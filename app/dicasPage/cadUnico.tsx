import { Image, Linking, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CadastroUnico() {
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
          Cadastro Único (CadÚnico)
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
            O Cadastro Único é um sistema do Governo Federal que reúne informações sobre famílias de baixa renda no Brasil. 
            Ele permite identificar a realidade social dessas famílias, incluindo renda, moradia, escolaridade e trabalho. 
            Funciona como uma base de dados nacional utilizada por diversos programas sociais. 
            Com ele, o governo consegue planejar melhor políticas públicas. 
            O cadastro é gratuito e acessível à população. 
            Ele evita que as famílias precisem fazer vários cadastros diferentes. 
            Também facilita o acesso a benefícios sociais. 
            É administrado em parceria com os municípios. 
            Está presente em todo o país. 
            É essencial para promover inclusão social.
          </Text>
        </View>

        {/* 🎯 PARA QUE SERVE */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Para que serve</Text>
          <Text style={styles.text}>
            O Cadastro Único serve como porta de entrada para programas sociais do governo. 
            Através dele, é possível acessar benefícios como Bolsa Família, Auxílio Gás e Tarifa Social de Energia. 
            Ele organiza as informações das famílias em um único sistema. 
            Isso facilita a seleção dos beneficiários. 
            Cada programa utiliza esses dados para definir quem tem direito. 
            Também ajuda o governo a identificar quem mais precisa. 
            Permite acompanhar a situação das famílias ao longo do tempo. 
            Auxilia na criação de novas políticas públicas. 
            Torna o processo mais justo e transparente. 
            Conecta a população aos seus direitos.
          </Text>
        </View>

        {/* 👨‍👩‍👧 QUEM PODE */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Quem pode se cadastrar</Text>
          <Text style={styles.text}>
            Podem se cadastrar famílias de baixa renda. 
            Em geral, aquelas com renda de até meio salário mínimo por pessoa. 
            Famílias com renda maior também podem participar em casos específicos. 
            Pessoas que vivem sozinhas podem se cadastrar. 
            Comunidades tradicionais também têm direito. 
            O cadastro é gratuito para todos. 
            Não é necessário pagar em nenhuma etapa. 
            O importante é estar em situação de vulnerabilidade social. 
            Os dados são analisados pelo governo. 
            Assim, mais pessoas podem acessar benefícios.
          </Text>
        </View>

        {/* 📝 COMO SE CADASTRAR */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Como se cadastrar</Text>
          <Text style={styles.text}>
            O cadastro deve ser feito presencialmente em um CRAS ou posto de atendimento. 
            Um responsável pela família deve comparecer ao local. 
            É necessário levar documentos de todos os membros da família. 
            Entre eles estão CPF, RG e comprovante de residência. 
            Será realizada uma entrevista social. 
            Nela, serão coletadas informações sobre a família. 
            Nem todos precisam estar presentes. 
            O processo é gratuito. 
            Após o cadastro, os dados são analisados. 
            É importante fornecer informações corretas.
          </Text>
        </View>

        {/* 👥 COMO FUNCIONA */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Como funciona</Text>
          <Text style={styles.text}>
            O Cadastro Único funciona por meio de um sistema nacional de dados. 
            Um entrevistador registra as informações da família. 
            Esses dados ficam disponíveis para programas sociais. 
            O cadastro não garante benefícios automaticamente. 
            Cada programa possui suas próprias regras. 
            O sistema permite acompanhar mudanças na família. 
            As informações devem ser sempre verdadeiras. 
            Isso evita problemas no acesso aos benefícios. 
            O governo utiliza esses dados para decisões. 
            É uma ferramenta de apoio social.
          </Text>
        </View>

        {/* 🔄 ATUALIZAÇÃO */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Atualização dos dados</Text>
          <Text style={styles.text}>
            Os dados devem ser atualizados a cada dois anos. 
            Também sempre que houver mudanças na família. 
            Como mudança de endereço ou renda. 
            Nascimento ou saída de membros deve ser informado. 
            A atualização evita bloqueio de benefícios. 
            Garante que as informações estejam corretas. 
            O processo é feito no mesmo local do cadastro. 
            Também é gratuito. 
            Dados desatualizados podem causar problemas. 
            Manter tudo atualizado é essencial.
          </Text>
        </View>

        {/* ⚠️ IMPORTANTE */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Importante</Text>
          <Text style={styles.text}>
            Estar no Cadastro Único não garante benefícios automaticamente. 
            Cada programa tem critérios próprios. 
            Todas as informações devem ser verdadeiras. 
            Dados incorretos podem bloquear benefícios. 
            O cadastro é totalmente gratuito. 
            Nunca pague para se cadastrar. 
            É importante guardar documentos. 
            O acompanhamento pode ser feito pelo app ou CRAS. 
            Manter contato com o atendimento ajuda. 
            O sistema exige responsabilidade.
          </Text>
        </View>

        {/* 🎬 VÍDEO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL("https://youtu.be/UNI1xYeEjjI?si=dzweKRVMYuTYbjqH")
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={require("../../assets/images/cadUnico.png")}
                style={styles.thumbnail}
              />
              <View style={styles.playButton}>
                <Text style={styles.playText}>▶</Text>
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.subtitle}>Vídeo explicativo</Text>
              <Text style={styles.text}>
                Cadastro Único explicado de forma simples
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 🌐 SITE */}
        <View>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              Linking.openURL("https://www.gov.br/pt-br/servicos/inscrever-se-no-cadastro-unico-para-programas-sociais-do-governo-federal")
            }
          >
            <Text style={styles.subtitle}>Veja mais na web</Text>
            <Text style={styles.text}>
              Clique e acesse o site oficial do Governo
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