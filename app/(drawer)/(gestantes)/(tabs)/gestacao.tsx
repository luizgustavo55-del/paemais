import Compartilhar from "@/src/components/(barra)/Compartilhar";
import Desenvolvimento from "@/src/components/(barra)/Desenvolvimento";
import Diario from "@/src/components/(barra)/Diario";
import Embriologia from "@/src/components/(barra)/Embriologia";
import Ferramentas from "@/src/components/(barra)/Ferramentas";
import Nomes from "@/src/components/(barra)/Nomes";
import Planejamentos from "@/src/components/(barra)/Planejamento";
import VisaoGeral from "@/src/components/(barra)/VisaoGeral";
import { dadosSemanas } from "@/src/constants/infoGest";
import { useTheme } from "@/src/context/ThemeContext";
import { useUnit } from "@/src/context/UnitContext";
import { auth, firestore } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const ferra = [
  { id: "1", title: "Visão Geral", icon: "home-outline" },
  { id: "2", title: "Desenvolvimento", icon: "heart-outline" },
  { id: "3", title: "Embriologia", icon: "medkit-outline" },
  { id: "4", title: "Ferramentas", icon: "construct-outline" },
  { id: "5", title: "Diário", icon: "book-outline" },
  { id: "6", title: "Planejamentos", icon: "calendar-outline" },
  { id: "7", title: "Nomes", icon: "people-outline" },
  { id: "8", title: "Compartilhar", icon: "share-social-outline" },
];

