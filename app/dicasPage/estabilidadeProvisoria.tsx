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

// Importação do seu hook customizado de tema
import { useTheme } from "@/src/context/ThemeContext";

export default function EstabilidadeProvisoriaScreen() {
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

        <Text style={styles.title}>Estabilidade Provisória</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#C54286"
            />
            <Text style={styles.cardTitle}>O que é esse direito?</Text>
          </View>

          <Text style={styles.cardText}>
            A estabilidade provisória é a garantia de que a mulher grávida{" "}
            <Text style={styles.boldText}>
              não pode ser demitida sem justa causa
            </Text>
            . O objetivo dessa lei é proteger o emprego da mãe e garantir o
            sustento do bebê que está a caminho.
          </Text>
        </View>

        {/* CARD 2: PERÍODO DE PROTEÇÃO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="calendar-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Qual o período de proteção?</Text>
          </View>

          <Text style={styles.cardText}>
            Segundo a Constituição Federal (ADCT, Art. 10, II, b), a proteção
            contra a demissão inicia no{" "}
            <Text style={styles.boldText}>
              momento da concepção (confirmação da gravidez)
            </Text>{" "}
            e vai até <Text style={styles.boldText}>5 meses após o parto</Text>.
          </Text>
        </View>

        {/* CARD 3: QUEM TEM DIREITO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="people-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>Quem tem direito?</Text>
          </View>

          <Text style={styles.cardText}>
            Esse direito não é exclusivo apenas para quem tem muitos anos de
            empresa. Ele também é válido para:
          </Text>
          {[
            "Trabalhadoras com carteira assinada (CLT) e Empregadas Domésticas.",
            "Trabalhadoras em Contrato de Experiência ou Temporário (Súmula 244 do TST).",
            "Gestantes que estão cumprindo o Aviso Prévio (trabalhado ou indenizado).",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CARD 4: OBSERVAÇÃO IMPORTANTE (Comunicação) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>Importante: Como garantir?</Text>
          </View>

          <Text style={styles.cardText}>
            Para garantir a maioria dos direitos trabalhistas e evitar dores de
            cabeça judiciais, é{" "}
            <Text style={styles.boldText}>
              fundamental que a gestante comunique oficialmente
            </Text>{" "}
            o empregador sobre a gravidez.{"\n\n"}
            Entregue um atestado médico, exame de sangue (Beta hCG) ou ultrassom
            no RH e{" "}
            <Text style={styles.boldText}>
              exija a assinatura em um comprovante de recebimento
            </Text>{" "}
            (uma cópia do documento assinada pelo chefe ou RH com a data).
          </Text>
        </View>

        {/* CARD 5: DEMISSÃO INDEVIDA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="warning-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Fui demitida grávida, e agora?</Text>
          </View>

          <Text style={styles.cardText}>
            Se você foi demitida e descobriu a gravidez depois (mas a concepção
            ocorreu enquanto ainda trabalhava na empresa), o direito permanece.
            Você deve notificar a empresa imediatamente. A empresa é obrigada a
            fazer a sua{" "}
            <Text style={styles.boldText}>reintegração ao trabalho</Text> ou
            pagar uma{" "}
            <Text style={styles.boldText}>indenização financeira</Text>{" "}
            correspondente a todo o período de estabilidade.
          </Text>
        </View>

        {/* LINK PARA O TST (Tribunal Superior do Trabalho) */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL("https://www.tst.jus.br/direitos-da-gestante")
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Portal do TST</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para acessar a página oficial do Tribunal Superior do
            Trabalho com todas as cartilhas de proteção à gestante.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=estabilidade+provisoria+gestante+direitos",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Entenda seus Direitos</Text>
              </View>

              <Text style={styles.videoText}>
                Assista a advogados explicando o que fazer em caso de demissão.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Função geradora de estilos baseada no ThemeContext
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
