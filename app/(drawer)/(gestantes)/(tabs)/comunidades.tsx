import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 🔥 IMPORTS DO FIREBASE
import { auth, firestore } from "@/src/services/firebase";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

export default function Comunidade() {
  const [posts, setPosts] = useState<any[]>([]);
  const [aba, setAba] = useState("feed");
  const [modalPost, setModalPost] = useState(false);
  const [modalComentario, setModalComentario] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState<any>(null);
  const [textoPost, setTextoPost] = useState("");
  const [textoComentario, setTextoComentario] = useState("");
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [modalOpcoes, setModalOpcoes] = useState(false);
  const [postOpcoes, setPostOpcoes] = useState<any>(null);
  const [userIdLogado, setUserIdLogado] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserIdLogado(user.uid);
    carregarPosts();
  }, []);

  useEffect(() => {
    if (modalComentario) {
      carregarComentarios();
    }
  }, [postSelecionado, modalComentario]);

  // 🔥 1. CARREGAR POSTS (COLEÇÃO GLOBAL)
  const carregarPosts = async () => {
    try {
      const q = query(
        collection(firestore, "comunidade"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(lista);
    } catch (error) {
      console.log("Erro ao carregar posts", error);
    }
  };

  // 🔥 2. CARREGAR COMENTÁRIOS (SUBCOLEÇÃO)
  const carregarComentarios = async () => {
    if (!postSelecionado) return;
    try {
      const q = query(
        collection(firestore, "comunidade", postSelecionado.id, "comentarios"),
        orderBy("createdAt", "asc"),
      );
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComentarios(lista);
    } catch (error) {
      console.log("Erro ao carregar comentários", error);
    }
  };

  // 🔥 3. CURTIR E DESCURTIR
  const toggleLike = async (post: any, scale: Animated.Value) => {
    try {
      if (!userIdLogado) return;

      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      const postRef = doc(firestore, "comunidade", post.id);
      const jaCurtiu = post.likes && post.likes.includes(userIdLogado);

      if (jaCurtiu) {
        await updateDoc(postRef, { likes: arrayRemove(userIdLogado) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(userIdLogado) });
      }

      carregarPosts(); // Atualiza feed
    } catch (error) {
      console.log("Erro ao curtir", error);
    }
  };

  // 🔥 4. CRIAR PUBLICAÇÃO
  const publicar = async () => {
    if (!textoPost.trim() || !userIdLogado) return;

    try {
      // Tenta buscar o nome real do usuário
      let nomeAutor = "Membro";
      const userDoc = await getDoc(doc(firestore, "usuarios", userIdLogado));
      if (userDoc.exists() && userDoc.data().nome) {
        nomeAutor = userDoc.data().nome;
      }

      const novoPost = {
        userId: userIdLogado,
        nome: nomeAutor,
        texto: textoPost,
        likes: [], // Inicia como array vazio
        totalComentarios: 0,
        createdAt: Date.now(),
      };

      await addDoc(collection(firestore, "comunidade"), novoPost);

      setModalPost(false);
      setTextoPost("");
      carregarPosts();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível publicar.");
    }
  };

  // 🔥 5. ENVIAR COMENTÁRIO
  const enviarComentario = async () => {
    if (!textoComentario.trim() || !postSelecionado || !userIdLogado) return;

    try {
      let nomeAutor = "Usuário";
      const userDoc = await getDoc(doc(firestore, "usuarios", userIdLogado));
      if (userDoc.exists() && userDoc.data().nome) {
        nomeAutor = userDoc.data().nome;
      }

      const novoComentario = {
        userId: userIdLogado,
        nome: nomeAutor,
        texto: textoComentario,
        createdAt: Date.now(),
      };

      // Salva o comentário na subcoleção do post
      await addDoc(
        collection(firestore, "comunidade", postSelecionado.id, "comentarios"),
        novoComentario,
      );

      // Atualiza o contador de comentários no post principal
      const postRef = doc(firestore, "comunidade", postSelecionado.id);
      await updateDoc(postRef, {
        totalComentarios: (postSelecionado.totalComentarios || 0) + 1,
      });

      setTextoComentario("");
      carregarComentarios();
      carregarPosts();
    } catch (error) {
      console.log("Erro ao comentar", error);
    }
  };

  // 🔥 6. DENUNCIAR
  const denunciarPost = async () => {
    if (!postOpcoes || !userIdLogado) return;
    try {
      await addDoc(collection(firestore, "denuncias"), {
        postId: postOpcoes.id,
        denunciadoId: postOpcoes.userId,
        denuncianteId: userIdLogado,
        texto: postOpcoes.texto,
        createdAt: Date.now(),
      });
      setModalOpcoes(false);
      Alert.alert(
        "Sucesso",
        "Publicação denunciada. Nossa equipe irá analisar.",
      );
    } catch (error) {
      console.log("Erro ao denunciar", error);
    }
  };

  // 🔥 7. APAGAR POST
  const deletarPost = async () => {
    if (!postOpcoes) return;
    try {
      await deleteDoc(doc(firestore, "comunidade", postOpcoes.id));
      setModalOpcoes(false);
      carregarPosts();
    } catch (error) {
      console.log("Erro ao deletar", error);
    }
  };

  const renderPost = ({ item }: any) => {
    const scale = new Animated.Value(1);
    const liked =
      userIdLogado && item.likes && item.likes.includes(userIdLogado);
    const totalCurtidas = item.likes ? item.likes.length : 0;
    const totalComentarios = item.totalComentarios || 0;

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.tipo}>{item.tipo || "Membro"}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setPostOpcoes(item);
              setModalOpcoes(true);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <Text style={styles.texto}>{item.texto}</Text>

        <View style={styles.acoes}>
          <TouchableOpacity onPress={() => toggleLike(item, scale)}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={22}
                color={liked ? "#ff4d6d" : "#555"}
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setPostSelecionado(item);
              setModalComentario(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#555" />
          </TouchableOpacity>
        </View>

        <Text style={styles.likes}>
          {totalCurtidas} curtidas • {totalComentarios} comentários
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Comunidade</Text>
      <Text style={styles.subtitulo}>
        Conecte-se com mães, pais e profissionais
      </Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={aba === "feed" ? styles.tabActive : styles.tab}
          onPress={() => setAba("feed")}
        >
          <Text style={aba === "feed" ? styles.tabTextActive : styles.tabText}>
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={aba === "profissionais" ? styles.tabActive : styles.tab}
          onPress={() => setAba("profissionais")}
        >
          <Text
            style={
              aba === "profissionais" ? styles.tabTextActive : styles.tabText
            }
          >
            Profissionais
          </Text>
        </TouchableOpacity>
      </View>

      {aba === "feed" && (
        <>
          <TouchableOpacity
            style={styles.inputFake}
            onPress={() => setModalPost(true)}
          >
            <View style={styles.inputFakeContent}>
              <View style={styles.avatarFake} />
              <Text style={styles.inputFakeText}>
                Compartilhe algo com a comunidade...
              </Text>
            </View>
          </TouchableOpacity>

          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {aba === "profissionais" && (
        <View style={styles.card}>
          <Text style={styles.nome}>Pediatra</Text>
          <Text style={styles.nome}>Psicóloga</Text>
          <Text style={styles.nome}>Consultora de amamentação</Text>
        </View>
      )}

      {/* MODAL CRIAR POST */}
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
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Publicar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => {
                setTextoPost("");
                setModalPost(false);
              }}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL COMENTÁRIOS */}
      <Modal visible={modalComentario} animationType="slide">
        <View style={[styles.container, { paddingTop: 20 }]}>
          <Text style={[styles.titulo, { marginBottom: 15 }]}>Comentários</Text>

          <FlatList
            data={comentarios}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={{ marginTop: 5 }}>{item.texto}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: "#fff", textAlign: "center" }}>
                Seja o primeiro a comentar!
              </Text>
            }
          />

          <View style={{ marginBottom: 20 }}>
            <TextInput
              placeholder="Escreva um comentário..."
              value={textoComentario}
              onChangeText={setTextoComentario}
              style={[styles.input, { height: 60 }]}
            />
            <TouchableOpacity style={styles.botao} onPress={enviarComentario}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalComentario(false)}>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 15,
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL OPÇÕES */}
      <Modal visible={modalOpcoes} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            {postOpcoes?.userId === userIdLogado ? (
              <TouchableOpacity
                style={[styles.botao, { backgroundColor: "#ff4d6d" }]}
                onPress={deletarPost}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Apagar publicação
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.botao, { backgroundColor: "#ff9800" }]}
                onPress={denunciarPost}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Denunciar
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => setModalOpcoes(false)}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
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
    backgroundColor: "#7050B3",
  },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitulo: { color: "#e1ceea", marginBottom: 15 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  tab: { flex: 1, padding: 10, alignItems: "center" },
  tabActive: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: { color: "#fff" },
  tabTextActive: { color: "#28174cca", fontWeight: "bold" },
  inputFake: {
    backgroundColor: "#ece3ff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
  },
  inputFakeContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarFake: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#ddd",
  },
  inputFakeText: { color: "#777", fontSize: 14 },
  card: {
    backgroundColor: "#ece3ff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ccc" },
  nome: { fontWeight: "bold", color: "#333" },
  tipo: { fontSize: 12, color: "#777" },
  texto: { marginVertical: 10, color: "#444" },
  acoes: { flexDirection: "row", gap: 15 },
  likes: { marginTop: 5, color: "#555" },
  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000000aa",
    padding: 20,
  },
  modalBox: { backgroundColor: "#fff", padding: 20, borderRadius: 16 },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#28174c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    height: 120,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  botao: {
    backgroundColor: "#C642A6",
    padding: 15,
    marginTop: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  botaoCancelar: { marginTop: 15, padding: 10, alignItems: "center" },
  textoCancelar: { color: "#C642A6", fontWeight: "bold" },
});
