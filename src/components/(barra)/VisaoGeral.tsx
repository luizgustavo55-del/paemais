import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getData } from "@/src/services/database";
import { auth } from "@/src/services/firebase";

import { dadosSemanas } from "@/src/constants/infoGest";
import { theme } from "@/src/constants/theme";

export default function VisaoGeral() {
  const [semanas, setSemanas] = useState(0);
  const [diasExtra, setDiasExtra] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [dpp, setDpp] = useState("...");
  const [diasRestantes, setDiasRestantes] =
    useState(280);

  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);

  const dadosAtual =
    dadosSemanas[semanas] ||
    dadosSemanas[40];

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        // 🔥 PEGA UID DO USUÁRIO LOGADO
        const uid = auth.currentUser?.uid;

        if (!uid) {
          console.log("Usuário não logado");
          return;
        }

        // 🔥 BUSCA DADOS NO REALTIME DATABASE
        // usuarios/uid
        const dados = await getData(uid);

        console.log("Dados usuário:", dados);

        // 🔥 PEGA NOME
        if (dados?.nome) {
          setNome(dados.nome);
        }

        // 🔥 PEGA DUM
        if (dados?.dataUltimaMenstruacao) {
          const partes =
            dados.dataUltimaMenstruacao.split(
              "/"
            );

          // dd/mm/yyyy
          const dum = new Date(
            Number(partes[2]),
            Number(partes[1]) - 1,
            Number(partes[0])
          );

          dum.setHours(0, 0, 0, 0);

          const hoje = new Date();

          hoje.setHours(0, 0, 0, 0);

          // 🔥 DIFERENÇA EM DIAS
          const diffMs =
            hoje.getTime() - dum.getTime();

          const diffDiasTotal = Math.floor(
            diffMs / (1000 * 60 * 60 * 24)
          );

          const diasValidos = Math.max(
            0,
            diffDiasTotal
          );

          // 🔥 SEMANAS
          const semanasCalculadas =
            Math.floor(diasValidos / 7);

          setSemanas(semanasCalculadas);

          // 🔥 DIAS EXTRAS
          setDiasExtra(
            diasValidos % 7
          );

          // 🔥 PROGRESSO
          const progressoCalculado = Math.min(
            Math.round(
              (diasValidos / 280) * 100
            ),
            100
          );

          setProgresso(
            progressoCalculado
          );

          // 🔥 DPP
          const dppData = new Date(dum);

          dppData.setDate(
            dppData.getDate() + 280
          );

          setDpp(
            dppData.toLocaleDateString(
              "pt-BR"
            )
          );

          // 🔥 DIAS RESTANTES
          setDiasRestantes(
            Math.max(
              0,
              280 - diasValidos
            )
          );
        }
      } catch (error) {
        console.log(
          "Erro ao carregar Visão Geral:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />

        <Text style={styles.loadingText}>
          Carregando informações...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerTitle}>
            {nome
              ? `Olá, ${nome.split(" ")[0]} 💜`
              : "Minha Gestação 💜"}
          </Text>

          <Text style={styles.headerSubtitle}>
            Acompanhe sua gravidez
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="baby-face-outline"
            size={34}
            color="#FFF"
          />
        </View>
      </View>

      {/* CARD PRINCIPAL */}
      <View style={styles.progressCard}>
        <Text style={styles.weekTitle}>
          Semana {semanas}
        </Text>

        <Text style={styles.weekSubtitle}>
          {semanas} semanas e{" "}
          {diasExtra} dias
        </Text>

        {/* PROGRESSO */}
        <View style={styles.progressSection}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>
              Progresso da gestação
            </Text>

            <Text style={styles.progressValue}>
              {progresso}%
            </Text>
          </View>

          <View
            style={
              styles.progressBarBackground
            }
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progresso}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* DPP */}
        <View style={styles.dateSection}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={20}
            color="#D81B60"
          />

          <Text style={styles.dateText}>
            Data prevista:{" "}
            <Text style={styles.dateBold}>
              {dpp}
            </Text>
          </Text>
        </View>
      </View>

      {/* DIAS RESTANTES */}
      <View style={styles.daysCard}>
        <View>
          <Text style={styles.daysLabel}>
            Dias restantes
          </Text>

          <Text style={styles.daysValue}>
            {diasRestantes} dias
          </Text>
        </View>

        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="timer-sand"
            size={30}
            color="#D81B60"
          />
        </View>
      </View>

      {/* TAMANHO DO BEBÊ */}
      <View style={styles.babySizeCard}>
        <Text style={styles.babySizeTitle}>
          Tamanho do Bebê
        </Text>

        <View style={styles.babySizeInnerCard}>
          <Text style={styles.babyEmoji}>
            {dadosAtual?.emoji || "👶"}
          </Text>

          <Text
            style={
              styles.babySizeMeasure
            }
          >
            Aproximadamente{" "}
            {dadosAtual?.tamanho ||
              "--"}
          </Text>

          <Text
            style={
              styles.babySizeComparison
            }
          >
            Tamanho de{" "}
            {dadosAtual?.fruta ||
              "--"}
          </Text>
        </View>
      </View>

      {/* DESENVOLVIMENTO */}
      <View style={styles.devCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={22}
            color={theme.colors.primary}
          />

          <Text style={styles.sectionTitle}>
            Desenvolvimento
          </Text>
        </View>

        <Text style={styles.devText}>
          {dadosAtual?.desenvolvimento ||
            "Informações indisponíveis"}
        </Text>
      </View>

      {/* CURIOSIDADES */}
      <View style={styles.curiosityCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={22}
            color="#FFF"
          />

          <Text
            style={[
              styles.sectionTitle,
              { color: "#FFF" },
            ]}
          >
            Você sabia?
          </Text>
        </View>

        <View style={styles.curiosityList}>
          {(
            dadosAtual?.curiosidades ||
            []
          ).map(
            (
              item: string,
              index: number
            ) => (
              <View
                key={index}
                style={
                  styles.curiosityItemBox
                }
              >
                <Text
                  style={
                    styles.curiosityBullet
                  }
                >
                  ✨
                </Text>

                <Text
                  style={
                    styles.curiosityItem
                  }
                >
                  {item}
                </Text>
              </View>
            )
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      theme.colors.background,
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  /* HEADER */

  headerCard: {
    backgroundColor:
      theme.colors.primary,
    borderRadius: 24,
    padding: 22,

    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color:
      "rgba(255,255,255,0.8)",
    marginTop: 4,
  },

  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor:
      "rgba(255,255,255,0.2)",

    justifyContent: "center",
    alignItems: "center",
  },

  /* CARD PRINCIPAL */

  progressCard: {
    backgroundColor:
      theme.colors.cards,
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

  weekSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },

  progressSection: {
    width: "100%",
    marginBottom: 24,
  },

  progressTextRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 14,
    color: "#555",
  },

  progressValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
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

  dateText: {
    marginLeft: 8,
    color: "#444",
  },

  dateBold: {
    fontWeight: "bold",
    color: "#333",
  },

  /* DIAS */

  daysCard: {
    backgroundColor:
      theme.colors.terceary,
    borderRadius: 24,
    padding: 22,

    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    elevation: 2,
  },

  daysLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  daysValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",
  },

  /* BEBÊ */

  babySizeCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor:
      theme.colors.cards,
  },

  babySizeTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },

  babySizeInnerCard: {
    backgroundColor:
      "rgba(255,255,255,0.18)",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
  },

  babyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },

  babySizeMeasure: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },

  babySizeComparison: {
    color:
      "rgba(255,255,255,0.85)",
    fontSize: 14,
  },

  /* DESENVOLVIMENTO */

  devCard: {
    backgroundColor:
      theme.colors.terceary,
    borderRadius: 24,
    padding: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color:
      theme.colors.textPrimary,
  },

  devText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },

  /* CURIOSIDADES */

  curiosityCard: {
    backgroundColor:
      theme.colors.cards,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },

  curiosityList: {
    gap: 12,
  },

  curiosityItemBox: {
    flexDirection: "row",
    alignItems: "flex-start",

    backgroundColor:
      "rgba(255,255,255,0.15)",

    borderRadius: 14,
    padding: 14,
  },

  curiosityBullet: {
    marginRight: 10,
    fontSize: 16,
  },

  curiosityItem: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#FFF",
  },
});