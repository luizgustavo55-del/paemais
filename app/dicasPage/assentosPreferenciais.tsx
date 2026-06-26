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

export default function AssentosPreferenciaisScreen() {
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
            <Text style={styles.badgeText}>Transporte e Mobilidade</Text>
          </View>
        </View>

        <Text style={styles.title}>Assentos Preferenciais</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="bus-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>O que diz a Lei?</Text>
          </View>

          <Text style={styles.cardText}>
            A legislação federal e diversas leis locais garantem a reserva de
            assentos em transportes públicos (ônibus, metrô, trem) para
            gestantes, lactantes e pessoas com crianças de colo. Esses assentos
            costumam ser pintados de outra cor ou devidamente sinalizados com
            adesivos.
          </Text>
        </View>

        {/* CARD 2: "TODOS OS ASSENTOS" */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="apps-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Apenas os marcados?</Text>
          </View>

          <Text style={styles.cardText}>
            <Text style={styles.boldText}>Não necessariamente.</Text> Em muitas
            capitais e estados brasileiros, a lei foi atualizada para determinar
            que{" "}
            <Text style={styles.boldText}>
              todos os assentos do transporte público são preferenciais
            </Text>
            . Isso significa que, se o veículo estiver lotado, qualquer
            passageiro sentado deve ceder o lugar à gestante, independentemente
            de estar em um banco sinalizado ou não.
          </Text>
        </View>

        {/* CARD 3: DIREITO APÓS O PARTO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="walk-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>E depois do nascimento?</Text>
          </View>

          <Text style={styles.cardText}>
            O direito não acaba com o parto. O transporte público balança muito
            e oferece riscos de queda. Por isso, a lei garante o assento para:
          </Text>
          {[
            "Pessoas com criança de colo (seja a mãe, o pai ou o responsável que esteja carregando o bebê).",
            "Mães lactantes (que estão em fase de amamentação).",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CARD 4: OBSERVAÇÃO IMPORTANTE (Como Agir) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>O que fazer se ninguém ceder?</Text>
          </View>

          <Text style={styles.cardText}>
            Não sinta vergonha de exigir o seu direito, pois a sua segurança e a
            do bebê estão em risco. Se os assentos estiverem ocupados por
            pessoas fora do grupo prioritário:{"\n\n"}
            <Text style={styles.boldText}>1.</Text> Peça educadamente a um
            passageiro para ceder o lugar.{"\n"}
            <Text style={styles.boldText}>2.</Text> Se houver recusa, comunique
            o{" "}
            <Text style={styles.boldText}>
              cobrador, motorista ou segurança
            </Text>{" "}
            da estação. Eles têm autoridade e o dever de intervir, podendo até
            parar o veículo até que o assento seja liberado.
          </Text>
        </View>

        {/* CARD 5: APLICATIVOS E ESTACIONAMENTOS */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="car-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Estacionamento e Aplicativos</Text>
          </View>

          <Text style={styles.cardText}>
            Além do transporte público, shoppings e supermercados devem
            disponibilizar{" "}
            <Text style={styles.boldText}>
              vagas de estacionamento exclusivas
            </Text>{" "}
            para gestantes. No caso de transportes por aplicativo, o motorista
            não pode recusar a viagem ou cobrar taxas extras pelo fato de você
            estar grávida ou com bebê de colo.
          </Text>
        </View>

        {/* LINK PARA INFORMAÇÃO */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://www12.senado.leg.br/noticias/materias/2023/04/17/aprovada-reserva-de-todos-os-assentos-para-prioridades-no-transporte-coletivo",
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons name="globe-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Notícias do Senado</Text>
          </View>

          <Text style={styles.cardText}>
            Toque aqui para ler sobre os projetos de lei que reforçam a
            prioridade em todos os assentos no Brasil.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=assento+preferencial+gestante+onibus",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Comportamento Social</Text>
              </View>

              <Text style={styles.videoText}>
                Assista a reportagens sobre o respeito e os direitos das
                grávidas no transporte público.
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
