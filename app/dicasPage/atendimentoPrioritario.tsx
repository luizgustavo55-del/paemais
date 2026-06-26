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

// Importação do hook customizado de tema
import { useTheme } from "@/src/context/ThemeContext";

export default function AtendimentoPrioritarioScreen() {
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
            <Text style={styles.badgeText}>Acessibilidade e Respeito</Text>
          </View>
        </View>

        <Text style={styles.title}>Atendimento Prioritário</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="star-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>O que diz a Lei?</Text>
          </View>

          <Text style={styles.cardText}>
            A <Text style={styles.boldText}>Lei Federal nº 10.048/2000</Text>{" "}
            garante atendimento prioritário e preferencial a todas as gestantes,
            lactantes (mães que amamentam) e pessoas acompanhadas por crianças
            de colo. Isso significa que você não deve aguardar nas filas comuns.
          </Text>
        </View>

        {/* CARD 2: ONDE É VÁLIDO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="storefront-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Onde o direito é válido?</Text>
          </View>

          <Text style={styles.cardText}>
            O atendimento prioritário é obrigatório em:
          </Text>
          {[
            "Repartições públicas e empresas concessionárias de serviços públicos.",
            "Instituições financeiras (bancos e lotéricas).",
            "Supermercados, padarias e comércios em geral.",
            "Hospitais, clínicas e laboratórios (respeitando a classificação de risco médico).",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CARD 3: TRANSPORTE PÚBLICO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="bus-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>Transporte Público</Text>
          </View>

          <Text style={styles.cardText}>
            As empresas de transporte público (ônibus, metrô, trem) devem
            reservar{" "}
            <Text style={styles.boldText}>
              assentos devidamente identificados
            </Text>{" "}
            para gestantes e pessoas com criança de colo. Caso os assentos
            reservados estejam ocupados, é de bom tom e de responsabilidade
            social que os demais passageiros cedam o lugar.
          </Text>
        </View>

        {/* CARD 4: OBSERVAÇÃO IMPORTANTE (Como Exigir) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>E se for negado?</Text>
          </View>

          <Text style={styles.cardText}>
            O atendimento preferencial não é um favor, é um direito legal. Se
            for negado, você deve solicitar a presença do{" "}
            <Text style={styles.boldText}>gerente ou responsável</Text> pelo
            local.{"\n\n"}
            Se o estabelecimento continuar recusando o atendimento preferencial,
            você tem o direito de acionar a{" "}
            <Text style={styles.boldText}>Polícia Militar (190)</Text> ou
            denunciar o local no PROCON, pois o descumprimento da lei gera
            multas ao estabelecimento.
          </Text>
        </View>

        {/* CARD 5: LACTANTES E CRIANÇAS DE COLO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="happy-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Após o nascimento</Text>
          </View>

          <Text style={styles.cardText}>
            Lembre-se que o direito não acaba após o parto! Mães lactantes e
            qualquer pessoa (inclusive o pai) que esteja carregando uma criança
            de colo continuam tendo o direito garantido por lei em todas as
            filas.
          </Text>
        </View>

        {/* LINK PARA A LEI FEDERAL */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://www.planalto.gov.br/ccivil_03/leis/l10048.htm",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Consultar a Lei</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para ler o texto oficial da Lei nº 10.048/2000 no site da
            Presidência da República.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=lei+atendimento+prioritario+gestante+lactante",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1595062584313-4001a18274d8?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Entenda na Prática</Text>
              </View>

              <Text style={styles.videoText}>
                Assista a vídeos de advogados explicando como agir em
                supermercados e bancos.
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
