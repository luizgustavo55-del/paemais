import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// 🔥 Firebase
import { ref, push, onValue, remove, update } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

// ✅ TIPOS
interface Filho {
  nome: string;
  dataNascimento: string;
  altura?: string;
}

interface Marco {
  id: string;
  titulo: string;
  idade: string;
  data: string;
  criadoEm?: number;
}

export default function Desenvolvimento() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("marcos");

  const [titulo, setTitulo] = useState("");
  const [idade, setIdade] = useState("");
  const [data, setData] = useState("");

  const [marcos, setMarcos] = useState<Marco[]>([]);
  const [filho, setFilho] = useState<Filho | null>(null);
  const [filhoId, setFilhoId] = useState<string | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);

  const router = useRouter();
  const user = auth.currentUser;

  // 👶 BUSCAR FILHO
  useEffect(() => {
    if (!user) return;

    const filhoRef = ref(db, `usuarios/${user.uid}/filhos`);

    onValue(filhoRef, (snapshot) => {
      const dados = snapshot.val() as Record<string, Filho> | null;

      if (dados) {
        const primeiroId = Object.keys(dados)[0];
        setFilhoId(primeiroId);
        setFilho(dados[primeiroId]);
      }
    });
  }, []);

  // 🔥 BUSCAR MARCOS
  useEffect(() => {
    if (!user || !filhoId) return;

    const marcosRef = ref(
      db,
      `usuarios/${user.uid}/filhos/${filhoId}/marcos`
    );

    onValue(marcosRef, (snapshot) => {
      const dados = snapshot.val() as Record<string, any> | null;

      if (dados) {
        const lista: Marco[] = Object.keys(dados).map((key) => ({
          id: key,
          titulo: dados[key].titulo,
          idade: dados[key].idade,
          data: dados[key].data,
          criadoEm: dados[key].criadoEm
        }));

        setMarcos(lista.reverse());
      } else {
        setMarcos([]);
      }
    });
  }, [filhoId]);

  // ➕ / ✏️ SALVAR
  const salvarMarco = () => {
    if (!titulo || !idade || !data || !user || !filhoId) return;

    const baseRef = `usuarios/${user.uid}/filhos/${filhoId}/marcos`;

    if (editandoId) {
      update(ref(db, `${baseRef}/${editandoId}`), {
        titulo,
        idade,
        data
      });
    } else {
      push(ref(db, baseRef), {
        titulo,
        idade,
        data,
        criadoEm: Date.now()
      });
    }

    limparForm();
  };

  // 🗑️ DELETAR
  const deletarMarco = (id: string) => {
    if (!user || !filhoId) return;

    remove(
      ref(db, `usuarios/${user.uid}/filhos/${filhoId}/marcos/${id}`)
    );
  };

  // ✏️ EDITAR
  const editarMarco = (item: Marco) => {
    setTitulo(item.titulo);
    setIdade(item.idade);
    setData(item.data);
    setEditandoId(item.id);
    setMostrarForm(true);
  };

  const limparForm = () => {
    setTitulo("");
    setIdade("");
    setData("");
    setEditandoId(null);
    setMostrarForm(false);
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* 🔙 BOTÃO VOLTAR */}
      <View style={styles.header}>
  <TouchableOpacity
    onPress={() => router.replace("/menu")}
    style={styles.botaoVoltar}
  >
    <Ionicons name="arrow-back" size={22} color="#fff" />
  </TouchableOpacity>

  <View style={styles.headerText}>
    <Text style={styles.titulo}>Desenvolvimento</Text>
    <Text style={styles.subtitulo}>
      Acompanhe o crescimento do seu bebê
    </Text>
  </View>
</View>
      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setAbaAtiva("marcos")}>
          <Text style={abaAtiva === "marcos" ? styles.tabActive : styles.tab}>
            Marcos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva("crescimento")}>
          <Text style={abaAtiva === "crescimento" ? styles.tabActive : styles.tab}>
            Crescimento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva("diario")}>
          <Text style={abaAtiva === "diario" ? styles.tabActive : styles.tab}>
            Diário
          </Text>
        </TouchableOpacity>
      </View>

      {abaAtiva === "marcos" && (
        <>
          {/* FILHO */}
          <View style={styles.card}>
            <Text style={styles.label}>Acompanhando</Text>

            <View style={styles.select}>
              <Text>
                {filho
                  ? `${filho.nome} - ${filho.dataNascimento}`
                  : "Carregando..."}
              </Text>
            </View>
          </View>

          {/* MARCOS */}
          <View style={styles.card}>
            <View style={styles.headerCard}>
              <Text style={styles.cardTitulo}>
                Marcos de Desenvolvimento
              </Text>

              <TouchableOpacity
                style={styles.botaoAdd}
                onPress={() => {
                  limparForm();
                  setMostrarForm(true);
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* FORM */}
            {mostrarForm && (
              <View style={styles.form}>
                <Text style={styles.formTitulo}>
                  {editandoId ? "Editar Marco" : "Novo Marco"}
                </Text>

                <TextInput
                  placeholder="Título"
                  style={styles.input}
                  value={titulo}
                  onChangeText={setTitulo}
                />

                <TextInput
                  placeholder="Idade"
                  style={styles.input}
                  value={idade}
                  onChangeText={setIdade}
                />

                <TextInput
                  placeholder="Data"
                  style={styles.input}
                  value={data}
                  onChangeText={setData}
                />

                <View style={styles.botoes}>
                  <TouchableOpacity
                    style={styles.botaoSalvar}
                    onPress={salvarMarco}
                  >
                    <Text style={{ color: "#fff" }}>
                      {editandoId ? "Salvar" : "Adicionar"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={limparForm}>
                    <Text style={{ color: "#555" }}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* LISTA */}
            {marcos.map((item) => (
              <View key={item.id} style={styles.marco}>
                <Text style={{ color: "#999" }}>{item.titulo}</Text>
                <Text style={{ fontSize: 12 }}>
                  {item.idade} - {item.data}
                </Text>

                <View style={styles.acoes}>
                  <TouchableOpacity onPress={() => editarMarco(item)}>
                    <Ionicons name="create-outline" size={20} color="#C642A6" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deletarMarco(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {abaAtiva === "crescimento" && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Crescimento</Text>
        </View>
      )}

      {abaAtiva === "diario" && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Diário</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8E2DE2",
    padding: 15
  },

 header: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 10
},

headerText: {
  marginLeft: 10
},

botaoVoltar: {
  padding: 5
},
  titulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 40
  },

  subtitulo: {
    color: "#EBD6F5",
    marginBottom: 15
  },

  tabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15
  },

  tab: {
    color: "#fff",
    backgroundColor: "#ffffff22",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },

  tabActive: {
    color: "#983a7f",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15
  },

  label: {
    color: "#777",
    marginBottom: 5
  },

  select: {
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 10
  },

  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  cardTitulo: {
    fontWeight: "bold",
    fontSize: 16
  },

  botaoAdd: {
    backgroundColor: "#C642A6",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },

  form: {
    marginTop: 15,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10
  },

  formTitulo: {
    fontWeight: "bold",
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },

  botoes: {
    flexDirection: "row",
    gap: 15
  },

  botaoSalvar: {
    backgroundColor: "#C642A6",
    padding: 10,
    borderRadius: 10
  },

  marco: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 10
  },

  acoes: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10
  }
}); 