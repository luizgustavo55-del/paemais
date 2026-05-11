import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getData } from '@/src/services/database';
import { theme } from '@/src/constants/theme';
import { auth } from '@/src/services/firebase';

const EmbriologiaCard = ({
  title,
  icon,
  color,
  children,
}: any) => (
  <View style={[styles.card, { backgroundColor: color }]}>
    <View style={styles.cardHeader}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color="#fff"
      />

      <Text style={styles.cardTitle}>
        {title}
      </Text>
    </View>

    {children}
  </View>
);

const Topico = ({ text }: any) => (
  <View style={styles.item}>
    <View style={styles.bullet} />

    <Text style={styles.itemText}>
      {text}
    </Text>
  </View>
);

export default function Embriologia() {
  const [semana, setSemana] = useState(0);

  useEffect(() => {
    async function carregar() {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const dados = await getData(uid);

      if (dados?.user?.dataUltimaMenstruacao) {
        const p =
          dados.user.dataUltimaMenstruacao.split('/');

        const dum = new Date(
          Number(p[2]),
          Number(p[1]) - 1,
          Number(p[0])
        );

        const dias = Math.floor(
          (Date.now() - dum.getTime()) /
            86400000
        );

        setSemana(
          Math.max(0, Math.floor(dias / 7))
        );
      }
    }

    carregar();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Embriologia
        </Text>

        <Text style={styles.headerSubtitle}>
          Formação completa do bebê desde a
          última menstruação
        </Text>

        <View style={styles.weekBadge}>
          <MaterialCommunityIcons
            name="calendar-heart"
            size={18}
            color="#fff"
          />

          <Text style={styles.weekText}>
            Semana atual: {semana}
          </Text>
        </View>
      </View>

      {/* DUM */}
      <EmbriologiaCard
        title="1ª e 2ª Semana — DUM"
        icon="calendar-month"
        color="#A855F7"
      >
        <Topico text="A gravidez é contada desde a Data da Última Menstruação." />

        <Topico text="Ainda não existe embrião nessas semanas." />

        <Topico text="O corpo da mulher inicia preparação hormonal." />

        <Topico text="O endométrio fica mais espesso para receber o bebê." />

        <Topico text="Ocorre amadurecimento do óvulo." />

        <Topico text="No final da 2ª semana geralmente acontece a ovulação." />
      </EmbriologiaCard>

      {/* FECUNDAÇÃO */}
      <EmbriologiaCard
        title="3ª Semana — Fecundação"
        icon="heart"
        color="#EC4899"
      >
        <Topico text="O espermatozoide encontra o óvulo na tuba uterina." />

        <Topico text="Forma-se o zigoto, a primeira célula do bebê." />

        <Topico text="O zigoto possui 46 cromossomos." />

        <Topico text="Metade do DNA vem da mãe e metade do pai." />

        <Topico text="O sexo genético do bebê já é definido nesse momento." />
      </EmbriologiaCard>

      {/* CLIVAGEM */}
      <EmbriologiaCard
        title="Clivagem Celular"
        icon="dna"
        color="#7C3AED"
      >
        <Topico text="Após a fecundação começam divisões celulares rápidas." />

        <Topico text="Essas divisões recebem o nome de clivagem." />

        <Topico text="As células formadas são chamadas blastômeros." />

        <Topico text="O embrião continua viajando até o útero." />
      </EmbriologiaCard>

      {/* MÓRULA */}
      <EmbriologiaCard
        title="Mórula"
        icon="circle-multiple"
        color="#8B5CF6"
      >
        <Topico text="A mórula possui cerca de 16 a 32 células." />

        <Topico text="Ela possui aparência semelhante a uma amora." />

        <Topico text="Ainda não existe aumento real de tamanho." />

        <Topico text="A mórula continua se deslocando em direção ao útero." />
      </EmbriologiaCard>

      {/* BLASTOCISTO */}
      <EmbriologiaCard
        title="Blastocisto"
        icon="atom"
        color="#06B6D4"
      >
        <Topico text="Depois da mórula surge o blastocisto." />

        <Topico text="O trofoblasto formará a placenta." />

        <Topico text="O embrioblasto formará o bebê." />

        <Topico text="A blastocele é a cavidade cheia de líquido." />
      </EmbriologiaCard>

      {/* NIDAÇÃO */}
      <EmbriologiaCard
        title="Nidação"
        icon="baby-face-outline"
        color="#14B8A6"
      >
        <Topico text="O blastocisto implanta-se no útero." />

        <Topico text="Esse processo é chamado nidação." />

        <Topico text="A gravidez passa a existir oficialmente." />

        <Topico text="Começa produção do hormônio HCG." />

        <Topico text="O teste de gravidez pode positivar." />
      </EmbriologiaCard>

      {/* GÁSTRULA */}
      <EmbriologiaCard
        title="Gastrulação e Gástrula"
        icon="layers"
        color="#F97316"
      >
        <Topico text="O blastocisto transforma-se em gástrula." />

        <Topico text="A gastrulação forma os folhetos embrionários." />

        <Topico text="Esses folhetos originam todos os órgãos do corpo." />
      </EmbriologiaCard>

      {/* FOLHETOS */}
      <EmbriologiaCard
        title="Folhetos Embrionários"
        icon="shape-outline"
        color="#EF4444"
      >
        <Topico text="Ectoderma → cérebro, pele, olhos e sistema nervoso." />

        <Topico text="Mesoderma → músculos, ossos, coração e sangue." />

        <Topico text="Endoderma → pulmões, fígado e intestinos." />
      </EmbriologiaCard>

      {/* NEURULAÇÃO */}
      <EmbriologiaCard
        title="Neurulação"
        icon="brain"
        color="#6366F1"
      >
        <Topico text="Forma-se o tubo neural." />

        <Topico text="O tubo neural dará origem ao cérebro e medula." />

        <Topico text="O ácido fólico é fundamental nessa fase." />

        <Topico text="Falhas podem causar anencefalia e espinha bífida." />
      </EmbriologiaCard>

      {/* ORGANOGÊNESE */}
      <EmbriologiaCard
        title="Organogênese"
        icon="heart-pulse"
        color="#10B981"
      >
        <Topico text="É a fase de formação dos órgãos." />

        <Topico text="Surgem coração, pulmões, rins e fígado." />

        <Topico text="Braços, pernas e dedos começam a aparecer." />

        <Topico text="É uma fase extremamente delicada." />
      </EmbriologiaCard>

      {/* CORAÇÃO */}
      <EmbriologiaCard
        title="Formação do Coração"
        icon="heart-circle"
        color="#E11D48"
      >
        <Topico text="O coração é um dos primeiros órgãos a funcionar." />

        <Topico text="Inicialmente existe um tubo cardíaco primitivo." />

        <Topico text="Por volta da 5ª semana o coração começa a bater." />
      </EmbriologiaCard>

      {/* PLACENTA */}
      <EmbriologiaCard
        title="Placenta e Cordão Umbilical"
        icon="mother-heart"
        color="#9333EA"
      >
        <Topico text="A placenta leva oxigênio e nutrientes ao bebê." />

        <Topico text="O cordão umbilical conecta o bebê à placenta." />

        <Topico text="A placenta também remove resíduos do bebê." />

        <Topico text="Hormônios importantes são produzidos nela." />
      </EmbriologiaCard>

      {/* EMBRIÃO */}
      <EmbriologiaCard
        title="Embrião"
        icon="baby"
        color="#F59E0B"
      >
        <Topico text="Até a 8ª semana o bebê é chamado embrião." />

        <Topico text="Nessa fase ocorre formação estrutural do corpo." />

        <Topico text="O embrião é muito sensível a álcool e drogas." />
      </EmbriologiaCard>

      {/* FETO */}
      <EmbriologiaCard
        title="Feto"
        icon="human-pregnant"
        color="#0EA5E9"
      >
        <Topico text="Após a 8ª semana o embrião passa a ser chamado feto." />

        <Topico text="Agora ocorre crescimento e amadurecimento." />

        <Topico text="Os órgãos continuam evoluindo até o nascimento." />
      </EmbriologiaCard>

      {/* TRIMESTRES */}
      <EmbriologiaCard
        title="Trimestres da Gestação"
        icon="calendar-range"
        color="#22C55E"
      >
        <Topico text="1º trimestre → formação dos órgãos e batimentos cardíacos." />

        <Topico text="2º trimestre → crescimento acelerado e movimentos fetais." />

        <Topico text="3º trimestre → amadurecimento pulmonar e ganho de peso." />
      </EmbriologiaCard>

      {/* FINAL */}
      <EmbriologiaCard
        title="Resumo Final"
        icon="star-four-points"
        color="#7C3AED"
      >
        <Topico text="Tudo começa com um zigoto formado na fecundação." />

        <Topico text="Depois surgem mórula, blastocisto e gástrula." />

        <Topico text="O bebê passa por neurulação e organogênese." />

        <Topico text="O embrião transforma-se em feto." />

        <Topico text="Milhões de divisões celulares formam um ser humano completo." />
      </EmbriologiaCard>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  header: {
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    lineHeight: 22,
  },

  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    alignSelf: 'flex-start',

    backgroundColor: theme.colors.primary,

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 30,

    marginTop: 14,
  },

  weekText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },

  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    backgroundColor: 'rgba(255,255,255,0.15)',

    padding: 14,

    borderRadius: 16,

    marginBottom: 10,
  },

  bullet: {
    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: '#fff',

    marginTop: 7,
    marginRight: 12,
  },

  itemText: {
    flex: 1,

    color: '#fff',

    fontSize: 14,

    lineHeight: 22,
  },
});