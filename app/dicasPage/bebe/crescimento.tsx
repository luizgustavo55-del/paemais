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

export default function TelaCrescimentoFeto() {
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

        <Text style={styles.title}>Evolução e Crescimento do Feto</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="trending-up-outline" size={22} color="#ff5ea8" />
            <Text style={styles.cardTitle}>O Ritmo do Desenvolvimento</Text>
          </View>

          <Text style={styles.cardText}>
            O crescimento fetal é um processo dinâmico dividido em duas fases
            principais: a <Text style={styles.boldText}>hiperplasia</Text>{" "}
            (multiplicação acelerada das células) e a{" "}
            <Text style={styles.boldText}>hipertrofia</Text> (aumento do tamanho
            celular). Nas primeiras semanas, o feto prioriza o crescimento em
            comprimento; nas últimas semanas, foca no ganho expressivo de peso e
            massa gorda.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="scale-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Como o médico monitoriza?</Text>
          </View>

          <Text style={styles.cardText}>
            Nas consultas de rotina, o crescimento é avaliado medindo a{" "}
            <Text style={styles.boldText}>Altura Uterina (AU)</Text> com uma
            fita métrica sobre o abdómen materno e cruzando os dados com o
            gráfico percentil da Caderneta da Gestante. Desvios nessa curva
            ajudam a detetar precocemente restrições de crescimento ou
            macrossomia.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="hourglass-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>Marcos estimados de evolução</Text>
          </View>

          {[
            "Fim do 1º Trimestre (12 semanas): O feto mede cerca de 5 a 6 centímetros de comprimento e pesa por volta de 14 gramas (tamanho aproximado de uma ameixa).",
            "Fim do 2º Trimestre (24 semanas): Com órgãos formados, mede cerca de 30 centímetros e atinge perto de 600 a 700 gramas, movimentando-se ativamente na bolsa amniótica.",
            "Reta Final (36 a 40 semanas): O bebé ganha cerca de 200g por semana. No termo, espera-se que meça entre 48 e 52 cm, com peso ideal médio entre 2,8 kg e 3,8 kg.",
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
            <Text style={styles.cardTitle}>Gráficos de Percentil Oficiais</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para consultar o manual oficial de acompanhamento do
            crescimento fetal e tabelas de peso estimado do Ministério da Saúde.
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=curva+de+crescimento+fetal+ultrassonografia+obstetrica",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Avaliação do Percentil</Text>
              </View>

              <Text style={styles.videoText}>
                Entenda o que significa o percentil do bebé nos relatórios de
                ultrassonografia morfológica e obstétrica.
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
