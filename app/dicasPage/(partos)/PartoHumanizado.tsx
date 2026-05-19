import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

export default function PartoHumanizado() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER VOLTAR */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(funcoes)/(planejamento)/planoParto")}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text style={styles.backText}>Voltar</Text>
      </View>

      {/* HEADER */}
      <View style={styles.headerCard}>
        <MaterialCommunityIcons
          name="account-heart"
          size={48}
          color="#9333EA"
        />

        <Text style={styles.title}>Parto Humanizado</Text>

        <Text style={styles.subtitle}>
          Respeito, acolhimento e protagonismo feminino
        </Text>
      </View>

      {/* INTRODUÇÃO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>O que é o Parto Humanizado?</Text>

        <Text style={styles.text}>
          Diferente do que muitos pensam, o parto humanizado não é um "tipo" de
          parto (como normal ou cesárea), mas sim uma abordagem ou filosofia de
          assistência.
        </Text>

        <Text style={styles.text}>
          Ele baseia-se no respeito à fisiologia do nascimento e aos desejos da
          mulher, colocando-a como protagonista e principal tomadora de decisões
          do próprio parto, sempre com respaldo da Medicina Baseada em
          Evidências.
        </Text>

        <Text style={styles.text}>
          Importante: Uma cesárea também pode (e deve) ser humanizada, desde que
          haja respeito e acolhimento em todo o processo cirúrgico.
        </Text>
      </View>

      {/* PILARES */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>
          Os 3 Pilares da Humanização
        </Text>

        <Text style={styles.textWhite}>1. Protagonismo da Mulher</Text>
        <Text style={styles.textWhite}>
          A gestante tem direito à informação clara, consentimento livre e
          construção de um Plano de Parto, tendo suas escolhas respeitadas.
        </Text>

        <Text style={styles.textWhite}>2. Medicina Baseada em Evidências</Text>
        <Text style={styles.textWhite}>
          As intervenções médicas só são realizadas quando realmente há
          necessidade clínica, seguindo as recomendações da Organização Mundial
          da Saúde (OMS).
        </Text>

        <Text style={styles.textWhite}>3. Equipe Multidisciplinar</Text>
        <Text style={styles.textWhite}>
          Apoio contínuo e respeitoso de médicos, enfermeiros obstetras,
          parteiras e doulas.
        </Text>
      </View>

      {/* PRÁTICAS */}
      <View style={styles.cardPink}>
        <Text style={styles.sectionTitle}>Práticas Recomendadas (OMS)</Text>

        <Text style={styles.text}>
          • Liberdade de movimento e escolha da posição para o nascimento (não é
          obrigatório ficar deitada).
        </Text>

        <Text style={styles.text}>
          • Permissão para ingerir líquidos e alimentos leves durante o trabalho
          de parto.
        </Text>

        <Text style={styles.text}>
          • Oferta de métodos não farmacológicos para alívio da dor (massagem,
          banho quente, bola, respiração).
        </Text>

        <Text style={styles.text}>
          • Presença garantida de um acompanhante de livre escolha da mulher em
          todo o processo.
        </Text>

        <Text style={styles.text}>
          • Monitoramento intermitente dos batimentos cardíacos do bebê.
        </Text>
      </View>

      {/* O QUE NÃO DEVE ACONTECER */}
      <View style={styles.cardGreen}>
        <Text style={styles.sectionTitle}>Intervenções Evitadas</Text>

        <Text style={styles.text}>
          No parto humanizado, rotinas antigas e desnecessárias são abandonadas:
        </Text>

        <Text style={styles.text}>
          • Episiotomia de rotina (corte no períneo). Hoje sabe-se que o corpo
          se recupera melhor de lacerações naturais.
        </Text>

        <Text style={styles.text}>
          • Manobra de Kristeller (empurrar a barriga da mãe). É proibida pelo
          Ministério da Saúde.
        </Text>

        <Text style={styles.text}>
          • Uso rotineiro de ocitocina sintética (sorinho) apenas para acelerar
          o parto sem indicação clínica.
        </Text>

        <Text style={styles.text}>
          • Raspagem dos pelos pubianos e lavagem intestinal obrigatórias.
        </Text>
      </View>

      {/* A HORA DOURADA */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>A "Hora Dourada" (Golden Hour)</Text>

        <Text style={styles.text}>
          Os primeiros 60 minutos após o nascimento são sagrados na assistência
          humanizada:
        </Text>

        <Text style={styles.text}>
          • Contato pele a pele imediato e ininterrupto entre mãe e bebê (se
          ambos estiverem bem).
        </Text>

        <Text style={styles.text}>
          • Clampeamento oportuno do cordão umbilical (esperar parar de pulsar
          para garantir as reservas de ferro do bebê).
        </Text>

        <Text style={styles.text}>
          • Estímulo à amamentação na primeira hora de vida.
        </Text>

        <Text style={styles.text}>
          • Procedimentos de rotina no bebê (pesar, medir, dar vacinas) são
          adiados para não interromper esse vínculo inicial.
        </Text>
      </View>

      {/* CONCLUSÃO */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>Conclusão</Text>

        <Text style={styles.textWhite}>
          O parto humanizado devolve à mulher o poder sobre o seu próprio corpo
          e transforma o nascimento num evento familiar, fisiológico e seguro.
        </Text>

        <Text style={styles.textWhite}>
          Informação é a chave. Ao elaborar seu Plano de Parto e dialogar com
          sua equipe de assistência, você garante que sua voz será ouvida no
          momento mais importante da sua vida.
        </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF9FA",
    padding: 16,
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",

    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  backText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 12,
  },

  headerCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,

    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 12,
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  cardPurple: {
    backgroundColor: "#9333EA",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  cardPink: {
    backgroundColor: "#FCE7F3",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  cardGreen: {
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 14,
  },

  sectionTitleWhite: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 14,
  },

  text: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 26,
    marginBottom: 12,
  },

  textWhite: {
    fontSize: 15,
    color: "#FFF",
    lineHeight: 26,
    marginBottom: 12,
  },
});
