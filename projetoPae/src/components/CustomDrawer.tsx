import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

// 🔥 Firebase
import { ref, onValue, update, push, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, } from "@/src/services/firebase";
import { signOut } from "firebase/auth";

// 📅 DatePicker
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CustomDrawer() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [filhos, setFilhos] = useState<any[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [novoPeso, setNovoPeso] = useState("");
  const [novaAltura, setNovaAltura] = useState("");

  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [dataTexto, setDataTexto] = useState(formatarData(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [editandoFilhoId, setEditandoFilhoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPeso, setEditPeso] = useState("");
  const [editAltura, setEditAltura] = useState("");
  const [editData, setEditData] = useState(new Date());
  const [editDataTexto, setEditDataTexto] = useState("");
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const refUser = ref(db, "usuarios/" + user.uid);

    onValue(refUser, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setUserData(data);

        if (data.filhos) {
          const lista = Object.keys(data.filhos).map((id) => ({
            id,
            ...data.filhos[id],
          }));
          setFilhos(lista);
        } else {
          setFilhos([]);
        }
      }
    });
  }, [user]);

  function formatarData(date: Date) {
    return date.toLocaleDateString("pt-BR");
  }

  function calcularIdade(dataStr: string) {
    const partes = dataStr.split("/");
    if (partes.length !== 3) return "";

    const nascimento = new Date(
      Number(partes[2]),
      Number(partes[1]) - 1,
      Number(partes[0])
    );

    const hoje = new Date();

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    if (anos <= 0) return `${meses} meses`;

    return `${anos} anos`;
  }

  async function adicionarFilho() {
    if (!user || !novoNome) return;

    await push(ref(db, `usuarios/${user.uid}/filhos`), {
      nome: novoNome,
      dataNascimento: dataTexto,
      descricao,
      peso: novoPeso,
      altura: novaAltura,
    });

    limparFormulario();
  }

  function limparFormulario() {
    setNovoNome("");
    setDescricao("");
    setNovoPeso("");
    setNovaAltura("");
    setDataNascimento(new Date());
    setDataTexto(formatarData(new Date()));
    setShowAdd(false);
  }

  function excluirFilho(id: string) {
    Alert.alert(
      "Excluir filho",
      "Tem certeza que deseja excluir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            if (!user) return;

            await remove(ref(db, `usuarios/${user.uid}/filhos/${id}`));

            if (editandoFilhoId === id) {
              setEditandoFilhoId(null);
            }
          },
        },
      ]
    );
  }

  function iniciarEdicao(filho: any) {
    setEditandoFilhoId(filho.id);
    setEditNome(filho.nome);
    setEditDescricao(filho.descricao || "");
    setEditPeso(filho.peso || "");
    setEditAltura(filho.altura || "");
    setEditDataTexto(filho.dataNascimento);

    const partes = filho.dataNascimento.split("/");
    const data = new Date(
      Number(partes[2]),
      Number(partes[1]) - 1,
      Number(partes[0])
    );

    setEditData(data);
  }

  async function salvarEdicaoFilho(id: string) {
    if (!user) return;

    await update(ref(db, `usuarios/${user.uid}/filhos/${id}`), {
      nome: editNome,
      dataNascimento: editDataTexto,
      descricao: editDescricao,
      peso: editPeso,
      altura: editAltura,
    });

    setEditandoFilhoId(null);
  }

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.nome?.[0] || "U"}
          </Text>
        </View>

        <Text style={styles.name}>
          {userData?.nome || "Usuário"}
        </Text>

        <Text style={styles.email}>
          {userData?.email || user?.email || ""}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Filhos</Text>

        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Text style={styles.add}>+ Adicionar filho</Text>
        </TouchableOpacity>

        {showAdd && (
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Nome" value={novoNome} onChangeText={setNovoNome} />

            <TextInput
              style={styles.input}
              value={dataTexto}
              placeholder="DD/MM/AAAA"
              onChangeText={setDataTexto}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: "#a855f7", marginTop: 5 }}>
                Abrir calendário
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dataNascimento}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDataNascimento(selectedDate);
                    setDataTexto(formatarData(selectedDate));
                  }
                }}
              />
            )}

            <TextInput style={styles.input} placeholder="Peso" value={novoPeso} onChangeText={setNovoPeso} />
            <TextInput style={styles.input} placeholder="Altura" value={novaAltura} onChangeText={setNovaAltura} />
            <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />

            <TouchableOpacity style={styles.saveButton} onPress={adicionarFilho}>
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>

            {/* CANCELAR */}
            <TouchableOpacity style={styles.cancelButton} onPress={limparFormulario}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {filhos.map((filho) => (
          <View key={filho.id} style={styles.childBox}>

            {editandoFilhoId === filho.id ? (
              <>
                <TextInput style={styles.input} value={editNome} onChangeText={setEditNome} />
                <TextInput style={styles.input} value={editDataTexto} onChangeText={setEditDataTexto} />

                <TouchableOpacity onPress={() => setShowEditDatePicker(true)}>
                  <Text style={{ color: "#a855f7", marginTop: 5 }}>
                    Abrir calendário
                  </Text>
                </TouchableOpacity>

                {showEditDatePicker && (
                  <DateTimePicker
                    value={editData}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowEditDatePicker(false);
                      if (selectedDate) {
                        setEditData(selectedDate);
                        setEditDataTexto(formatarData(selectedDate));
                      }
                    }}
                  />
                )}

                <TextInput style={styles.input} value={editPeso} onChangeText={setEditPeso} />
                <TextInput style={styles.input} value={editAltura} onChangeText={setEditAltura} />
                <TextInput style={styles.input} value={editDescricao} onChangeText={setEditDescricao} />

                <TouchableOpacity style={styles.saveButton} onPress={() => salvarEdicaoFilho(filho.id)}>
                  <Text style={styles.saveText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => excluirFilho(filho.id)}>
                  <Text style={styles.deleteText}>Excluir filho</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.childName}>{filho.nome}</Text>
                <Text style={styles.info}>Nascimento: {filho.dataNascimento}</Text>
                <Text style={styles.info}>Idade: {calcularIdade(filho.dataNascimento)}</Text>

                {filho.descricao && <Text style={styles.info}>{filho.descricao}</Text>}
                {filho.peso && <Text style={styles.info}>Peso: {filho.peso}</Text>}
                {filho.altura && <Text style={styles.info}>Altura: {filho.altura}</Text>}

                <TouchableOpacity onPress={() => iniciarEdicao(filho)}>
                  <Text style={{ color: "#a855f7", marginTop: 5 }}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => excluirFilho(filho.id)}>
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        ))}
      </View>

      <TouchableOpacity onPress={() => router.push("/MenuPage/perfil")}>
        <Text style={styles.item}>Ver Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/configuracoes")}>
        <Text style={styles.item}>Configurações</Text>
      </TouchableOpacity>

     
      <TouchableOpacity
  onPress={async () => {
    try {
      await signOut(auth); // 🔥 faz logout do Firebase
      router.replace("/login"); // 🔁 redireciona
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  }}
  style={styles.logout}
>
  <Text style={styles.logoutText}>Sair</Text>
</TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#7050B3", padding: 20 },

  header: {
    backgroundColor: "#7b5ac4b7",
    padding: 20,
    borderRadius: 12,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#8569c199",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: { color: "#fff", fontWeight: "bold" },

  name: { color: "#f9d3ff", fontSize: 18, marginTop: 10 },
  email: { color: "#f9d3ff", fontSize: 12 },

  section: { marginTop: 20 },

  title: { fontSize: 16, fontWeight: "bold" },
  add: { color: "#28174cca", marginTop: 5, fontWeight: "bold" },

  inputBox: {
    marginTop: 10,
    backgroundColor: "#7f5acf",
    padding: 10,
    borderRadius: 10,
  },

  childBox: {
    backgroundColor: "#7f5acf",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  childName: { fontWeight: "bold", fontSize: 15 },
  info: { color: "#28174cca" },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  saveButton: {
    backgroundColor: "#a855f7",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  saveText: { color: "#fff", fontWeight: "bold" },

  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },

  cancelText: { fontWeight: "bold", color: "#333" },

  deleteText: {
    color: "red",
    marginTop: 8,
    fontWeight: "bold",
  },

  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  logout: { marginTop: 30 },
  logoutText: { color: "red", fontWeight: "bold" },
});