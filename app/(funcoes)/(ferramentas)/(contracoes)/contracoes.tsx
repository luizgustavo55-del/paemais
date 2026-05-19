import { theme } from "@/src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, firestore } from "@/src/services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface Contracao {
  id: string;
  data: string;
  hora: string;
  duracao: number;
  intervalo: number | null;
  duracaoFormatada: string;
}

export default function CronometroContracoes() {
  const router = useRouter();

  const [ativo, setAtivo] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [inicioAtual, setInicioAtual] = useState<number | null>(null);
  const [ultimoInicio, setUltimoInicio] = useState<number | null>(null);
  const [historico, setHistorico] = useState<Contracao[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [alertaInteligente, setAlertaInteligente] =
    useState("Aguardando início");

  const carregarHistorico = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dados = userSnap.data();
        const lista = dados.historicoContracoes || [];
        setHistorico(lista);

        if (lista.length > 0) {
          analisarPadrao(lista);
          // Correção: Recupera o timestamp do último registro salvo
          setUltimoInicio(Number(lista[0].id));
        }
      }
    } catch (e) {
      console.log("Erro ao carregar histórico", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico]),
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (ativo && inicioAtual) {
      interval = setInterval(() => {
        const segundosDecorridos = Math.floor(
          (Date.now() - inicioAtual) / 1000,
        );
        setTempo(segundosDecorridos);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval as unknown as number);
    };
  }, [ativo, inicioAtual]);

  const mostrarAviso = (texto: string) => {
    setMensagemAviso(texto);
    setTimeout(() => setMensagemAviso(""), 3000);
  };

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
  };

  const analisarPadrao = (lista: Contracao[]) => {
    if (lista.length < 3) {
      setAlertaInteligente("Continue registrando para analisarmos o padrão.");
      return;
    }

    const ultimas = lista.slice(0, 3);
    const mediaIntervalo =
      ultimas.reduce((acc, curr) => acc + (curr.intervalo || 0), 0) / 3;
    const mediaDuracao =
      ultimas.reduce((acc, curr) => acc + curr.duracao, 0) / 3;

    if (mediaIntervalo > 0 && mediaIntervalo <= 300 && mediaDuracao >= 50) {
      setAlertaInteligente(
        "ATENÇÃO: Padrão 5-1-1 detectado! Contate seu médico ou vá à maternidade.",
      );
    } else {
      setAlertaInteligente("Padrão irregular. Fase latente ou alarme falso.");
    }
  };

  const toggleContracao = async () => {
    if (!ativo) {
      const agora = Date.now();
      setInicioAtual(agora);
      setTempo(0);
      setAtivo(true);
      setAlertaInteligente("Contração em andamento...");
    } else {
      setAtivo(false);

      let intervalo = null;
      if (ultimoInicio && inicioAtual) {
        intervalo = Math.floor((inicioAtual - ultimoInicio) / 1000);
      }

      const novaContracao: Contracao = {
        id: Date.now().toString(),
        data: new Date().toLocaleDateString("pt-BR"),
        hora: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duracao: tempo,
        intervalo,
        duracaoFormatada: formatarTempo(tempo),
      };

      const novaLista = [novaContracao, ...historico];
      setHistorico(novaLista);
      setUltimoInicio(inicioAtual);
      setInicioAtual(null);
      setTempo(0);
      analisarPadrao(novaLista);

      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(firestore, "usuarios", user.uid);
        await updateDoc(userRef, { historicoContracoes: novaLista });
        mostrarAviso("Contração salva no histórico!");
      } catch {
        mostrarAviso("Erro ao guardar.");
      }
    }
  };

  const cancelarContagem = () => {
    setAtivo(false);
    setTempo(0);
    setInicioAtual(null);
    analisarPadrao(historico);
    mostrarAviso("Contagem cancelada.");
  };

  const apagarItem = async (id: string) => {
    try {
      const novoHistorico = historico.filter((item) => item.id !== id);
      setHistorico(novoHistorico);

      // Correção: Atualiza a referência da última contração após apagar
      if (novoHistorico.length > 0) {
        setUltimoInicio(Number(novoHistorico[0].id));
      } else {
        setUltimoInicio(null);
      }

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, "usuarios", user.uid);
        await updateDoc(userRef, { historicoContracoes: novoHistorico });
      }

      analisarPadrao(novoHistorico);
      mostrarAviso("Registo apagado!");
    } catch {
      mostrarAviso("Erro ao apagar.");
    }
  };

  const apagarTodos = async () => {
    try {
      setHistorico([]);
      setUltimoInicio(null);
      setAlertaInteligente("Aguardando início");

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, "usuarios", user.uid);
        await updateDoc(userRef, { historicoContracoes: [] });
      }

      mostrarAviso("Todo o histórico foi limpo!");
    } catch {
      mostrarAviso("Erro ao limpar histórico.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/gestacao" as any)}
          style={styles.headerBtnLeft}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={theme.colors.title}
          />
        </TouchableOpacity>

        <Text style={styles.titulo}>Contrações</Text>

        <View style={styles.headerBtnsRight}>
          <TouchableOpacity
            onPress={() => router.push("/padroes" as any)}
            style={styles.iconBtn}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={28}
              color={theme.colors.title}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisivel(true)}
            style={styles.iconBtn}
          >
            <MaterialCommunityIcons
              name="history"
              size={28}
              color={theme.colors.title}
            />
          </TouchableOpacity>
        </View>
      </View>

      {mensagemAviso !== "" && (
        <View style={styles.avisoContainer}>
          <Text style={styles.avisoTexto}>{mensagemAviso}</Text>
        </View>
      )}

      <View style={styles.main}>
        <Text
          style={[
            styles.status,
            alertaInteligente.includes("ATENÇÃO") && {
              color: theme.colors.textPrimary,
              fontWeight: "bold",
            },
          ]}
        >
          {alertaInteligente}
        </Text>

        {/* Usando o maior tamanho permitido pelo tema (title) */}
        <Text style={styles.tempo}>{formatarTempo(tempo)}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.botaoChute,
            ativo
              ? { backgroundColor: theme.colors.textPrimary }
              : { backgroundColor: theme.colors.primary },
          ]}
          onPress={toggleContracao}
        >
          <Text style={styles.botaoTexto}>{ativo ? "PARAR" : "INICIAR"}</Text>
        </TouchableOpacity>

        {ativo && (
          <TouchableOpacity
            onPress={cancelarContagem}
            style={{ marginTop: 20 }}
          >
            <Text style={styles.textoCancelar}>Cancelar contagem atual</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Histórico</Text>

              <View style={styles.modalAcoesTopo}>
                {historico.length > 0 && (
                  <TouchableOpacity
                    onPress={apagarTodos}
                    style={{ marginRight: 15 }}
                  >
                    <Text style={styles.apagarTudoTexto}>Limpar Tudo</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setModalVisivel(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={28}
                    color={theme.colors.title}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={historico}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.textoVazio}>
                  Nenhum histórico encontrado.
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.cardHistorico}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardData}>
                      {item.data} - {item.hora}
                    </Text>
                    <Text style={styles.cardTexto}>
                      Duração:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {item.duracaoFormatada}
                      </Text>
                    </Text>
                    <Text style={styles.cardSubtexto}>
                      Intervalo desde a última:{" "}
                      {item.intervalo ? formatarTempo(item.intervalo) : "--"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => apagarItem(item.id)}
                    style={styles.iconeLixeira}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={24}
                      color={theme.colors.textPrimary}
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
  container: {
    flex: 1,
    backgroundColor: "#FFF7FB",
  },

  header: {
    height: 92,

    paddingTop: 40,
    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#C85C90",

    shadowColor: "#8E3D68",
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  headerBtnLeft: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.20)",

    alignItems: "center",
    justifyContent: "center",
  },

  headerBtnsRight: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  iconBtn: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.20)",

    alignItems: "center",
    justifyContent: "center",
  },

  titulo: {
    fontSize: 23,

    fontWeight: "700",

    color: "#FFF8FC",

    letterSpacing: 0.2,
  },

  avisoContainer: {
    backgroundColor: "#A64D78",

    paddingVertical: 11,
    paddingHorizontal: 16,

    marginHorizontal: 22,

    borderRadius: 16,

    alignItems: "center",

    position: "absolute",

    top: 100,

    width: "86%",

    zIndex: 10,

    alignSelf: "center",

    shadowColor: "#8E3D68",
    shadowOpacity: 0.10,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  avisoTexto: {
    color: "#FFF",

    fontWeight: "600",

    fontSize: 14,
  },

  main: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 24,
  },

  status: {
    fontSize: 18,

    color: "#91486F",

    fontWeight: "600",

    textAlign: "center",

    marginBottom: 10,
  },

  tempo: {
    fontSize: 64,

    fontWeight: "700",

    color: "#B2487D",

    letterSpacing: 1,

    marginBottom: 20,
  },

  botaoChute: {
    width: 220,
    height: 220,

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

    fontSize: 22,

    fontWeight: "700",

    letterSpacing: 0.5,
  },

  textoCancelar: {
    color: "#91486F",

    fontSize: 15,

    fontWeight: "600",

    marginTop: 18,

    textDecorationLine: "underline",
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
    fontSize: 24,

    fontWeight: "700",

    color: "#91486F",
  },

  modalAcoesTopo: {
    flexDirection: "row",
    alignItems: "center",

    gap: 12,
  },

  apagarTudoTexto: {
    color: "#B2487D",

    fontWeight: "700",

    fontSize: 14,
  },

  textoVazio: {
    textAlign: "center",

    marginTop: 24,

    fontSize: 15,

    color: "#A2748B",

    lineHeight: 24,
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

    fontSize: 15,

    color: "#8D3E67",
  },

  cardTexto: {
    fontSize: 14,

    color: "#8E7180",

    lineHeight: 22,
  },

  cardSubtexto: {
    color: "#A2748B",

    fontSize: 13,

    marginTop: 4,
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