import React from "react";
import {
  Image,
  Linking,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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
              onPress={() =>
                router.push("/(drawer)/(gestantes)/(tabs)/dicas" as any)
              }
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                aqui seu texto (badge)
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            aqui seu texto (título principal)
          </Text>
        </View>

        {/* CARD 1 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#ff5ea8"
            />
            <Text style={styles.cardTitle}>
              aqui seu texto (título card)
            </Text>
          </View>

          <Text style={styles.cardText}>
            aqui seu texto (conteúdo do card)
          </Text>
        </View>

        {/* CARD 2 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="library-outline"
              size={22}
              color="#7050b3"
            />
            <Text style={styles.cardTitle}>
              aqui seu texto (título card)
            </Text>
          </View>

          <Text style={styles.cardText}>
            aqui seu texto (conteúdo do card)
          </Text>
        </View>

        {/* LISTA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="list-outline"
              size={22}
              color="#00c48c"
            />
            <Text style={styles.cardTitle}>
              aqui seu texto (lista)
            </Text>
          </View>

          {["item 1", "item 2", "item 3"].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>
                aqui seu texto: {item}
              </Text>
            </View>
          ))}
        </View>

        {/* LINK */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL("https://seu-link-aqui.com")
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="globe-outline"
              size={22}
              color="#7050b3"
            />
            <Text style={styles.cardTitle}>
              aqui seu texto (link)
            </Text>
          </View>

          <Text style={styles.cardText}>
            aqui seu texto (descrição do link)
          </Text>
        </TouchableOpacity>

        {/* VÍDEO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL("https://youtube.com")
            }
          >
            <Image
              source={{ uri: "https://via.placeholder.com/105" }}
              style={styles.thumbnail}
            />

            <View style={styles.videoInfo}>
              <View style={styles.cardTitleRow}>
                <Ionicons
                  name="logo-youtube"
                  size={20}
                  color="red"
                />
                <Text style={styles.videoTitle}>
                  aqui seu texto (vídeo)
                </Text>
              </View>

              <Text style={styles.videoText}>
                aqui seu texto (descrição do vídeo)
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