import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function PadroesContracoes() {
  const router = useRouter();
  const { theme } = useTheme();

  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;

  const styles = getStyles(theme, isModoCompacto);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtnLeft}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={isModoCompacto ? 22 : 26}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <Text style={styles.titulo}>Padrões</Text>

        <View style={{ width: isModoCompacto ? 34 : 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.descricaoGeral}>
          Entenda como identificar os sinais e padrões das suas contrações para
          saber a hora certa de ir à maternidade.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Falso Trabalho de Parto</Text>
          <Text style={styles.cardSubtitulo}>(Braxton Hicks)</Text>
          <Text style={styles.cardTexto}>
            • Contrações irregulares em intensidade e duração.{"\n"}• Geralmente
            param quando você descansa, muda de posição ou se hidrata.{"\n"}• A
            dor se concentra mais na parte da frente da barriga.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Fase Latente</Text>
          <Text style={styles.cardSubtitulo}>
            (Início do Trabalho de Parto)
          </Text>
          <Text style={styles.cardTexto}>
            • As contrações começam a ficar mais regulares, mas ainda são
            espaçadas (a cada 5 a 30 minutos).{"\n"}• Duram entre 30 a 45
            segundos.{"\n"}• A intensidade é leve a moderada (parecida com
            cólica menstrual).
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Trabalho de Parto Ativo</Text>
          <Text style={styles.cardSubtitulo}>(Regra 5-1-1)</Text>
          <Text style={styles.cardTexto}>
            Atenção! Este é o padrão de alerta para contatar seu médico ou ir à
            maternidade:{"\n\n"}• <Text style={{ fontWeight: "bold" }}>5</Text>:
            Contrações a cada 5 minutos (intervalo).{"\n"}•{" "}
            <Text style={{ fontWeight: "bold" }}>1</Text>: Durando pelo menos 1
            minuto cada.{"\n"}• <Text style={{ fontWeight: "bold" }}>1</Text>:
            Esse padrão se mantém por 1 hora.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFF7FB",
    },
    header: {
      height: isModoCompacto ? 70 : 92,
      paddingTop: isModoCompacto ? 20 : 40,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.gestantesPrimary,
      shadowColor: "#8E3D68",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 4,
    },
    headerBtnLeft: {
      width: isModoCompacto ? 34 : 40,
      height: isModoCompacto ? 34 : 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.20)",
      alignItems: "center",
      justifyContent: "center",
    },
    titulo: {
      fontSize: isModoCompacto ? theme.texts.subtitle : theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    scrollContent: {
      padding: isModoCompacto ? 14 : 20,
      paddingBottom: 40,
    },
    descricaoGeral: {
      fontSize: theme.texts.text,
      color: theme.colors.title,
      marginBottom: 20,
      textAlign: "center",
      paddingHorizontal: 10,
    },
    card: {
      backgroundColor: theme.colors.gestantesCard,
      borderRadius: 16,
      padding: isModoCompacto ? 16 : 20,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderColor: theme.colors.gestantesPrimary,
      borderWidth: 2,
    },
    cardTitulo: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.gestantesPrimary,
      marginBottom: 4,
    },
    cardSubtitulo: {
      fontSize: theme.texts.text,
      color: theme.colors.subtitle,
      fontStyle: "italic",
      marginBottom: 12,
    },
    cardTexto: {
      fontSize: theme.texts.text,
      color: theme.colors.subtitle,
      lineHeight: 24,
    },
  });
