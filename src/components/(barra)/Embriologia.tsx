import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { doc, getDoc } from "firebase/firestore"; // Importações do Firestore
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase"; // Certifique-se de exportar 'db' daqui

// --- TIPAGENS (TypeScript) ---
interface TopicoProps {
  text: string;
}

interface EmbriologiaCardProps {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap; // Tipagem correta para os ícones
  color: string;
  topicos: string[];
}

// --- DADOS DA TELA (Tirando os textos do meio do código) ---
const FASES_EMBRIOLOGIA: EmbriologiaCardProps[] = [
  {
    title: "1ª e 2ª Semana — DUM",
    icon: "calendar-month",
    color: "#A855F7",
    topicos: [
      "A gravidez é contada desde a Data da Última Menstruação.",
      "Ainda não existe embrião nessas semanas.",
      "O corpo da mulher inicia preparação hormonal.",
      "O endométrio fica mais espesso para receber o bebê.",
      "Ocorre amadurecimento do óvulo.",
      "No final da 2ª semana geralmente acontece a ovulação.",
    ],
  },
  {
    title: "3ª Semana — Fecundação",
    icon: "heart",
    color: "#EC4899",
    topicos: [
      "O espermatozoide encontra o óvulo na tuba uterina.",
      "Forma-se o zigoto, a primeira célula do bebê.",
      "O zigoto possui 46 cromossomos.",
      "Metade do DNA vem da mãe e metade do pai.",
      "O sexo genético do bebê já é definido nesse momento.",
    ],
  },
  {
    title: "Clivagem Celular",
    icon: "dna",
    color: "#7C3AED",
    topicos: [
      "Após a fecundação começam divisões celulares rápidas.",
      "Essas divisões recebem o nome de clivagem.",
      "As células formadas são chamadas blastômeros.",
      "O embrião continua viajando até o útero.",
    ],
  },
  {
    title: "Mórula",
    icon: "circle-multiple",
    color: "#8B5CF6",
    topicos: [
      "A mórula possui cerca de 16 a 32 células.",
      "Ela possui aparência semelhante a uma amora.",
      "Ainda não existe aumento real de tamanho.",
      "A mórula continua se deslocando em direção ao útero.",
    ],
  },
  {
    title: "Blastocisto",
    icon: "atom",
    color: "#06B6D4",
    topicos: [
      "Depois da mórula surge o blastocisto.",
      "O trofoblasto formará a placenta.",
      "O embrioblasto formará o bebê.",
      "A blastocele é a cavidade cheia de líquido.",
    ],
  },
  {
    title: "Nidação",
    icon: "baby-face-outline",
    color: "#14B8A6",
    topicos: [
      "O blastocisto implanta-se no útero.",
      "Esse processo é chamado nidação.",
      "A gravidez passa a existir oficialmente.",
      "Começa produção do hormônio HCG.",
      "O teste de gravidez pode positivar.",
    ],
  },
  {
    title: "Gastrulação e Gástrula",
    icon: "layers",
    color: "#F97316",
    topicos: [
      "O blastocisto transforma-se em gástrula.",
      "A gastrulação forma os folhetos embrionários.",
      "Esses folhetos originam todos os órgãos do corpo.",
    ],
  },
  {
    title: "Folhetos Embrionários",
    icon: "shape-outline",
    color: "#EF4444",
    topicos: [
      "Ectoderma → cérebro, pele, olhos e sistema nervoso.",
      "Mesoderma → músculos, ossos, coração e sangue.",
      "Endoderma → pulmões, fígado e intestinos.",
    ],
  },
  {
    title: "Neurulação",
    icon: "brain",
    color: "#6366F1",
    topicos: [
      "Forma-se o tubo neural.",
      "O tubo neural dará origem ao cérebro e medula.",
      "O ácido fólico é fundamental nessa fase.",
      "Falhas podem causar anencefalia e espinha bífida.",
    ],
  },
  {
    title: "Organogênese",
    icon: "heart-pulse",
    color: "#10B981",
    topicos: [
      "É a fase de formação dos órgãos.",
      "Surgem coração, pulmões, rins e fígado.",
      "Braços, pernas e dedos começam a aparecer.",
      "É uma fase extremamente delicada.",
    ],
  },
  {
    title: "Formação do Coração",
    icon: "heart-circle",
    color: "#E11D48",
    topicos: [
      "O coração é um dos primeiros órgãos a funcionar.",
      "Inicialmente existe um tubo cardíaco primitivo.",
      "Por volta da 5ª semana o coração começa a bater.",
    ],
  },
  {
    title: "Placenta e Cordão Umbilical",
    icon: "mother-heart",
    color: "#9333EA",
    topicos: [
      "A placenta leva oxigênio e nutrientes ao bebê.",
      "O cordão umbilical conecta o bebê à placenta.",
      "A placenta também remove resíduos do bebê.",
      "Hormônios importantes são produzidos nela.",
    ],
  },
  {
    title: "Embrião",
    icon: "baby",
    color: "#F59E0B",
    topicos: [
      "Até a 8ª semana o bebê é chamado embrião.",
      "Nessa fase ocorre formação estrutural do corpo.",
      "O embrião é muito sensível a álcool e drogas.",
    ],
  },
  {
    title: "Feto",
    icon: "human-pregnant",
    color: "#0EA5E9",
    topicos: [
      "Após a 8ª semana o embrião passa a ser chamado feto.",
      "Agora ocorre crescimento e amadurecimento.",
      "Os órgãos continuam evoluindo até o nascimento.",
    ],
  },
  {
    title: "Trimestres da Gestação",
    icon: "calendar-range",
    color: "#22C55E",
    topicos: [
      "1º trimestre → formação dos órgãos e batimentos cardíacos.",
      "2º trimestre → crescimento acelerado e movimentos fetais.",
      "3º trimestre → amadurecimento pulmonar e ganho de peso.",
    ],
  },
  {
    title: "Resumo Final",
    icon: "star-four-points",
    color: "#7C3AED",
    topicos: [
      "Tudo começa com um zigoto formado na fecundação.",
      "Depois surgem mórula, blastocisto e gástrula.",
      "O bebê passa por neurulação e organogênese.",
      "O embrião transforma-se em feto.",
      "Milhões de divisões celulares formam um ser humano completo.",
    ],
  },
];

