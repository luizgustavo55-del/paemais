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

export default function RetornoScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                router.push("/(drawer)/(gestantes)/(tabs)/dicas" as any)
              }
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Saúde Fetal</Text>
            </View>
          </View>

          <Text style={styles.title}>Doenças Congênitas</Text>
        </View>

        {/* CARD 1 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="medical-outline" size={22} color="#ff5ea8" />
            <Text style={styles.cardTitle}>O que são?</Text>
          </View>

          <Text style={styles.cardText}>
            Doenças ou anomalias congênitas são alterações na estrutura ou no
            funcionamento do corpo do bebê que ocorrem ainda durante a vida
            intrauterina. Elas podem ser causadas por fatores genéticos,
            infecciosos ou ambientais.
          </Text>
        </View>

        {/* CARD 2 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="git-network-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>As Principais</Text>
          </View>

          <Text style={styles.cardText}>
            As anomalias mais comuns incluem as{" "}
            <Text style={styles.boldText}>Cardiopatias Congênitas</Text>{" "}
            (alterações no coração), os{" "}
            <Text style={styles.boldText}>Defeitos do Tubo Neural</Text> (como a
            espinha bífida), a{" "}
            <Text style={styles.boldText}>Fenda Labiopalatina</Text> e condições
            cromossômicas como a{" "}
            <Text style={styles.boldText}>Síndrome de Down</Text>.
          </Text>
        </View>

        {/* LISTA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#00c48c"
            />
            <Text style={styles.cardTitle}>Prevenção e Cuidados</Text>
          </View>

          {[
            "Suplementação de Ácido Fólico antes e durante a gestação.",
            "Vacinação em dia (ex: contra a Rubéola).",
            "Realização rigorosa dos exames de pré-natal.",
            "Zero consumo de álcool, cigarro ou drogas ilícitas.",
            "Atenção à automedicação (só use remédios com aval médico).",
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
              "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/anomalias-congenitas",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Portal Oficial de Saúde</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para ler mais sobre Anomalias Congênitas no portal
            oficial do Ministério da Saúde.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=ultrassom+morfologico+importancia",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>
                  A Importância do Ultrassom
                </Text>
              </View>

              <Text style={styles.videoText}>
                O exame morfológico é crucial para o rastreio. Entenda mais
                pesquisando sobre o assunto.
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
    backgroundColor: "#F4C7DD",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    zIndex: 999,

    backgroundColor: "#cc5994",

    paddingTop: 42,
    paddingHorizontal: 22,
    paddingBottom: 22,

    elevation: 10,

    shadowColor: "#6E2C50",
    shadowOpacity: 0.25,
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

    backgroundColor: "#D97AA8",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  badge: {
    backgroundColor: "#D97AA8",
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

  boldText: {
    fontWeight: "bold",
    color: "#8B2F61",
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    lineHeight: 32,
  },

  content: {
    padding: 20,
    paddingTop: 190,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FCE1EC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,

    shadowColor: "#7B3057",
    shadowOpacity: 0.12,
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
    color: "#8B2F61",
    marginLeft: 10,
    flex: 1,
  },

  cardText: {
    fontSize: 16,
    color: "#694257",
    lineHeight: 28,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  bullet: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: "#C54286",
    marginTop: 10,
    marginRight: 12,
  },

  listText: {
    flex: 1,
    fontSize: 16,
    color: "#694257",

    lineHeight: 27,
  },
  youtubeCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  thumbnailContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  thumbnail: {
    width: 105,
    height: 105,
    borderRadius: 18,
  },

  playButton: {
    position: "absolute",
    backgroundColor: "rgba(139, 47, 97, 0.85)",
    padding: 10,
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
    color: "#8B2F61",
    marginLeft: 8,
  },

  videoText: {
    fontSize: 15,
    color: "#694257",
    lineHeight: 24,
    marginTop: 4,
  },
});
