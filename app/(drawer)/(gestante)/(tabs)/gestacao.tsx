import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from '@/src/constants/theme';

import VisaoGeral from "@/src/components/(barra)/VisaoGeral";
import Desenvolvimento from "@/src/components/(barra)/Desenvolvimento";
import Saude from "@/src/components/(barra)/Embriologia";
import Ferramentas from "@/src/components/(barra)/Ferramentas";
import Diario from "@/src/components/(barra)/Diario";
import Planejamentos from "@/src/components/(barra)/Planejamento";
import Nomes from "@/src/components/(barra)/Nomes";
import Compartilhar from "@/src/components/(barra)/Compartilhar";

const ferra = [
  { id: "1", title: "Visão Geral", icon: "home-outline" },
  { id: "2", title: "Desenvolvimento", icon: "heart-outline" },
  { id: "3", title: "Saúde", icon: "medkit-outline" },
  { id: "4", title: "Ferramentas", icon: "construct-outline" },
  { id: "5", title: "Diário", icon: "book-outline" },
  { id: "6", title: "Planejamentos", icon: "calendar-outline" },
  { id: "7", title: "Nomes", icon: "people-outline" },
  { id: "8", title: "Compartilhar", icon: "share-outline" },
];

export default function Inicio() {
  const [escolha, setEscolha] = useState("1");

  const render = () => {
    switch (escolha) {
      case "1":
        return <VisaoGeral />;

      case "2":
        return <Desenvolvimento />;

      case "3":
        return <Saude />;

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
      {/* MENU SUPERIOR */}
      <View style={styles.headerContainer}>
        <ScrollView
          style={styles.ferramentas}
          contentContainerStyle={styles.ferramentasContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {ferra.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={[
                styles.cardFer,
                escolha === item.id && styles.cardFerAtivo,
              ]}
              onPress={() => setEscolha(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={
                  escolha === item.id
                    ? theme.colors.textPrimary
                    : "#999"
                }
              />

              <Text
                style={{
                  fontSize: 12,
                  marginTop: 6,
                  color:
                    escolha === item.id
                      ? theme.colors.textPrimary
                      : "#999",
                  fontWeight:
                    escolha === item.id ? "600" : "400",
                }}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CONTEÚDO DINÂMICO */}
      <View style={styles.conteudoDinamico}>
        {render()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 10,
  },

  headerContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  ferramentas: {
    backgroundColor: "#fff",
    height: 85,
    maxHeight: 85,
    borderRadius: 18,

    elevation: 4,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  ferramentasContent: {
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },

  cardFer: {
    height: 65,
    width: 95,
    borderRadius: 14,
    marginHorizontal: 6,

    alignItems: "center",
    justifyContent: "center",
  },

  cardFerAtivo: {
    backgroundColor: "#FDF0F4",
    transform: [{ scale: 1.05 }],
  },

  conteudoDinamico: {
    flex: 1,
    paddingHorizontal: 15,
  },
});