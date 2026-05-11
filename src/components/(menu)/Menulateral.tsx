import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import {EditarPerfil} from "@/src/components/(menu)/EditarPerfil";
import {Configuracoes} from "@/src/components/(menu)/Configuracoes";

import { getData } from "@/src/services/database";
import { getCurrentUser, logout } from "@/src/services/auth";
import { theme } from "@/src/constants/theme";

export default function Menulateral() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    nome: "Carregando...",
    email: "",
  });

  const [gravidezData, setGravidezData] = useState({
    semanasText: "Calculando...",
    dataParto: "...",
  });

  async function carregarDados() {
    try {
      const currentUser = await getCurrentUser();

      if (!currentUser) return;

      const dbData = await getData(currentUser.uid);

      setUserData({
        nome: dbData?.user?.nome || "Usuário",
        email: currentUser.email || dbData?.user?.email || "",
      });

      if (dbData?.user?.dataUltimaMenstruacao) {
        const partes =
          dbData.user.dataUltimaMenstruacao.split("/");

        const dum = new Date(
          Number(partes[2]),
          Number(partes[1]) - 1,
          Number(partes[0])
        );

        dum.setHours(0, 0, 0, 0);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const diffMs =
          hoje.getTime() - dum.getTime();

        const diffDiasTotal = Math.round(
          diffMs / (1000 * 60 * 60 * 24)
        );

        const diasValidos = Math.max(
          0,
          diffDiasTotal
        );

        const semanasCalculadas = Math.floor(
          diasValidos / 7
        );

        const diasExtra = diasValidos % 7;

        const dataPrevista = new Date(
          dum.getTime() +
            280 * 24 * 60 * 60 * 1000
        );

        setGravidezData({
          semanasText: `${semanasCalculadas} semanas e ${diasExtra} dias`,
          dataParto:
            dataPrevista.toLocaleDateString(
              "pt-BR"
            ),
        });
      }
    } catch (error) {
      console.log(
        "Erro ao carregar dados no menu:",
        error
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleLogout() {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData.nome?.charAt(0)?.toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>
            {userData.nome}
          </Text>

          <Text style={styles.email}>
            {userData.email}
          </Text>
        </View>
      </View>

      {/* CONTEÚDO */}
      <View style={styles.content}>
        {/* ESTADO ATUAL */}
        <View style={styles.section}>
          <Text style={styles.title}>
            Estado Atual
          </Text>

          <View style={styles.cardPurple}>
            <Text style={styles.cardSubtitle}>
              Tempo de Gestação
            </Text>

            <Text style={styles.cardValue}>
              {gravidezData.semanasText}
            </Text>
          </View>

          <View style={styles.cardPink}>
            <Text style={styles.cardSubtitle}>
              Previsão do Parto
            </Text>

            <Text style={styles.cardValue}>
              {gravidezData.dataParto}
            </Text>
          </View>
        </View>

        {/* CONTA */}
        <View style={styles.section}>
          <Text style={styles.title}>
            Conta
          </Text>

          <EditarPerfil
            onUpdate={carregarDados}
          />

          <Configuracoes />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather
              name="log-out"
              size={20}
              color="#ff4d4d"
            />

            <Text
              style={[
                styles.menuItemText,
                { color: "#ff4d4d" },
              ]}
            >
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      theme.colors.background,
  },

  header: {
    padding: 30,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      theme.colors.cards,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#d946ef",
    fontSize: 24,
    fontWeight: "600",
  },

  headerTextContainer: {
    marginLeft: 15,
    flex: 1,
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  email: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 2,
  },

  content: {
    paddingTop: 20,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    fontWeight: "bold",
  },

  cardPurple: {
    backgroundColor:
      theme.colors.terceary,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  cardPink: {
    backgroundColor:
      theme.colors.terceary,
    padding: 15,
    borderRadius: 12,
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },

  cardValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
});