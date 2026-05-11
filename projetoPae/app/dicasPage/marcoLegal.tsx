import { Image, Linking, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TelaExemplo() {
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
          Marco Legal da Primeira Infância
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        <View style={styles.card}>
           <Text style={styles.subtitle}> Resumo</Text>
          <Text style={styles.text}>

            O Marco Legal da Primeira Infância (Lei nº 13.257/2016) estabelece diretrizes para políticas públicas voltadas a crianças de até 6 anos.
            Reconhece a importância dos primeiros mil dias para o desenvolvimento físico, emocional e cognitivo.
            Destaca que essa fase é decisiva, mas também vulnerável a fatores como pobreza e violência.
            A lei garante direitos fundamentais às crianças e orienta ações integradas entre diferentes áreas.
            Inclui temas como saúde, educação, alimentação, convivência familiar e proteção contra violência.
            Também valoriza o direito ao brincar como essencial para o desenvolvimento infantil.
            Prevê a ampliação da licença-paternidade para fortalecer o vínculo familiar.
            Garante direitos às gestantes, inclusive em situações de vulnerabilidade.
            Incentiva políticas intersetoriais com participação de União, estados e municípios.
            Define que o cuidado com a criança é responsabilidade de toda a sociedade e do Estado.
            Determina a criação e manutenção de espaços seguros e adequados para crianças.
            Estabelece a necessidade de monitoramento e avaliação das políticas públicas.
            Prioriza a qualificação de profissionais que atuam com a primeira infância.
            Orienta famílias sobre cuidados, alimentação e desenvolvimento infantil saudável.
            Assim, promove o desenvolvimento integral da criança desde os primeiros anos de vida.
          </Text>
        </View>

        <View style={styles.card}>
           <Text style={styles.subtitle}> A lei</Text>
          <Text style={styles.text}>
           
       O Marco Legal da Primeira Infância (Lei nº 13.257/2016) traz importantes avanços na proteção aos direitos das crianças brasileiras de até seis anos de idade, ao estabelecer princípios e diretrizes para a formulação e a implementação de políticas públicas voltadas a meninos e meninas nessa faixa etária. Trata-se do reconhecimento de que os primeiros mil dias (compreendendo a gestação e os dois primeiros anos de vida) configuram uma janela de oportunidade única para o desenvolvimento neurológico, cognitivo, psicomotor e emocional das crianças.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>O que é?</Text>
          <Text style={styles.text}>
            Estabelece princípios e diretrizes para políticas públicas voltadas à primeira infância.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Por quê?</Text>
          <Text style={styles.text}>
            Os primeiros anos são fundamentais e exigem proteção contra vulnerabilidades.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Como colocar em prática?</Text>
          <Text style={styles.text}>
            Define direitos, responsabilidades e integração entre políticas públicas.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Áreas prioritárias</Text>
          <Text style={styles.text}>
            Saúde, educação, alimentação, convivência, lazer e proteção.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Responsabilidade</Text>
          <Text style={styles.text}>
            União, estados e municípios atuam juntos.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Monitoramento</Text>
          <Text style={styles.text}>
            Avaliação contínua e coleta de dados.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Qualificação</Text>
          <Text style={styles.text}>
            Profissionais recebem formação especializada.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Gestantes</Text>
          <Text style={styles.text}>
            Orientação completa sobre cuidados e desenvolvimento.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Brincar</Text>
          <Text style={styles.text}>
            Fundamental para o desenvolvimento infantil.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Licença-paternidade</Text>
          <Text style={styles.text}>
            Ampliada para fortalecer vínculos.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Acolhimento</Text>
          <Text style={styles.text}>
            Prioriza ambiente familiar para crianças.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Consumo e mídia</Text>
          <Text style={styles.text}>
            Uso da tecnologia deve ser mediado.
          </Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity
  style={styles.youtubeCard}
  onPress={() =>
    Linking.openURL("https://youtu.be/bV6bQNMFhq4?si=3vg2bncM8bcmhD1x")
  }
>
  {/* 🎬 THUMBNAIL */}
  <View style={styles.thumbnailContainer}>
 <Image
  source={require("../../assets/images/marcoLegal.jpg")}
  style={styles.thumbnail}
/>
    <View style={styles.playButton}>
      <Text style={styles.playText}>▶</Text>
    </View>
  </View>

  {/* 📝 INFO */}
  <View style={styles.info}>
    <Text style={styles.subtitle}>Vídeo explicativo</Text>
    <Text style={styles.text}>
      Marco Legal da Primeira Infância explicado
    </Text> 
  </View>
</TouchableOpacity>
</View>
        <View>
        <TouchableOpacity
        style={styles.card}
  onPress={() => Linking.openURL("https://www.gov.br/mdh/pt-br/navegue-por-temas/crianca-e-adolescente/acoes-e-programas-de-gestoes-anteriores/primeira-infancia")}>
    <Text style={styles.subtitle}> Veja mais sobre na web</Text>
  <Text style={styles.text}>Clique e acesse o site do Governo Brasileiro</Text>
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
  botao: {
  backgroundColor: "#ba11f2",
  padding: 12,
  borderRadius: 10,
  marginTop: 10,
},
youtubeCard: {
  backgroundColor: "#fff",
  borderRadius: 10,
  marginBottom: 8,
  overflow: "hidden",

  flexDirection: "row", // 🔥 deixa lado a lado

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
  width: 80,   // 🔥 tamanho menor lateral
  height: 80,
  padding: 10,
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
  flex: 1, // 🔥 ocupa o resto do espaço
  padding: 10,
  justifyContent: "center",
},
});