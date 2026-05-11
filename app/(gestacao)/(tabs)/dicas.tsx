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
          style={aba === "auxilios" ? styles.tabActive : styles.tab}
          onPress={() => setAba("auxilios")}
        >
          <Text
            style={
              aba === "auxilios"
                ? styles.tabActiveText
                : styles.tabText
            }
          >
            Auxílios
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

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Dicas de organização
              </Text>

              <View style={styles.listContainer}>
                <TouchableOpacity
                  style={styles.tipBox}
                  onPress={() =>
                    router.push("/dicasPage/docDica")
                  }
                >
                  <Text style={styles.tipTitle}>
                    Organização de Documentos
                  </Text>

                  <Text style={styles.tipText}>
                    Veja dicas de organização de documentos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* AUXÍLIOS */}
        {aba === "auxilios" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Auxílios disponíveis
            </Text>

            <View style={styles.listContainer}>
              <TouchableOpacity
                style={styles.tipBox}
                onPress={() =>
                  router.push("/dicasPage/marcoLegal")
                }
              >
                <View style={styles.tipRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: "#ece3ff" },
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#7050b3"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>
                      Marco Legal da Primeira Infância
                    </Text>

                    <Text style={styles.tipText}>
                      Lei voltada ao desenvolvimento infantil.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#7050b3"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SAÚDE */}
        {aba === "saude" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Dicas de Saúde na Gestação
            </Text>

            <View style={styles.listContainer}>
              <TouchableOpacity
                style={styles.tipBox}
                onPress={() =>
                  router.push("/dicasPage/dicasSaude/anemia")
                }
              >
                <View style={styles.tipRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: "#ffc2e8" },
                    ]}
                  >
                    <Ionicons
                      name="fitness-outline"
                      size={20}
                      color="#28174c"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>
                      Anemia na Gestação
                    </Text>

                    <Text style={styles.tipText}>
                      Saiba identificar sintomas e tratamentos.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#7050b3"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
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
    marginBottom: 4,
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