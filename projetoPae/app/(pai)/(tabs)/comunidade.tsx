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
import { useRouter } from "expo-router";

export default function Comunidade() {
  const [posts, setPosts] = useState<any[]>([]);
  const [modalDenuncia, setModalDenuncia] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState<any>(null);
  const [descricao, setDescricao] = useState("");

  const router = useRouter();

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

  // ❤️ LIKE COM ANIMAÇÃO
  const toggleLike = async (postId: string, scale: Animated.Value) => {
    const userId = auth.currentUser?.uid;

    const likeRef = ref(db, `comunidade/posts/${postId}/likes/${userId}`);
    const snap = await get(likeRef);

    // animação
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();

    if (snap.exists()) {
      await remove(likeRef);
    } else {
      await update(ref(db), {
        [`comunidade/posts/${postId}/likes/${userId}`]: true
      });
    }
  };

  // 🚨 DENÚNCIA
  const enviarDenuncia = () => {
    const user = auth.currentUser;

    push(ref(db, "denuncias"), {
      postId: postSelecionado.id,
      userId: user?.uid,
      descricao,
      createdAt: Date.now()
    });

    setModalDenuncia(false);
    setDescricao("");
  };

  const renderPost = ({ item }: any) => {
    const scale = new Animated.Value(1);
    const userId = auth.currentUser?.uid;
    const liked = item.likes && item.likes[userId];

    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.nome}>
            {item.nome} • {item.tipo}
          </Text>

          <TouchableOpacity
            onPress={() => {
              setPostSelecionado(item);
              setModalDenuncia(true);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={18} />
          </TouchableOpacity>
        </View>

        {/* TEXTO */}
        <Text style={styles.texto}>{item.texto}</Text>

        {/* AÇÕES */}
        <View style={styles.acoes}>
          <TouchableOpacity
            onPress={() => toggleLike(item.id, scale)}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={22}
                color={liked ? "red" : "black"}
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/comentarios",
                params: { postId: item.id }
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={22} />
          </TouchableOpacity>
        </View>

        {/* CONTADOR */}
        <Text style={styles.likes}>
          {item.likes ? Object.keys(item.likes).length : 0} curtidas
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Comunidade</Text>

      <TouchableOpacity
        style={styles.botaoPost}
        onPress={() => router.push("/criarPost")}
      >
        <Text style={{ color: "#fff" }}>
          Compartilhar algo com a comunidade
        </Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
      />

      {/* MODAL DENÚNCIA */}
      <Modal visible={modalDenuncia} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text>Denunciar post</Text>

            <TextInput
              placeholder="Descreva o problema"
              value={descricao}
              onChangeText={setDescricao}
              style={styles.input}
            />

            <TouchableOpacity onPress={enviarDenuncia}>
              <Text style={{ color: "red" }}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

  botaoPost: {
    backgroundColor: "#a855f7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  card: {
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  nome: { fontWeight: "bold" },

  texto: { marginVertical: 10 },

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
    borderRadius: 12
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  }
});