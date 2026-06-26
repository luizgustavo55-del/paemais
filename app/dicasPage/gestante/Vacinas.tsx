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

export default function TelaExemplo() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

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
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Prevenção e Imunidade</Text>
            </View>
          </View>

          <Text style={styles.title}>Vacinas Recomendadas na Gestação</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#ff5ea8"
            />
            <Text style={styles.cardTitle}>Por que vacinar na gravidez?</Text>
          </View>

          <Text style={styles.cardText}>
            As vacinas na gravidez são seguras e essenciais. Elas não apenas
            protegem a gestante contra formas graves de doenças, mas também
            garantem que o bebê receba anticorpos maternos por meio da placenta.
            Essa transferência, chamada de imunidade passiva, é fundamental para
            proteger o recém-nascido nos seus primeiros meses de vida, antes de
            ele próprio poder ser vacinado.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="medkit-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>
              As essenciais (Ministério da Saúde)
            </Text>
          </View>

          <Text style={styles.cardText}>
            Com base no calendário oficial do SUS, as vacinas indicadas são:
            {"\n\n"}
            <Text style={styles.boldText}>
              • dTpa (Difteria, Tétano e Coqueluche):
            </Text>{" "}
            1 dose a partir da 20ª semana. Muito importante para proteger o bebê
            da coqueluche.{"\n"}
            <Text style={styles.boldText}>• Hepatite B:</Text> 3 doses,
            dependendo do histórico vacinal da mãe.{"\n"}
            <Text style={styles.boldText}>• Influenza (Gripe):</Text> Dose única
            anual, em qualquer momento da gestação.{"\n"}
            <Text style={styles.boldText}>• Covid-19:</Text> Recomendada a cada
            gestação para evitar complicações.{"\n"}
            <Text style={styles.boldText}>
              • VSR (Vírus Sincicial Respiratório):
            </Text>{" "}
            1 dose a partir da 28ª semana, recomendada para prevenir
            bronquiolite grave no bebê.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>Restrições e Alertas</Text>
          </View>

          {[
            "Vacinas de vírus vivo atenuado são contraindicadas na gestação. Isso inclui a Tríplice Viral (sarampo, caxumba, rubéola), a Varicela (catapora) e a vacina da Dengue.",
            "A vacina da Febre Amarela só deve ser aplicada em gestantes em situações de surtos e alto risco epidemiológico, sempre mediante avaliação médica.",
            "Sempre leve a sua caderneta de vacinação original às consultas de pré-natal para que a equipe de saúde verifique quais doses estão pendentes.",
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
              "https://www.gov.br/saude/pt-br/vacinacao/calendario",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#7050b3" />
            <Text style={styles.cardTitle}>Calendário Oficial do SUS</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para acessar a página do Ministério da Saúde com o
            Calendário de Vacinação atualizado para gestantes.
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=vacinacao+gestante+ministerio+da+saude",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1633393285750-32247fb010af?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Entenda a Imunização</Text>
              </View>

              <Text style={styles.videoText}>
                Veja vídeos educativos de especialistas e do Ministério da Saúde
                sobre vacinas na gravidez.
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
      paddingTop: 180,
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
      backgroundColor: "rgba(139, 47, 97, 0.85)",
      padding: 8,
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
