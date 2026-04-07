import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput
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

  // 🔥 CORREÇÃO AQUI
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
          ...data.filhos[id]
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
          ...data[key]
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
      bio
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
        <Ionicons name="arrow-back" size={20} color="#C642A6" />
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
              style={styles.input}
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              multiline
            />
          </>
        ) : (
          <>
            <Text style={styles.nome}>
              {userData?.nome || "Carregando..."}
            </Text>

            <Text style={styles.usuario}>
              @{userData?.nome?.toLowerCase().replace(" ", "")}
            </Text>

            <View style={styles.bioBox}>
              <Text style={styles.bio}>
                {userData?.bio || "Adicione uma bio 💖"}
              </Text>
            </View>

            <Text style={styles.info}>
              📍 {userData?.cidade || "Não informado"}
            </Text>

            <Text style={styles.info}>
              📧 {userData?.email || user?.email}
            </Text>
          </>
        )}

        {editando ? (
          <>
            <TouchableOpacity style={styles.botaoEditar} onPress={salvarPerfil}>
              <Text style={styles.textBotao}>💾 Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoCancelar} onPress={cancelarEdicao}>
              <Text style={styles.textCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => setEditando(true)}
          >
            <Text style={styles.textBotao}>✏️ Editar Perfil</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "posts" ? styles.tabActive : styles.tab}
          onPress={() => setAba("posts")}
        >
          <Text style={aba === "posts" ? styles.tabTextActive : styles.tabText}>
            Minhas Publicações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "filhos" ? styles.tabActive : styles.tab}
          onPress={() => setAba("filhos")}
        >
          <Text style={aba === "filhos" ? styles.tabTextActive : styles.tabText}>
            Meus Filhos
          </Text>
        </TouchableOpacity>
      </View>

      {aba === "posts" && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.texto}>{item.texto}</Text>

              <Text style={styles.infoPost}>
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
                Nascimento: {item.dataNascimento}
              </Text>
              {item.descricao && (
                <Text style={styles.infoPost}>{item.descricao}</Text>
              )}
              {item.peso && (
                <Text style={styles.infoPost}>Peso: {item.peso}</Text>
              )}
              {item.altura && (
                <Text style={styles.infoPost}>Altura: {item.altura}</Text>
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
    zIndex: 10
  },

  header: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff"
  },

  nome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10
  },

  usuario: {
    color: "#EBD6F5",
    marginBottom: 10
  },

  bioBox: {
    backgroundColor: "#ffffff22",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10
  },

  bio: { color: "#fff", textAlign: "center" },

  info: { color: "#EBD6F5", fontSize: 12 },

  input: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    borderRadius: 10,
    marginTop: 8
  },

  botaoEditar: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10
  },

  textBotao: { color: "#C642A6", fontWeight: "bold" },

  botaoCancelar: {
    marginTop: 8
  },

  textCancelar: {
    color: "#fff",
    fontWeight: "bold"
  },

  tabs: {
    flexDirection: "row",
    margin: 15,
    backgroundColor: "#fff",
    borderRadius: 12
  },

  tab: { flex: 1, padding: 12, alignItems: "center" },

  tabActive: {
    flex: 1,
    padding: 12,
    backgroundColor: "#C642A6",
    alignItems: "center"
  },

  tabText: { color: "#555" },

  tabTextActive: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },

  texto: { color: "#333" },

  infoPost: {
    fontSize: 12,
    color: "#777",
    marginTop: 5
  }
});  