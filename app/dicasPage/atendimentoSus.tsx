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

// Importação do hook customizado de tema conforme solicitado
import { useTheme } from "@/src/context/ThemeContext";

export default function AtendimentoSusScreen() {
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
            <Text style={styles.badgeText}>Saúde Pública</Text>
          </View>
        </View>

        <Text style={styles.title}>Atendimento no SUS</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: O QUE É O PRÉ-NATAL NO SUS */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="heart-half-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>Acompanhamento Integral</Text>
          </View>

          <Text style={styles.cardText}>
            Todo o acompanhamento da gestação pelo SUS é{" "}
            <Text style={styles.boldText}>100% gratuito</Text>, universal e
            humanizado. O programa garante consultas periódicas, exames
            laboratoriais, testes rápidos, vacinação e medicamentos essenciais
            do início ao fim da gravidez.
          </Text>
        </View>

        {/* CARD 2: ONDE IR */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="location-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Onde iniciar o atendimento?</Text>
          </View>

          <Text style={styles.cardText}>
            A porta de entrada do pré-natal é a{" "}
            <Text style={styles.boldText}>Unidade Básica de Saúde (UBS)</Text>{" "}
            ou Posto de Saúde mais próximo da sua residência. O ideal é iniciar
            as consultas assim que houver a suspeita ou confirmação da gravidez,
            preferencialmente antes da 12ª semana.
          </Text>
        </View>

        {/* CARD 3: DOCUMENTOS */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="card-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>
              O que levar na primeira consulta?
            </Text>
          </View>

          <Text style={styles.cardText}>
            Para abrir o seu prontuário e receber o acompanhamento, apresente na
            recepção da UBS:
          </Text>
          {[
            "Documento oficial com foto (RG, CNH ou Passaporte).",
            "CPF.",
            "Comprovante de residência atualizado (essencial para vincular o seu posto de saúde).",
            "Cartão Nacional de Saúde (Cartão SUS), caso já possua.",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CARD 4: OBSERVAÇÃO IMPORTANTE (Vinculação à Maternidade) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>
              Importante: Saber onde vai nascer
            </Text>
          </View>

          <Text style={styles.cardText}>
            Você tem o direito legal de saber antecipadamente qual maternidade
            fará o seu parto. A Lei Federal nº 11.634/2007 garante o{" "}
            <Text style={styles.boldText}>
              Direito de Vinculação à Maternidade
            </Text>
            .{"\n\n"}
            Certifique-se de que a equipe da UBS registre na sua{" "}
            <Text style={styles.boldText}>Caderneta da Gestante</Text> o nome e
            o endereço do hospital ou maternidade de referência para o seu
            parto. Exija também realizar uma visita ao local durante o último
            trimestre para conhecer a estrutura.
          </Text>
        </View>

        {/* CARD 5: O QUE ESTÁ INCLUSO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="checkbox-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Direitos e Serviços Garantidos</Text>
          </View>

          <Text style={styles.cardText}>
            Durante o seu pré-natal, você receberá gratuitamente:
          </Text>
          {[
            "Consultas mensais (e mais frequentes na reta final).",
            "Exames de sangue, urina, testes rápidos de HIV, Sífilis e Hepatites.",
            "Exames de Ultrassonografia.",
            "Vacinas obrigatórias na gestação (dTpa, Hepatite B e Influenza).",
            "Suplementação de Ferro e Ácido Fólico.",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* LINK PARA O GOVERNO FEDERAL / MEU SUS DIGITAL */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-mulher/pre-natal",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Página Oficial do Pré-Natal</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para acessar as diretrizes nacionais de atenção ao
            pré-natal e parto do Ministério da Saúde.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=direitos+gestante+sus+pre+natal+vulnerabilidade",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Como Funciona no SUS</Text>
              </View>

              <Text style={styles.videoText}>
                Assista a um vídeo explicativo sobre o fluxo de atendimento e os
                direitos das gestantes no SUS.
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