export default function Inicio() {
  const { theme } = useTheme();
  const { unidadeAtual } = useUnit();

  const { height, width } = useWindowDimensions();
  const isModoCompacto = height < 650;

  const styles = getStyles(theme, isModoCompacto);

  const navigation = useNavigation();
  const router = useRouter();

  const [escolha, setEscolha] = useState("1");
  const [nome, setNome] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [semana, setSemana] = useState(0);
  const [dias, setDias] = useState(0);
  const [tamanho, setTamanho] = useState("...");
  const [peso, setPeso] = useState("...");
  const [fruta, setFruta] = useState("...");
  const [emoji, setEmoji] = useState("...");
  const [modalChatVisivel, setModalChatVisivel] = useState(false);
  const animacaoLateral = useRef(new Animated.Value(width)).current;
  const [temMensagemNaoLida, setTemMensagemNaoLida] = useState(false);
  const [chatsRecentes, setChatsRecentes] = useState<any[]>([]);

  const abrirModalChat = () => {
    setModalChatVisivel(true);
    Animated.timing(animacaoLateral, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fecharModalChat = () => {
    Animated.timing(animacaoLateral, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalChatVisivel(false));
  };

  const irParaChat = (id: string, nomeAmigo: string) => {
    fecharModalChat();
    router.push({ pathname: "/chat", params: { id, nomeAmigo } });
  };

  const formatarTamanho = (valorCmStr: string) => {
    if (!valorCmStr || valorCmStr === "...") return "...";
    if (unidadeAtual === "imperial") {
      const num = parseFloat(valorCmStr.replace(/[^0-9.]/g, ""));
      if (isNaN(num)) return valorCmStr;
      return `${(num * 0.393701).toFixed(1)} in`;
    }
    return valorCmStr;
  };

  const formatarPeso = (valorGramasStr: string) => {
    if (!valorGramasStr || valorGramasStr === "...") return "...";
    if (unidadeAtual === "imperial") {
      const isKg = valorGramasStr.toLowerCase().includes("kg");
      let num = parseFloat(valorGramasStr.replace(/[^0-9.]/g, ""));
      if (isNaN(num)) return valorGramasStr;

      if (isKg) num = num * 1000;
      return `${(num * 0.035274).toFixed(1)} oz`;
    }
    return valorGramasStr;
  };

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    let unsubGestacao: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const docRef = doc(firestore, "usuarios", user.uid);
        unsubUser = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const dadosUser = docSnap.data();
            setNome(dadosUser.nome || "");
            setFotoPerfil(dadosUser.fotoPerfil || null);

            const amigosArray = dadosUser.amigos || [];
            if (amigosArray.length > 0) {
              const qAmigos = query(
                collection(firestore, "usuarios"),
                where(documentId(), "in", amigosArray.slice(0, 30)),
              );
              const snapAmigos = await getDocs(qAmigos);

              const listaAmigos = await Promise.all(
                snapAmigos.docs.map(async (d) => {
                  const amigoId = d.id;
                  const chatId =
                    user.uid > amigoId
                      ? `${user.uid}_${amigoId}`
                      : `${amigoId}_${user.uid}`;

                  const mensagensRef = collection(
                    firestore,
                    "chats",
                    chatId,
                    "messages",
                  );
                  const qMsg = query(
                    mensagensRef,
                    orderBy("createdAt", "desc"),
                    limit(1),
                  );
                  const msgSnap = await getDocs(qMsg);

                  let ultimaMensagem = "Toque para conversar";
                  let lida = true;

                  if (!msgSnap.empty) {
                    const msgData = msgSnap.docs[0].data();
                    ultimaMensagem = msgData.text || ultimaMensagem;

                    if (msgData.senderId !== user.uid) {
                      lida = msgData.lido === true;
                    }
                  }

                  return {
                    id: amigoId,
                    nomeAmigo: d.data().nome || "Amigo",
                    fotoPerfil: d.data().fotoPerfil || null,
                    ultimaMensagem,
                    lida,
                  };
                }),
              );

              setChatsRecentes(listaAmigos);
              setTemMensagemNaoLida(listaAmigos.some((a) => !a.lida));
            } else {
              setChatsRecentes([]);
              setTemMensagemNaoLida(false);
            }
          }
        });

        const gestacoesRef = collection(
          firestore,
          "usuarios",
          user.uid,
          "gestacoes",
        );
        const q = query(gestacoesRef, where("status", "==", "ativa"));

        unsubGestacao = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const dadosGestacao = querySnapshot.docs[0].data();
            const dataDUM = dadosGestacao.dataUltimaMenstruacao;

            if (dataDUM) {
              const partes = dataDUM.split("/");
              const dum = new Date(
                Number(partes[2]),
                Number(partes[1]) - 1,
                Number(partes[0]),
              );
              dum.setHours(0, 0, 0, 0);

              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);

              const diferencaMs = hoje.getTime() - dum.getTime();
              const diasTotais = Math.max(
                0,
                Math.round(diferencaMs / (1000 * 60 * 60 * 24)),
              );

              const semanasCalculadas = Math.floor(diasTotais / 7);
              const diasExtras = diasTotais % 7;

              setSemana(semanasCalculadas);
              setDias(diasExtras);

              const info =
                dadosSemanas[semanasCalculadas] || dadosSemanas[40] || {};
              setTamanho(info.tamanho || "...");
              setPeso(info.peso || "...");
              setFruta(info.fruta || "...");
              setEmoji(info.emoji || "...");
            }
          } else {
            setSemana(0);
            setDias(0);
            setTamanho("...");
            setPeso("...");
            setFruta("...");
            setEmoji("...");
          }
        });
      } else {
        if (unsubUser) unsubUser();
        if (unsubGestacao) unsubGestacao();
        setNome("");
        setFotoPerfil(null);
        setSemana(0);
        setDias(0);
        setTamanho("...");
        setPeso("...");
        setFruta("...");
        setEmoji("...");
        setChatsRecentes([]);
      }
    });

    return () => {
      if (unsubUser) unsubUser();
      if (unsubGestacao) unsubGestacao();
      unsubscribeAuth();
    };
  }, []);

  const render = () => {
    switch (escolha) {
      case "1":
        return <VisaoGeral />;
      case "2":
        return <Desenvolvimento />;
      case "3":
        return <Embriologia />;
      case "4":
        return <Ferramentas />;
      case "5":
        return <Diario />;
      case "6":
        return <Planejamentos />;
      case "7":
        return <Nomes />;
      case "8":
        return <Compartilhar />;
      default:
        return <VisaoGeral />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <View style={styles.topContainer}>
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            activeOpacity={0.7}
          >
            <View style={styles.iconBack}>
              {fotoPerfil ? (
                <Image
                  source={{ uri: fotoPerfil }}
                  style={styles.imagemPerfil}
                />
              ) : (
                <Ionicons
                  name="person"
                  size={isModoCompacto ? 14 : 18}
                  color="#FFF"
                />
              )}
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {nome ? `Olá, ${nome.split(" ")[0]} ` : "Minha Gestação"}
            </Text>
            <Text style={styles.subtitle}>Acompanhe sua gravidez</Text>
          </View>

          <TouchableOpacity
            onPress={abrirModalChat}
            style={styles.btnChatHeader}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={26}
              color={theme.colors.text || theme.colors.subtitle}
            />
            {temMensagemNaoLida && <View style={styles.bolinhaNotificacao} />}
          </TouchableOpacity>
        </View>

        {isModoCompacto ? (
          <View style={styles.mainCardCompact}>
            <Text style={styles.compactCardText}>
              {semana} sem • {dias}d | 📏 {formatarTamanho(tamanho)} | ⚖️{" "}
              {formatarPeso(peso)} | {emoji} {fruta}
            </Text>
          </View>
        ) : (
          <View style={styles.mainCard}>
            <View style={styles.mainCardIcon}>
              <Image
                source={require("@/assets/images/logo3.png")}
                style={styles.imagemCardIcon}
                resizeMode="cover"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.weekText}>
                {semana} semanas • {dias} dias
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  📏 {formatarTamanho(tamanho)}
                </Text>
                <Text style={styles.infoLabel}>⚖️ {formatarPeso(peso)}</Text>
              </View>
              <Text style={styles.mainInfo}>
                Comparável a(o): {fruta} {emoji}
              </Text>
            </View>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuContainer}
        >
          {ferra.map((item) => {
            const ativo = escolha === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={[styles.menuButton, ativo && styles.menuButtonActive]}
                onPress={() => setEscolha(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={isModoCompacto ? 14 : 17}
                  color={ativo ? "#FFF" : theme.colors.gestantesPrimary}
                />
                <Text style={[styles.menuText, ativo && styles.menuTextActive]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.content}>{render()}</View>

      <Modal
        visible={modalChatVisivel}
        transparent
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.areaDispensavel}
            onPress={fecharModalChat}
            activeOpacity={1}
          />

          <Animated.View
            style={[
              styles.drawerLateral,
              { transform: [{ translateX: animacaoLateral }] },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Mensagens</Text>
              <TouchableOpacity onPress={fecharModalChat}>
                <Ionicons
                  name="close"
                  size={28}
                  color={theme.colors.gestantesPrimary}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chatsRecentes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 15 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chatCard}
                  activeOpacity={0.7}
                  onPress={() => irParaChat(item.id, item.nomeAmigo)}
                >
                  {item.fotoPerfil ? (
                    <Image
                      source={{ uri: item.fotoPerfil }}
                      style={styles.chatAvatar}
                    />
                  ) : (
                    <View
                      style={[styles.chatAvatar, styles.chatAvatarPlaceholder]}
                    >
                      <Ionicons name="person" size={24} color="#FFF" />
                    </View>
                  )}
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatNome} numberOfLines={1}>
                      {item.nomeAmigo}
                    </Text>
                    <Text
                      style={[
                        styles.chatUltimaMsg,
                        !item.lida && styles.chatUltimaMsgUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.ultimaMensagem}
                    </Text>
                  </View>
                  {!item.lida && <View style={styles.chatBadgeUnread} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyChatText}>
                  Nenhuma conversa recente.
                </Text>
              }
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFF5FA",
    },
    topContainer: {
      paddingTop: isModoCompacto ? 24 : 20,
      paddingBottom: isModoCompacto ? 10 : 20,
      paddingHorizontal: 18,
      backgroundColor: theme.colors.gestantesBackground,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      elevation: 6,
      shadowColor: theme.colors.gestantesPrimary,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    topHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: isModoCompacto ? 8 : 15,
    },
    iconBack: {
      width: isModoCompacto ? 34 : 44,
      height: isModoCompacto ? 34 : 44,
      borderRadius: isModoCompacto ? 17 : 22,
      backgroundColor: "rgba(255,255,255,0.16)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      overflow: "hidden",
    },
    imagemPerfil: {
      width: "100%",
      height: "100%",
      borderRadius: isModoCompacto ? 17 : 22,
    },
    title: {
      color: theme.colors.text,
      fontSize: isModoCompacto ? 18 : theme.texts.title,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    subtitle: {
      color: theme.colors.subtitle,
      marginTop: isModoCompacto ? 1 : 3,
      fontSize: isModoCompacto ? 12 : theme.texts.subtitle,
      fontWeight: "500",
    },
    btnChatHeader: {
      position: "relative",
      padding: 6,
      marginLeft: 10,
    },
    bolinhaNotificacao: {
      position: "absolute",
      top: 5,
      right: 5,
      width: 12,
      height: 12,
      backgroundColor: "#FF3B30",
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.gestantesBackground,
    },
    mainCard: {
      backgroundColor: theme.colors.gestantesSecondary,
      borderRadius: 24,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
      borderWidth: 1,
      borderColor: "#e0a0c0",
      elevation: 4,
      shadowColor: "#A13D71",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    mainCardCompact: {
      backgroundColor: theme.colors.gestantesSecondary,
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "#e0a0c0",
    },
    compactCardText: {
      color: theme.colors.gestantesPrimary,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },
    mainCardIcon: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: "#FFD9EC",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
      overflow: "hidden",
    },
    imagemCardIcon: {
      width: "100%",
      height: "100%",
    },
    weekText: {
      color: theme.colors.gestantesPrimary,
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      marginBottom: 10,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    infoLabel: {
      color: theme.colors.gestantesPrimary,
      fontSize: theme.texts.text,
      fontWeight: "600",
      backgroundColor: "#FFF5FA",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    mainInfo: {
      color: theme.colors.subtitle,
      fontSize: theme.texts.text,
      lineHeight: 22,
    },
    menuContainer: {
      paddingBottom: 4,
      paddingRight: 20,
    },
    menuButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isModoCompacto ? 12 : 16,
      paddingVertical: isModoCompacto ? 8 : 11,
      backgroundColor: "#FFF0F8",
      borderRadius: isModoCompacto ? 12 : 16,
      marginRight: 10,
      borderWidth: 1,
      borderColor: "#F4C7DD",
    },
    menuButtonActive: {
      backgroundColor: "#8B2F61",
      borderColor: "#8B2F61",
    },
    menuText: {
      marginLeft: 7,
      color: theme.colors.gestantesPrimary,
      fontSize: isModoCompacto ? 13 : theme.texts.text,
      fontWeight: "600",
    },
    menuTextActive: {
      color: "#FFF",
    },
    content: {
      flex: 1,
      paddingHorizontal: 14,
      paddingTop: isModoCompacto ? 8 : 16,
    },

    /* MUDANÇAS APLICANDO O THEME CONTEXT NO MODAL */
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    areaDispensavel: {
      ...StyleSheet.absoluteFillObject,
    },
    drawerLateral: {
      position: "absolute",
      right: 0,
      width: "80%",
      maxWidth: 340,
      height: "100%",
      backgroundColor: "#FFF", // Mantém o fundo limpo ou altere para theme.colors.background se houver
      shadowColor: "#000",
      shadowOffset: { width: -4, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    },
    drawerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#EEE",
      backgroundColor: theme.colors.gestantesBackground, // Sincronizado com o cabeçalho superior
    },
    drawerTitle: {
      fontSize: theme.texts.subtitle, // Pega dinamicamente o tamanho do subtítulo/título adaptável
      fontWeight: "bold",
      color: theme.colors.text, // Adapta à cor padrão de texto ativa
    },
    chatCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#F4F4F4",
    },
    chatAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    chatAvatarPlaceholder: {
      backgroundColor: theme.colors.gestantesPrimary, // Sincronizado com o tom principal
      justifyContent: "center",
      alignItems: "center",
    },
    chatInfo: {
      flex: 1,
      justifyContent: "center",
    },
    chatNome: {
      fontSize: theme.texts.text, // Tamanho dinâmico vindo do Contexto de fontes
      fontWeight: "600",
      color: theme.colors.title || "#333", // Cor de título principal
      marginBottom: 4,
    },
    chatUltimaMsg: {
      fontSize: theme.texts.text - 2, // Ajusta ligeiramente menor que o texto principal
      color: theme.colors.subtitle || "#888",
    },
    chatUltimaMsgUnread: {
      fontWeight: "bold",
      color: theme.colors.text,
    },
    chatBadgeUnread: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#FF3B30",
      marginLeft: 10,
    },
    emptyChatText: {
      textAlign: "center",
      color: theme.colors.subtitle || "#999",
      marginTop: 30,
      fontSize: theme.texts.text,
    },
  });
