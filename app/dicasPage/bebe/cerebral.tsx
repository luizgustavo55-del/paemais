import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function TelaDesenvolvimentoCerebral() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

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
            <Text style={styles.badgeText}>Saúde do Bebê</Text>
          </View>
        </View>

        <Text style={styles.title}>Desenvolvimento Cerebral do Bebê</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="bulb-outline" size={22} color="#ff5ea8" />
            <Text style={styles.cardTitle}>A formação dos neurônios</Text>
          </View>

          <Text style={styles.cardText}>
            O sistema nervoso do bebê começa a ser desenhado logo nas primeiras
            semanas a partir do tubo neural. Bilhões de neurônios são gerados em
            um ritmo impressionante, criando as primeiras conexões (sinapses)
            que comandarão os futuros sentidos, movimentos, memória e
            aprendizado do seu filho.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="nutrition-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Combustível para a mente</Text>
          </View>

          <Text style={styles.cardText}>
            Para apoiar essa construção neurológica, o consumo de{" "}
            <Text style={styles.boldText}>DHA (Ômega-3)</Text> — presente em
            peixes gordos e suplementos recomendados — é vital para a estrutura
            do cérebro. A <Text style={styles.boldText}>Colina</Text>{" "}
            (encontrada em ovos) e o <Text style={styles.boldText}>Iodo</Text>{" "}
            também atuam diretamente na proteção e velocidade da comunicação
            entre as células cerebrais.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="git-network-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Marcos da evolução cerebral</Text>
          </View>

          {[
            "Primeiro Trimestre: Ocorre o fechamento vital do tubo neural (até a 4ª semana) e as três divisões cerebrais primárias começam a se isolar.",
            "Segundo Trimestre: Os hemisférios cerebrais crescem e o bebê passa a processar estímulos sonoros externos, como os batimentos e a voz da mãe.",
            "Terceiro Trimestre: O peso do cérebro triplica. Formam-se os sulcos e giros cerebrais (as dobras do cérebro) e inicia-se a mielinização para proteger os circuitos neurais.",
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
              "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-z/g/gravidez",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Diretrizes de Saúde Infantil</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para acessar os materiais e guias de acompanhamento do
            desenvolvimento gestacional e infantil do Ministério da Saúde.
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=desenvolvimento+cerebral+do+feto+gestacao+neurobiologia",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1544126592-807add215123?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Fisiologia Fetal</Text>
              </View>

              <Text style={styles.videoText}>
                Assista a animações científicas detalhando como o sistema
                nervoso se desenvolve a cada trimestre.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.gestantesBackground,
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      backgroundColor: theme.colors.gestantesSecondary,
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
      color: theme.colors.text,
      fontSize: theme.texts.text,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    boldText: {
      fontWeight: "bold",
      color: "#8B2F61",
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.texts.title,
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
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#8B2F61",
      marginLeft: 10,
      flex: 1,
    },
    cardText: {
      fontSize: theme.texts.text,
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
      fontSize: theme.texts.text,
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
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#8B2F61",
      marginLeft: 8,
    },
    videoText: {
      fontSize: theme.texts.text,
      color: "#694257",
      lineHeight: 24,
      marginTop: 4,
    },
  });
