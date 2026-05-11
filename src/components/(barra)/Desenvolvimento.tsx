import React, {
  useState,
  useEffect,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getData } from "@/src/services/database";
import { auth } from "@/src/services/firebase";

import { theme } from "@/src/constants/theme";
import { dadosSemanas } from "@/src/constants/infoGest";

export default function Desenvolvimento() {
  const [semanaAtual, setSemanaAtual] =
    useState<number>(1);

  const [loading, setLoading] =
    useState(true);

  // 🔥 LIMITA ENTRE 1 E 40
  const semanaLimitada = Math.min(
    Math.max(semanaAtual, 1),
    40
  );

  // 🔥 GARANTE QUE SEMPRE EXISTE
  const dadosAtual =
    dadosSemanas[semanaLimitada] ||
    dadosSemanas[1];

  useEffect(() => {
    async function carregar() {
      try {
        // 🔥 USUÁRIO LOGADO
        const uid =
          auth.currentUser?.uid;

        if (!uid) {
          console.log(
            "Usuário não logado"
          );
          return;
        }

        // 🔥 DADOS DO REALTIME DATABASE
        // usuarios/uid
        const dados = await getData(
          uid
        );

        console.log(
          "DADOS FIREBASE:",
          dados
        );

        // 🔥 VERIFICA DUM
        if (
          dados?.dataUltimaMenstruacao
        ) {
          const partes =
            dados.dataUltimaMenstruacao.split(
              "/"
            );

          // 🔥 VALIDA DATA
          if (partes.length !== 3) {
            console.log(
              "Data inválida"
            );
            return;
          }

          // 🔥 CONVERTE DATA
          const dum = new Date(
            Number(partes[2]),
            Number(partes[1]) - 1,
            Number(partes[0])
          );

          dum.setHours(
            0,
            0,
            0,
            0
          );

          const hoje = new Date();

          hoje.setHours(
            0,
            0,
            0,
            0
          );

          // 🔥 DIFERENÇA EM DIAS
          const diffDias = Math.floor(
            (hoje.getTime() -
              dum.getTime()) /
              (1000 *
                60 *
                60 *
                24)
          );

          // 🔥 EVITA NEGATIVO
          const diasValidos =
            Math.max(0, diffDias);

          // 🔥 CALCULA SEMANA
          const semanasCalculadas =
            Math.floor(
              diasValidos / 7
            );

          setSemanaAtual(
            semanasCalculadas
          );
        } else {
          console.log(
            "dataUltimaMenstruacao não encontrada"
          );
        }
      } catch (error) {
        console.log(
          "Erro ao carregar dados:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent:
              "center",
            alignItems: "center",
          },
        ]}
      >
        <Text>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* CARD PRINCIPAL */}
      <View
        style={[
          styles.card,
          styles.mainCard,
        ]}
      >
        <Text
          style={styles.babyEmoji}
        >
          👶
        </Text>

        <Text
          style={[
            styles.title,
            {
              marginVertical: 10,
            },
          ]}
        >
          Semana{" "}
          {semanaLimitada}
        </Text>

        <Text
          style={[
            styles.text,
            {
              textAlign:
                "center",
            },
          ]}
        >
          Acompanhe o
          desenvolvimento do
          seu bebê
        </Text>
      </View>

      {/* PESO E TAMANHO */}
      <View style={styles.row}>
        {/* PESO */}
        <View style={styles.litle}>
          <View
            style={
              styles.litleHeader
            }
          >
            <View
              style={
                styles.iconPink
              }
            >
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={20}
                color={
                  theme.colors
                    .textPrimary
                }
              />
            </View>

            <Text
              style={styles.text}
            >
              Peso Médio
            </Text>
          </View>

          <Text
            style={
              styles.litleValue
            }
          >
            {dadosAtual?.peso ||
              "--"}
          </Text>
        </View>

        {/* TAMANHO */}
        <View style={styles.litle}>
          <View
            style={
              styles.litleHeader
            }
          >
            <View
              style={
                styles.iconPurple
              }
            >
              <MaterialCommunityIcons
                name="ruler"
                size={20}
                color={
                  theme.colors
                    .textPrimary
                }
              />
            </View>

            <Text
              style={styles.text}
            >
              Tamanho
            </Text>
          </View>

          <Text
            style={
              styles.litleValue
            }
          >
            {dadosAtual?.tamanho ||
              "--"}
          </Text>
        </View>
      </View>

      {/* ÓRGÃOS */}
      <View
        style={[
          styles.card,
          styles.organsCard,
        ]}
      >
        <View
          style={
            styles.sectionHeader
          }
        >
          <MaterialCommunityIcons
            name="heart-outline"
            size={22}
            color={
              theme.colors
                .primary
            }
          />

          <Text
            style={
              styles.sectionTitle
            }
          >
            Órgãos em
            Desenvolvimento
          </Text>
        </View>

        {(
          dadosAtual?.orgaos ||
          []
        ).map(
          (
            item: string,
            index: number
          ) => (
            <View
              style={
                styles.orgRow
              }
              key={index}
            >
              <View
                style={
                  styles.dotPink
                }
              />

              <Text
                style={
                  styles.orgText
                }
              >
                {item}
              </Text>
            </View>
          )
        )}
      </View>

      {/* CURIOSIDADES */}
      <View
        style={[
          styles.card,
          styles.curiosityCard,
        ]}
      >
        <View
          style={
            styles.sectionHeader
          }
        >
          <MaterialCommunityIcons
            name="brain"
            size={22}
            color="#FFF"
          />

          <Text
            style={[
              styles.sectionTitle,
              {
                color: "#FFF",
              },
            ]}
          >
            Curiosidades da
            Semana
          </Text>
        </View>

        {(
          dadosAtual?.curiosidades ||
          []
        ).map(
          (
            item: string,
            index: number
          ) => (
            <View
              style={
                styles.curiosityRow
              }
              key={index}
            >
              <Text
                style={
                  styles.sparkleIcon
                }
              >
                ✨
              </Text>

              <Text
                style={
                  styles.curiosityText
                }
              >
                {item}
              </Text>
            </View>
          )
        )}
      </View>

      {/* MARCOS */}
      <View
        style={
          styles.marcosContainer
        }
      >
        <MaterialCommunityIcons
          name="target"
          size={22}
          color={
            theme.colors.primary
          }
        />

        <Text
          style={
            styles.marcosTitle
          }
        >
          Marcos Importantes
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor:
      theme.colors.background,
  },

  card: {
    width: "100%",
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#FFF",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    elevation: 2,
  },

  /* CARD PRINCIPAL */
  mainCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      theme.colors.cards,
    minHeight: 220,
  },

  babyEmoji: {
    fontSize: 70,
  },

  /* ROW */
  row: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 16,
  },

  /* CARDS PEQUENOS */
  litle: {
    width: "48%",
    minHeight: 120,
    backgroundColor:
      theme.colors.terceary,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    elevation: 2,
  },

  litleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  litleValue: {
    fontSize: 24,
    fontWeight: "bold",
    color:
      theme.colors.textPrimary,
  },

  text: {
    fontSize:
      theme.texts.text,
    color:
      theme.colors.title,
  },

  title: {
    fontSize:
      theme.texts.title,
    fontWeight: "bold",
    color:
      theme.colors.textPrimary,
    textAlign: "center",
  },

  iconPink: {
    backgroundColor:
      theme.colors.secondary,
    padding: 8,
    marginRight: 8,
    borderRadius: 12,
  },

  iconPurple: {
    backgroundColor:
      theme.colors.secondary,
    padding: 8,
    marginRight: 8,
    borderRadius: 12,
  },

  /* ÓRGÃOS */
  organsCard: {
    backgroundColor:
      theme.colors.terceary,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color:
      theme.colors.textPrimary,
    marginLeft: 8,
  },

  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor:
      "rgba(255,255,255,0.6)",
  },

  dotPink: {
    width: 8,
    height: 8,
    backgroundColor:
      theme.colors.primary,
    borderRadius: 4,
    marginRight: 10,
  },

  orgText: {
    color:
      theme.colors.textSecondary,
    fontSize: 15,
    flex: 1,
  },

  /* CURIOSIDADES */
  curiosityCard: {
    backgroundColor:
      theme.colors.cards,
    elevation: 0,
    shadowOpacity: 0,
  },

  curiosityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  sparkleIcon: {
    marginRight: 10,
    fontSize: 16,
  },

  curiosityText: {
    color: "#FFF",
    fontSize: 15,
    flex: 1,
  },

  /* MARCOS */
  marcosContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 20,
  },

  marcosTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color:
      theme.colors.textPrimary,
    marginLeft: 8,
  },
});