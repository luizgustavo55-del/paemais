import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ref, onValue, update } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

export default function Perfil() {
  const router = useRouter();

  const [aba, setAba] = useState("posts");

  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [filhos, setFilhos] = useState<any[]>([]);

  const [editando, setEditando] = useState(false);

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [bio, setBio] = useState("");

  const user = auth.currentUser;

  const handleVoltar = () => {
    router.replace("/menu"); // sempre vai pro menu
  };

  // 🔥 USER DATA
  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `usuarios/${user.uid}`);

    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);

      if (data && !editando) {
        setNome(data.nome || "");
        setCidade(data.cidade || "");
        setBio(data.bio || "");
      }

      if (data?.filhos) {
        const lista = Object.keys(data.filhos).map((id) => ({
          id,
          ...data.filhos[id],
        }));
        setFilhos(lista);
      } else {
        setFilhos([]);
      }
    });
  }, [editando]);

  // 🔥 POSTS
  useEffect(() => {
    if (!user) return;

    const postsRef = ref(db, "comunidade/posts");

    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setPosts([]);

      const lista = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .filter((post) => post.userId === user.uid);

      lista.sort((a, b) => b.createdAt - a.createdAt);

      setPosts(lista);
    });
  }, []);

  async function salvarPerfil() {
    if (!user) return;

    await update(ref(db, `usuarios/${user.uid}`), {
      nome,
      cidade,
      bio,
    });

    setEditando(false);
  }

  function cancelarEdicao() {
    setEditando(false);
    setNome(userData?.nome || "");
    setCidade(userData?.cidade || "");
    setBio(userData?.bio || "");
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.botaoVoltar} onPress={handleVoltar}>
        <Ionicons name="arrow-back" size={24} color="#C642A6" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Image
          source={{ uri: "null" }}
          style={styles.avatar}
        />

        {editando ? (
          <>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome"
            />

            <TextInput
              style={styles.input}
              value={cidade}
              onChangeText={setCidade}
              placeholder="Cidade"
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              multiline
            />
          </>
        ) : (
          <>
            <Text style={styles.nome}>{userData?.nome || "Carregando..."}</Text>

            <Text style={styles.usuario}>
              @{userData?.nome?.toLowerCase().replace(" ", "")}
            </Text>

            <View style={styles.bioBox}>
              <Text style={styles.bio}>{userData?.bio || "Adicione uma bio"}</Text>
            </View>

            <Text style={styles.info}>
              <Ionicons name="location-outline" size={14} color="#EBD6F5" />{" "}
              {userData?.cidade || "Não informado"}
            </Text>

            <Text style={styles.info}>
              <Ionicons name="mail-outline" size={14} color="#EBD6F5" />{" "}
              {userData?.email || user?.email}
            </Text>
          </>
        )}

        {editando ? (
          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <TouchableOpacity
              style={[styles.botaoEditar, { flex: 1, marginRight: 8 }]}
              onPress={salvarPerfil}
            >
              <Text style={styles.textBotao}>
                <Ionicons name="save-outline" size={16} /> Salvar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoCancelar, { flex: 1 }]}
              onPress={cancelarEdicao}
            >
              <Text style={styles.textCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => setEditando(true)}
          >
            <Text style={styles.textBotao}>
              <Ionicons name="create-outline" size={16} /> Editar Perfil
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔹 TABS MELHORADAS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "posts" ? styles.tabActive : styles.tab}
          onPress={() => setAba("posts")}
        >
          <Ionicons
            name="reader-outline"
            size={18}
            color={aba === "posts" ? "#fff" : "#555"}
          />
          <Text
            style={aba === "posts" ? styles.tabTextActive : styles.tabText}
          >
            Minhas Publicações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "filhos" ? styles.tabActive : styles.tab}
          onPress={() => setAba("filhos")}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={aba === "filhos" ? "#fff" : "#555"}
          />
          <Text
            style={aba === "filhos" ? styles.tabTextActive : styles.tabText}
          >
            Meus Filhos
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 CONTEÚDO */}
      {aba === "posts" && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.texto}>{item.texto}</Text>
              <Text style={styles.infoPost}>
                <Ionicons name="time-outline" size={12} />{" "}
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}

      {aba === "filhos" && (
        <FlatList
          data={filhos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#fff" }}>
              Nenhum filho cadastrado
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.texto}>{item.nome}</Text>
              <Text style={styles.infoPost}>
                <Ionicons name="gift-outline" size={12} /> Nascimento:{" "}
                {item.dataNascimento}
              </Text>
              {item.descricao && (
                <Text style={styles.infoPost}>{item.descricao}</Text>
              )}
              {item.peso && (
                <Text style={styles.infoPost}>
                  <Ionicons name="barbell-outline" size={12} /> Peso: {item.peso}
                </Text>
              )}
              {item.altura && (
                <Text style={styles.infoPost}>
                  <Ionicons name="resize-outline" size={12} /> Altura: {item.altura}
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#7050B3" },

  botaoVoltar: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  header: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },

  nome: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },

  usuario: {
    color: "#EBD6F5",
    marginBottom: 10,
  },

  bioBox: {
    backgroundColor: "#ffffff22",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    width: "90%",
  },

  bio: { color: "#fff", textAlign: "center" },

  info: {
    color: "#EBD6F5",
    fontSize: 13,
    marginTop: 3,
  },

  input: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 12,
    borderRadius: 15,
    marginTop: 10,
    fontSize: 16,
  },

  botaoEditar: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 12,
    alignItems: "center",
  },

  textBotao: { color: "#C642A6", fontWeight: "bold" },

  botaoCancelar: {
    backgroundColor: "#ffffff44",
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 12,
    alignItems: "center",
  },

  textCancelar: {
    color: "#fff",
    fontWeight: "bold",
  },

  tabs: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  tabActive: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#C642A6",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  tabText: { color: "#555", fontWeight: "600" },
  tabTextActive: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  texto: { color: "#333", fontSize: 15, marginBottom: 4 },

  infoPost: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
});