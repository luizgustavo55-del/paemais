import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/src/constants/theme';

export default function PartoNormal() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerCard}>
        <MaterialCommunityIcons
          name="human-pregnant"
          size={48}
          color="#9333EA"
        />

        <Text style={styles.title}>
          Parto Normal
        </Text>

        <Text style={styles.subtitle}>
          Guia completo sobre parto vaginal
        </Text>
      </View>

      {/* INTRODUÇÃO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          O que é o parto normal?
        </Text>

        <Text style={styles.text}>
          O parto normal é o nascimento realizado pela via vaginal.
          Ele acontece de forma fisiológica através das contrações uterinas,
          dilatação do colo do útero e descida do bebê pelo canal vaginal.
        </Text>

        <Text style={styles.text}>
          Esse processo é considerado natural e envolve mudanças hormonais,
          físicas e emocionais importantes no organismo materno.
        </Text>

        <Text style={styles.text}>
          Durante o trabalho de parto o corpo libera hormônios como
          ocitocina, endorfina e adrenalina.
        </Text>

        <Text style={styles.text}>
          Esses hormônios ajudam nas contrações, no controle da dor
          e no vínculo entre mãe e bebê.
        </Text>
      </View>

      {/* FASES */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>
          Fases do Trabalho de Parto
        </Text>

        <Text style={styles.textWhite}>
          • Fase Latente
        </Text>

        <Text style={styles.textWhite}>
          Início das contrações leves e irregulares.
        </Text>

        <Text style={styles.textWhite}>
          • Fase Ativa
        </Text>

        <Text style={styles.textWhite}>
          Contrações intensas e dilatação progressiva.
        </Text>

        <Text style={styles.textWhite}>
          • Período Expulsivo
        </Text>

        <Text style={styles.textWhite}>
          Momento em que o bebê nasce.
        </Text>

        <Text style={styles.textWhite}>
          • Dequitação
        </Text>

        <Text style={styles.textWhite}>
          Saída da placenta após o nascimento.
        </Text>

        <Text style={styles.textWhite}>
          • Pós-parto Imediato
        </Text>

        <Text style={styles.textWhite}>
          Primeiras horas após o nascimento.
        </Text>
      </View>

      {/* DILATAÇÃO */}
      <View style={styles.cardPink}>
        <Text style={styles.sectionTitle}>
          Dilatação do Colo do Útero
        </Text>

        <Text style={styles.text}>
          O colo do útero dilata gradualmente até atingir
          aproximadamente 10 centímetros.
        </Text>

        <Text style={styles.text}>
          Essa dilatação permite a passagem do bebê pelo canal vaginal.
        </Text>

        <Text style={styles.text}>
          As contrações tornam-se mais frequentes,
          fortes e regulares conforme a dilatação evolui.
        </Text>

        <Text style={styles.text}>
          A movimentação da mãe pode auxiliar esse processo.
        </Text>
      </View>

      {/* BENEFÍCIOS */}
      <View style={styles.cardGreen}>
        <Text style={styles.sectionTitle}>
          Benefícios do Parto Normal
        </Text>

        <Text style={styles.text}>
          • Recuperação mais rápida da mãe
        </Text>

        <Text style={styles.text}>
          • Menor risco cirúrgico
        </Text>

        <Text style={styles.text}>
          • Menor chance de infecção
        </Text>

        <Text style={styles.text}>
          • Menor tempo de internação hospitalar
        </Text>

        <Text style={styles.text}>
          • Facilita a amamentação precoce
        </Text>

        <Text style={styles.text}>
          • Maior liberação hormonal natural
        </Text>

        <Text style={styles.text}>
          • Melhor adaptação respiratória do bebê
        </Text>

        <Text style={styles.text}>
          • Menor risco de complicações futuras
        </Text>
      </View>

      {/* HORMÔNIOS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Hormônios Envolvidos
        </Text>

        <Text style={styles.text}>
          A ocitocina é responsável pelas contrações uterinas.
        </Text>

        <Text style={styles.text}>
          As endorfinas ajudam no alívio natural da dor.
        </Text>

        <Text style={styles.text}>
          A prolactina participa da produção do leite materno.
        </Text>

        <Text style={styles.text}>
          A adrenalina aumenta em momentos de maior intensidade do parto.
        </Text>
      </View>

      {/* DOR */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>
          Métodos Naturais para Alívio da Dor
        </Text>

        <Text style={styles.textWhite}>
          • Respiração controlada
        </Text>

        <Text style={styles.textWhite}>
          • Banho quente
        </Text>

        <Text style={styles.textWhite}>
          • Bola suíça
        </Text>

        <Text style={styles.textWhite}>
          • Massagens
        </Text>

        <Text style={styles.textWhite}>
          • Caminhadas leves
        </Text>

        <Text style={styles.textWhite}>
          • Técnicas de relaxamento
        </Text>

        <Text style={styles.textWhite}>
          • Musicoterapia
        </Text>

        <Text style={styles.textWhite}>
          • Presença de acompanhante
        </Text>
      </View>

      {/* RISCOS */}
      <View style={styles.cardPink}>
        <Text style={styles.sectionTitle}>
          Possíveis Riscos e Complicações
        </Text>

        <Text style={styles.text}>
          Apesar de ser um processo natural, o parto normal pode apresentar
          algumas complicações.
        </Text>

        <Text style={styles.text}>
          • Lacerações perineais
        </Text>

        <Text style={styles.text}>
          • Hemorragias
        </Text>

        <Text style={styles.text}>
          • Sofrimento fetal
        </Text>

        <Text style={styles.text}>
          • Trabalho de parto prolongado
        </Text>

        <Text style={styles.text}>
          • Exaustão materna
        </Text>

        <Text style={styles.text}>
          Em situações específicas pode ser necessária uma cesárea de emergência.
        </Text>
      </View>

      {/* HUMANIZAÇÃO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Humanização do Parto
        </Text>

        <Text style={styles.text}>
          O parto humanizado busca respeitar as escolhas da mulher.
        </Text>

        <Text style={styles.text}>
          A gestante possui autonomia para escolher posições,
          acompanhante e métodos de conforto.
        </Text>

        <Text style={styles.text}>
          O contato pele a pele entre mãe e bebê é incentivado.
        </Text>

        <Text style={styles.text}>
          A amamentação precoce também é estimulada.
        </Text>
      </View>

      {/* PÓS PARTO */}
      <View style={styles.cardGreen}>
        <Text style={styles.sectionTitle}>
          Recuperação Pós-Parto
        </Text>

        <Text style={styles.text}>
          A recuperação costuma ser mais rápida quando comparada à cesárea.
        </Text>

        <Text style={styles.text}>
          Nos primeiros dias podem ocorrer dores uterinas,
          sangramento vaginal e cansaço físico.
        </Text>

        <Text style={styles.text}>
          A alimentação adequada e hidratação auxiliam a recuperação.
        </Text>

        <Text style={styles.text}>
          O apoio emocional da família também é importante.
        </Text>
      </View>

      {/* CONCLUSÃO */}
      <View style={styles.cardPurple}>
        <Text style={styles.sectionTitleWhite}>
          Conclusão
        </Text>

        <Text style={styles.textWhite}>
          O parto normal é um processo fisiológico complexo
          que envolve alterações hormonais, emocionais e físicas.
        </Text>

        <Text style={styles.textWhite}>
          Quando realizado com segurança e acompanhamento profissional,
          ele oferece diversos benefícios para mãe e bebê.
        </Text>

        <Text style={styles.textWhite}>
          Cada gestação é única e a escolha do tipo de parto
          deve considerar aspectos médicos, emocionais e pessoais.
        </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF9FA',
    padding: 16,
  },

  headerCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,

    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
  },

  subtitle: {
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  cardPurple: {
    backgroundColor: '#9333EA',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  cardPink: {
    backgroundColor: '#FCE7F3',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  cardGreen: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 14,
  },

  sectionTitleWhite: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 14,
  },

  text: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 12,
  },

  textWhite: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 26,
    marginBottom: 12,
  },
});