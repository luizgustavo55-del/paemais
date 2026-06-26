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

// Importação do hook customizado de tema atualizada conforme solicitado
import { useTheme } from "@/src/context/ThemeContext";

export default function PausasAmamentacaoScreen() {
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
            <Text style={styles.badgeText}>Direitos Pós-Parto</Text>
          </View>
        </View>

        <Text style={styles.title}>Pausas para Amamentação</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="time-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>O que é esse direito?</Text>
          </View>

          <Text style={styles.cardText}>
            A lei garante que a mãe, ao regressar da licença-maternidade, tem
            direito a pausas especiais durante a jornada de trabalho para
            amamentar o seu próprio filho. Essas pausas{" "}
            <Text style={styles.boldText}>
              não podem ser descontadas do salário/vencimento
            </Text>{" "}
            nem compensadas com horas extras.
          </Text>
        </View>

        {/* CARD 2: DURAÇÃO E PERÍODO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="hourglass-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Duração e Prazos</Text>
          </View>

          <Text style={styles.cardText}>
            Segundo a CLT (Artigo 396.º), as regras básicas são:
          </Text>
          {[
            "Dois descansos especiais de 30 minutos cada um por dia.",
            "O direito é válido até o bebé completar 6 (seis) meses de idade.",
            "O prazo de 6 meses pode ser estendido caso a saúde do bebé exija (mediante laudo médico).",
            "Aplica-se também a mães adotivas.",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CARD 3: FLEXIBILIDADE */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="git-compare-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>Flexibilidade de Horários</Text>
          </View>

          <Text style={styles.cardText}>
            Muitas empresas e trabalhadoras preferem juntar os dois períodos de
            30 minutos. Assim, a mãe pode optar por{" "}
            <Text style={styles.boldText}>entrar 1 hora mais tarde</Text> ou{" "}
            <Text style={styles.boldText}>sair 1 hora mais cedo</Text> do
            trabalho para amamentar o bebé em casa.
          </Text>
        </View>

        {/* CARD 4: OBSERVAÇÃO IMPORTANTE (Acordo Escrito) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>Importante: Acordo por Escrito</Text>
          </View>

          <Text style={styles.cardText}>
            A definição dos horários das pausas deve ser acordada diretamente
            entre a mulher e a empresa. Para a sua segurança jurídica, é{" "}
            <Text style={styles.boldText}>
              essencial formalizar este acordo por escrito
            </Text>
            .{"\n\n"}
            Crie um documento simples especificando os horários escolhidos (ex:
            das 10h às 10h30 e das 15h às 15h30, ou a saída antecipada), assine
            e peça a assinatura do responsável pelos Recursos Humanos (RH).
          </Text>
        </View>

        {/* CARD 5: ESPAÇO NA EMPRESA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="business-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Espaço para Extração de Leite</Text>
          </View>

          <Text style={styles.cardText}>
            As empresas que possuam mais de 30 funcionárias com mais de 16 anos
            são obrigadas por lei a disponibilizar um local apropriado onde as
            mães possam guardar os seus bebés ou, de forma mais moderna, extrair
            e armazenar o leite materno com higiene e privacidade durante estas
            pausas.
          </Text>
        </View>

        {/* LINK PARA O MINISTÉRIO DO TRABALHO / CLT */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://www.jusbrasil.com.br/topicos/10714774/artigo-396-da-decreto-lei-n-5452-de-01-de-maio-de-1943",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Consultar o Artigo 396.º</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para aceder ao texto integral da lei e entender os
            detalhes jurídicos sobre a amamentação no trabalho.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=pausa+para+amamentacao+clt+como+funciona",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1546111811-9a7dc92ec92f?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Guia Prático em Vídeo</Text>
              </View>

              <Text style={styles.videoText}>
                Assista a explicações sobre como negociar o horário da
                amamentação com o seu chefe.
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
