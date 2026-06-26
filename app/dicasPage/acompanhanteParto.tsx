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

export default function AcompanhamentoPartoScreen() {
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
            <Text style={styles.badgeText}>Direitos no Parto</Text>
          </View>
        </View>

        <Text style={styles.title}>Acompanhante no Parto</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="people-circle-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>O que é esse direito?</Text>
          </View>

          <Text style={styles.cardText}>
            A legislação assegura a todas as grávidas o direito de ter{" "}
            <Text style={styles.boldText}>
              um acompanhante da sua livre escolha
            </Text>{" "}
            durante todo o período de trabalho de parto, momento do parto e
            pós-parto imediato.
          </Text>
        </View>

        {/* CARD 2: QUEM PODE SER */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="person-add-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Quem pode acompanhar?</Text>
          </View>

          <Text style={styles.cardText}>
            A escolha é{" "}
            <Text style={styles.boldText}>exclusivamente da grávida</Text>. O
            hospital ou maternidade não pode impor restrições de parentesco.
            Pode ser:
          </Text>
          {[
            "O pai do bebé, parceiro ou companheiro(a).",
            "Uma amiga, mãe, irmã ou outra pessoa de extrema confiança.",
            "Não há obrigatoriedade de ser um familiar direto.",
            "O direito aplica-se tanto em hospitais públicos (SUS) como em hospitais privados.",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CARD 3: CUSTOS */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cash-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>Existe algum custo?</Text>
          </View>

          <Text style={styles.cardText}>
            <Text style={styles.boldText}>Não.</Text> Os hospitais públicos e
            conveniados com o SUS são obrigados a disponibilizar as condições
            materiais e de alojamento necessárias, incluindo{" "}
            <Text style={styles.boldText}>alimentação para o acompanhante</Text>{" "}
            durante todo o período de internamento da mãe.
          </Text>
        </View>

        {/* CARD 4: OBSERVAÇÃO IMPORTANTE (Plano de Parto) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>
              Importante: Como evitar problemas?
            </Text>
          </View>

          <Text style={styles.cardText}>
            Infelizmente, alguns hospitais ainda criam barreiras alegando falta
            de espaço ou privacidade. Para garantir o cumprimento da lei, é{" "}
            <Text style={styles.boldText}>
              altamente recomendado formalizar a sua escolha por escrito
            </Text>
            .{"\n\n"}
            Inclua o nome completo do acompanhante no seu{" "}
            <Text style={styles.boldText}>Plano de Parto</Text> e anexe uma
            cópia da Lei n.º 11.108/2005. Entregue este plano na maternidade
            durante as visitas do pré-natal ou no momento da admissão,
            garantindo que a equipa médica e a administração estejam cientes.
          </Text>
        </View>

        {/* CARD 5: VIOLÊNCIA OBSTÉTRICA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="shield-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Prevenção de Violência</Text>
          </View>

          <Text style={styles.cardText}>
            A presença do acompanhante é uma das principais formas de reduzir o
            risco de violência obstétrica. O apoio emocional e a vigilância
            ativa de alguém de confiança dão mais segurança à parturiente,
            garantindo que as suas decisões e o seu corpo sejam respeitados pela
            equipa de saúde.
          </Text>
        </View>

        {/* LINK PARA O MINISTÉRIO DA SAÚDE */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-mulher/lei-do-acompanhante",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>
              Consultar a Lei do Acompanhante
            </Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para aceder à página oficial do Governo Federal sobre a
            Lei n.º 11.108/2005 e compreender todos os seus pormenores
            regulamentares.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=lei+do+acompanhante+parto+sus+direitos",
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
                <Text style={styles.videoTitle}>
                  Direito Explicado em Vídeo
                </Text>
              </View>

              <Text style={styles.videoText}>
                Assista a relatos e conselhos de ativistas sobre como fazer
                valer a Lei do Acompanhante.
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
