import { Image, Linking, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RedeAlyne() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(pai)/(tabs)/dicas" as any)}
        >
          <Ionicons name="arrow-back" size={24} color="#ba11f2" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Rede Alyne
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* 📌 O QUE É */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>O que é</Text>
          <Text style={styles.text}>
            A Rede Alyne é um programa do Governo Federal voltado ao cuidado integral da gestante, do bebê e da mãe. 
            Ela foi criada para melhorar a qualidade do atendimento no sistema de saúde. 
            O foco é garantir um cuidado mais humano e eficiente durante a gravidez, parto e pós-parto. 
            A iniciativa faz parte do SUS e reorganiza serviços de saúde. 
            Busca integrar diferentes etapas do atendimento. 
            Também amplia o acesso aos serviços de saúde materna. 
            O programa atua em todo o Brasil. 
            Ele substitui e melhora iniciativas anteriores. 
            Tem como base a equidade no atendimento. 
            É voltado principalmente para mulheres em situação de vulnerabilidade.
            
          </Text>
        </View>

        {/* 🎯 OBJETIVO */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Objetivo</Text>
          <Text style={styles.text}>
            O principal objetivo da Rede Alyne é reduzir a mortalidade materna no Brasil. 
            A meta é diminuir essas mortes em cerca de 25%. 
            Também busca reduzir em até 50% as mortes de mulheres negras. 
            O programa investe em melhorias no atendimento de saúde. 
            Promove um cuidado mais seguro e humanizado. 
            Busca reduzir desigualdades no acesso à saúde. 
            Incentiva o acompanhamento desde o pré-natal. 
            Também fortalece o cuidado com o bebê após o nascimento. 
            O programa recebe investimentos do governo federal. 
            É uma política pública voltada à proteção da vida. 
          </Text>
        </View>

        {/* 👩 HISTÓRIA */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Quem foi Alyne</Text>
          <Text style={styles.text}>
            Alyne Pimentel foi uma jovem negra de 28 anos, grávida de seis meses. 
            Ela buscou atendimento médico ao se sentir mal, mas não recebeu o cuidado adequado. 
            Foi atendida sem exames e mandada para casa. 
            Seu quadro piorou e, ao retornar, foi constatada a morte do bebê. 
            Ela enfrentou demora no atendimento e falta de estrutura. 
            Houve atraso na transferência para outro hospital. 
            Alyne morreu após diversas falhas no atendimento. 
            Seu caso se tornou símbolo de negligência na saúde pública. 
            Ele evidenciou desigualdades no atendimento às mulheres negras. 
            Sua história deu nome ao programa como forma de homenagem. 
          </Text>
        </View>

        {/* ⚖️ IMPORTÂNCIA */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Importância</Text>
          <Text style={styles.text}>
            O caso de Alyne teve grande impacto internacional. 
            O Brasil foi condenado por não garantir atendimento adequado. 
            Foi a primeira condenação mundial por morte materna. 
            O caso mostrou falhas graves no sistema de saúde. 
            Também evidenciou desigualdade racial no atendimento. 
            A Rede Alyne surge como resposta a esses problemas. 
            Ela busca evitar novas mortes evitáveis. 
            Promove justiça social na saúde. 
            Fortalece o direito das mulheres ao atendimento digno. 
            É um marco na luta por direitos na saúde pública.
          </Text>
        </View>

        {/* 🏥 COMO FUNCIONA */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Como funciona</Text>
          <Text style={styles.text}>
            A Rede Alyne organiza o atendimento em diferentes etapas. 
            Inclui pré-natal, parto e cuidados após o nascimento. 
            Integra hospitais, postos de saúde e equipes médicas. 
            Busca garantir atendimento contínuo. 
            Também melhora a comunicação entre serviços. 
            Investe na qualificação de profissionais. 
            Amplia o acesso a exames e tratamentos. 
            Incentiva práticas humanizadas no parto. 
            Oferece suporte à mãe e ao bebê. 
            Atua para melhorar toda a rede de atenção à saúde. 
          </Text>
        </View>

        {/* 🔄 IMPACTO */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Impacto esperado</Text>
          <Text style={styles.text}>
            A Rede Alyne busca reduzir mortes maternas evitáveis. 
            Espera melhorar a qualidade do atendimento no SUS. 
            Deve ampliar o acesso aos serviços de saúde. 
            Também pretende diminuir desigualdades raciais. 
            O programa fortalece o cuidado com mães e bebês. 
            Incentiva políticas públicas mais eficientes. 
            Promove atendimento mais rápido e seguro. 
            Valoriza o cuidado humanizado. 
            Pode salvar milhares de vidas. 
            É um avanço importante na saúde pública brasileira. 
          </Text>
        </View>

        {/* 🎬 VÍDEO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL("https://youtu.be/KDmbfW3IKu8?si=Tzaib5yQS2EkCsEr")
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={require("../../assets/images/redeAlyne.png")}
                style={styles.thumbnail}
              />
              <View style={styles.playButton}>
                <Text style={styles.playText}>▶</Text>
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.subtitle}>Vídeo explicativo</Text>
              <Text style={styles.text}>
                Entenda a Rede Alyne e sua importância
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 🌐 SITE */}
        <View>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              Linking.openURL("https://www.gov.br/saude/pt-br/assuntos/noticias/2024/setembro/rede-alyne-conheca-a-historia-da-jovem-negra-que-deu-nome-ao-novo-programa-de-cuidado-integral-a-gestante-e-bebe")
            }
          >
            <Text style={styles.subtitle}>Veja mais na web</Text>
            <Text style={styles.text}>
              Acesse o site oficial do Governo
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6EDFB",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",

    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ba11f2",
  },

  scroll: {
    padding: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ba11f2",

    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ba11f2",
    marginBottom: 6,
  },

  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  youtubeCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
    flexDirection: "row",

    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  thumbnailContainer: {
    position: "relative",
  },

  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },

  playButton: {
    position: "absolute",
    top: "5%",
    left: "5%",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 50,
  },

  playText: {
    color: "#fff",
    fontSize: 14,
  },

  info: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
});