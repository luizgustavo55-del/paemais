import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

// 🔥 Firebase
import { ref, onValue, update, push } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

// 📅 DatePicker
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CustomDrawer() {
  const router = useRouter();
  const user = auth.currentUser;

  const [userData, setUserData] = useState<any>(null);
  const [filhos, setFilhos] = useState<any[]>([]);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [novoPeso, setNovoPeso] = useState("");
  const [novaAltura, setNovaAltura] = useState("");

  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!user) return;

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

  async function salvarDadosFilho(id: string) {
    if (!user) return;

    await update(ref(db, `usuarios/${user.uid}/filhos/${id}`), {
      peso,
      altura,
    });

    setEditandoId(null);
    setPeso("");
    setAltura("");
  }

  function formatarData(date: Date) {
    return date.toLocaleDateString("pt-BR"); // dd/mm/aaaa
  }

  async function adicionarFilho() {
    if (!user || !novoNome) return;

    await push(ref(db, `usuarios/${user.uid}/filhos`), {
      nome: novoNome,
      dataNascimento: formatarData(dataNascimento),
      descricao,
      peso: novoPeso,
      altura: novaAltura,
    });

    // reset
    setNovoNome("");
    setDescricao("");
    setNovoPeso("");
    setNovaAltura("");
    setDataNascimento(new Date());
    setShowAdd(false);
  }

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
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
          {user?.email}
        </Text>
      </View>

      {/* FILHOS */}
      <View style={styles.section}>
        <Text style={styles.title}>Filhos</Text>

        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Text style={styles.add}>+ Adicionar filho</Text>
        </TouchableOpacity>

        {showAdd && (
          <View style={styles.inputBox}>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={novoNome}
              onChangeText={setNovoNome}
            />

            {/* 📅 DATA COM PICKER */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.input}>
                {formatarData(dataNascimento)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dataNascimento}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDataNascimento(selectedDate);
                }}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Peso"
              value={novoPeso}
              onChangeText={setNovoPeso}
            />

            <TextInput
              style={styles.input}
              placeholder="Altura"
              value={novaAltura}
              onChangeText={setNovaAltura}
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
            />

            <TouchableOpacity style={styles.saveButton} onPress={adicionarFilho}>
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>

          </View>
        )}

        {filhos.length === 0 && (
          <Text style={styles.empty}>Nenhum filho cadastrado</Text>
        )}

        {filhos.map((filho) => (
          <View key={filho.id} style={styles.childBox}>

            <Text style={styles.childName}>{filho.nome}</Text>
            <Text style={styles.info}>
              Nascimento: {filho.dataNascimento}
            </Text>

            {filho.descricao && (
              <Text style={styles.info}>{filho.descricao}</Text>
            )}

            {filho.peso && <Text style={styles.info}>Peso: {filho.peso}</Text>}
            {filho.altura && <Text style={styles.info}>Altura: {filho.altura}</Text>}

          </View>
        ))}
      </View>

      {/* MENU */}
      <TouchableOpacity onPress={() => router.push("/perfil" as const)}>
        <Text style={styles.item}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/configuracoes" as const)}>
        <Text style={styles.item}>Configurações</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/notificacoes" as const)}>
        <Text style={styles.item}>Notificações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },

  header: {
    backgroundColor: "#a855f7",
    padding: 20,
    borderRadius: 12,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#9333ea",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: { color: "#fff", fontWeight: "bold" },

  name: { color: "#fff", fontSize: 18, marginTop: 10 },

  email: { color: "#fff", fontSize: 12 },

  section: { marginTop: 20 },

  title: { fontSize: 16, fontWeight: "bold" },

  add: { color: "#a855f7", marginTop: 5, fontWeight: "bold" },

  inputBox: {
    marginTop: 10,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
  },

  childBox: {
    backgroundColor: "#f1f2f6",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  childName: { fontWeight: "bold", fontSize: 15 },

  info: { color: "#555" },

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

  empty: { marginTop: 10, color: "#888" },

  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  logout: { marginTop: 30 },

  logoutText: { color: "red", fontWeight: "bold" },
});