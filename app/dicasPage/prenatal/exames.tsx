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

export default function TelaExamesPrenatal() {
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
            <Text style={styles.badgeText}>Diagnóstico Médico</Text>
          </View>
        </View>

        <Text style={styles.title}>Exames Laboratoriais e de Imagem</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="flask-outline" size={22} color="#ff5ea8" />
            <Text style={styles.cardTitle}>Sangue e Urina</Text>
          </View>

          <Text style={styles.cardText}>
            Logo na primeira consulta, o médico solicitará uma bateria de exames
            laboratoriais para avaliar a sua saúde geral. Isso inclui{" "}
            <Text style={styles.boldText}>
              hemograma, glicemia de jejum e tipagem sanguínea
            </Text>{" "}
            (ABO e fator Rh). Também são feitas sorologias cruciais (HIV,
            Sífilis, Hepatites e Toxoplasmose) e exames de urina para detetar
            infecções silenciosas.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="water-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Rastreio da Diabetes</Text>
          </View>

          <Text style={styles.cardText}>
            Entre a 24ª e a 28ª semana de gestação, é realizado o{" "}
            <Text style={styles.boldText}>
              Teste de Tolerância Oral à Glicose (PTOG)
            </Text>
            . Este exame específico (onde se ingere um líquido doce) serve para
            diagnosticar precocemente a diabetes gestacional, permitindo um
            controlo alimentar seguro na reta final da gravidez.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="scan-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Linha do tempo das Ecografias</Text>
          </View>

          {[
            "Ecografia Transvaginal (Início): Realizada no primeiro trimestre para confirmar o tempo de gestação, a localização do embrião e escutar os batimentos cardíacos.",
            "Morfológica do 1º Trimestre (11 a 14 semanas): Avalia a translucência da nuca e o osso nasal, importantes para rastrear os riscos de síndromes genéticas.",
            "Morfológica do 2º Trimestre (20 a 24 semanas): É o exame mais minucioso, onde se analisa detalhadamente a formação de todos os órgãos internos do bebé.",
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
            <Text style={styles.cardTitle}>Caderneta da Gestante</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para consultar as informações oficiais do Governo sobre
            todos os exames exigidos no pré-natal de risco habitual e os seus
            prazos de realização.
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=exames+pre+natal+ultrassom+morfologico",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Compreender a Ecografia</Text>
              </View>

              <Text style={styles.videoText}>
                Descubra o que o médico obstetra procura identificar nos exames
                morfológicos.
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