// --- SUBCOMPONENTES ---
const Topico = ({ text }: TopicoProps) => (
  <View style={styles.item}>
    <View style={styles.bullet} />
    <Text style={styles.itemText}>{text}</Text>
  </View>
);

const EmbriologiaCard = ({
  title,
  icon,
  color,
  topicos,
}: EmbriologiaCardProps) => (
  <View style={[styles.card, { backgroundColor: color }]}>
    <View style={styles.cardHeader}>
      <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {topicos.map((texto, index) => (
      <Topico key={index} text={texto} />
    ))}
  </View>
);

// --- COMPONENTE PRINCIPAL ---
export default function Embriologia() {
  const [semana, setSemana] = useState(0);

  // useFocusEffect garante que os dados atualizem sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      async function carregarDadosDoFirestore() {
        try {
          const uid = auth.currentUser?.uid;
          if (!uid) return;

          // Busca direto do Firestore na coleção 'users' (Ajuste o nome se necessário)
          const userDocRef = doc(firestore, "users", uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const dumString = userData.dataUltimaMenstruacao;

            // Validação de segurança para evitar erro no .split()
            if (
              dumString &&
              typeof dumString === "string" &&
              dumString.includes("/")
            ) {
              const p = dumString.split("/");

              if (p.length === 3) {
                const dum = new Date(
                  Number(p[2]),
                  Number(p[1]) - 1,
                  Number(p[0]),
                );
                const dias = Math.floor(
                  (Date.now() - dum.getTime()) / 86400000,
                );
                setSemana(Math.max(0, Math.floor(dias / 7)));
              }
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados do Firestore:", error);
        }
      }

      carregarDadosDoFirestore();
    }, []),
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Embriologia</Text>
        <Text style={styles.headerSubtitle}>
          Formação completa do bebê desde a última menstruação
        </Text>

        <View style={styles.weekBadge}>
          <MaterialCommunityIcons
            name="calendar-heart"
            size={18}
            color="#fff"
          />
          <Text style={styles.weekText}>Semana atual: {semana}</Text>
        </View>
      </View>

      {/* RENDERIZAÇÃO DA LISTA DE CARDS MUDOU AQUI */}
      {FASES_EMBRIOLOGIA.map((fase, index) => (
        <EmbriologiaCard
          key={index}
          title={fase.title}
          icon={fase.icon}
          color={fase.color}
          topicos={fase.topicos}
        />
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ... Estilos permanecem exatamente iguais ao seu código original ...
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  header: { marginBottom: 24 },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 6, lineHeight: 22 },
  weekBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    marginTop: 14,
  },
  weekText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  card: { borderRadius: 24, padding: 18, marginBottom: 18 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginTop: 7,
    marginRight: 12,
  },
  itemText: { flex: 1, color: "#fff", fontSize: 14, lineHeight: 22 },
});
