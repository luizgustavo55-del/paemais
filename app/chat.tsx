import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Chat() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const { id: amigoId, nomeAmigo } = useLocalSearchParams<{
    id: string;
    nomeAmigo: string;
  }>();

  const [mensagemInput, setMensagemInput] = useState("");
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [fotoAmigo, setFotoAmigo] = useState<string | null>(null);
  const [amigoDigitando, setAmigoDigitando] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primeiraCargaRef = useRef(true);
  const userConfigRef = useRef<any>({});

  const corPrimaria = theme.colors.gestantesPrimary || "#a339b8";
  const meuId = auth.currentUser?.uid;

  const chatId =
    meuId && amigoId
      ? meuId > amigoId
        ? `${meuId}_${amigoId}`
        : `${amigoId}_${meuId}`
      : null;

  useEffect(() => {
    if (!meuId) return;
    const unsub = onSnapshot(doc(firestore, "usuarios", meuId), (docSnap) => {
      if (docSnap.exists()) {
        userConfigRef.current = docSnap.data().configuracoes || {};
      }
    });
    return () => unsub();
  }, [meuId]);

  useEffect(() => {
    if (!amigoId) return;
    const fetchAmigo = async () => {
      const docSnap = await getDoc(doc(firestore, "usuarios", amigoId));
      if (docSnap.exists() && docSnap.data().fotoPerfil) {
        setFotoAmigo(docSnap.data().fotoPerfil);
      }
    };
    fetchAmigo();
  }, [amigoId]);

  useEffect(() => {
    if (!chatId) return;
    const chatRef = doc(firestore, "chats", chatId);
    const unsubscribe = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.typing && data.typing[amigoId]) {
          setAmigoDigitando(true);
        } else {
          setAmigoDigitando(false);
        }
      }
    });
    return () => unsubscribe();
  }, [chatId, amigoId]);

  useEffect(() => {
    if (!chatId) return;

    const mensagensRef = collection(firestore, "chats", chatId, "messages");
    const q = query(mensagensRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!primeiraCargaRef.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (data.senderId !== meuId) {
              const config = userConfigRef.current;
              const notificacoesDesligadas =
                config.notificacoesAtivas === false;
              let emDescanso = false;

              if (config.descansoAtivo && config.horaInicio && config.horaFim) {
                const agora = new Date();
                const minutosAtual = agora.getHours() * 60 + agora.getMinutes();

                const [hI, mI] = config.horaInicio.split(":").map(Number);
                const minutosInicio = hI * 60 + mI;

                const [hF, mF] = config.horaFim.split(":").map(Number);
                const minutosFim = hF * 60 + mF;

                if (minutosInicio < minutosFim) {
                  emDescanso =
                    minutosAtual >= minutosInicio && minutosAtual < minutosFim;
                } else {
                  emDescanso =
                    minutosAtual >= minutosInicio || minutosAtual < minutosFim;
                }
              }

              if (!notificacoesDesligadas && !emDescanso) {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: nomeAmigo || "Nova Mensagem",
                    body: data.text,
                    sound: true,
                  },
                  trigger: null,
                });
              }
            }
          }
        });
      }

      const msgsFirebase = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        if (data.senderId !== meuId && !data.lido) {
          updateDoc(doc(firestore, "chats", chatId, "messages", docSnap.id), {
            lido: true,
          });
        }

        const dataMensagem = data.createdAt
          ? data.createdAt.toDate()
          : new Date();
        const horaFormatada = dataMensagem.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          id: docSnap.id,
          texto: data.text,
          remetente: data.senderId === meuId ? "eu" : "outro",
          hora: horaFormatada,
          lido: data.lido || false,
        };
      });

      setMensagens(msgsFirebase);
      primeiraCargaRef.current = false;
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleDigitando = async (texto: string) => {
    setMensagemInput(texto);
    if (!chatId || !meuId) return;

    await setDoc(
      doc(firestore, "chats", chatId),
      { typing: { [meuId]: true } },
      { merge: true },
    );

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      await setDoc(
        doc(firestore, "chats", chatId),
        { typing: { [meuId]: false } },
        { merge: true },
      );
    }, 1500);
  };

  const enviarMensagem = async () => {
    if (mensagemInput.trim() === "" || !chatId || !meuId) return;

    const textoParaEnviar = mensagemInput;
    setMensagemInput("");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await setDoc(
      doc(firestore, "chats", chatId),
      { typing: { [meuId]: false } },
      { merge: true },
    );

    try {
      const mensagensRef = collection(firestore, "chats", chatId, "messages");
      await addDoc(mensagensRef, {
        text: textoParaEnviar,
        senderId: meuId,
        lido: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      setMensagemInput(textoParaEnviar);
    }
  };

  const apagarMensagem = (msgId: string) => {
    Alert.alert("Apagar", "Deseja apagar esta mensagem para todos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(
            doc(firestore, "chats", chatId as string, "messages", msgId),
          );
        },
      },
    ]);
  };

  const apagarTudo = () => {
    Alert.alert(
      "Apagar Conversa",
      "Tem certeza que deseja apagar TODAS as mensagens para você e para o seu amigo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar Tudo",
          style: "destructive",
          onPress: async () => {
            try {
              const batch = writeBatch(firestore);
              mensagens.forEach((msg) => {
                const msgRef = doc(
                  firestore,
                  "chats",
                  chatId as string,
                  "messages",
                  msg.id,
                );
                batch.delete(msgRef);
              });
              await batch.commit();
            } catch (error) {
              console.log(error);
            }
          },
        },
      ],
    );
  };

  const renderizarMensagem = ({ item }: { item: any }) => {
    const isMinha = item.remetente === "eu";

    return (
      <TouchableOpacity
        onLongPress={() => apagarMensagem(item.id)}
        activeOpacity={0.8}
        style={[
          styles.mensagemWrapper,
          isMinha ? styles.mensagemWrapperMinha : styles.mensagemWrapperOutro,
        ]}
      >
        <View
          style={[
            styles.balaoMensagem,
            isMinha
              ? [styles.balaoMinha, { backgroundColor: corPrimaria }]
              : styles.balaoOutro,
          ]}
        >
          <Text
            style={[styles.textoMensagem, { color: isMinha ? "#FFF" : "#333" }]}
          >
            {item.texto}
          </Text>
          <Text
            style={[
              styles.horaMensagem,
              { color: isMinha ? "rgba(255,255,255,0.8)" : "#999" },
            ]}
          >
            {item.hora}
            {isMinha && (
              <Text
                style={{
                  fontWeight: item.lido ? "bold" : "normal",
                  color: item.lido ? "#4CAF50" : "rgba(255,255,255,0.7)",
                }}
              >
                {item.lido ? " • Lido" : " • Enviado"}
              </Text>
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: corPrimaria }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          {fotoAmigo ? (
            <Image source={{ uri: fotoAmigo }} style={styles.avatarHeader} />
          ) : (
            <View
              style={[
                styles.avatarHeader,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Ionicons name="person" size={20} color="#999" />
            </View>
          )}

          <View style={styles.headerTitleContainer}>
            <Text style={styles.nomeHeader}>{nomeAmigo || "Conversa"}</Text>
            {amigoDigitando && (
              <Text style={styles.statusDigitando}>Digitando...</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.headerRight} onPress={apagarTudo}>
          <MaterialCommunityIcons name="dots-vertical" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={renderizarMensagem}
          contentContainerStyle={styles.listaMensagens}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#999"
              multiline
              value={mensagemInput}
              onChangeText={handleDigitando}
            />
          </View>

          <TouchableOpacity
            style={[styles.botaoEnviar, { backgroundColor: corPrimaria }]}
            onPress={enviarMensagem}
          >
            <Ionicons
              name="send"
              size={20}
              color="#FFF"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#E5DDD5",
    },
    keyboardContainer: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: Platform.OS === "ios" ? 50 : 30,
      paddingBottom: 15,
      paddingHorizontal: 10,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    backButton: {
      padding: 5,
      marginRight: 5,
    },
    avatarHeader: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
      backgroundColor: "#FFF",
    },
    headerTitleContainer: {
      flexDirection: "column",
      justifyContent: "center",
    },
    nomeHeader: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      color: "#FFF",
    },
    statusDigitando: {
      fontSize: 12,
      color: "#4CAF50",
      fontStyle: "italic",
      fontWeight: "bold",
    },
    headerRight: {
      padding: 5,
    },
    listaMensagens: {
      paddingHorizontal: 15,
      paddingTop: 20,
      paddingBottom: 20,
    },
    mensagemWrapper: {
      width: "100%",
      flexDirection: "row",
      marginBottom: 10,
    },
    mensagemWrapperMinha: {
      justifyContent: "flex-end",
    },
    mensagemWrapperOutro: {
      justifyContent: "flex-start",
    },
    balaoMensagem: {
      maxWidth: "80%",
      padding: 10,
      borderRadius: 15,
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    balaoMinha: {
      borderTopRightRadius: 0,
    },
    balaoOutro: {
      backgroundColor: "#FFF",
      borderTopLeftRadius: 0,
    },
    textoMensagem: {
      fontSize: theme.texts.text,
      marginBottom: 2,
    },
    horaMensagem: {
      fontSize: 11,
      alignSelf: "flex-end",
      marginTop: 2,
      flexDirection: "row",
      alignItems: "center",
    },
    footer: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 10,
      paddingVertical: 10,
      backgroundColor: "transparent",
    },
    inputContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF",
      borderRadius: 25,
      paddingHorizontal: 15,
      minHeight: 50,
      maxHeight: 120,
      marginRight: 10,
      elevation: 1,
    },
    input: {
      flex: 1,
      fontSize: theme.texts.text,
      paddingTop: 12,
      paddingBottom: 12,
      color: "#333",
    },
    botaoEnviar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
  });
