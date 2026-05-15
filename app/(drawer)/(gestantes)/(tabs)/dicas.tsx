import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

// 🔥 Firebase
import { ref, push, onValue, remove, update } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

type Meta = {
  id: string;
  texto: string;
  concluida: boolean;
  dataConclusao: string;
};

export default function DicasScreen() {
  const [aba, setAba] = useState("rotina");
  const router = useRouter();

  const [metas, setMetas] = useState<Meta[]>([]);
  const [novaMeta, setNovaMeta] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // 📅 SEMANA ATUAL
  const getSemanaAtual = () => {
    const hoje = new Date();

    const primeiroDia = new Date(
      hoje.setDate(hoje.getDate() - hoje.getDay())
    );

    return `semana_${primeiroDia.toISOString().split("T")[0]}`;
  };

  const semanaAtual = getSemanaAtual();

  // 🔄 BUSCAR METAS
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const metasRef = ref(
      db,
      `metasSemana/${user.uid}/${semanaAtual}`
    );

    const unsubscribe = onValue(metasRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const lista: Meta[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setMetas(lista);
      } else {
        setMetas([]);
      }
    });

    return () => unsubscribe();
  }, [semanaAtual]);

  // ➕ SALVAR
  const salvarMeta = () => {
    const user = auth.currentUser;

    if (!user || !novaMeta.trim()) return;

    if (editandoId) {
      update(
        ref(
          db,
          `metasSemana/${user.uid}/${semanaAtual}/${editandoId}`
        ),
        {
          texto: novaMeta,
        }
      );

      setEditandoId(null);
    } else {
      push(ref(db, `metasSemana/${user.uid}/${semanaAtual}`), {
        texto: novaMeta,
        concluida: false,
        dataConclusao: "",
      });
    }

    setNovaMeta("");
  };

  // ❌ EXCLUIR
  const excluirMeta = (id: string) => {
    const user = auth.currentUser;

    if (!user) return;

    remove(
      ref(
        db,
        `metasSemana/${user.uid}/${semanaAtual}/${id}`
      )
    );
  };

  // ✏️ EDITAR
  const editarMeta = (meta: Meta) => {
    setNovaMeta(meta.texto);
    setEditandoId(meta.id);
  };

  // ✔️ CONCLUIR
  const concluirMeta = (meta: Meta) => {
    const user = auth.currentUser;

    if (!user) return;

    const hoje = new Date();

    const dataFormatada = `${String(
      hoje.getDate()
    ).padStart(2, "0")}/${String(
      hoje.getMonth() + 1
    ).padStart(2, "0")}/${hoje.getFullYear()}`;

    update(
      ref(
        db,
        `metasSemana/${user.uid}/${semanaAtual}/${meta.id}`
      ),
      {
        concluida: !meta.concluida,
        dataConclusao: !meta.concluida
          ? dataFormatada
          : "",
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dicas</Text>

      <Text style={styles.subtitle}>
        Informações úteis para sua gestação
      </Text>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "rotina" ? styles.tabActive : styles.tab}
          onPress={() => setAba("rotina")}
        >
          <Text
            style={
              aba === "rotina"
                ? styles.tabActiveText
                : styles.tabText
            }
          >
            Gestação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "direitos" ? styles.tabActive : styles.tab}
          onPress={() => setAba("direitos")}
        >
          <Text
            style={
              aba === "direitos"
                ? styles.tabActiveText
                : styles.tabText
            }
          >
            Direitos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "saude" ? styles.tabActive : styles.tab}
          onPress={() => setAba("saude")}
        >
          <Text
            style={
              aba === "saude"
                ? styles.tabActiveText
                : styles.tabText
            }
          >
            Saúde
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >

        {/* GESTAÇÃO */}
        {aba === "rotina" && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  Metas da Semana
                </Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite uma meta..."
                  placeholderTextColor="#777"
                  value={novaMeta}
                  onChangeText={setNovaMeta}
                />

                <TouchableOpacity
                  style={styles.plusBtn}
                  onPress={salvarMeta}
                >
                  <Ionicons
                    name="save"
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>

                {editandoId && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setNovaMeta("");
                      setEditandoId(null);
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color="#fff"
                    />
                  </TouchableOpacity>
                )}
              </View>

              {metas.map((meta) => (
                <View key={meta.id} style={styles.item}>
                  <TouchableOpacity
                    onPress={() => concluirMeta(meta)}
                  >
                    <Ionicons
                      name={
                        meta.concluida
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={22}
                      color="#7050b3"
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.itemText,
                        meta.concluida && styles.itemDone,
                      ]}
                    >
                      {meta.texto}
                    </Text>

                    {meta.concluida && (
                      <Text style={styles.dataText}>
                        Concluído em: {meta.dataConclusao}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => editarMeta(meta)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color="#555"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => excluirMeta(meta.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="red"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* SAÚDE DA GESTANTE */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Saúde da Gestante
              </Text>

              <View style={styles.listContainer}>

                {renderTip(
                  "restaurant-outline",
                  "Alimentação",
                  "Cuidados com alimentação saudável na gestação.",
                  "/dicasPage/gestante/alimentacao"
                )}

                {renderTip(
                  "water-outline",
                  "Hidratação",
                  "Importância da hidratação para mãe e bebê.",
                  "/dicasPage/gestante/hidratacao"
                )}

                {renderTip(
                  "moon-outline",
                  "Sono e Descanso",
                  "Dicas para melhorar descanso e qualidade do sono.",
                  "/dicasPage/gestante/Sono"
                )}

                {renderTip(
                  "barbell-outline",
                  "Exercícios",
                  "Atividades físicas seguras durante a gravidez.",
                  "/dicasPage/gestante/Exercicios"
                )}

                {renderTip(
                  "medical-outline",
                  "Saúde Bucal",
                  "Cuidados importantes com dentes e gengivas.",
                  "/dicasPage/gestante/SaudeBocal"
                )}

                {renderTip(
                  "heart-outline",
                  "Saúde Emocional",
                  "Cuidados emocionais e apoio psicológico.",
                  "/dicasPage/gestante/SaudeEmocional"
                )}

                {renderTip(
                  "shield-checkmark-outline",
                  "Vacinas",
                  "Vacinas recomendadas durante a gestação.",
                  "/dicasPage/gestante/Vacinas"
                )}

                {renderTip(
                  "pulse-outline",
                  "Controle de Doenças",
                  "Acompanhamento de condições e doenças gestacionais.",
                  "/dicasPage/gestante/ControleDoenças"
                )}

                {renderTip(
                  "body-outline",
                  "Segurança Física",
                  "Cuidados físicos e prevenção de acidentes.",
                  "/dicasPage/gestante/SegurançaFisica"
                )}

                {renderTip(
                  "warning-outline",
                  "Sinais de Alerta",
                  "Sintomas importantes que exigem atenção.",
                  "/dicasPage/gestante/SinaisAlerta"
                )}
              </View>
            </View>

            {/* PRÉ-NATAL */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Pré-natal
              </Text>

              <View style={styles.listContainer}>

                {renderTip(
                  "book-outline",
                  "Visão Geral",
                  "Informações gerais sobre o pré-natal.",
                  "/dicasPage/prenatal/visaoGeral"
                )}

                {renderTip(
                  "calendar-outline",
                  "Consultas",
                  "Acompanhamento médico durante a gravidez.",
                  "/dicasPage/prenatal/consultas"
                )}

                {renderTip(
                  "medkit-outline",
                  "Exames",
                  "Acompanhe os exames importantes do pré-natal.",
                  "/dicasPage/prenatal/exames"
                )}

              </View>
            </View>
          </>
        )}

        {/* AUXÍLIOS */}
        {aba === "direitos" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
             Direitos da Gestante e Auxílios
            </Text>

            <View style={styles.listContainer}>

              {renderTip(
                "document-text-outline",
                "Marco Legal da Primeira Infância",
                "Lei voltada ao desenvolvimento infantil.",
                "/dicasPage/marcoLegal"
              )}

            </View>
          </View>
        )}

        {/* SAÚDE */}
        {aba === "saude" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Saúde do Bebê
              </Text>

              <View style={styles.listContainer}>

                {renderTip(
                  "brain-outline",
                  "Desenvolvimento Cerebral",
                  "Importância do desenvolvimento cerebral do bebê.",
                  "/dicasPage/bebe/cerebral"
                )}

                {renderTip(
                  "body-outline",
                  "Formação dos Órgãos",
                  "Entenda a formação dos órgãos do bebê.",
                  "/dicasPage/bebe/orgaos"
                )}

                {renderTip(
                  "resize-outline",
                  "Crescimento do Feto",
                  "Fases do crescimento fetal durante a gestação.",
                  "/dicasPage/bebe/crescimento"
                )}

                {renderTip(
                  "heart-circle-outline",
                  "Cuidados Importantes",
                  "Cuidados essenciais para a saúde do bebê.",
                  "/dicasPage/bebe/cuidadosImportantes"
                )}

                {renderTip(
                  "medical-outline",
                  "Doenças Congênitas",
                  "Informações sobre doenças congênitas.",
                  "/dicasPage/bebe/doençasCongenitas"
                )}

              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );

  function renderTip(
    icon: any,
    title: string,
    description: string,
    route: string
  ) {
    return (
      <TouchableOpacity
        style={styles.tipBox}
        onPress={() => router.push(route as any)}
      >
        <View style={styles.tipRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: "#ece3ff" },
            ]}
          >
            <Ionicons
              name={icon}
              size={20}
              color="#7050b3"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>
              {title}
            </Text>

            <Text style={styles.tipText}>
              {description}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#7050b3"
          />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#7050b3",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#ece3ff",
    marginBottom: 18,
    marginTop: 4,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabActive: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },

  tabText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  tabActiveText: {
    color: "#28174c",
    fontWeight: "bold",
    fontSize: 13,
  },

  card: {
    backgroundColor: "#b390d8",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#28174cca",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  cardHeader: {
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28174c",
    marginBottom: 12,
  },

  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#000",
  },

  plusBtn: {
    backgroundColor: "#7050b3",
    padding: 12,
    borderRadius: 12,
  },

  cancelBtn: {
    backgroundColor: "#ff6b6b",
    padding: 12,
    borderRadius: 12,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    backgroundColor: "#ece3ff",
    padding: 12,
    borderRadius: 14,
  },

  itemText: {
    color: "#28174c",
    fontSize: 15,
  },

  itemDone: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },

  dataText: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },

  listContainer: {
    gap: 14,
  },

  tipBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#7050b3",
  },

  tipTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#28174c",
    marginBottom: 3,
  },

  tipText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 19,
  },

  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});