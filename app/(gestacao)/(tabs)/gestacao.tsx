import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import React, { useState, useEffect } from "react";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "@/src/constants/theme";

import VisaoGeral from "@/src/components/(barra)/VisaoGeral";
import Desenvolvimento from "@/src/components/(barra)/Desenvolvimento";
import Embriologia from "@/src/components/(barra)/Embriologia";
import Ferramentas from "@/src/components/(barra)/Ferramentas";
import Diario from "@/src/components/(barra)/Diario";
import Planejamentos from "@/src/components/(barra)/Planejamento";
import Nomes from "@/src/components/(barra)/Nomes";
import Compartilhar from "@/src/components/(barra)/Compartilhar";

// FIREBASE
import { auth, db } from "@/src/services/firebase";
import { ref, get } from "firebase/database";

// DADOS DAS SEMANAS
import { dadosSemanas } from "@/src/constants/infoGest";

const ferra = [
  { id: "1", title: "Visão Geral", icon: "home-outline" },
  {
    id: "2",
    title: "Desenvolvimento",
    icon: "heart-outline",
  },
  {
    id: "3",
    title: "Embriologia",
    icon: "medkit-outline",
  },
  {
    id: "4",
    title: "Ferramentas",
    icon: "construct-outline",
  },
  { id: "5", title: "Diário", icon: "book-outline" },
  {
    id: "6",
    title: "Planejamentos",
    icon: "calendar-outline",
  },
  { id: "7", title: "Nomes", icon: "people-outline" },
  {
    id: "8",
    title: "Compartilhar",
    icon: "share-social-outline",
  },
];

export default function Inicio() {
  const [escolha, setEscolha] = useState("1");

  // DADOS GESTAÇÃO
  const [semana, setSemana] = useState(0);
  const [dias, setDias] = useState(0);

  const [tamanho, setTamanho] = useState("...");
  const [peso, setPeso] = useState("...");
  const [fruta, setFruta] = useState("...");

  useEffect(() => {
    async function carregarGestacao() {
      try {
        const user = auth.currentUser;

        if (!user) return;

        const snapshot = await get(
          ref(db, `usuarios/${user.uid}`)
        );

        const dados = snapshot.val();

        if (!dados?.dataUltimaMenstruacao)
          return;

        const partes =
          dados.dataUltimaMenstruacao.split("/");

        const dum = new Date(
          Number(partes[2]),
          Number(partes[1]) - 1,
          Number(partes[0])
        );

        dum.setHours(0, 0, 0, 0);

        const hoje = new Date();

        hoje.setHours(0, 0, 0, 0);

        const diferencaMs =
          hoje.getTime() - dum.getTime();

        const diasTotais = Math.floor(
          diferencaMs / (1000 * 60 * 60 * 24)
        );

        const semanasCalculadas = Math.floor(
          diasTotais / 7
        );

        const diasExtras = diasTotais % 7;

        setSemana(semanasCalculadas);
        setDias(diasExtras);

        const info =
          dadosSemanas[semanasCalculadas] ||
          dadosSemanas[40];

        if (info) {
          setTamanho(info.tamanho || "...");
          setPeso(info.peso || "...");
          setFruta(info.fruta || "...");
        }
      } catch (error) {
        console.log(
          "Erro ao carregar gestação:",
          error
        );
      }
    }

    carregarGestacao();
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
      {/* HEADER */}
      <LinearGradient
        colors={[
          theme.colors.primary,
          theme.colors.cards,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topContainer}
      >
        {/* TOPO */}
        <View style={styles.topHeader}>
          <View style={styles.iconBack}>
            <Ionicons
              name="heart"
              size={18}
              color="#FFF"
            />
          </View>

          <View>
            <Text style={styles.title}>
              Minha Gestação
            </Text>

            <Text style={styles.subtitle}>
              Acompanhe sua gravidez
            </Text>
          </View>
        </View>

        {/* CARD */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardIcon}>
            <Ionicons
              name="happy-outline"
              size={28}
              color={theme.colors.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.weekText}>
              {semana} semanas • {dias} dias
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                📏 {tamanho}
              </Text>

              <Text style={styles.infoLabel}>
                ⚖️ {peso}
              </Text>
            </View>

            <Text style={styles.mainInfo}>
              🍓 Comparável a: {fruta}
            </Text>
          </View>
        </View>

        {/* MENU */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.menuContainer
          }
        >
          {ferra.map((item) => {
            const ativo = escolha === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={[
                  styles.menuButton,
                  ativo &&
                    styles.menuButtonActive,
                ]}
                onPress={() =>
                  setEscolha(item.id)
                }
              >
                <Ionicons
                  name={item.icon as any}
                  size={17}
                  color={
                    ativo
                      ? "#FFF"
                      : theme.colors.primary
                  }
                />

                <Text
                  style={[
                    styles.menuText,
                    ativo &&
                      styles.menuTextActive,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* CONTEÚDO */}
      <View style={styles.content}>
        {render()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  /* HEADER */
  topContainer: {
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 16,

    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,

    elevation: 5,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 16,
  },

  iconBack: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor:
      "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  title: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    fontSize: 12,
  },

  /* CARD */
  mainCard: {
    backgroundColor:
      "rgba(255,255,255,0.16)",

    borderRadius: 22,

    padding: 15,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 18,
  },

  mainCardIcon: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor:
      "rgba(255,255,255,0.25)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  weekText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },

  infoLabel: {
    color: "#FFF",
    fontSize: 13,
    backgroundColor:
      "rgba(255,255,255,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  mainInfo: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
  },

  /* MENU */
  menuContainer: {
    paddingBottom: 4,
    paddingRight: 20,
  },

  menuButton: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 10,

    backgroundColor: "#FFF",

    borderRadius: 14,

    marginRight: 10,
  },

  menuButtonActive: {
    backgroundColor: "#7C3AED",
  },

  menuText: {
    marginLeft: 7,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  menuTextActive: {
    color: "#FFF",
  },

  /* CONTEÚDO */
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
});