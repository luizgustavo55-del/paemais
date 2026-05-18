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
      > <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                router.push("/(pais)/(tabs)/dicas" as any)
              }
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Primeira Infância
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            Marco Legal da Primeira Infância
          </Text>
        </View>
        {/* RESUMO */}
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
            O Marco Legal da Primeira Infância
            (Lei nº 13.257/2016) estabelece
            diretrizes para políticas públicas
            voltadas a crianças de até 6 anos.
            Reconhece a importância dos primeiros
            mil dias para o desenvolvimento
            físico, emocional e cognitivo da
            criança.
          </Text>
        </View>

        {/* A LEI */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="library-outline"
              size={22}
              color="#7050b3"
            />

            <Text style={styles.cardTitle}>
              A Lei
            </Text>
          </View>

          <Text style={styles.cardText}>
            A legislação fortalece os direitos
            da criança na primeira infância e
            incentiva políticas públicas
            integradas entre saúde, educação,
            assistência social e proteção
            familiar.
          </Text>
        </View>

        {/* O QUE É */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="help-circle-outline"
              size={22}
              color="#00c48c"
            />

            <Text style={styles.cardTitle}>
              O que é?
            </Text>
          </View>

          <Text style={styles.cardText}>
            O Marco Legal da Primeira Infância é
            uma lei brasileira criada para
            garantir mais proteção, cuidado e
            desenvolvimento às crianças de até 6
            anos de idade.
          </Text>
        </View>

        {/* POR QUÊ */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#ffb300"
            />

            <Text style={styles.cardTitle}>
              Por quê?
            </Text>
          </View>

          <Text style={styles.cardText}>
            Os primeiros anos de vida são
            fundamentais para o desenvolvimento
            cerebral, emocional e social da
            criança.
          </Text>
        </View>

        {/* ÁREAS */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="grid-outline"
              size={22}
              color="#ff5ea8"
            />

            <Text style={styles.cardTitle}>
              Áreas Prioritárias
            </Text>
          </View>

          {[
            "Saúde",
            "Educação",
            "Alimentação",
            "Convivência familiar",
            "Proteção contra violência",
            "Direito ao brincar",
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
        </View>

        {/* RESPONSABILIDADE */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="people-outline"
              size={22}
              color="#7050b3"
            />

            <Text style={styles.cardTitle}>
              Responsabilidade
            </Text>
          </View>

          <Text style={styles.cardText}>
            União, estados, municípios,
            profissionais e famílias devem atuar
            juntos na proteção e desenvolvimento
            da criança.
          </Text>
        </View>

        {/* QUALIFICAÇÃO */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="school-outline"
              size={22}
              color="#00c48c"
            />

            <Text style={styles.cardTitle}>
              Qualificação
            </Text>
          </View>

          <Text style={styles.cardText}>
            Incentiva a formação especializada
            de profissionais que trabalham
            diretamente com a primeira infância.
          </Text>
        </View>

        {/* GESTANTES */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="heart-outline"
              size={22}
              color="#ff5ea8"
            />

            <Text style={styles.cardTitle}>
              Gestantes
            </Text>
          </View>

          <Text style={styles.cardText}>
            Garante orientação sobre saúde,
            alimentação, cuidados e
            desenvolvimento saudável do bebê.
          </Text>
        </View>

        {/* BRINCAR */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="happy-outline"
              size={22}
              color="#ffb300"
            />

            <Text style={styles.cardTitle}>
              Direito ao Brincar
            </Text>
          </View>

          <Text style={styles.cardText}>
            O brincar é reconhecido como
            essencial para o desenvolvimento
            emocional, cognitivo e social.
          </Text>
        </View>

        {/* LICENÇA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="time-outline"
              size={22}
              color="#7050b3"
            />

            <Text style={styles.cardTitle}>
              Licença-paternidade
            </Text>
          </View>

          <Text style={styles.cardText}>
            A lei amplia a
            licença-paternidade para fortalecer
            os vínculos familiares desde os
            primeiros dias de vida.
          </Text>
        </View>

        {/* VÍDEO */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() =>
              Linking.openURL(
                "https://youtu.be/bV6bQNMFhq4?si=3vg2bncM8bcmhD1x"
              )
            }
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={require("../../assets/images/marcoLegal.jpg")}
                style={styles.thumbnail}
              />

              <View style={styles.playButton}>
                <Ionicons
                  name="play"
                  size={18}
                  color="#fff"
                />
              </View>
            </View>

            <View style={styles.videoInfo}>
              <View style={styles.cardTitleRow}>
                <Ionicons
                  name="logo-youtube"
                  size={20}
                  color="red"
                />

                <Text style={styles.videoTitle}>
                  Vídeo explicativo
                </Text>
              </View>

              <Text style={styles.videoText}>
                Marco Legal da Primeira Infância
                explicado de forma simples.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* LINK */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Linking.openURL(
              "https://www.gov.br/mdh/pt-br/navegue-por-temas/crianca-e-adolescente/acoes-e-programas-de-gestoes-anteriores/primeira-infancia"
            )
          }
        >
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="globe-outline"
              size={22}
              color="#7050b3"
            />

            <Text style={styles.cardTitle}>
              Veja Mais
            </Text>
          </View>

          <Text style={styles.cardText}>
            Clique para acessar o site oficial
            do Governo Brasileiro.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#cfb8ff",
  },

  /* HEADER FIXO */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    zIndex: 999,

    backgroundColor: "#8a68d3",

    paddingTop: 42,
    paddingHorizontal: 22,
    paddingBottom: 22,

    elevation: 10,
    shadowColor: "#28174c",
    shadowOpacity: 0.22,
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
    backgroundColor: "#ae89e9",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  badge: {
    backgroundColor: "#ae89e9",
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
    paddingTop: 180,
    paddingBottom: 40,
  },

  /* CARDS */
  card: {
    backgroundColor: "#eae1fd",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,

    shadowColor: "#28174c",
    shadowOpacity: 0.08,
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
    color: "#28174c",
    marginLeft: 10,
    flex: 1,
  },

  cardText: {
    fontSize: 16,
    color: "#4a4a4a",
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
    backgroundColor: "#ff5ea8",
    marginTop: 10,
    marginRight: 12,
  },

  listText: {
    flex: 1,
    fontSize: 16,
    color: "#4a4a4a",
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

    backgroundColor: "rgba(0,0,0,0.65)",
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
    color: "#28174c",
    marginLeft: 8,
  },

  videoText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    marginTop: 4,
  },
});