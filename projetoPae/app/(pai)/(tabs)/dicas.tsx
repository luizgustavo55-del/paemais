import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

// 🔥 Firebase
import { ref, push, onValue, remove, update } from "firebase/database";
import { db, auth } from "@/src/services/firebase";
import { Background } from "@react-navigation/elements";

// ✅ TIPAGEM
type Meta = {
  id: string;
  texto: string;
  concluida: boolean;
  dataConclusao: string;
};

export default function DicasScreen() {
  const [aba, setAba] = useState("rotina");
  const router = useRouter();

  // 🔥 STATES
  const [metas, setMetas] = useState<Meta[]>([]);
  const [novaMeta, setNovaMeta] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // 📅 SEMANA ATUAL
  const getSemanaAtual = () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
    return `semana_${primeiroDia.toISOString().split("T")[0]}`;
  };

  const semanaAtual = getSemanaAtual();

  // 🔄 BUSCAR METAS
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const metasRef = ref(db, `metasSemana/${user.uid}/${semanaAtual}`);

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
      update(ref(db, `metasSemana/${user.uid}/${semanaAtual}/${editandoId}`), {
        texto: novaMeta,
      });
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

    remove(ref(db, `metasSemana/${user.uid}/${semanaAtual}/${id}`));
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
    const dataFormatada = `${String(hoje.getDate()).padStart(2, "0")}/${String(
      hoje.getMonth() + 1
    ).padStart(2, "0")}/${hoje.getFullYear()}`;

    update(ref(db, `metasSemana/${user.uid}/${semanaAtual}/${meta.id}`), {
      concluida: !meta.concluida,
      dataConclusao: !meta.concluida ? dataFormatada : "",
    });
  };

  return (
    <Background style={styles.container}>

      <Text style={styles.title}>Dicas</Text>
      <Text style={styles.subtitle}>
        Informações úteis para você e seu bebê
      </Text>


{/* TABS */}
<View style={styles.tabs}>
  <TouchableOpacity
    style={aba === "rotina" ? styles.tabActive : styles.tab}
    onPress={() => setAba("rotina")}
  >
    <Text
      style={aba === "rotina" ? styles.tabActiveText : styles.tabText}
    >
      Rotina
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={aba === "auxilios" ? styles.tabActive : styles.tab}
    onPress={() => setAba("auxilios")}
  >
    <Text
      style={aba === "auxilios" ? styles.tabActiveText : styles.tabText}
    >
      Auxílios
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={aba === "bebe" ? styles.tabActive : styles.tab}
    onPress={() => setAba("bebe")}
  >
    <Text
      style={aba === "bebe" ? styles.tabActiveText : styles.tabText}
    >
      Bebê
    </Text>
  </TouchableOpacity>
</View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

        {/* ROTINA */}
        {aba === "rotina" && (
          <>
            <View style={styles.cardtwo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Metas da Semana</Text>
              </View>

              {/* INPUT */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite uma meta..."
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
              
              {/* LISTA */}
              {metas.map((meta) => (
                <View key={meta.id} style={styles.item}>

                  <TouchableOpacity onPress={() => concluirMeta(meta)}>
                    <Ionicons
                      name={meta.concluida ? "checkbox" : "square-outline"}
                      size={20}
                      color="#27001d"
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
                    <Ionicons name="create-outline" size={18} color="#555" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => excluirMeta(meta.id)}>
                    <Ionicons name="trash-outline" size={18} color="red" />
                  </TouchableOpacity>

                </View>
                
                
              ))}
            </View> 
              <View style={styles.card}>
            <Text style={styles.cardTitle}>Dicas de organização</Text>

            <View style={styles.listContainer}> 
              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/docDica")}>
                <Text style={styles.tipTitle}>Organização de Documentos</Text>
                <Text style={styles.tipText}>
                 Veja dicas de organização de documentos
                </Text>
              </TouchableOpacity>
              </View>
              </View>

          </>
        )}

        {/* AUXÍLIOS (INALTERADO) */}
        {aba === "auxilios" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Auxílios disponíveis</Text>

            <View style={styles.listContainer}>
              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/marcoLegal")}>
                <Text style={styles.tipTitle}>Marco Legal da Primeira Infância</Text>
                <Text style={styles.tipText}>
                  Aprovada em 2016, a Lei n.º 13.257 instituiu o Marco Legal da Primeira Infância.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/cadUnico")}>
                <Text style={styles.tipTitle}>Cadastro Único (CadÚnico)</Text>
                <Text style={styles.tipText}>
                  Entenda o que é, como funciona e seus variados usos.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/redeAlyne")}>
                <Text style={styles.tipTitle}>Rede Alyne</Text>
                <Text style={styles.tipText}>
                  Atendimento humanizado e seguro para mães e crianças.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/bolsaFamilia")}>
                <Text style={styles.tipTitle}>Bolsa Família</Text>
                <Text style={styles.tipText}>
                  Verifique seu direito ao benefício.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/auxMaternidade")}>
                <Text style={styles.tipTitle}>Auxílio Maternidade</Text>
                <Text style={styles.tipText}>
                  Benefício para mães contribuintes do INSS.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/criançaFeliz")}>
                <Text style={styles.tipTitle}>Criança Feliz</Text>
                <Text style={styles.tipText}>
                  Apoio ao desenvolvimento infantil.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipBox} onPress={() => router.push("/dicasPage/criancaCidada")}>
                <Text style={styles.tipTitle}>Criança Cidadã</Text>
                <Text style={styles.tipText}>
                  Ajuda no pagamento de creches.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* BEBÊ (INALTERADO) */}
        {aba === "bebe" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>CUIDADOS COM O BEBE (Aqui estarão dicas adicionadas pelos profissionais para o cuidado com os bebês)</Text>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Sono do bebê</Text>
              <Text style={styles.tipText}>
                Recém-nascidos dormem de 14 a 17 horas por dia.
              </Text>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Amamentação</Text>
              <Text style={styles.tipText}>
                O leite materno é essencial até os 6 meses.
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#7050B3"

  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#EBD6F5",
    marginBottom: 15,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 4,
    marginBottom: 15
  },

  tab: { flex: 1, padding: 10, alignItems: "center" },

  tabActive: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    alignItems: "center"
  },
   tabActiveText: { color: "#28174cca" },

  tabText: { color: "#ffffff" },

  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  slider: {
    flex: 1,
    height: 6,
    backgroundColor: "#46073cd0",
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#B390D7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
   cardtwo: {
    backgroundColor: "#B390D7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },


  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },

  plusBtn: {
    backgroundColor: "rgb(119, 0, 89)",
    padding: 8,
    borderRadius: 10,
  },

  cancelBtn: {
    backgroundColor: "#999",
    padding: 8,
    borderRadius: 10,
  },

  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  itemText: {
    color: "#230022c6",
    fontSize: 15,
  },

  itemDone: {
    textDecorationLine: "line-through",
    color: "#40003a",
  },

  dataText: {
    fontSize: 11,
    color: "#3a0037",
  },

  listContainer: {
    gap: 12,
  },

  tipBox: {
    backgroundColor: "rgb(242, 215, 255)",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#28174cca",
    elevation: 2,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#530c45",
    marginBottom: 4,
  },

  tipText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});