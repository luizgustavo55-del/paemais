import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TelaExemplo() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER (DENTRO DO SCROLLVIEW COMO PEDIDO) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Pré-natal</Text>
            </View>
          </View>

          <Text style={styles.title}>Visão Geral: O que é o pré-natal?</Text>
        </View>

        {/* CARD 1 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="document-text-outline" size={22} color="#ff5ea8" />
            <Text style={styles.cardTitle}>Qual a importância?</Text>
          </View>

          <Text style={styles.cardText}>
            O pré-natal é o acompanhamento médico essencial durante a gestação.
            Ele visa garantir uma gravidez saudável, acompanhando o
            desenvolvimento do bebê, orientando a mãe e prevenindo ou tratando
            possíveis complicações precocemente.
          </Text>
        </View>

        {/* CARD 2 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="library-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Frequência das Consultas</Text>
          </View>

          <Text style={styles.cardText}>
            Idealmente, deve iniciar assim que a gravidez é confirmada. As
            consultas costumam ser mensais até a 28ª semana, quinzenais até a
            36ª semana e semanais a partir da 37ª semana até o momento do parto.
          </Text>
        </View>

        {/* LISTA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="list-outline" size={22} color="#00c48c" />
            <Text style={styles.cardTitle}>Principais Exames</Text>
          </View>

          {[
            "Ultrassonografias obstétricas e morfológicas.",
            "Exames de sangue (hemograma, glicemia, tipo sanguíneo).",
            "Exames de urina para checar infecções.",
            "Sorologias (HIV, sífilis, hepatites, toxoplasmose).",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* LINK */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_gestante_6ed.pdf",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Caderneta da Gestante</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para acessar a Caderneta da Gestante oficial do
            Ministério da Saúde com todas as orientações.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=primeira+consulta+pre+natal",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=105&q=80",
                }}
                style={styles.thumbnail}
              />
              <View style={styles.playButton}>
                <Ionicons name="play" size={16} color="#fff" />
              </View>
            </View>

            <View style={styles.videoInfo}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="logo-youtube" size={20} color="red" />
                <Text style={styles.videoTitle}>A Primeira Consulta</Text>
              </View>

              <Text style={styles.videoText}>
                Veja o que esperar e quais perguntas fazer na sua primeira
                consulta médica.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#cfb8ff",
  },

  /* HEADER FIXO */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    zIndex: 999,

    backgroundColor: "#8a68d3",

    paddingTop: 42,
    paddingHorizontal: 22,
    paddingBottom: 22,

    elevation: 10,
    shadowColor: "#28174c",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ae89e9",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  badge: {
    backgroundColor: "#ae89e9",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    lineHeight: 32,
  },

  /* CONTENT */
  content: {
    padding: 20,
    paddingTop: 180,
    paddingBottom: 40,
  },

  /* CARDS */
  card: {
    backgroundColor: "#eae1fd",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,

    shadowColor: "#28174c",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#28174c",
    marginLeft: 10,
    flex: 1,
  },

  cardText: {
    fontSize: 16,
    color: "#4a4a4a",
    lineHeight: 28,
  },

  /* LISTA */
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  bullet: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: "#ff5ea8",
    marginTop: 10,
    marginRight: 12,
  },

  listText: {
    flex: 1,
    fontSize: 16,
    color: "#4a4a4a",
    lineHeight: 27,
  },

  /* VÍDEO */
  youtubeCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  thumbnailContainer: {
    position: "relative",
  },

  thumbnail: {
    width: 105,
    height: 105,
    borderRadius: 18,
  },

  playButton: {
    position: "absolute",
    top: "38%",
    left: "38%",

    backgroundColor: "rgba(0,0,0,0.65)",
    padding: 8,
    borderRadius: 50,
  },

  videoInfo: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },

  videoTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#28174c",
    marginLeft: 8,
  },

  videoText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    marginTop: 4,
  },
});
