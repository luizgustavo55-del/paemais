import React from "react";
import {
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

type Secao = {
  titulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  texto?: string;
  lista?: string[];
};

type BemEstarTemplateProps = {
  badge: string;
  titulo: string;
  secoes: Secao[];
  linkTitulo?: string;
  linkTexto?: string;
  linkUrl?: string;
};

export default function BemEstarTemplate({
  badge,
  titulo,
  secoes,
  linkTitulo,
  linkTexto,
  linkUrl,
}: BemEstarTemplateProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(pais)/(tabs)/dicas" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          </View>

          <Text style={styles.title}>{titulo}</Text>
        </View>

        {secoes.map((secao, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name={secao.icone} size={22} color={secao.cor} />

              <Text style={styles.cardTitle}>{secao.titulo}</Text>
            </View>

            {secao.texto ? (
              <Text style={styles.cardText}>{secao.texto}</Text>
            ) : null}

            {secao.lista?.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: secao.cor }]} />

                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {linkUrl ? (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(linkUrl)}
          >
            <View style={styles.cardTitleRow}>
              <Ionicons name="globe-outline" size={22} color="#7050b3" />

              <Text style={styles.cardTitle}>{linkTitulo || "Veja mais"}</Text>
            </View>

            <Text style={styles.cardText}>
              {linkTexto || "Clique para acessar mais informações."}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#cfb8ff",
  },

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

  content: {
    padding: 20,
    paddingTop: 180,
    paddingBottom: 40,
  },

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

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  bullet: {
    width: 8,
    height: 8,
    borderRadius: 10,
    marginTop: 10,
    marginRight: 12,
  },

  listText: {
    flex: 1,
    fontSize: 16,
    color: "#4a4a4a",
    lineHeight: 27,
  },
});