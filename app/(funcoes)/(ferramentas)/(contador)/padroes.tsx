import { theme } from "@/src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🔥 Novos imports do Firebase
import { auth, firestore } from "@/src/services/firebase";
import { doc, getDoc } from "firebase/firestore";

interface RegistroChute {
  id: string | number;
  tempo: string;
  hora: string;
  chutes: number; // Adicionado para tipagem correta
}

export default function Padroes() {
  const router = useRouter();

  const [historico, setHistorico] = useState<RegistroChute[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [mediaTempo, setMediaTempo] = useState("00:00");
  const [horarioPico, setHorarioPico] = useState("");
  const [alerta, setAlerta] = useState("");

  const [tendencia, setTendencia] = useState("");
  const [score, setScore] = useState(0);
  const [melhorTempo, setMelhorTempo] = useState("");
  const [consistencia, setConsistencia] = useState("");
  const [resumo, setResumo] = useState("");

  useFocusEffect(
    useCallback(() => {
      carregarPadroes();
    }, []),
  );

  const converterTempo = (tempo: string) => {
    const [min, seg] = tempo.split(":").map(Number);
    return min * 60 + seg;
  };

  const formatar = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
  };

  // 🔥 Carrega os dados diretamente do Firestore
  const carregarPadroes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      let dados: RegistroChute[] = [];

      if (userSnap.exists()) {
        dados = userSnap.data().historicoChutes || [];
      }

      // Ordena do mais recente para o mais antigo
      dados = dados.sort((a, b) => Number(b.id) - Number(a.id));
      setHistorico(dados);

      if (dados.length >= 3) {
        calcularInteligencia(dados);
      }
    } catch (error) {
      console.log("Erro ao carregar padrões do Firestore:", error);
    }
  };

  const aoAtualizar = async () => {
    setRefreshing(true);
    await carregarPadroes();
    setRefreshing(false);
  };

  const calcularInteligencia = (dados: RegistroChute[]) => {
    let tempoTotal = 0;
    let turnos = { Manhã: 0, Tarde: 0, Noite: 0 };

    const tempos = dados.map((d) => converterTempo(d.tempo));

    dados.forEach((item) => {
      tempoTotal += converterTempo(item.tempo);

      const hora = parseInt(item.hora.split(":")[0]);
      if (hora >= 6 && hora < 12) turnos.Manhã++;
      else if (hora < 18) turnos.Tarde++;
      else turnos.Noite++;
    });

    const mediaSeg = Math.floor(tempoTotal / dados.length);
    setMediaTempo(formatar(mediaSeg));

    const pico = Object.keys(turnos).reduce((a, b) =>
      turnos[a as keyof typeof turnos] > turnos[b as keyof typeof turnos]
        ? a
        : b,
    );
    setHorarioPico(pico);

    const melhor = Math.min(...tempos);
    setMelhorTempo(formatar(melhor));

    const registrosRecentes = tempos.slice(0, 10);
    const variacao =
      Math.max(...registrosRecentes) - Math.min(...registrosRecentes);

    setConsistencia(variacao < 120 ? "Consistente" : "Variável");

    const ultimos = tempos.slice(0, 3);
    let textoTendencia = "Estável";

    if (ultimos[0] < ultimos[1] && ultimos[1] < ultimos[2]) {
      textoTendencia = "Melhorando";
    } else if (ultimos[0] > ultimos[1] && ultimos[1] > ultimos[2]) {
      textoTendencia = "Mais lento";
    }

    setTendencia(textoTendencia);

    let s = 0;
    if (mediaSeg > 600) s -= 30;
    if (variacao > 300) s -= 20;
    setScore(s);

    const ultimo = tempos[0];

    if (ultimo > mediaSeg * 2) {
      setAlerta(
        "O movimento recente foi mais lento que o padrão. Observe nas próximas horas.",
      );
    } else if (ultimo < mediaSeg * 0.7) {
      setAlerta("O bebê está super ativo hoje!");
    } else {
      setAlerta("Tudo ótimo! Os movimentos estão dentro do padrão saudável.");
    }

    const statusConsistencia =
      variacao < 120
        ? "um padrão consistente"
        : "uma leve variação nos movimentos";

    setResumo(
      `Seu bebê é mais ativo à ${pico.toLowerCase()} e apresenta ${statusConsistencia}. A tendência atual está ${textoTendencia.toLowerCase()}.`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/(funcoes)/(contador)/contador" as any)}
            style={styles.back}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color={theme.colors.title}
            />
          </TouchableOpacity>
          <Text style={styles.titulo}>Análise Inteligente</Text>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={aoAtualizar}
              tintColor={theme.colors.primary}
            />
          }
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.topInfo}>
            Sessões registradas: {historico.length}
          </Text>

          {historico.length < 3 ? (
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: theme.colors.title,
                opacity: 0.7,
              }}
            >
              Use o contador pelo menos 3 vezes para gerar os primeiros padrões
              do seu bebê.
            </Text>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Resumo</Text>
                <Text style={styles.cardText}>{resumo}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Status Atual</Text>
                <Text style={styles.cardText}>{alerta}</Text>
              </View>

              {/* GRID */}
              <View style={styles.grid}>
                <View style={styles.cardHalf}>
                  <Text style={styles.valor}>{mediaTempo}</Text>
                  <Text style={styles.legenda}>Média</Text>
                </View>

                <View style={styles.cardHalf}>
                  <Text style={styles.valor}>{horarioPico}</Text>
                  <Text style={styles.legenda}>Pico</Text>
                </View>

                <View style={styles.cardHalf}>
                  <Text style={styles.valor}>{melhorTempo}</Text>
                  <Text style={styles.legenda}>Melhor</Text>
                </View>

                <View style={styles.cardHalf}>
                  <Text style={styles.valor}>{tendencia}</Text>
                  <Text style={styles.legenda}>Tendência</Text>
                </View>

                <View style={styles.cardHalf}>
                  <Text style={styles.valor}>{score}</Text>
                  <Text style={styles.legenda}>Score</Text>
                </View>

                <View style={styles.cardHalf}>
                  <Text style={[styles.valor, { fontSize: 18 }]}>
                    {consistencia}
                  </Text>
                  <Text style={styles.legenda}>Consistência</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.terceary, marginTop: 50 },
  container: { flex: 1, backgroundColor: theme.colors.terceary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.terceary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
  },
  back: { position: "absolute", left: 20, zIndex: 10 },
  titulo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.title,
  },
  content: { padding: 20 },
  topInfo: {
    textAlign: "center",
    marginBottom: 15,
    color: theme.colors.title,
    fontWeight: "500",
    opacity: 0.8,
  },
  card: {
    backgroundColor: theme.colors.secondary,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  cardText: { color: theme.colors.title, lineHeight: 22 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  cardHalf: {
    width: "48%",
    backgroundColor: theme.colors.secondary,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  valor: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  legenda: { fontSize: 14, color: theme.colors.title, opacity: 0.8 },
});
