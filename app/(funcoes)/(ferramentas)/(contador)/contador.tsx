import { theme } from "@/src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🔥 Imports do Firebase
import { auth, firestore } from "@/src/services/firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function Contador() {
  const router = useRouter();
  const [chutes, setChutes] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [ativo, setAtivo] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [mensagemAviso, setMensagemAviso] = useState("");
  const [meta, setMeta] = useState(10);

  useFocusEffect(
    useCallback(() => {
      const carregarDadosIniciais = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const userRef = doc(firestore, "usuarios", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const hist = data.historicoChutes || [];
            setHistorico(hist);

            if (hist.length >= 3) {
              const ultimos3 = hist.slice(0, 3);
              const totalChutes = ultimos3.reduce(
                (acc: number, curr: any) => acc + curr.chutes,
                0,
              );
              const media = Math.round(totalChutes / 3);
              setMeta(media > 0 ? media : 10);
            }
          }
        } catch (e) {
          console.log("Erro ao carregar dados", e);
        }
      };

      carregarDadosIniciais();
    }, []),
  );

  useEffect(() => {
    let interval: any;
    if (ativo) {
      interval = setInterval(() => {
        setTempo((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ativo]);

  const mostrarAviso = (texto: string) => {
    setMensagemAviso(texto);
    setTimeout(() => setMensagemAviso(""), 3000);
  };

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
  };

  const adicionarChute = () => {
    if (!ativo) {
      Alert.alert("Ops!", "Toque em 'Iniciar' primeiro!");
      return;
    }
    setChutes((prev) => prev + 1);
  };

  const finalizar = async () => {
    if (tempo === 0 && chutes === 0) {
      mostrarAviso("Não há dados para salvar.");
      return;
    }

    setAtivo(false);
    setCarregando(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const novaSessao = {
        id: Date.now().toString(),
        data: new Date().toLocaleDateString("pt-BR"),
        hora: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        chutes,
        tempo: formatarTempo(tempo),
      };

      const userRef = doc(firestore, "usuarios", user.uid);

      await updateDoc(userRef, {
        historicoChutes: arrayUnion(novaSessao),
      });

      mostrarAviso("Sessão guardada!");
      setHistorico((prev) => [novaSessao, ...prev]);
      setChutes(0);
      setTempo(0);
    } catch (e) {
      mostrarAviso("Erro ao salvar no banco.");
    } finally {
      setCarregando(false);
    }
  };

  const apagarItem = async (item: any) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      await updateDoc(userRef, {
        historicoChutes: arrayRemove(item),
      });

      setHistorico((prev) => prev.filter((h) => h.id !== item.id));
      mostrarAviso("Registo apagado!");
    } catch (error) {
      mostrarAviso("Erro ao apagar.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/gestacao")}
          style={[styles.back, { left: 20 }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={theme.colors.title}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/padroes")}
          style={[styles.back, { right: 60 }]}
        >
          <MaterialCommunityIcons
            name="chart-bell-curve"
            size={26}
            color={theme.colors.title}
          />
        </TouchableOpacity>

        <Text style={styles.titulo}>Contador de Chutes</Text>
        <TouchableOpacity
          onPress={() => setModalVisivel(true)}
          style={[styles.back, { right: 20 }]}
        >
          <MaterialCommunityIcons
            name="history"
            size={28}
            color={theme.colors.title}
          />
        </TouchableOpacity>
      </View>

      {mensagemAviso !== "" && (
        <View style={styles.avisoContainer}>
          <Text style={styles.avisoTexto}>{mensagemAviso}</Text>
        </View>
      )}

      <View style={styles.main}>
        <Text style={styles.status}>
          {chutes >= meta ? "Meta atingida" : `Faltam ${meta - chutes} chutes`}
        </Text>
        <Text style={styles.tempo}>{formatarTempo(tempo)}</Text>
        <Text style={styles.progresso}>
          {chutes} / {meta}
        </Text>

        <TouchableOpacity
          activeOpacity={ativo ? 0.7 : 1}
          style={[styles.botaoChute, !ativo && { backgroundColor: "#E0E0E0" }]}
          onPress={adicionarChute}
        >
          <Text style={[styles.botaoTexto, !ativo && { color: "#AAA" }]}>
            CHUTE
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        {!ativo ? (
          <TouchableOpacity
            style={[styles.bot, { backgroundColor: theme.colors.primary }]}
            onPress={() => setAtivo(true)}
          >
            <Text style={styles.botText}> Começar </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.bot, { backgroundColor: theme.colors.quaternary }]}
              onPress={() => {
                setChutes(0);
                setTempo(0);
              }}
            >
              <Text style={styles.botText}>Zerar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bot, { backgroundColor: theme.colors.cards }]}
              onPress={finalizar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botText}>Finalizar e Salvar</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* MODAL DE HISTÓRICO */}
      <Modal animationType="slide" transparent visible={modalVisivel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Histórico</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={28}
                  color={theme.colors.title}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={historico}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.cardHistorico}>
                  <View>
                    <Text style={styles.cardData}>
                      {item.data} às {item.hora}
                    </Text>
                    <Text style={{ color: "#666" }}>
                      {item.chutes} chutes em {item.tempo}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => apagarItem(item)}
                    style={styles.iconeLixeira}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={24}
                      color="#FF4D4D"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 110,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  back: { position: "absolute", top: 60 },
  titulo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.title,
  },
  avisoContainer: {
    backgroundColor: "#333",
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    position: "absolute",
    top: 110,
    width: "90%",
    zIndex: 10,
    alignSelf: "center",
  },
  avisoTexto: { color: "#fff", fontWeight: "bold" },
  main: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  status: {
    fontSize: theme.texts.subtitle,
    color: theme.colors.subtitle,
    fontWeight: "600",
  },

  tempo: { fontSize: 70, fontWeight: "bold", color: theme.colors.title },

  progresso: {
    fontSize: theme.texts.subtitle,
    color: theme.colors.subtitle,
    marginBottom: 20,
    fontWeight: "600",
  },

  botaoChute: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  botaoTexto: {
    color: theme.colors.texts,
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 25,
    paddingBottom: 40,
    justifyContent: "center",
  },
  bot: {
    height: 80,
    width: 150,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  botText: {
    color: theme.colors.texts,
    fontWeight: "bold",
    fontSize: theme.texts.subtitle,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "85%",
    padding: 25,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitulo: { fontSize: 22, fontWeight: "bold", color: theme.colors.title },
  cardHistorico: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    backgroundColor: theme.colors.terceary,
    borderRadius: 18,
    marginBottom: 12,
  },
  cardData: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
    color: theme.colors.title,
  },
  iconeLixeira: { padding: 8 },
});
