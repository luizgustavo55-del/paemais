import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ref, onValue, get, update, remove, push } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

export default function Comunidade() {
  const [posts, setPosts] = useState<any[]>([]);
  const [modalDenuncia, setModalDenuncia] = useState(false);
  const [modalPost, setModalPost] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState<any>(null);
  const [descricao, setDescricao] = useState("");
  const [textoPost, setTextoPost] = useState("");

  useEffect(() => {
    const postsRef = ref(db, "comunidade/posts");

    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setPosts([]);

      const lista = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));

      lista.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(lista);
    });
  }, []);

  const toggleLike = async (postId: string, scale: Animated.Value) => {
    const userId = auth.currentUser?.uid;

    const likeRef = ref(db, `comunidade/posts/${postId}/likes/${userId}`);
    const snap = await get(likeRef);

    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();

    if (snap.exists()) {
      await remove(likeRef);
    } else {
      await update(ref(db), {
        [`comunidade/posts/${postId}/likes/${userId}`]: true
      });
    }
  };

  const publicar = async () => {
    const user = auth.currentUser;

    const snap = await get(ref(db, `usuarios/${user?.uid}`));
    const userData = snap.val();

    await push(ref(db, "comunidade/posts"), {
      userId: user?.uid,
      nome: userData?.nome,
      tipo: userData?.tipo,
      texto: textoPost,
      createdAt: Date.now()
    });

    setTextoPost("");
    setModalPost(false); // 🔥 volta automaticamente
  };

  const renderPost = ({ item }: any) => {
    const scale = new Animated.Value(1);
    const userId = auth.currentUser?.uid;
    const liked = item.likes && item.likes[userId];

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.tipo}>{item.tipo}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setPostSelecionado(item);
              setModalDenuncia(true);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={18} />
          </TouchableOpacity>
        </View>

        <Text style={styles.texto}>{item.texto}</Text>

        <View style={styles.acoes}>
          <TouchableOpacity onPress={() => toggleLike(item.id, scale)}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={22}
                color={liked ? "#ff4d6d" : "#555"}
              />
            </Animated.View>
          </TouchableOpacity>

          <Ionicons name="chatbubble-outline" size={22} color="#555" />
        </View>

        <Text style={styles.likes}>
          {item.likes ? Object.keys(item.likes).length : 0} curtidas
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Comunidade</Text>
      <Text style={styles.subtitulo}>
        Conecte-se com outras mamães e profissionais
      </Text>

      <View style={styles.tabs}>
        <View style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Feed</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Profissionais</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.inputFake}
        onPress={() => setModalPost(true)}
      >
        <Text style={{ color: "#999" }}>
          No que você está pensando?
        </Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
      />

      {/* 🔥 MODAL CRIAR POST */}
      <Modal visible={modalPost} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Criar publicação</Text>

            <TextInput
              placeholder="O que você quer compartilhar?"
              multiline
              value={textoPost}
              onChangeText={setTextoPost}
              style={styles.input}
            />

            <TouchableOpacity style={styles.botao} onPress={publicar}>
              <Text style={{ color: "#fff" }}>Publicar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalPost(false)}>
              <Text style={{ marginTop: 10, color: "#999" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#8E2DE2"
  },

  titulo: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitulo: { color: "#EBD6F5", marginBottom: 15 },

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
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center"
  },

  tabText: { color: "#fff" },
  tabTextActive: { color: "#C642A6", fontWeight: "bold" },

  inputFake: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15
  },

  card: {
    backgroundColor: "#F3F3F3",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  userRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc"
  },

  nome: { fontWeight: "bold", color: "#333" },
  tipo: { fontSize: 12, color: "#777" },

  texto: { marginVertical: 10, color: "#444" },

  acoes: { flexDirection: "row", gap: 15 },

  likes: { marginTop: 5, color: "#555" },

  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000000aa"
  },

  modalBox: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16
  },

  modalTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    height: 120
  },

  botao: {
    backgroundColor: "#C642A6",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    alignItems: "center"
  }
});