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

export default function PartoCesarea() {
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
        <MaterialCommunityIcons name="hospital-box" size={48} color="#9333EA" />

        <Text style={styles.title}>Parto Cesárea</Text>

        <Text style={styles.subtitle}>
          Guia completo sobre o parto cirúrgico
        </Text>
      </View>

      {/* INTRODUÇÃO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>O que é a Cesárea?</Text>

        <Text style={styles.text}>
          A cesariana é um procedimento cirúrgico utilizado para o nascimento do
          bebê, realizado através de incisões no abdômen e no útero da mulher.
        </Text>

        <Text style={styles.text}>
          Ela pode ser planejada com antecedência (eletiva) por motivos médicos,
          ou realizada em caráter de urgência/emergência caso surjam
          complicações durante o trabalho de parto normal.
        </Text>

        <Text style={styles.text}>
          Hoje em dia, é uma cirurgia muito segura, desenvolvida para salvar
          vidas e garantir o bem-estar tanto da mãe quanto do bebê.
        </Text>
      </View>

      {/* INDICAÇÕES */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>
          Principais Indicações Médicas
        </Text>

        <Text style={styles.textWhite}>• Posição do bebê</Text>
        <Text style={styles.textWhite}>
          Bebê sentado (pélvico) ou atravessado (transverso) no final da
          gestação.
        </Text>

        <Text style={styles.textWhite}>• Sofrimento fetal</Text>
        <Text style={styles.textWhite}>
          Alterações severas nos batimentos cardíacos do bebê durante o trabalho
          de parto.
        </Text>

        <Text style={styles.textWhite}>
          • Descolamento prematuro da placenta
        </Text>
        <Text style={styles.textWhite}>
          Quando a placenta se separa do útero antes da hora.
        </Text>

        <Text style={styles.textWhite}>• Placenta prévia</Text>
        <Text style={styles.textWhite}>
          Quando a placenta cobre total ou parcialmente o colo do útero.
        </Text>

        <Text style={styles.textWhite}>• Gestação múltipla</Text>
        <Text style={styles.textWhite}>
          Dependendo da posição dos bebês, em casos de gêmeos ou mais.
        </Text>
      </View>

      {/* O PROCEDIMENTO */}
      <View style={styles.cardPink}>
        <Text style={styles.sectionTitle}>Como é o Procedimento?</Text>

        <Text style={styles.text}>
          1. Anestesia: Geralmente é utilizada a raquidiana ou peridural, que
          adormece apenas da cintura para baixo. A mãe permanece acordada.
        </Text>

        <Text style={styles.text}>
          2. Incisão: Um pequeno corte (cerca de 10 a 15 cm) é feito logo acima
          da linha dos pelos pubianos.
        </Text>

        <Text style={styles.text}>
          3. Nascimento: O médico retira o bebê, limpa suas vias aéreas e, caso
          esteja tudo bem, logo o apresenta aos pais.
        </Text>

        <Text style={styles.text}>
          4. Finalização: A placenta é removida e inicia-se a sutura
          (fechamento) das camadas do útero e abdômen. O processo todo leva
          cerca de 45 a 60 minutos.
        </Text>
      </View>

      {/* HUMANIZAÇÃO */}
      <View style={styles.cardGreen}>
        <Text style={styles.sectionTitle}>Cesárea Humanizada</Text>

        <Text style={styles.text}>
          Mesmo sendo uma cirurgia, a cesárea pode e deve ser acolhedora.
        </Text>

        <Text style={styles.text}>
          • Campo cirúrgico abaixado: Permite que a mãe veja o exato momento do
          nascimento.
        </Text>

        <Text style={styles.text}>
          • Contato pele a pele: O bebê é colocado imediatamente no peito da
          mãe, se ambos estiverem estáveis.
        </Text>

        <Text style={styles.text}>
          • Clampeamento tardio: Esperar o cordão parar de pulsar antes de
          cortar, garantindo mais ferro para o bebê.
        </Text>

        <Text style={styles.text}>
          • Ambiente: Luzes mais fracas e música ambiente, se for o desejo da
          família.
        </Text>
      </View>

      {/* RISCOS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Riscos e Desvantagens</Text>

        <Text style={styles.text}>
          Como toda cirurgia de médio porte, a cesárea apresenta alguns riscos
          que precisam ser avaliados junto à equipe médica:
        </Text>

        <Text style={styles.text}>
          • Risco de infecção na incisão cirúrgica ou uterina.
        </Text>

        <Text style={styles.text}>• Maior probabilidade de sangramentos.</Text>

        <Text style={styles.text}>
          • Possibilidade de problemas respiratórios transitórios no bebê
          (especialmente se feita antes das 39 semanas sem entrar em trabalho de
          parto).
        </Text>

        <Text style={styles.text}>
          • Impactos em gestações futuras, como risco ligeiramente maior de
          ruptura uterina.
        </Text>
      </View>

      {/* RECUPERAÇÃO */}
      <View style={styles.cardGreen}>
        <Text style={styles.sectionTitle}>Recuperação Pós-Parto</Text>

        <Text style={styles.text}>
          A recuperação costuma ser mais lenta e requer mais cuidados do que o
          parto normal.
        </Text>

        <Text style={styles.text}>
          • O tempo de internação é geralmente de 2 a 3 dias.
        </Text>

        <Text style={styles.text}>
          • Há restrições maiores para pegar peso (além do bebê), dirigir e
          fazer exercícios físicos nas primeiras semanas.
        </Text>

        <Text style={styles.text}>
          • É comum sentir dores na região do corte, que são controladas com
          analgésicos e anti-inflamatórios prescritos pelo médico.
        </Text>

        <Text style={styles.text}>
          • A higienização da cicatriz deve ser feita apenas com água e sabão
          durante o banho.
        </Text>
      </View>

      {/* CONCLUSÃO */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>Conclusão</Text>

        <Text style={styles.textWhite}>
          A cesárea é um recurso vital e extraordinário da medicina moderna
          quando o parto vaginal apresenta riscos à mãe ou ao bebê.
        </Text>

        <Text style={styles.textWhite}>
          Quando bem indicada, ela garante a segurança de ambos. Uma boa
          comunicação com sua equipe médica e a elaboração de um plano de parto
          para o cenário cirúrgico são essenciais para um nascimento tranquilo e
          respeitoso.
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
