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

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Nutrição Maternal</Text>
          </View>
        </View>

        <Text style={styles.title}>Cuidados com a Alimentação na Gestação</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: IMPORTÂNCIA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="document-text-outline" size={22} color="#ff5ea8" />
            <Text style={styles.cardTitle}>Por que cuidar da dieta?</Text>
          </View>

          <Text style={styles.cardText}>
            Durante a gestação, a alimentação da mãe é a única fonte de
            nutrientes para o bebê. Uma dieta equilibrada com comida de verdade
            (in natura) previne complicações como diabetes gestacional e anemia,
            garantindo o desenvolvimento saudável.
          </Text>
        </View>

        {/* CARD 2: NUTRIENTES */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="library-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Nutrientes Essenciais</Text>
          </View>

          <Text style={styles.cardText}>
            Foque em alimentos ricos em{" "}
            <Text style={styles.boldText}>Ácido Fólico</Text> (espinafre,
            feijão), <Text style={styles.boldText}>Ferro</Text> (carnes,
            lentilha) e <Text style={styles.boldText}>Cálcio</Text> (leite,
            brócolis). Lembre-se: a suplementação vitamínica deve ser sempre
            orientada pelo seu obstetra.
          </Text>
        </View>

        {/* LISTA: O QUE EVITAR */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>O que evitar ou restringir</Text>
          </View>

          {[
            "Carnes, aves e peixes crus ou malpassados (risco de infecções como toxoplasmose).",
            "Leite e queijos não pasteurizados.",
            "Consumo de bebidas alcoólicas (zero álcool na gravidez).",
            "Excesso de cafeína (café, refrigerantes de cola, chá preto).",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Guia Alimentar Oficial</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para acessar o Guia Alimentar para a População Brasileira
            oficial do Ministério da Saúde.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO: DICAS */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=alimentacao+saudavel+gestacao",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Dicas Práticas</Text>
              </View>

              <Text style={styles.videoText}>
                Pesquise vídeos de nutricionistas sobre como montar o prato
                ideal.
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
