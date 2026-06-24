import { dadosSemanas } from "@/src/constants/infoGest";
import { useTheme } from "@/src/context/ThemeContext";
import { useUnit } from "@/src/context/UnitContext";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Desenvolvimento() {
  const { theme } = useTheme();
  const { unidadeAtual } = useUnit();
  const styles = getStyles(theme);

  const [semanaAtual, setSemanaAtual] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const semanaLimitada = Math.min(Math.max(semanaAtual, 1), 40);
  const dadosAtual = dadosSemanas[semanaLimitada] || dadosSemanas[1];

  const formatarTamanho = (valorCmStr: string) => {
    if (!valorCmStr || valorCmStr === "...") return "--";
    if (unidadeAtual === "imperial") {
      const num = parseFloat(valorCmStr.replace(/[^0-9.]/g, ""));
      if (isNaN(num)) return valorCmStr;
      return `${(num * 0.393701).toFixed(1)} in`;
    }
    return valorCmStr;
  };

  const formatarPeso = (valorGramasStr: string) => {
    if (!valorGramasStr || valorGramasStr === "...") return "--";
    if (unidadeAtual === "imperial") {
      const isKg = valorGramasStr.toLowerCase().includes("kg");
      let num = parseFloat(valorGramasStr.replace(/[^0-9.]/g, ""));
      if (isNaN(num)) return valorGramasStr;

      if (isKg) num = num * 1000;
      return `${(num * 0.035274).toFixed(1)} oz`;
    }
    return valorGramasStr;
  };

  const carregarDados = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const gestacoesRef = collection(firestore, "usuarios", uid, "gestacoes");
      const q = query(gestacoesRef, where("status", "==", "ativa"));
      const gestacoesSnap = await getDocs(q);

      if (!gestacoesSnap.empty) {
        const dadosGestacao = gestacoesSnap.docs[0].data();

        if (dadosGestacao?.dataUltimaMenstruacao) {
          const partes = dadosGestacao.dataUltimaMenstruacao.split("/");

          if (partes.length === 3) {
            const dum = new Date(
              Number(partes[2]),
              Number(partes[1]) - 1,
              Number(partes[0]),
            );
            dum.setHours(0, 0, 0, 0);

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const diffDias = Math.floor(
              (hoje.getTime() - dum.getTime()) / (1000 * 60 * 60 * 24),
            );

            const diasValidos = Math.max(0, diffDias);
            const semanasCalculadas = Math.floor(diasValidos / 7);

            setSemanaAtual(semanasCalculadas);
          }
        }
      }
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        await carregarDados();
        setLoading(false);
      } else {
        setSemanaAtual(1);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.text} />
        <Text style={{ color: theme.colors.subtitle, marginTop: 10 }}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#E91E63"]}
          tintColor="#E91E63"
        />
      }
    >
      <View style={styles.row}>
        <View style={styles.litle}>
          <View style={styles.litleHeader}>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={20}
                color={theme.colors.text}
              />
            </View>
            <Text style={styles.text}>Peso Médio</Text>
          </View>
          <Text style={styles.litleValue}>
            {formatarPeso(dadosAtual?.peso || "--")}
          </Text>
        </View>

        <View style={styles.litle}>
          <View style={styles.litleHeader}>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="ruler"
                size={20}
                color={theme.colors.text}
              />
            </View>
            <Text style={styles.text}>Tamanho</Text>
          </View>
          <Text style={styles.litleValue}>
            {formatarTamanho(dadosAtual?.tamanho || "--")}
          </Text>
        </View>
      </View>

      <View style={[styles.card, styles.organsCard]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.situacao}> Situação </Text>
          <Text style={styles.textSituacao}>
            {dadosAtual?.desenvolvimento || "--"}
          </Text>
        </View>

        {(dadosAtual?.orgaos || []).map((item: string, index: number) => (
          <View style={styles.orgRow} key={index}>
            <View style={styles.dotPink} />
            <Text style={styles.orgText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, styles.curiosityCard]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="brain" size={22} color="#FFF" />
          <Text style={[styles.sectionTitle, { color: "#FFF" }]}>
            Curiosidades da Semana
          </Text>
        </View>

        {(dadosAtual?.curiosidades || []).map((item: string, index: number) => (
          <View style={styles.curiosityRow} key={index}>
            <Text style={styles.sparkleIcon}>✨</Text>
            <Text style={styles.curiosityText}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    card: {
      width: "100%",
      borderRadius: 20,
      marginBottom: 16,
      padding: 20,
      backgroundColor: theme.colors.gestantesSecondary,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      elevation: 2,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    litle: {
      width: "48%",
      minHeight: 120,
      backgroundColor: theme.colors.gestantesCard,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      elevation: 2,
    },
    litleHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    litleValue: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    text: {
      fontSize: theme.texts.text,
      color: theme.colors.text,
    },
    icon: {
      backgroundColor: theme.colors.background,
      padding: 8,
      marginRight: 8,
      borderRadius: 14,
    },
    organsCard: {
      backgroundColor: theme.colors.gestantesCard,
      paddingVertical: 20,
    },
    sectionHeader: {
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.text,
      marginLeft: 8,
      marginBottom: 10,
    },
    orgRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      backgroundColor: "rgba(255,255,255,0.6)",
    },
    dotPink: {
      width: 8,
      height: 8,
      backgroundColor: "red",
      borderRadius: 4,
      marginRight: 10,
    },
    orgText: {
      color: theme.colors.text,
      fontSize: theme.texts.text,
      flex: 1,
    },
    curiosityCard: {
      backgroundColor: theme.colors.gestantesCard,
      elevation: 0,
      shadowOpacity: 0,
    },
    curiosityRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    sparkleIcon: { marginRight: 10, fontSize: 16 },
    curiosityText: {
      color: theme.colors.subtitle,
      fontSize: theme.texts.text,
      flex: 1,
    },
    situacao: {
      color: theme.colors.text,
      fontSize: theme.texts.title,
      marginBottom: 10,
    },
    textSituacao: {
      color: theme.colors.subtitle,
      fontSize: theme.texts.subtitle,
      textAlign: "center",
    },
  });
