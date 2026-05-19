import { auth, firestore } from "@/src/services/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Meta = {
  id: string;
  texto: string;
  concluida: boolean;
  dataConclusao: string;
  semana: string;
};

export default function DicasScreen() {
  const [aba, setAba] = useState("rotina");
  const router = useRouter();

  const [metas, setMetas] = useState<Meta[]>([]);
  const [novaMeta, setNovaMeta] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const getSemanaAtual = () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
    return `semana_${primeiroDia.toISOString().split("T")[0]}`;
  };

  const semanaAtual = getSemanaAtual();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const metasRef = collection(firestore, `usuarios/${user.uid}/metas`);
    const q = query(metasRef, where("semana", "==", semanaAtual));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Meta[] = [];
      snapshot.forEach((documento) => {
        lista.push({
          id: documento.id,
          ...documento.data(),
        } as Meta);
      });
      setMetas(lista);
    });

    return () => unsubscribe();
  }, [semanaAtual]);

  const salvarMeta = async () => {
    const user = auth.currentUser;
    if (!user || !novaMeta.trim()) return;

    try {
      if (editandoId) {
        const metaDocRef = doc(
          firestore,
          `usuarios/${user.uid}/metas/${editandoId}`,
        );
        await updateDoc(metaDocRef, {
          texto: novaMeta,
        });
        setEditandoId(null);
      } else {
        const metasRef = collection(firestore, `usuarios/${user.uid}/metas`);
        await addDoc(metasRef, {
          texto: novaMeta,
          concluida: false,
          dataConclusao: "",
          semana: semanaAtual,
        });
      }
      setNovaMeta("");
    } catch (error) {
      console.error(error);
    }
  };

  const excluirMeta = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const metaDocRef = doc(firestore, `usuarios/${user.uid}/metas/${id}`);
      await deleteDoc(metaDocRef);
    } catch (error) {
      console.error(error);
    }
  };

  const editarMeta = (meta: Meta) => {
    setNovaMeta(meta.texto);
    setEditandoId(meta.id);
  };

  const concluirMeta = async (meta: Meta) => {
    const user = auth.currentUser;
    if (!user) return;

    const hoje = new Date();
    const dataFormatada = `${String(hoje.getDate()).padStart(2, "0")}/${String(
      hoje.getMonth() + 1,
    ).padStart(2, "0")}/${hoje.getFullYear()}`;

    try {
      const metaDocRef = doc(
        firestore,
        `usuarios/${user.uid}/metas/${meta.id}`,
      );
      await updateDoc(metaDocRef, {
        concluida: !meta.concluida,
        dataConclusao: !meta.concluida ? dataFormatada : "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dicas</Text>
      <Text style={styles.subtitle}>Informações úteis para sua gestação</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "rotina" ? styles.tabActive : styles.tab}
          onPress={() => setAba("rotina")}
        >
          <Text
            style={aba === "rotina" ? styles.tabActiveText : styles.tabText}
          >
            Gestação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "direitos" ? styles.tabActive : styles.tab}
          onPress={() => setAba("direitos")}
        >
          <Text
            style={aba === "direitos" ? styles.tabActiveText : styles.tabText}
          >
            Direitos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "saude" ? styles.tabActive : styles.tab}
          onPress={() => setAba("saude")}
        >
          <Text style={aba === "saude" ? styles.tabActiveText : styles.tabText}>
            Saúde
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {aba === "rotina" && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Metas da Semana</Text>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite uma meta..."
                  placeholderTextColor="#777"
                  value={novaMeta}
                  onChangeText={setNovaMeta}
                />

                <TouchableOpacity style={styles.plusBtn} onPress={salvarMeta}>
                  <Ionicons name="save" size={18} color="#fff" />
                </TouchableOpacity>

                {editandoId && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setNovaMeta("");
                      setEditandoId(null);
                    }}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              {metas.map((meta) => (
                <View key={meta.id} style={styles.item}>
                  <TouchableOpacity onPress={() => concluirMeta(meta)}>
                    <Ionicons
                      name={meta.concluida ? "checkbox" : "square-outline"}
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

                  <TouchableOpacity onPress={() => editarMeta(meta)}>
                    <Ionicons name="create-outline" size={20} color="#555" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => excluirMeta(meta.id)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Saúde da Gestante</Text>
              <View style={styles.listContainer}>
                {renderTip(
                  "restaurant-outline",
                  "Alimentação",
                  "Cuidados com alimentação saudável na gestação.",
                  "/dicasPage/gestante/alimentacao",
                )}
                {renderTip(
                  "water-outline",
                  "Hidratação",
                  "Importância da hidratação para mãe e bebê.",
                  "/dicasPage/gestante/hidratacao",
                )}
                {renderTip(
                  "moon-outline",
                  "Sono e Descanso",
                  "Dicas para melhorar descanso e qualidade do sono.",
                  "/dicasPage/gestante/Sono",
                )}
                {renderTip(
                  "barbell-outline",
                  "Exercícios",
                  "Atividades físicas seguras durante a gravidez.",
                  "/dicasPage/gestante/Exercicios",
                )}
                {renderTip(
                  "medical-outline",
                  "Saúde Bucal",
                  "Cuidados importantes com dentes e gengivas.",
                  "/dicasPage/gestante/SaudeBocal",
                )}
                {renderTip(
                  "heart-outline",
                  "Saúde Emocional",
                  "Cuidados emocionais e apoio psicológico.",
                  "/dicasPage/gestante/SaudeEmocional",
                )}
                {renderTip(
                  "shield-checkmark-outline",
                  "Vacinas",
                  "Vacinas recomendadas durante a gestação.",
                  "/dicasPage/gestante/Vacinas",
                )}
                {renderTip(
                  "pulse-outline",
                  "Controle de Doenças",
                  "Acompanhamento de condições e doenças gestacionais.",
                  "/dicasPage/gestante/ControleDoenças",
                )}
                {renderTip(
                  "body-outline",
                  "Segurança Física",
                  "Cuidados físicos e prevenção de acidentes.",
                  "/dicasPage/gestante/SegurançaFisica",
                )}
                {renderTip(
                  "warning-outline",
                  "Sinais de Alerta",
                  "Sintomas importantes que exigem atenção.",
                  "/dicasPage/gestante/SinaisAlerta",
                )}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pré-natal</Text>
              <View style={styles.listContainer}>
                {renderTip(
                  "book-outline",
                  "Visão Geral",
                  "Informações gerais sobre o pré-natal.",
                  "/dicasPage/prenatal/visaoGeral",
                )}
                {renderTip(
                  "calendar-outline",
                  "Consultas",
                  "Acompanhamento médico durante a gravidez.",
                  "/dicasPage/prenatal/consultas",
                )}
                {renderTip(
                  "medkit-outline",
                  "Exames",
                  "Acompanhe os exames importantes do pré-natal.",
                  "/dicasPage/prenatal/exames",
                )}
              </View>
            </View>
          </>
        )}

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
                "/dicasPage/marcoLegal",
              )}
            </View>
          </View>
        )}

        {aba === "saude" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saúde do Bebê</Text>
            <View style={styles.listContainer}>
              {renderTip(
                "brain",
                "Desenvolvimento Cerebral",
                "Importância do desenvolvimento cerebral do bebê.",
                "/dicasPage/bebe/cerebral",
              )}
              {renderTip(
                "body-outline",
                "Formação dos Órgãos",
                "Entenda a formação dos órgãos do bebê.",
                "/dicasPage/bebe/orgaos",
              )}
              {renderTip(
                "resize-outline",
                "Crescimento do Feto",
                "Fases do crescimento fetal durante a gestação.",
                "/dicasPage/bebe/crescimento",
              )}
              {renderTip(
                "heart-circle-outline",
                "Cuidados Importantes",
                "Cuidados essenciais para a saúde do bebê.",
                "/dicasPage/bebe/cuidadosImportantes",
              )}
              {renderTip(
                "medical-outline",
                "Doenças Congênitas",
                "Informações sobre doenças congênitas.",
                "/dicasPage/bebe/doencasCongenitas",
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  function renderTip(
    icon: any,
    title: string,
    description: string,
    route: string,
  ) {
    return (
      <TouchableOpacity
        style={styles.tipBox}
        onPress={() => router.push(route as any)}
      >
        <View style={styles.tipRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#ece3ff" }]}>
            {icon === "brain" ? (
              <MaterialCommunityIcons name="brain" size={20} color="#7050b3" />
            ) : (
              <Ionicons name={icon} size={20} color="#7050b3" />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>{title}</Text>
            <Text style={styles.tipText}>{description}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#7050b3" />
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

    backgroundColor: "#D46B9D",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",

    color: "#FFF1F7",

    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#F9DDEA",

    marginBottom: 18,
    marginTop: 5,

    fontSize: 15,
    fontWeight: "500",

    letterSpacing: 0.2,
  },
  tabs: {
    flexDirection: "row",

    backgroundColor: "#C86A9B",

    borderRadius: 16,

    padding: 5,

    marginBottom: 20,
  },
  tab: {
    flex: 1,

    paddingVertical: 11,

    alignItems: "center",
  },
  tabActive: {
    flex: 1,

    paddingVertical: 11,

    backgroundColor: "#FFF2F8",

    borderRadius: 12,

    alignItems: "center",
  },
  tabText: {
    color: "#FFF",

    fontWeight: "600",
    fontSize: 13,

    letterSpacing: 0.2,
  },
  tabActiveText: {
    color: "#9A3E6D",

    fontWeight: "700",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#F8D3E4",

    borderRadius: 24,

    padding: 18,

    marginBottom: 20,

    shadowColor: "#7C3158",
    shadowOpacity: 0.14,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",

    color: "#8E3564",

    marginBottom: 12,

    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: "row",

    gap: 8,

    marginBottom: 15,
  },
  input: {
    flex: 1,

    backgroundColor: "#FFF8FB",

    borderRadius: 14,

    paddingHorizontal: 14,

    color: "#5E3750",

    fontSize: 14,
  },
  plusBtn: {
    backgroundColor: "#C54C86",

    padding: 12,

    borderRadius: 12,
  },
  cancelBtn: {
    backgroundColor: "#D982AF",

    padding: 12,

    borderRadius: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    marginBottom: 14,

    backgroundColor: "#FFF0F6",

    padding: 13,

    borderRadius: 15,
  },
  itemText: {
    color: "#8A3D66",

    fontSize: 15,

    fontWeight: "500",
  },
  itemDone: {
    textDecorationLine: "line-through",

    opacity: 0.6,
  },
  dataText: {
    fontSize: 11,

    color: "#92677E",

    marginTop: 2,
  },
  listContainer: {
    gap: 14,
  },
  tipBox: {
    backgroundColor: "#FFF8FB",

    borderRadius: 18,

    padding: 16,

    borderLeftWidth: 5,

    borderLeftColor: "#C54C86",
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "700",

    color: "#8E3564",

    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,

    color: "#6F4B5F",

    lineHeight: 20,

    fontWeight: "400",
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

    backgroundColor: "#EDB5CF",
  },
});
