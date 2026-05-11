import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AnemiaGestacao() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(pai)/(tabs)/dicas")}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Dicas de Saúde</Text>
        </View>

        <Text style={styles.title}>Anemia na Gestação</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* VISÃO GERAL */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#ff5ea8"
            />

            <Text style={styles.cardTitle}>Visão Geral</Text>
          </View>

          <Text style={styles.cardText}>
            A anemia durante a gravidez ocorre quando há falta de glóbulos
            vermelhos saudáveis para transportar oxigênio adequadamente para os
            tecidos do corpo e para o bebê.
          </Text>
        </View>

        {/* SINTOMAS */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#ffb300"
            />

            <Text style={styles.cardTitle}>Sintomas Comuns</Text>
          </View>

          {[
            "Fadiga e cansaço extremo",
            "Palidez na pele e mucosas",
            "Falta de ar",
            "Tonturas ou vertigens",
            "Batimentos cardíacos acelerados",
            "Dificuldade de concentração",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* TRATAMENTO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#00c48c"
            />

            <Text style={styles.cardTitle}>Tratamento</Text>
          </View>

          {[
            "Suplementação de ferro conforme prescrição médica",
            "Aumento do consumo de alimentos ricos em ferro",
            "Vitamina C para melhorar a absorção de ferro",
            "Em casos severos, transfusão de sangue",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: "#00c48c" }]} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ece3ff",
  },

  header: {
    backgroundColor: "#7050b3",
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#28174cca",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#b390d8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#b390d8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#28174cca",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  cardTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#28174c",
    marginLeft: 10,
  },

  cardText: {
    fontSize: 18,
    color: "#4a4a4a",
    lineHeight: 30,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffb300",
    marginTop: 9,
    marginRight: 12,
  },

  listText: {
    flex: 1,
    fontSize: 17,
    color: "#4a4a4a",
    lineHeight: 28,
  },
});