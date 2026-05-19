import { theme } from "@/src/constants/theme";
import { auth, db, firestore } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { get, ref } from "firebase/database";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
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

export default function Comunidade() {
  const [aba, setAba] = useState("feed");
  const [userIdLogado, setUserIdLogado] = useState<string | null>(null);
  const [nomeLogado, setNomeLogado] = useState<string>("Membro");
  const [tipoLogado, setTipoLogado] = useState<string>("Membro");

  const [posts, setPosts] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<any[]>([]);

  const [modalPost, setModalPost] = useState(false);
  const [modalComentario, setModalComentario] = useState(false);
  const [modalOpcoes, setModalOpcoes] = useState(false);

  const [textoPost, setTextoPost] = useState("");
  const [textoComentario, setTextoComentario] = useState("");
  const [visibilidadePost, setVisibilidadePost] = useState<"todos" | "grupo">(
    "todos",
  );

  const [postSelecionado, setPostSelecionado] = useState<any>(null);
  const [postOpcoes, setPostOpcoes] = useState<any>(null);

  useEffect(() => {
    const inicializar = async () => {
      const user = auth.currentUser;
      let tipoAtual = "pai";

      if (user) {
        setUserIdLogado(user.uid);
        const userRef = ref(db, `usuarios/${user.uid}`);

        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const dados = snapshot.val();
          setNomeLogado(dados.nome || "Pais/Mães");
          tipoAtual = dados.tipo || "pai";
          setTipoLogado(tipoAtual);
        }
      }
      carregarPosts(tipoAtual);
    };

    inicializar();
  }, []);

  useEffect(() => {
    if (modalComentario) {
      carregarComentarios();
    }
  }, [postSelecionado, modalComentario]);

  const carregarPosts = async (tipoUsuarioAtual: string = tipoLogado) => {
    try {
      const q = query(
        collection(firestore, "comunidade"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);

      const lista = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((post: any) => {
          if (post.visibilidade === "grupo") {
            return post.tipoAutor === tipoUsuarioAtual;
          }
          return true;
        });

      setPosts(lista);
    } catch (error) {
      console.log(error);
    }
  };

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
      console.log(error);
    }
  };

  const toggleLike = async (post: any, scale: Animated.Value) => {
    if (!userIdLogado) return;
    try {
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
      carregarPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const publicar = async () => {
    if (!textoPost.trim() || !userIdLogado) return;

    try {
      const novoPost = {
        userId: userIdLogado,
        nome: nomeLogado,
        tipoAutor: tipoLogado,
        texto: textoPost,
        visibilidade: visibilidadePost,
        likes: [],
        totalComentarios: 0,
        createdAt: Date.now(),
      };

      await addDoc(collection(firestore, "comunidade"), novoPost);

      setModalPost(false);
      setTextoPost("");
      setVisibilidadePost("todos");
      carregarPosts();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível publicar.");
    }
  };

  const enviarComentario = async () => {
    if (!textoComentario.trim() || !postSelecionado || !userIdLogado) return;

    try {
      const novoComentario = {
        userId: userIdLogado,
        nome: nomeLogado,
        texto: textoComentario,
        createdAt: Date.now(),
      };

      await addDoc(
        collection(firestore, "comunidade", postSelecionado.id, "comentarios"),
        novoComentario,
      );

      const postRef = doc(firestore, "comunidade", postSelecionado.id);
      await updateDoc(postRef, {
        totalComentarios: (postSelecionado.totalComentarios || 0) + 1,
      });

      setTextoComentario("");
      carregarComentarios();
      carregarPosts();
    } catch (error) {
      console.log(error);
    }
  };

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
      console.log(error);
    }
  };

  const deletarPost = async () => {
    if (!postOpcoes) return;
    try {
      await deleteDoc(doc(firestore, "comunidade", postOpcoes.id));
      setModalOpcoes(false);
      carregarPosts();
    } catch (error) {
      console.log(error);
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
              <Text style={styles.tipo}>{item.tipoAutor || "Membro"}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setPostOpcoes(item);
              setModalOpcoes(true);
            }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={theme.colors.subtitle}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.texto}>{item.texto}</Text>

        <View style={styles.acoes}>
          <TouchableOpacity onPress={() => toggleLike(item, scale)}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={26}
                color={liked ? theme.colors.primary : theme.colors.subtitle}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setPostSelecionado(item);
              setModalComentario(true);
            }}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={theme.colors.subtitle}
            />
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

      <Modal visible={modalPost} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Criar publicação</Text>

            <TextInput
              placeholder="O que você quer compartilhar?"
              placeholderTextColor={theme.colors.subtitle}
              multiline
              value={textoPost}
              onChangeText={setTextoPost}
              style={styles.input}
            />

            <Text style={styles.labelVisibilidade}>Quem pode ver isso?</Text>
            <View style={styles.rowVisibilidade}>
              <TouchableOpacity
                style={[
                  styles.btnVisibilidade,
                  visibilidadePost === "todos" && styles.btnVisibilidadeAtivo,
                ]}
                onPress={() => setVisibilidadePost("todos")}
              >
                <Text
                  style={[
                    styles.txtVisibilidade,
                    visibilidadePost === "todos" && styles.txtVisibilidadeAtivo,
                  ]}
                >
                  Todos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnVisibilidade,
                  visibilidadePost === "grupo" && styles.btnVisibilidadeAtivo,
                ]}
                onPress={() => setVisibilidadePost("grupo")}
              >
                <Text
                  style={[
                    styles.txtVisibilidade,
                    visibilidadePost === "grupo" && styles.txtVisibilidadeAtivo,
                  ]}
                >
                  Apenas meu grupo
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.botao} onPress={publicar}>
              <Text style={styles.textoBotaoBranco}>Publicar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => {
                setTextoPost("");
                setVisibilidadePost("todos");
                setModalPost(false);
              }}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalComentario} animationType="slide">
        <View style={[styles.container, { paddingTop: 20 }]}>
          <Text style={[styles.titulo, { marginBottom: 15 }]}>Comentários</Text>

          <FlatList
            data={comentarios}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.textoComentarioRender}>{item.texto}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.textoVazio}>Seja o primeiro a comentar!</Text>
            }
          />

          <View style={{ marginBottom: 20 }}>
            <TextInput
              placeholder="Escreva um comentário..."
              placeholderTextColor={theme.colors.subtitle}
              value={textoComentario}
              onChangeText={setTextoComentario}
              style={[styles.input, { height: 60 }]}
            />
            <TouchableOpacity style={styles.botao} onPress={enviarComentario}>
              <Text style={styles.textoBotaoBranco}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalComentario(false)}>
              <Text style={styles.textoBotaoFechar}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalOpcoes} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            {postOpcoes?.userId === userIdLogado ? (
              <TouchableOpacity
                style={[
                  styles.botao,
                  { backgroundColor: theme.colors.textPrimary },
                ]}
                onPress={deletarPost}
              >
                <Text style={styles.textoBotaoBranco}>Apagar publicação</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.botao,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={denunciarPost}
              >
                <Text style={styles.textoBotaoBranco}>Denunciar</Text>
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
    backgroundColor: "#7050b3",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitulo: {
    color: "#ece3ff",
    marginBottom: 18,
    marginTop: 4,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabActive: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },

  tabText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  tabTextActive: {
    color: "#28174c",
    fontWeight: "bold",
    fontSize: 12,
  },

  inputFake: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
  },

  inputFakeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatarFake: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#ece3ff",
  },

  inputFakeText: {
    color: "#777",
    fontSize: 13,
  },

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

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
  },

  nome: {
    fontWeight: "bold",
    color: "#28174c",
    fontSize: 16,
  },

  tipo: {
    fontSize: 12,
    color: "#555",
    textTransform: "capitalize",
  },

  texto: {
    marginVertical: 10,
    color: "#28174c",
    fontSize: 14,
  },

  textoComentarioRender: {
    marginTop: 5,
    color: "#28174c",
    fontSize: 13,
  },

  acoes: {
    flexDirection: "row",
    gap: 15,
  },

  likes: {
    marginTop: 5,
    color: "#777",
    fontSize: 12,
  },

  modal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },

  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#28174c",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ece3ff",
    padding: 15,
    borderRadius: 10,
    height: 120,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    fontSize: 14,
    color: "#28174c",
  },

  labelVisibilidade: {
    marginTop: 15,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  rowVisibilidade: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  btnVisibilidade: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ece3ff",
    alignItems: "center",
  },

  btnVisibilidadeAtivo: {
    borderColor: "#7050b3",
    backgroundColor: "#ece3ff",
  },

  txtVisibilidade: {
    color: "#555",
    fontSize: 12,
  },

  txtVisibilidadeAtivo: {
    color: "#7050b3",
    fontWeight: "bold",
    fontSize: 12,
  },

  botao: {
    backgroundColor: "#7050b3",
    padding: 15,
    marginTop: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  textoBotaoBranco: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  botaoCancelar: {
    marginTop: 15,
    padding: 10,
    alignItems: "center",
  },

  textoCancelar: {
    color: "#7050b3",
    fontWeight: "bold",
    fontSize: 14,
  },

  textoBotaoFechar: {
    textAlign: "center",
    marginTop: 15,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  textoVazio: {
    color: "#fff",
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },
});