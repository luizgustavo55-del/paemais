import { Image, Linking, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BolsaFamilia() {
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
          Bolsa Família
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
            O Bolsa Família é o principal programa de transferência de renda do Brasil. 
            Ele oferece apoio financeiro direto para famílias em situação de pobreza e extrema pobreza. 
            O objetivo é garantir uma renda mínima para essas famílias. 
            O programa é reconhecido internacionalmente por reduzir a fome no país. 
            Ele considera o tamanho e as características da família. 
            Quanto mais pessoas, maior pode ser o benefício. 
            Também promove inclusão social. 
            Faz parte das políticas públicas do Governo Federal. 
            Atua em todo o território nacional. 
            É uma das principais ferramentas de combate à pobreza no Brasil.
          </Text>
        </View>

        {/* 🎯 OBJETIVO */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Objetivo</Text>
          <Text style={styles.text}>
            O programa tem como objetivo principal combater a pobreza e a desigualdade social. 
            Ele garante renda básica para famílias vulneráveis. 
            Também busca promover dignidade e cidadania. 
            Incentiva o acesso à saúde, educação e assistência social. 
            Ajuda a melhorar a qualidade de vida das famílias. 
            Atua para quebrar o ciclo da pobreza entre gerações. 
            Estimula o desenvolvimento social. 
            Integra diferentes políticas públicas. 
            Fortalece a proteção social no Brasil. 
            Contribui para uma sociedade mais justa. 
          </Text>
        </View>

        {/* 👨‍👩‍👧 QUEM PODE */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Quem pode participar</Text>
          <Text style={styles.text}>
            Podem participar famílias em situação de pobreza. 
            A principal regra é ter renda mensal de até R$ 218 por pessoa. 
            Mesmo quem trabalha pode receber o benefício. 
            Famílias com crianças, gestantes ou adolescentes têm prioridade. 
            É necessário estar inscrito no Cadastro Único. 
            Os dados devem estar atualizados. 
            O governo analisa cada caso mensalmente. 
            Nem todas as famílias entram automaticamente. 
            O processo depende dos critérios do programa. 
            O foco é atender quem mais precisa. 
          </Text>
        </View>

        {/* 📝 COMO RECEBER */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Como receber</Text>
          <Text style={styles.text}>
            O primeiro passo é se cadastrar no Cadastro Único. 
            O cadastro é feito em postos como o CRAS. 
            É necessário apresentar documentos da família. 
            Após isso, o governo analisa os dados. 
            A entrada no programa não é imediata. 
            Existe uma seleção automática mensal. 
            O valor do benefício varia conforme a família. 
            Depende da renda e da quantidade de pessoas. 
            O pagamento é feito mensalmente. 
            Pode ser acessado por conta bancária ou aplicativo. 
          </Text>
        </View>

        {/* 💰 BENEFÍCIOS */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Benefícios</Text>
          <Text style={styles.text}>
            O Bolsa Família é composto por diferentes tipos de benefícios. 
            Existe um valor base por pessoa da família. 
            Há complementos para garantir valor mínimo. 
            Famílias com crianças pequenas recebem adicional. 
            Gestantes e adolescentes também têm benefícios extras. 
            O valor total depende da composição familiar. 
            O objetivo é atender necessidades específicas. 
            O pagamento é mensal. 
            Ajuda na alimentação e nas despesas básicas. 
            É um apoio importante para famílias vulneráveis. 
          </Text>
        </View>

        {/* ⚠️ IMPORTANTE */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Importante</Text>
          <Text style={styles.text}>
            Estar no Cadastro Único não garante receber o Bolsa Família. 
            É necessário atender aos critérios do programa. 
            Os dados devem estar sempre atualizados. 
            Informações incorretas podem bloquear o benefício. 
            O acompanhamento é feito pelo governo. 
            O programa exige compromisso com saúde e educação. 
            O benefício deve ser usado para necessidades básicas. 
            O pagamento tem prazo para saque. 
            O programa é gratuito. 
            Nunca pague para participar.
          </Text>
        </View>

        {/* 🎬 VÍDEO (NULL) */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() => {}}
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={require("../../assets/images/bolsaFamilia.png")}
                style={styles.thumbnail}
              />
              <View style={styles.playButton}>
                <Text style={styles.playText}>▶</Text>
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.subtitle}>Vídeo explicativo</Text>
              <Text style={styles.text}>
                Conteúdo em breve
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 🌐 SITE */}
        <View>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              Linking.openURL("https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia")
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