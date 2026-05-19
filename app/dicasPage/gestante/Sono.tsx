import React from "react";
import {
  Image,
  Linking,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TelaExemplo() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER (DENTRO DO SCROLLVIEW COMO PEDIDO) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                router.push("/(drawer)/(gestantes)/(tabs)/dicas" as any)
              }
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>


            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Autocuidado e Rotina
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            Sono e Cansaço durante a Gestação
          </Text>
        </View>

        {/* CARD 1 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#ff5ea8"
            />
            <Text style={styles.cardTitle}>
              Resumo
            </Text>
          </View>

          <Text style={styles.cardText}>
            Durante a gravidez, é muito comum que as futuras mães sintam mais cansaço do que o habitual — como sono excessivo ao longo do dia, dificuldade para encontrar uma posição confortável para dormir e até a sensação de acordar cansada mesmo após várias horas de descanso.
Mas afinal, isso é normal? Neste artigo, você vai entender por que o sono muda tanto durante a gestação, quando ele pode ser um dos primeiros sinais da gravidez, o que provoca esse cansaço e quais hábitos podem ajudar a melhorar a qualidade do descanso nesse período tão especial.

          </Text>
        </View>
       

        {/* CARD 2 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="library-outline"
              size={22}
              color="#7050b3"
            />
            <Text style={styles.cardTitle}>
             Quando o sono aumenta na gravidez?
            </Text>
          </View>
          

         <Text style={styles.cardText}>
  É muito comum que a gestante passe a sentir mais sono logo nas primeiras semanas da gravidez. Em geral, esse cansaço começa a aparecer por volta da{" "}
  
  <Text style={{ fontWeight: "bold" }}>
    5ª ou 6ª semana
  </Text>
  , período em que os hormônios da gestação, como o HCG e a progesterona, aumentam bastante no organismo
  <Text style={{ fontWeight: "bold" }}>
        . Durante o segundo trimestre
  </Text>
, muitas mulheres percebem uma melhora na disposição e conseguem se sentir mais ativas no dia a dia.
</Text>
        </View>
          {/* CARD 1 */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#ff5ea8"
            />
            <Text style={styles.cardTitle}>
           Sonecas e cochilos inesperados (1° trimestre)
            </Text>
          </View>

          <Text style={styles.cardText}>
           
No comecinho da gravidez, é bem provável que você passe o dia com sono. A repentina necessidade de uma soneca é provocada pelo aumento nos níveis de progesterona, fenômeno normal na gestação. Esse hormônio feminino ajuda a controlar seu ciclo reprodutivo. A presença da progesterona pode transformar um dia normal de trabalho numa verdadeira maratona; talvez você fique tão exausta que ache até que está prestes a pegar uma gripe.

O paradoxal é que, apesar de a progesterona fazer você ficar morrendo de sono durante o dia, à noite o hormônio atrapalha seu sono, o que por sua vez faz você ficar ainda mais sonolenta no dia seguinte. Infelizmente, não há muita saída para esse círculo vicioso. O jeito é descansar o máximo que puder, mesmo que não dê para dormir. E aproveitar qualquer oportunidade para tirar aquela tão sonhada sonequinha da tarde.
          </Text>
        </View><View style={styles.card}>
  <View style={styles.cardTitleRow}>
    <Ionicons
      name="moon-outline"
      size={22}
      color="#7050b3"
    />

    <Text style={styles.cardTitle}>
      Sono no segundo e terceiro trimestre
    </Text>
  </View>

  <Text style={styles.cardText}>
    Durante o segundo trimestre da gravidez,
    muitas gestantes percebem uma melhora no
    sono e na disposição. Nessa fase, o corpo
    costuma se adaptar melhor às mudanças
    hormonais, diminuindo o cansaço intenso
    comum no início da gestação. Mesmo assim,
    algumas mulheres ainda podem sentir sono
    ao longo do dia, principalmente após
    atividades cansativas.

    {"\n\n"}

    Já no terceiro trimestre, as dificuldades
    para dormir costumam aumentar novamente.
    O crescimento da barriga, dores nas
    costas, desconfortos para encontrar uma
    posição confortável, ansiedade e as idas
    frequentes ao banheiro durante a noite
    podem atrapalhar bastante o descanso.

    {"\n\n"}

    Além disso, os movimentos do bebê e a
    dificuldade para respirar em algumas
    posições também podem deixar o sono mais
    leve e interrompido. Por isso, muitas
    gestantes acordam cansadas mesmo após
    várias horas na cama.

    {"\n\n"}

    Nessa fase, manter hábitos saudáveis,
    criar uma rotina de descanso e buscar
    posições mais confortáveis para dormir
    ajudam bastante a melhorar a qualidade do
    sono e trazer mais conforto para a mãe.
  </Text>
</View>
      {/* CARD 1 */}
<View style={styles.card}>
  <View style={styles.cardTitleRow}>
    <Ionicons name="sparkles-outline" size={22} color="#ff5ea8" />

    <Text style={styles.cardTitle}>
      Como melhorar o sono e aliviar o cansaço na gravidez
    </Text>
  </View> 

  <Text style={styles.cardText}>
    Durante a gravidez, é normal sentir mais sono, cansaço e dificuldade para descansar. As alterações hormonais, emocionais e físicas fazem o corpo trabalhar mais intensamente para o desenvolvimento do bebê. Por isso, alguns hábitos podem ajudar a melhorar a qualidade do sono e trazer mais disposição no dia a dia.
  </Text>

  {[
    "Mantenha uma rotina de sono: dormir e acordar em horários parecidos ajuda o organismo a criar um ritmo mais saudável, facilitando o descanso;",
    
    "Tenha um ambiente confortável: lugares escuros, silenciosos e mais frescos ajudam o corpo a relaxar e dormir melhor;",
    
    "Evite telas antes de dormir: a luz do celular, televisão e computador pode atrapalhar a produção de melatonina, dificultando o sono;",
    
    "Prefira refeições leves no período da noite: alimentos muito gordurosos ou pesados podem causar desconforto e prejudicar o descanso;",
    
    "Evite excesso de cafeína: café, refrigerantes e energéticos podem aumentar a agitação e atrapalhar o sono;",
    
    "Faça atividades relaxantes: banho morno, leitura leve, músicas calmas e meditação ajudam a desacelerar o corpo e a mente;",
    
    "Respeite os sinais do corpo: quando sentir muito cansaço, tente fazer pausas ao longo do dia ou cochilos curtos para recuperar as energias;",
    
    "Durma em posições mais confortáveis: dormir de lado, principalmente do lado esquerdo, melhora a circulação sanguínea e reduz desconfortos;",
    
    "Use travesseiros e almofadas: apoiar a barriga, as costas ou as pernas ajuda a aliviar dores e encontrar posições mais confortáveis;",
    
    "Pratique atividades físicas leves: caminhadas, alongamentos, yoga, hidroginástica e exercícios orientados ajudam a melhorar a disposição e a qualidade do sono;",
    
    "Faça alongamentos durante o dia: movimentar o corpo melhora a circulação, reduz inchaços e diminui dores musculares;",
    
    "Evite ficar muito tempo na mesma posição: permanecer muito tempo sentada ou em pé pode aumentar o desconforto e o cansaço;",
    
    "Cuide da alimentação: frutas, verduras, legumes, proteínas e alimentos ricos em ferro ajudam a manter a energia e prevenir anemia;",
    
    "Beba bastante água: manter o corpo hidratado ajuda no funcionamento do organismo e reduz alguns desconfortos da gestação;",
    
    "Evite excesso de esforço físico: o corpo precisa de mais descanso nesse período, então é importante respeitar seus limites;",
    
    "Reduza situações de estresse: preocupações e ansiedade podem prejudicar o sono e aumentar o desgaste emocional;",
    
    "Compartilhe sentimentos e inseguranças: conversar com pessoas de confiança ajuda a aliviar tensões e trazer mais tranquilidade;",
    
    "Faça massagens e técnicas de relaxamento: quando orientadas corretamente, ajudam a aliviar dores, tensões e sensação de peso no corpo;",
    
    "Cuide da saúde emocional: momentos de descanso mental são importantes para o bem-estar da mãe e do bebê;",
    
    "Observe sinais diferentes: cansaço excessivo, tristeza frequente, falta de ar ou fraqueza intensa devem ser avaliados pelo médico.",
  ].map((item, index) => (
    <View
      key={index}
      style={styles.listItem}
    >
      <View style={styles.bullet} />

      <Text style={styles.listText}>
        {item}
      </Text>
    </View>
  ))}

  <Text style={styles.cardText}>
    Cada gestante vive a gravidez de forma única. O mais importante é encontrar hábitos que tragam conforto, bem-estar e equilíbrio, tornando esse período mais leve, saudável e tranquilo para a mãe e para o bebê.
  </Text>
</View>

        {/* LISTA 
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="list-outline"
              size={22}
              color="#00c48c"
            />
            <Text style={styles.cardTitle}>
              aqui seu texto (lista)
            </Text>
          </View>

          {["item 1", "item 2", "item 3"].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>
                aqui seu texto: {item}
              </Text>
            </View>
          ))}
        </View>*/}

        {/* LINK */}
       {/* LINKS EXTERNOS */}
<View style={styles.card}>
  <View style={styles.cardTitleRow}>
    <Ionicons
      name="globe-outline"
      size={22}
      color="#7050b3"
    />

    <Text style={styles.cardTitle}>
      Conteúdos externos
    </Text>
  </View>

  <Text style={styles.cardText}>
    Veja conteúdos da web para aprender mais
    sobre o assunto e tirar dúvidas.
  </Text>

  {/* LINK 1 */}
  <TouchableOpacity
    style={styles.linkButton}
    onPress={() =>
      Linking.openURL(
        "https://blog.cordvida.com.br/dicas-para-gravidas-reduzirem-a-sensacao-de-cansaco/"
      )
    }
  >
    <Ionicons
      name="open-outline"
      size={18}
      color="#7050b3"
    />

    <Text style={styles.linkButtonText}>
      Dicas para reduzir o cansaço
    </Text>
  </TouchableOpacity>

  {/* LINK 2 */}
  <TouchableOpacity
    style={styles.linkButton}
    onPress={() =>
      Linking.openURL(
        "https://materna.nestlefamilynes.com.br/conteudos/sono-na-gravidez"
      )
    }
  >
    <Ionicons
      name="open-outline"
      size={18}
      color="#7050b3"
    />

    <Text style={styles.linkButtonText}>
      Sono na gravidez
    </Text>
  </TouchableOpacity>

  {/* LINK 3 */}
  <TouchableOpacity
    style={styles.linkButton}
    onPress={() =>
      Linking.openURL(
        "https://brasil.babycenter.com/a1500773/sono-no-primeiro-trimestre-da-gravidez"
      )
    }
  >
    <Ionicons
      name="open-outline"
      size={18}
      color="#7050b3"
    />

    <Text style={styles.linkButtonText}>
      Sono no primeiro trimestre da gravidez
    </Text>
  </TouchableOpacity>
</View>

        {/* VÍDEO 
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL("https://youtube.com")
            }
          >
            <Image
              source={{ uri: "https://via.placeholder.com/105" }}
              style={styles.thumbnail}
            />

            <View style={styles.videoInfo}>
              <View style={styles.cardTitleRow}>
                <Ionicons
                  name="logo-youtube"
                  size={20}
                  color="red"
                />
                <Text style={styles.videoTitle}>
                  aqui seu texto (vídeo)
                </Text>
              </View>

              <Text style={styles.videoText}>
                aqui seu texto (descrição do vídeo)
              </Text>
            </View>
          </TouchableOpacity>
        </View>*/}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4C7DD",
  },

  /* HEADER FIXO */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    zIndex: 999,

    backgroundColor: "#cc5994",

    paddingTop: 42,
    paddingHorizontal: 22,
    paddingBottom: 22,

    elevation: 10,

    shadowColor: "#6E2C50",
    shadowOpacity: 0.25,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#D97AA8",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  badge: {
    backgroundColor: "#D97AA8",

    paddingHorizontal: 14,
    paddingVertical: 7,

    borderRadius: 18,
  },

  badgeText: {
    color: "#fff",

    fontSize: 12,
    fontWeight: "700",

    letterSpacing: 0.3,
  },

  boldText: {
    fontWeight: "bold",
    color: "#8B2F61",
  },

  title: {
    color: "#fff",

    fontSize: 24,
    fontWeight: "bold",

    marginTop: 16,

    lineHeight: 32,
  },

  /* CONTENT */
  content: {
    padding: 20,
    paddingTop: 190,
    paddingBottom: 40,
  },

  /* CARDS */
  card: {
    backgroundColor: "#FCE1EC",

    borderRadius: 24,

    padding: 20,
    marginBottom: 18,

    shadowColor: "#7B3057",
    shadowOpacity: 0.12,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "700",

    color: "#8B2F61",

    marginLeft: 10,
    flex: 1,
  },

  cardText: {
    fontSize: 16,

    color: "#694257",

    lineHeight: 28,
  },

  /* LISTA */
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",

    marginBottom: 14,
  },

  bullet: {
    width: 8,
    height: 8,

    borderRadius: 10,

    backgroundColor: "#C54286",

    marginTop: 10,
    marginRight: 12,
  },

  listText: {
    flex: 1,

    fontSize: 16,

    color: "#694257",

    lineHeight: 27,
  },

  /* VÍDEO */
  youtubeCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  thumbnailContainer: {
    position: "relative",
  },

  thumbnail: {
    width: 105,
    height: 105,

    borderRadius: 18,
  },

  playButton: {
    position: "absolute",

    top: "38%",
    left: "38%",

    backgroundColor: "rgba(139, 47, 97, 0.85)",

    padding: 8,

    borderRadius: 50,
  },

  videoInfo: {
    flex: 1,

    paddingLeft: 16,

    justifyContent: "center",
  },

  videoTitle: {
    fontSize: 17,
    fontWeight: "700",

    color: "#8B2F61",

    marginLeft: 8,
  },

  videoText: {
    fontSize: 15,

    color: "#694257",

    lineHeight: 24,

    marginTop: 4,
  },

  /* LINKS */
  linkButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F8D7E7",

    paddingVertical: 14,
    paddingHorizontal: 16,

    borderRadius: 16,

    marginTop: 14,
  },

  linkButtonText: {
    marginLeft: 10,

    fontSize: 15,
    fontWeight: "600",

    color: "#8B2F61",

    flex: 1,
  },
});