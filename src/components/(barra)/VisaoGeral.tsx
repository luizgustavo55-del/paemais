import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export default function VisaoGeral() {
  const { theme } = useTheme();

  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;

  const styles = getStyles(theme, isModoCompacto);

  const [semanas, setSemanas] = useState(0);
  const [diasExtra, setDiasExtra] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [dpp, setDpp] = useState("...");
  const [diasRestantes, setDiasRestantes] = useState(280);

  const [lembretes, setLembretes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
          const dum = new Date(
            Number(partes[2]),
            Number(partes[1]) - 1,
            Number(partes[0]),
          );

          dum.setHours(0, 0, 0, 0);

          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const diffMs = hoje.getTime() - dum.getTime();
          const diffDiasTotal = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diasValidos = Math.max(0, diffDiasTotal);

          const semanasCalculadas = Math.floor(diasValidos / 7);
          setSemanas(semanasCalculadas);

          setDiasExtra(diasValidos % 7);

          const progressoCalculado = Math.min(
            Math.round((diasValidos / 280) * 100),
            100,
          );
          setProgresso(progressoCalculado);

          const dppData = new Date(dum);
          dppData.setDate(dppData.getDate() + 280);
          setDpp(dppData.toLocaleDateString("pt-BR"));

          setDiasRestantes(Math.max(0, 280 - diasValidos));
        }
      }

      const userRef = doc(firestore, "usuarios", uid);
      const userSnap = await getDoc(userRef);

      let lembretesFormatados: any[] = [];

      if (userSnap.exists()) {
        const dadosUsuario = userSnap.data();
        const todosLembretes = dadosUsuario.lembretes || [];

        lembretesFormatados = todosLembretes
          .filter((l: any) => !l.concluido)
          .map((l: any) => ({
            ...l,
            tipoLembrete: l.tipo || "dia a dia",
            origem: "lembrete",
          }));
      }

      const consultasRef = collection(firestore, "usuarios", uid, "consultas");
      const consultasSnap = await getDocs(consultasRef);

      const consultasFormatadas = consultasSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          titulo: data.titulo,
          data: data.data,
          hora: data.hora,
          tipoLembrete: "importante",
          origem: data.tipo,
        };
      });

      const todosItens = [...lembretesFormatados, ...consultasFormatadas];
      const agora = new Date().getTime();

      const itensProximos = todosItens
        .filter((l: any) => {
          if (!l.data || !l.hora) return false;
          const [dia, mes, ano] = l.data.split("/");
          const [hora, minuto] = l.hora.split(":");
          const dataLembrete = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(minuto),
          ).getTime();
          return dataLembrete > agora;
        })
        .sort((a: any, b: any) => {
          const [diaA, mesA, anoA] = a.data.split("/");
          const [horaA, minA] = a.hora.split(":");
          const dataA = new Date(
            Number(anoA),
            Number(mesA) - 1,
            Number(diaA),
            Number(horaA),
            Number(minA),
          ).getTime();

          const [diaB, mesB, anoB] = b.data.split("/");
          const [horaB, minB] = b.hora.split(":");
          const dataB = new Date(
            Number(anoB),
            Number(mesB) - 1,
            Number(diaB),
            Number(horaB),
            Number(minB),
          ).getTime();

          return dataA - dataB;
        })
        .slice(0, 3);

      setLembretes(itensProximos);
    } catch (error) {
      console.log("Erro ao carregar Visão Geral:", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        await carregarDados();
        setLoading(false);
      } else {
        setSemanas(0);
        setDiasExtra(0);
        setProgresso(0);
        setDpp("...");
        setDiasRestantes(280);
        setLembretes([]);
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Carregando informações...</Text>
      </View>
    );
  }

  const getIconeOrigem = (origem: string) => {
    if (origem === "Consulta") return "stethoscope";
    if (origem === "Exame") return "flask-outline";
    return "calendar-range";
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
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
      <View style={styles.progressCard}>
        <Text style={styles.weekTitle}>Semana {semanas}</Text>
        <Text style={styles.weekSubtitle}>
          {semanas} semanas e {diasExtra} dias
        </Text>

        <View style={styles.progressSection}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>Progresso da gestação</Text>
            <Text style={styles.progressValue}>{progresso}%</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${progresso}%` }]}
            />
          </View>
        </View>

        <View style={styles.dateSection}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={20}
            color="#D81B60"
          />
          <Text style={styles.dateText}>
            Data prevista: <Text style={styles.dateBold}>{dpp}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.daysCard}>
        <View>
          <Text style={styles.daysLabel}>Dias restantes</Text>
          <Text style={styles.daysValue}>{diasRestantes} dias</Text>
        </View>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="timer-sand" size={30} color="#D81B60" />
        </View>
      </View>

      <View style={styles.remindersCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Avisos</Text>
        </View>

        {lembretes.length === 0 ? (
          <Text style={styles.emptyRemindersText}>
            Nenhum lembrete próximo.
          </Text>
        ) : (
          <View style={styles.remindersList}>
            {lembretes.map((lembrete, index) => (
              <View key={index} style={styles.reminderItem}>
                <View
                  style={[
                    styles.iconContainer,
                    lembrete.tipoLembrete === "importante"
                      ? { backgroundColor: "#E11D48" }
                      : { backgroundColor: "#D81B60" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getIconeOrigem(lembrete.origem)}
                    size={22}
                    color="#FFF"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.reminderTitleRow}>
                    <Text style={styles.reminderTitle} numberOfLines={1}>
                      {lembrete.titulo}
                    </Text>
                    {lembrete.tipoLembrete === "importante" && (
                      <MaterialCommunityIcons
                        name="alert-circle"
                        size={14}
                        color="#E11D48"
                        style={{ marginLeft: 6 }}
                      />
                    )}
                  </View>

                  <Text style={styles.reminderDate}>
                    {lembrete.data} às {lembrete.hora}
                  </Text>

                  <Text
                    style={[
                      styles.reminderBadgeText,
                      lembrete.tipoLembrete === "importante"
                        ? { color: "#E11D48" }
                        : { color: "#9C7388" },
                    ]}
                  >
                    {lembrete.tipoLembrete === "importante"
                      ? "Importante"
                      : "Dia a dia"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: { padding: isModoCompacto ? 12 : 16, gap: 16 },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: { marginTop: 10, color: theme.colors.subtitle },
    progressCard: {
      backgroundColor: theme.colors.gestantesCard,
      borderRadius: 24,
      padding: isModoCompacto ? 20 : 24,
      alignItems: "center",
    },
    weekTitle: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.subtitle,
      marginBottom: 6,
    },
    weekSubtitle: {
      fontSize: theme.texts.subtitle,
      color: theme.colors.text,
      marginBottom: 24,
    },
    progressSection: { width: "100%", marginBottom: 24 },
    progressTextRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    progressLabel: { fontSize: theme.texts.text, color: theme.colors.subtitle },
    progressValue: {
      fontSize: theme.texts.text,
      fontWeight: "bold",
      color: theme.colors.subtitle,
    },
    progressBarBackground: {
      height: 10,
      backgroundColor: "#FFF",
      borderRadius: 999,
      width: "100%",
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "#E91E63",
      borderRadius: 999,
    },
    dateSection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 14,
    },
    dateText: { marginLeft: 8, color: "#444" },
    dateBold: { fontWeight: "bold", color: theme.colors.title },
    daysCard: {
      backgroundColor: theme.colors.gestantesCard,
      borderRadius: 24,
      padding: isModoCompacto ? 18 : 22,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      elevation: 2,
    },
    daysLabel: {
      fontSize: theme.texts.subtitle,
      color: theme.colors.subtitle,
      marginBottom: 4,
    },
    daysValue: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    iconBox: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#FFF",
      justifyContent: "center",
      alignItems: "center",
    },
    remindersCard: {
      backgroundColor: theme.colors.gestantesCard,
      borderRadius: 24,
      padding: isModoCompacto ? 16 : 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      marginLeft: 8,
      color: theme.colors.subtitle,
    },
    emptyRemindersText: {
      color: theme.colors.text,
      fontSize: theme.texts.text,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 8,
    },
    remindersList: {
      gap: 12,
    },
    reminderItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F9F9F9",
      padding: 12,
      borderRadius: 12,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    reminderTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 1,
    },
    reminderTitle: {
      fontSize: theme.texts.text,
      fontWeight: "600",
      color: theme.colors.title,
      flexShrink: 1,
    },
    reminderDate: {
      fontSize: theme.texts.text,
      color: theme.colors.subtitle,
      marginBottom: 2,
    },
    reminderBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
  });
