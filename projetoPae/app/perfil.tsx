import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ref, onValue } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

export default function Perfil() {
  const router = useRouter();
  const [aba, setAba] = useState("posts");

  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);

  const user = auth.currentUser;

  // 🔙 FUNÇÃO INTELIGENTE DE VOLTAR
  const handleVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/menu"); // vai direto pro menu se não tiver histórico
    }
  };

  // 🔥 BUSCAR DADOS DO USUÁRIO
  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `usuarios/${user.uid}`);

    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });
  }, []);

  // 🔥 BUSCAR POSTS DO USUÁRIO
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

  return (
    <View style={styles.container}>
      
      <TouchableOpacity
  style={styles.botaoVoltar}
  onPress={() => router.replace("/menu")}
>
  <Ionicons name="arrow-back" size={20} color="#C642A6" />
</TouchableOpacity>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "null"
          }}
          style={styles.avatar}
        />

        <Text style={styles.nome}>
          {userData?.nome || "Carregando..."}
        </Text>

        <Text style={styles.usuario}>
          @{userData?.nome?.toLowerCase().replace(" ", "")}
        </Text>

        <View style={styles.bioBox}>
          <Text style={styles.bio}>
            adicione uma bio 💖
          </Text>
        </View>

        <Text style={styles.info}>
          📍 {userData?.cidade || "Não informado"}
        </Text>

        <Text style={styles.info}>
          📧 {userData?.email || user?.email}
        </Text>

        <TouchableOpacity style={styles.botaoEditar}>
          <Text style={{ color: "#C642A6", fontWeight: "bold" }}>
            ✏️ Editar Perfil
          </Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "posts" ? styles.tabActive : styles.tab}
          onPress={() => setAba("posts")}
        >
          <Text
            style={aba === "posts" ? styles.tabTextActive : styles.tabText}
          >
            Minhas Publicações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "filhos" ? styles.tabActive : styles.tab}
          onPress={() => {
            setAba("filhos");
            router.push("/meusFilhos");
          }}
        >
          <Text
            style={aba === "filhos" ? styles.tabTextActive : styles.tabText}
          >
            Meus Filhos
          </Text>
        </TouchableOpacity>
      </View>

      {/* POSTS */}
      {aba === "posts" && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => {
            const totalComentarios = item.comentarios
              ? Object.keys(item.comentarios).length
              : 0;

            return (
              <View style={styles.card}>
                <Text style={styles.texto}>{item.texto}</Text>

                <Text style={styles.infoPost}>
                  {new Date(item.createdAt).toLocaleString()} •{" "}
                  {item.likes ? Object.keys(item.likes).length : 0} curtidas •{" "}
                  {totalComentarios} comentários
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8E2DE2"
  },

  // 🔙 BOTÃO VOLTAR
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
    elevation: 5
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

  bio: {
    color: "#fff",
    textAlign: "center"
  },

  info: {
    color: "#EBD6F5",
    fontSize: 12
  },

  botaoEditar: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10
  },

  tabs: {
    flexDirection: "row",
    margin: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden"
  },

  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center"
  },

  tabActive: {
    flex: 1,
    padding: 12,
    backgroundColor: "#C642A6",
    alignItems: "center"
  },

  tabText: {
    color: "#555"
  },

  tabTextActive: {
    color: "#fff",
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },

  texto: {
    color: "#333",
    marginBottom: 10
  },

  infoPost: {
    fontSize: 12,
    color: "#777"
  }
});