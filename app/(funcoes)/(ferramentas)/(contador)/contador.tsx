import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
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
  useWindowDimensions,
} from "react-native";

export default function Contador() {
  const router = useRouter();
  const { theme } = useTheme();

  // Detecta tela dividida/espremida
  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;

  const styles = getStyles(theme, isModoCompacto);

  const [chutes, setChutes] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [ativo, setAtivo] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [mensagemAviso, setMensagemAviso] = useState("");
  const [meta, setMeta] = useState(10);

  // Recarrega sempre que a tela ganha foco
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
      Alert.alert("Ops!", "Toque em 'Começar' primeiro!");
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
          onPress={() => router.back()}
          style={[styles.back, { left: 20 }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={isModoCompacto ? 22 : 26}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/padroes")}
          style={[styles.back, { right: 50 }]}
        >
          <MaterialCommunityIcons
            name="chart-bell-curve"
            size={isModoCompacto ? 22 : 26}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <Text style={styles.titulo}>Contador de Chutes</Text>

        <TouchableOpacity
          onPress={() => setModalVisivel(true)}
          style={[styles.back, { right: 5 }]}
        >
          <MaterialCommunityIcons
            name="history"
            size={isModoCompacto ? 22 : 28}
            color={theme.colors.text}
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
            style={[
              styles.bot,
              { backgroundColor: theme.colors.gestantesCard },
            ]}
            onPress={() => setAtivo(true)}
          >
            <Text style={styles.botText}> Começar </Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Oculta o botão Zerar em telas muito espremidas para não encavalar botões */}
            {!isModoCompacto && (
              <TouchableOpacity
                style={[
                  styles.bot,
                  { backgroundColor: theme.colors.gestantesSecondary },
                ]}
                onPress={() => {
                  setChutes(0);
                  setTempo(0);
                }}
              >
                <Text style={styles.botText}>Zerar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.bot,
                { backgroundColor: theme.colors.gestantesPrimary },
              ]}
              onPress={finalizar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.botText, { color: "#FFF" }]}>
                  {isModoCompacto ? "Finalizar" : "Finalizar e Salvar"}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal animationType="slide" transparent visible={modalVisivel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Histórico</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={28}
                  color={theme.colors.gestantesPrimary}
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

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFF7FB",
    },

    header: {
      height: isModoCompacto ? 70 : 92,
      paddingTop: isModoCompacto ? 20 : 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.gestantesPrimary,
      shadowColor: "#8E3D68",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 4,
    },

    back: {
      position: "absolute",
      top: isModoCompacto ? 15 : 44,
      width: isModoCompacto ? 34 : 40,
      height: isModoCompacto ? 34 : 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.20)",
      alignItems: "center",
      justifyContent: "center",
    },

    titulo: {
      fontSize: isModoCompacto ? theme.texts.subtitle : theme.texts.title,
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },

    avisoContainer: {
      backgroundColor: theme.colors.gestantesSecondary,
      paddingVertical: 11,
      paddingHorizontal: 16,
      marginHorizontal: 22,
      borderRadius: 16,
      alignItems: "center",
      position: "absolute",
      top: isModoCompacto ? 80 : 100,
      width: "86%",
      zIndex: 10,
      alignSelf: "center",
      shadowColor: "#8E3D68",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 3,
    },

    avisoTexto: {
      color: theme.colors.text,
      fontWeight: "600",
      fontSize: theme.texts.text,
    },

    main: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    status: {
      fontSize: theme.texts.text,
      color: theme.colors.gestantesPrimary,
      fontWeight: "600",
      marginBottom: isModoCompacto ? 4 : 10,
    },

    tempo: {
      fontSize: isModoCompacto ? 48 : 64,
      fontWeight: "700",
      color: theme.colors.gestantesPrimary,
      letterSpacing: 1,
      marginBottom: 2,
    },

    progresso: {
      fontSize: theme.texts.subtitle,
      color: "#A2748B",
      marginBottom: isModoCompacto ? 16 : 34,
      fontWeight: "500",
    },

    botaoChute: {
      width: isModoCompacto ? 160 : 220,
      height: isModoCompacto ? 160 : 220,
      borderRadius: 120,
      backgroundColor: "#C85C90",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#A64D78",
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 8,
    },

    botaoTexto: {
      color: "#FFF",
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    footer: {
      flexDirection: "row",
      gap: 14,
      paddingHorizontal: 22,
      paddingTop: 8,
      paddingBottom: isModoCompacto ? 16 : 34,
      justifyContent: "center",
    },

    bot: {
      flex: 1,
      minHeight: isModoCompacto ? 54 : 72,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
      shadowColor: "#8E3D68",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 3,
    },

    botText: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: theme.texts.subtitle,
      textAlign: "center",
      letterSpacing: 0.2,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.40)",
      justifyContent: "flex-end",
    },

    modalContent: {
      backgroundColor: "#FFF9FC",
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      height: "84%",
      paddingTop: 24,
      paddingHorizontal: 22,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 22,
    },

    modalTitulo: {
      fontSize: theme.texts.title,
      fontWeight: "700",
      color: theme.colors.gestantesPrimary,
    },

    cardHistorico: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 18,
      backgroundColor: "#FDEAF2",
      borderRadius: 22,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowColor: "#A64D78",
      shadowOpacity: 0.05,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    cardData: {
      fontWeight: "700",
      marginBottom: 5,
      fontSize: theme.texts.subtitle,
      color: theme.colors.gestantesPrimary,
    },

    iconeLixeira: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "#FFF3F7",
      alignItems: "center",
      justifyContent: "center",
    },
  });
