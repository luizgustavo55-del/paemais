import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function VisaoGeral() {
  const [semanas, setSemanas] = useState(0);
  const [diasExtra, setDiasExtra] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [dpp, setDpp] = useState("...");
  const [diasRestantes, setDiasRestantes] = useState(280);

  const [lembretes, setLembretes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        const uid = auth.currentUser?.uid;

        if (!uid) {
          console.log("Usuário não logado");
          return;
        }

        const gestacoesRef = collection(
          firestore,
          "usuarios",
          uid,
          "gestacoes",
        );
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

        if (userSnap.exists()) {
          const dadosUsuario = userSnap.data();
          const todosLembretes = dadosUsuario.lembretes || [];
          const agora = new Date().getTime();

          const lembretesProximos = todosLembretes
            .filter((l: any) => !l.concluido)
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

          setLembretes(lembretesProximos);
        }
      } catch (error) {
        console.log("Erro ao carregar Visão Geral:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando informações...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
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
          <Text style={styles.sectionTitle}>Próximos Lembretes</Text>
        </View>

        {lembretes.length === 0 ? (
          <Text style={styles.emptyRemindersText}>
            Nenhum lembrete próximo.
          </Text>
        ) : (
          <View style={styles.remindersList}>
            {lembretes.map((lembrete, index) => (
              <View key={index} style={styles.reminderItem}>
                <View style={styles.reminderDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderTitle}>{lembrete.titulo}</Text>
                  <Text style={styles.reminderDate}>
                    {lembrete.data} às {lembrete.hora}
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

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: { marginTop: 10, color: "#666" },
  headerCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  headerSubtitle: { color: "rgba(255,255,255,0.8)", marginTop: 4 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressCard: {
    backgroundColor: theme.colors.cards,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  weekTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  weekSubtitle: { fontSize: 16, color: "#666", marginBottom: 24 },
  progressSection: { width: "100%", marginBottom: 24 },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, color: "#555" },
  progressValue: { fontSize: 14, fontWeight: "bold", color: "#555" },
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
  dateBold: { fontWeight: "bold", color: "#333" },
  daysCard: {
    backgroundColor: theme.colors.terceary,
    borderRadius: 24,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  daysLabel: { fontSize: 14, color: "#666", marginBottom: 4 },
  daysValue: { fontSize: 30, fontWeight: "bold", color: "#333" },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  remindersCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
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
    fontSize: theme.texts.title,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  emptyRemindersText: {
    color: "#888",
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
  reminderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "yellow",
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  reminderDate: {
    fontSize: 13,
    color: "#777",
  },
});
