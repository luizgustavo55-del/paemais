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

import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LicencaMaternidadeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);

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
            <Text style={styles.badgeText}>Direitos Trabalhistas</Text>
          </View>
        </View>

        <Text style={styles.title}>Licença-Maternidade</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="briefcase-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>O que é esse direito?</Text>
          </View>

          <Text style={styles.cardText}>
            A licença-maternidade é um afastamento remunerado garantido por lei
            a todas as mulheres que trabalham e contribuem para a Previdência
            Social (INSS). O objetivo é garantir que a mãe possa se recuperar do
            parto e cuidar do bebê nos seus primeiros meses de vida sem perda do
            salário.
          </Text>
        </View>

        {/* CARD 2: DURAÇÃO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="calendar-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Qual a duração?</Text>
          </View>

          <Text style={styles.cardText}>
            O período padrão estabelecido pela Constituição é de{" "}
            <Text style={styles.boldText}>120 dias</Text> (cerca de 4 meses). No
            entanto, esse prazo pode ser maior:
          </Text>
          {[
            "180 dias (6 meses) para funcionárias de empresas que aderiram ao Programa Empresa Cidadã.",
            "180 dias para servidoras públicas federais e de muitos estados/municípios.",
            "Pode ser solicitada a partir de 28 dias antes da data prevista do parto.",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CARD 3: ADOÇÃO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="heart-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>Adoção e Guarda Judicial</Text>
          </View>

          <Text style={styles.cardText}>
            Mães adotivas possuem{" "}
            <Text style={styles.boldText}>exatamente os mesmos direitos</Text>{" "}
            que as mães biológicas. A licença de 120 dias (ou 180 dias) é
            garantida independentemente da idade da criança adotada.
          </Text>
        </View>

        {/* CARD 4: OBSERVAÇÃO IMPORTANTE (Comunicação) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>Importante: Como avisar?</Text>
          </View>

          <Text style={styles.cardText}>
            <Text style={styles.boldText}>Atenção:</Text> Para garantir seus
            direitos, você deve comunicar oficialmente a empresa sobre a
            gravidez.{"\n\n"}
            Entregue uma cópia do{" "}
            <Text style={styles.boldText}>atestado médico ou exame</Text> que
            confirme a gestação e peça para a empresa assinar um comprovante de
            recebimento. Isso protege você contra demissões arbitrárias
            (Estabilidade Provisória).
          </Text>
        </View>

        {/* CARD 5: QUEM PAGA? */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cash-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Quem paga o salário?</Text>
          </View>

          <Text style={styles.cardText}>
            Para quem trabalha com carteira assinada (CLT), a empresa paga o
            salário normal e depois é reembolsada pelo INSS. Já para
            trabalhadoras autônomas, MEIs ou facultativas, o benefício deve ser
            solicitado{" "}
            <Text style={styles.boldText}>diretamente no portal Meu INSS</Text>.
          </Text>
        </View>

        {/* LINK PARA O GOVERNO */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://www.gov.br/pt-br/servicos/solicitar-salario-maternidade-urbano",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Solicitar Salário-Maternidade</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para acessar o portal oficial do Governo e entender como
            solicitar o benefício junto ao INSS.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=como+funciona+licenca+maternidade+brasil",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1554446422-d05db23719d2?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Guia em Vídeo</Text>
              </View>

              <Text style={styles.videoText}>
                Assista a um passo a passo sobre prazos e documentos
                necessários.
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
      shadowOffset: { width: 0, height: 4 },
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
      fontSize: (theme?.texts?.text || 14) - 2,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    boldText: {
      fontWeight: "bold",
      color: "#8B2F61",
    },
    title: {
      color: "#fff",
      fontSize: theme?.texts?.title || 24,
      fontWeight: "bold",
      marginTop: 16,
      lineHeight: (theme?.texts?.title || 24) * 1.3,
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
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    highlightCard: {
      borderWidth: 1,
      borderColor: "#E53935",
      backgroundColor: "#FFF0F0",
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: theme?.texts?.subtitle || 21,
      fontWeight: "700",
      color: "#8B2F61",
      marginLeft: 10,
      flex: 1,
    },
    cardText: {
      fontSize: theme?.texts?.text || 16,
      color: "#694257",
      lineHeight: (theme?.texts?.text || 16) * 1.6,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 14,
      marginTop: 10,
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
      fontSize: theme?.texts?.text || 16,
      color: "#694257",
      lineHeight: (theme?.texts?.text || 16) * 1.6,
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
      fontSize: theme?.texts?.subtitle || 17,
      fontWeight: "700",
      color: "#8B2F61",
      marginLeft: 8,
      marginBottom: 6,
    },
    videoText: {
      fontSize: theme?.texts?.text || 15,
      color: "#694257",
      lineHeight: (theme?.texts?.text || 15) * 1.4,
    },
  });
