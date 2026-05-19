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

export default function PartoNaAgua() {
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
        <MaterialCommunityIcons name="water" size={48} color="#9333EA" />

        <Text style={styles.title}>Parto na Água</Text>

        <Text style={styles.subtitle}>
          O relaxamento e a leveza da imersão morna
        </Text>
      </View>

      {/* INTRODUÇÃO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>O que é o Parto na Água?</Text>

        <Text style={styles.text}>
          O parto na água é uma variação do parto vaginal onde a mulher passa
          parte do trabalho de parto e/ou o momento do nascimento imersa em uma
          banheira ou piscina de parto com água morna.
        </Text>

        <Text style={styles.text}>
          A água morna funciona como um excelente método natural de alívio da
          dor, proporcionando uma experiência de profunda leveza, intimidade e
          relaxamento para a mãe.
        </Text>
      </View>

      {/* BENEFÍCIOS PARAA MÃE */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>Benefícios para a Mãe</Text>

        <Text style={styles.textWhite}>• Alívio natural da dor</Text>
        <Text style={styles.textWhite}>
          A água morna bloqueia parte dos estímulos dolorosos que vão para o
          cérebro, agindo como uma analgesia natural.
        </Text>

        <Text style={styles.textWhite}>• Relaxamento muscular</Text>
        <Text style={styles.textWhite}>
          Reduz a ansiedade e a adrenalina, facilitando a produção de ocitocina
          (o hormônio que faz o parto evoluir).
        </Text>

        <Text style={styles.textWhite}>• Proteção do períneo</Text>
        <Text style={styles.textWhite}>
          A água morna aumenta a elasticidade dos tecidos do períneo de forma
          natural, reduzindo drasticamente as chances de lacerações severas.
        </Text>

        <Text style={styles.textWhite}>• Mobilidade e leveza</Text>
        <Text style={styles.textWhite}>
          O efeito de flutuação tira o peso do corpo, tornando muito mais fácil
          para a gestante trocar de posição e encontrar o seu conforto.
        </Text>
      </View>

      {/* BENEFÍCIOS PARA O BEBÊ */}
      <View style={styles.cardPink}>
        <Text style={styles.sectionTitle}>Benefícios para o Bebê</Text>

        <Text style={styles.text}>
          • Transição suave: O bebê sai do ambiente líquido e aquecido do útero
          diretamente para a água morna, diminuindo o impacto do nascimento.
        </Text>

        <Text style={styles.text}>
          • Nascimento mais calmo: Bebês que nascem na água costumam chorar
          menos, são mais calmos e iniciam o contato pele a pele de forma muito
          tranquila.
        </Text>

        <Text style={styles.text}>
          💡 Curiosidade importante: O bebê não se afoga! Enquanto ele está na
          água, ele continua recebendo oxigênio através do cordão umbilical. O
          reflexo de respirar só é ativado quando o rosto do bebê entra em
          contato com o ar frio e o oxigênio atmosférico.
        </Text>
      </View>

      {/* CRITÉRIOS DE SEGURANÇA */}
      <View style={styles.cardGreen}>
        <Text style={styles.sectionTitle}>Critérios de Segurança</Text>

        <Text style={styles.text}>
          Para garantir um parto seguro na água, alguns requisitos médicos são
          fundamentais:
        </Text>

        <Text style={styles.text}>
          • Gestação de risco habitual (baixo risco).
        </Text>

        <Text style={styles.text}>
          • Gravidez a termo (entre 37 e 42 semanas) e de apenas um bebê.
        </Text>

        <Text style={styles.text}>
          • Ausência de infecções ativas que possam ser transmitidas pela água.
        </Text>

        <Text style={styles.text}>
          • Sinais vitais da mãe e batimentos do bebê perfeitamente saudáveis
          durante todo o monitoramento.
        </Text>
      </View>

      {/* COMO FUNCIONA O PROCESSO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cuidados Durante a Imersão</Text>

        <Text style={styles.text}>
          • Temperatura ideal: A água deve ser mantida rigorosamente entre
          **36°C e 37°C** para evitar o superaquecimento da mãe ou induzir o
          bebê a respirar antes da hora.
        </Text>

        <Text style={styles.text}>
          • Momento de entrar: O mais recomendado é entrar na água quando a fase
          ativa já estiver bem estabelecida (acima de 5 cm de dilatação), para
          que o relaxamento excessivo não diminua o ritmo das contrações no
          início.
        </Text>

        <Text style={styles.text}>
          • Monitoramento: A equipe de saúde utiliza sonar cirúrgico à prova
          d'água para ouvir os batimentos do bebê sem que a mãe precise sair da
          piscina.
        </Text>
      </View>

      {/* QUANDO NÃO É RECOMENDADO */}
      <View style={styles.cardPink}>
        <Text style={styles.sectionTitle}>Contraindicações</Text>

        <Text style={styles.text}>
          A saída da água (ou a não recomendação) acontece caso surjam cenários
          como:
        </Text>

        <Text style={styles.text}>
          • Presença de mecônio espesso (sinal de que o bebê pode estar em
          sofrimento).
        </Text>

        <Text style={styles.text}>
          • Sangramento vaginal anormal durante o trabalho de parto.
        </Text>

        <Text style={styles.text}>
          • Necessidade do uso de analgesia farmacológica (peridural) ou indução
          contínua com oxitocina, que exigem monitoramento hospitalar fixo.
        </Text>
      </View>

      {/* CONCLUSÃO */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>Conclusão</Text>

        <Text style={styles.textWhite}>
          O parto na água é uma ferramenta maravilhosa e empoderadora para as
          mulheres que buscam um nascimento natural com alto nível de conforto
          térmico e muscular.
        </Text>

        <Text style={styles.textWhite}>
          Se este for o seu desejo, converse com seu obstetra ou enfermeira
          obstétrica para avaliar a viabilidade e garantir que a maternidade
          escolhida possua a estrutura ideal para te acolher.
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
