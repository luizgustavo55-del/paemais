import { theme } from "@/src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PadroesContracoes() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtnLeft}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={theme.colors.title}
          />
        </TouchableOpacity>
        <Text style={styles.titulo}>Padrões</Text>
        <View style={{ width: 26 }} />{" "}
        {/* Espaçador para centralizar o título */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        <View
          style={[
            styles.card,
            { borderColor: theme.colors.textPrimary, borderWidth: 2 },
          ]}
        >
          <Text style={styles.cardTituloDestaque}>Trabalho de Parto Ativo</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.terceary,
  },
  header: {
    height: 110,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: theme.colors.terceary,
  },
  headerBtnLeft: {
    padding: 5,
  },
  titulo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.title,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  descricaoGeral: {
    fontSize: theme.texts.text,
    color: theme.colors.title,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  cardTitulo: {
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
    color: theme.colors.title,
    marginBottom: 5,
  },
  cardTituloDestaque: {
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: 5,
  },
  cardSubtitulo: {
    fontSize: theme.texts.text,
    color: theme.colors.subtitle,
    fontStyle: "italic",
    marginBottom: 15,
  },
  cardTexto: {
    fontSize: theme.texts.text,
    color: theme.colors.title,
    lineHeight: 28,
  },
});
