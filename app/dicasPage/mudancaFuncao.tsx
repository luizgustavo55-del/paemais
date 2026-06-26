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

import { useTheme } from "@/src/context/ThemeContext";

export default function MudancaFuncaoScreen() {
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
            <Text style={styles.badgeText}>Proteção no Trabalho</Text>
          </View>
        </View>

        <Text style={styles.title}>Mudança de Função</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CARD 1: O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="swap-horizontal-outline"
              size={22}
              color="#C54286"
            />
            <Text style={styles.cardTitle}>O que é esse direito?</Text>
          </View>

          <Text style={styles.cardText}>
            A lei garante à gestante o direito à{" "}
            <Text style={styles.boldText}>
              transferência temporária de cargo ou função
            </Text>{" "}
            quando as suas atividades normais apresentarem risco para a sua
            saúde ou para o desenvolvimento do bebé.
          </Text>
        </View>

        {/* CARD 2: QUANDO SOLICITAR */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="warning-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Quando deve ser aplicada?</Text>
          </View>

          <Text style={styles.cardText}>
            Esta mudança deve ocorrer sempre que o trabalho envolver:
          </Text>
          {[
            "Esforço físico intenso (como carregar peso).",
            "Muito tempo em pé ou em posições desconfortáveis.",
            "Contacto com produtos químicos, radiação ou agentes biológicos (insalubridade).",
            "Ambientes com frio ou calor extremos.",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CARD 3: SALÁRIO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cash-outline" size={22} color="#C54286" />
            <Text style={styles.cardTitle}>O meu salário vai diminuir?</Text>
          </View>

          <Text style={styles.cardText}>
            <Text style={styles.boldText}>Não.</Text> A CLT (Art. 392, § 4º,
            inciso I) proíbe qualquer redução salarial. Mesmo que seja
            transferida para uma função teoricamente "inferior" ou mais leve na
            empresa, o seu salário e os seus benefícios devem ser{" "}
            <Text style={styles.boldText}>integralmente mantidos</Text>.
          </Text>
        </View>

        {/* CARD 4: OBSERVAÇÃO IMPORTANTE (Comprovação) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />
            <Text style={styles.cardTitle}>Importante: O Atestado</Text>
          </View>

          <Text style={styles.cardText}>
            A empresa não fará a mudança de função apenas de boca. Para garantir
            este direito, é obrigatório solicitar ao seu médico obstetra um{" "}
            <Text style={styles.boldText}>laudo ou atestado médico</Text>.
            {"\n\n"}O documento deve{" "}
            <Text style={styles.boldText}>
              especificar claramente quais atividades você não pode realizar
            </Text>{" "}
            (ex: "proibida de levantar mais de 5kg" ou "não pode ter contacto
            com produtos de limpeza industriais"). Entregue o documento ao RH e
            guarde uma cópia assinada por eles.
          </Text>
        </View>

        {/* CARD 5: RETORNO À FUNÇÃO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="refresh-outline" size={22} color="#8B2F61" />
            <Text style={styles.cardTitle}>Retorno após a Licença</Text>
          </View>

          <Text style={styles.cardText}>
            Não se preocupe em perder o seu antigo lugar. A lei assegura a{" "}
            <Text style={styles.boldText}>retoma da sua função original</Text>{" "}
            logo após o fim da licença-maternidade, quando regressar ao
            trabalho.
          </Text>
        </View>

        {/* LINK PARA O TST */}
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
            Toque aqui para consultar o portal do Tribunal Superior do Trabalho
            e conhecer todas as garantias sobre ambiente salubre para gestantes.
          </Text>
        </TouchableOpacity>

        {/* VÍDEO EXPLICATIVO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/results?search_query=gestante+mudanca+de+funcao+trabalho+insalubre",
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=105&q=80",
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
                <Text style={styles.videoTitle}>Assista sobre o tema</Text>
              </View>

              <Text style={styles.videoText}>
                Veja explicações de advogados sobre como pedir a mudança de
                função sem conflitos.
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
