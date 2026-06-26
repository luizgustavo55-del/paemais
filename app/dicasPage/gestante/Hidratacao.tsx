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

export default function TelaHidratacao() {
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
            <Text style={styles.badgeText}>Hidratação Maternal</Text>
          </View>
        </View>

        <Text style={styles.title}>Cuidados com a Água na Gestação</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: IMPORTÂNCIA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="water-outline" size={22} color="#ff5ea8" />
            <Text style={styles.cardTitle}>Por que a água é fundamental?</Text>
          </View>

          <Text style={styles.cardText}>
            A hidratação adequada é essencial para uma gravidez saudável, dado
            que a grávida acumula cerca de 6 a 9 litros de água durante a
            gestação. O consumo adequado evita a retenção de líquidos, auxilia
            na produção de líquido amniótico e melhora as funções digestivas e
            intestinais. Em casos específicos, a hidratação pode até mesmo
            ajudar a regular o índice de líquido amniótico.
          </Text>
        </View>

        {/* CARD 2: QUANTIDADE */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="beaker-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Qual a quantidade ideal?</Text>
          </View>

          <Text style={styles.cardText}>
            A recomendação médica de referência sugere a ingestão de{" "}
            <Text style={styles.boldText}>2,3 a 3 litros</Text> de água por dia.
            Na prática, indica-se que gestantes adicionem cerca de{" "}
            <Text style={styles.boldText}>300 ml extras</Text> à sua necessidade
            diária básica. Além da água pura, invista em alimentos ricos em
            água, como melancia, melão e alface.
          </Text>
        </View>

        {/* LISTA: O QUE EVITAR */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>O que evitar ou restringir</Text>
          </View>

          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>
              Esperar sentir sede para beber água: se você sentir sede, seu
              corpo já está começando a desidratar.
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>
              Chá preto: deve ser evitado por concentrar muita cafeína.
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>
              Chá verde: deve ser cortado, pois inibe a ação do ácido fólico,
              que é essencial para a formação do sistema nervoso do bebê.
            </Text>
          </View>
        </View>

        {/* LINK CARD */}
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
            <Text style={styles.cardTitle}>Guia Oficial de Saúde</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para acessar o Guia Alimentar para a População Brasileira
            do Ministério da Saúde, que também orienta sobre a ingestão de água
            e hábitos saudáveis.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO: DICAS */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=importancia+agua+gestacao",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1543352634-99a5d50ae78e?auto=format&fit=crop&w=105&q=80",
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
                Pesquise vídeos de obstetras sobre como manter uma rotina de
                hidratação constante.
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
      backgroundColor: "#faa1cf",
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
