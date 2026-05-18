import React, { useState } from "react";
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

export default function OrganizacaoPapeis() {
  const router = useRouter();

  const [checklist, setChecklist] = useState([
    {
      id: 1,
      text: "Separar todos os papéis",
      icon: "folder-outline",
      done: false,
    },
    {
      id: 2,
      text: "Descartar o que não é necessário",
      icon: "trash-outline",
      done: false,
    },
    {
      id: 3,
      text: "Criar categorias",
      icon: "albums-outline",
      done: false,
    },
    {
      id: 4,
      text: "Organizar em pastas",
      icon: "pricetags-outline",
      done: false,
    },
    {
      id: 5,
      text: "Guardar desenhos importantes",
      icon: "color-palette-outline",
      done: false,
    },
    {
      id: 6,
      text: "Digitalizar documentos",
      icon: "phone-portrait-outline",
      done: false,
    },
    {
      id: 7,
      text: "Definir rotina",
      icon: "repeat-outline",
      done: false,
    },
  ]);

  function toggleItem(id: number) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, done: !item.done }
          : item
      )
    );
  }

  return (
    <View style={styles.container}>
      

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
      <StatusBar barStyle="light-content" />

     
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.push("/(pais)/(tabs)/dicas" as any)
            }
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Organização Familiar
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          Organização de Papéis
        </Text>
      </View>
        {/* RESUMO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#ff5ea8"
            />

            <Text style={styles.cardTitle}>
              Resumo
            </Text>
          </View>

          <Text style={styles.cardText}>
            Organizar documentos evita perda de
            informações importantes e reduz o
            estresse. O segredo não é ter poucos
            papéis, mas sim ter um sistema simples
            e eficiente.
          </Text>
        </View>

        {/* IDEIA PRINCIPAL */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#ffb300"
            />

            <Text style={styles.cardTitle}>
              Ideia Principal
            </Text>
          </View>

          <Text style={styles.cardText}>
            O problema não é a quantidade de
            papéis, mas a falta de organização.
            Criar um sistema simples facilita o
            dia a dia e evita acúmulos.
          </Text>
        </View>

        {/* CATEGORIAS */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="folder-open-outline"
              size={22}
              color="#00c48c"
            />

            <Text style={styles.cardTitle}>
              Categorias
            </Text>
          </View>

          {[
            "Saúde da criança",
            "Escola e atividades",
            "Documentos importantes",
            "Contas e garantias",
            "Exames e receitas",
            "Cada tipo deve ter seu lugar fixo",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View
                style={[
                  styles.bullet,
                  { backgroundColor: "#00c48c" },
                ]}
              />

              <Text style={styles.listText}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* DESENHOS */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="image-outline"
              size={22}
              color="#7050b3"
            />

            <Text style={styles.cardTitle}>
              Desenhos e Lembranças
            </Text>
          </View>

          <Text style={styles.cardText}>
            Guarde apenas os mais especiais.
            Você pode organizar por ano ou tirar
            fotos para economizar espaço físico.
          </Text>
        </View>

        {/* ROTINA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="refresh-outline"
              size={22}
              color="#ff5ea8"
            />

            <Text style={styles.cardTitle}>
              Rotina
            </Text>
          </View>

          <Text style={styles.cardText}>
            Tenha um local fixo para novos papéis
            e revise tudo mensalmente para evitar
            acúmulo e bagunça.
          </Text>
        </View>

        {/* CHECKLIST */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="checkmark-done-outline"
              size={22}
              color="#00c48c"
            />

            <Text style={styles.cardTitle}>
              Checklist
            </Text>
          </View>

          {checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkItem}
              onPress={() => toggleItem(item.id)}
            >
              <Ionicons
                name={
                  item.done
                    ? "checkbox"
                    : "square-outline"
                }
                size={24}
                color={
                  item.done ? "#00c48c" : "#999"
                }
              />

              <View style={styles.checkIcon}>
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color="#7050b3"
                />
              </View>

              <Text
                style={[
                  styles.checkText,
                  item.done && {
                    textDecorationLine:
                      "line-through",
                    color: "#999",
                  },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* VÍDEO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/watch?v=rkSrz-jpkZo"
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={require("../../assets/images/documentos.png")}
                style={styles.thumbnail}
              />

              <View style={styles.playButton}>
                <Ionicons
                  name="play"
                  size={18}
                  color="#fff"
                />
              </View>
            </View>

            <View style={styles.videoInfo}>
              <View style={styles.cardTitleRow}>
                <Ionicons
                  name="logo-youtube"
                  size={20}
                  color="red"
                />

                <Text style={styles.videoTitle}>
                  Vídeo
                </Text>
              </View>

              <Text style={styles.videoText}>
                Como organizar documentos e papéis
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* LINK */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://itmae.com.br/casa/tudo-organizado/como-organizar-a-papelada-das-criancas"
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="globe-outline"
              size={22}
              color="#7050b3"
            />

            <Text style={styles.cardTitle}>
              Ver Mais
            </Text>
          </View>

          <Text style={styles.cardText}>
            Acesse o artigo completo sobre
            organização de papéis infantis.
          </Text>
        </TouchableOpacity>
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
    paddingTop: 170,
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
    marginTop: 10,
    marginRight: 12,
  },

  listText: {
    flex: 1,
    fontSize: 16,
    color: "#4a4a4a",
    lineHeight: 27,
  },

  /* CHECKLIST */
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#cfb8ff",

    justifyContent: "center",
    alignItems: "center",

    marginHorizontal: 10,
  },

  checkText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
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