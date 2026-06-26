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

export default function ConsultasExamesScreen() {
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
            <Text style={styles.badgeText}>Direitos e Saúde</Text>
          </View>
        </View>

        <Text style={styles.title}>Consultas e Exames</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARTÃO 1: O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="medical-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>Dispensa do Trabalho</Text>
          </View>

          <Text style={styles.cardText}>
            A lei assegura que a mulher grávida se possa ausentar do trabalho
            para realizar o acompanhamento médico (pré-natal){" "}
            <Text style={styles.boldText}>
              sem qualquer desconto no seu salário
            </Text>{" "}
            ou prejuízo nos seus direitos.
          </Text>
        </View>

        {/* CARTÃO 2: QUANTAS CONSULTAS? */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="list-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Qual é o limite?</Text>
          </View>

          <Text style={styles.cardText}>
            Segundo a CLT (Artigo 392, § 4º), a gestante tem direito a dispensa
            pelo tempo necessário para a realização de,{" "}
            <Text style={styles.boldText}>
              no mínimo, 6 (seis) consultas médicas
            </Text>{" "}
            e demais exames complementares durante todo o período de gravidez.
          </Text>
        </View>

        {/* CARTÃO 3: DIREITO DO ACOMPANHANTE */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="people-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>Direito do Acompanhante</Text>
          </View>

          <Text style={styles.cardText}>
            Uma alteração recente na lei também garantiu direitos ao parceiro ou
            parceira. O trabalhador(a) pode ausentar-se do trabalho, sem
            desconto no salário, para{" "}
            <Text style={styles.boldText}>
              acompanhar a sua esposa ou companheira em até 6 (seis) consultas
              médicas
            </Text>{" "}
            ou exames durante a gravidez.
          </Text>
        </View>

        {/* CARTÃO 4: OBSERVAÇÃO IMPORTANTE (Comprovação) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>Importante: Como justificar?</Text>
          </View>

          <Text style={styles.cardText}>
            Para garantir que as horas ou o dia de ausência não sejam
            descontados, é{" "}
            <Text style={styles.boldText}>
              obrigatório apresentar o comprovativo
            </Text>
            .{"\n\n"}
            Sempre que for a uma consulta ou exame, peça ao médico ou na receção
            uma{" "}
            <Text style={styles.boldText}>
              Declaração de Comparecimento
            </Text>{" "}
            (com a data, horário e carimbo do profissional de saúde) e entregue
            nos Recursos Humanos da sua empresa.
          </Text>
        </View>

        {/* CARTÃO 5: ACESSO À SAÚDE PÚBLICA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="business-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Atendimento Gratuito</Text>
          </View>

          <Text style={styles.cardText}>
            Todas as gestantes têm direito ao acompanhamento pré-natal gratuito
            através do sistema público de saúde. Isto inclui consultas de
            rotina, ecografias, exames de sangue, vacinação e assistência no
            parto.
          </Text>
        </View>

        {/* LINK PARA O MINISTÉRIO DA SAÚDE */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/p/pre-natal",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Guia do Pré-Natal</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para aceder ao guia oficial de saúde sobre a importância
            das consultas e os exames recomendados em cada trimestre.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=direitos+gestante+consultas+exames+clt",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Entenda a Lei</Text>
              </View>

              <Text style={styles.videoText}>
                Veja dicas sobre como apresentar atestados e declarações na
                empresa.
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
