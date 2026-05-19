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

import { theme } from "@/src/constants/theme";
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
      let tipoAtual = "Membro";

      if (user) {
        setUserIdLogado(user.uid);
        const userDoc = await getDoc(doc(firestore, "usuarios", user.uid));

        if (userDoc.exists()) {
          const dados = userDoc.data();
          setNomeLogado(dados.nome || "Membro");
          tipoAtual = dados.tipo || "Membro";
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

    backgroundColor: "#D46B9D",
  },

  titulo: {
    fontSize: 29,
    fontWeight: "700",

    color: "#FFF5FA",

    letterSpacing: 0.3,

    lineHeight: 36,
  },

  subtitulo: {
    fontSize: 15,

    color: "#FCE5F0",

    marginBottom: 18,
    marginTop: 6,

    lineHeight: 23,

    fontWeight: "400",

    letterSpacing: 0.2,
  },

  tabs: {
    flexDirection: "row",

    backgroundColor: "#C973A0",

    borderRadius: 18,

    padding: 5,

    marginBottom: 22,
  },

  tab: {
    flex: 1,

    paddingVertical: 11,

    alignItems: "center",

    borderRadius: 14,
  },

  tabActive: {
    flex: 1,

    paddingVertical: 11,

    backgroundColor: "#FFF4F9",

    borderRadius: 14,

    alignItems: "center",

    shadowColor: "#7B3057",
    shadowOpacity: 0.07,
    shadowRadius: 5,

    elevation: 2,
  },

  tabText: {
    fontSize: 14,

    color: "#FFF",

    fontWeight: "500",

    letterSpacing: 0.2,
  },

  tabTextActive: {
    fontSize: 14,

    color: "#973B69",

    fontWeight: "700",

    letterSpacing: 0.2,
  },

  inputFake: {
    backgroundColor: "#FFF3F8",

    padding: 15,

    borderRadius: 20,

    marginBottom: 16,

    elevation: 3,

    shadowColor: "#7B3057",
    shadowOpacity: 0.07,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  inputFakeContent: {
    flexDirection: "row",
    alignItems: "center",

    gap: 12,
  },

  avatarFake: {
    width: 38,
    height: 38,

    borderRadius: 22,

    backgroundColor: "#EDB5CF",
  },

  inputFakeText: {
    color: "#7A5568",

    fontSize: 15,

    fontWeight: "400",
  },

  card: {
    backgroundColor: "#F9D9E8",

    padding: 20,

    borderRadius: 24,

    marginBottom: 18,

    shadowColor: "#7B3057",
    shadowOpacity: 0.10,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  userRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 12,
  },

  avatar: {
    width: 42,
    height: 42,

    borderRadius: 24,

    backgroundColor: "#EDB5CF",
  },

  nome: {
    fontWeight: "700",

    color: "#8C3562",

    fontSize: 17,

    letterSpacing: 0.2,
  },

  tipo: {
    fontSize: 13,

    color: "#9B7185",

    textTransform: "capitalize",

    marginTop: 2,
  },

  texto: {
    marginVertical: 14,

    color: "#6D5060",

    fontSize: 15,

    lineHeight: 26,

    fontWeight: "400",
  },

  textoComentarioRender: {
    marginTop: 6,

    color: "#6D5060",

    fontSize: 14,

    lineHeight: 23,
  },

  acoes: {
    flexDirection: "row",

    gap: 20,

    marginTop: 6,
  },

  likes: {
    marginTop: 8,

    color: "#9B7185",

    fontSize: 13,
  },

  modal: {
    flex: 1,

    justifyContent: "center",

    backgroundColor: "rgba(0,0,0,0.45)",

    padding: 22,
  },

  modalBox: {
    backgroundColor: "#FFF8FC",

    padding: 24,

    borderRadius: 28,
  },

  modalTitulo: {
    fontSize: 24,

    fontWeight: "700",

    marginBottom: 16,

    color: "#8C3562",

    letterSpacing: 0.2,
  },

  input: {
    borderWidth: 1,

    borderColor: "#EDB5CF",

    padding: 16,

    borderRadius: 16,

    height: 120,

    backgroundColor: "#FFFFFF",

    textAlignVertical: "top",

    fontSize: 15,

    color: "#5E3A4D",

    lineHeight: 24,
  },

  labelVisibilidade: {
    marginTop: 16,
    marginBottom: 10,

    fontSize: 14,

    fontWeight: "600",

    color: "#8C3562",
  },

  rowVisibilidade: {
    flexDirection: "row",

    gap: 10,

    marginBottom: 12,
  },

  btnVisibilidade: {
    flex: 1,

    padding: 13,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#EDB5CF",

    alignItems: "center",

    backgroundColor: "#FFF8FC",
  },

  btnVisibilidadeAtivo: {
    borderColor: "#C54C86",

    backgroundColor: "#FFE5F0",
  },

  txtVisibilidade: {
    color: "#8F6779",

    fontSize: 13,

    fontWeight: "500",
  },

  txtVisibilidadeAtivo: {
    color: "#8C3562",

    fontWeight: "700",

    fontSize: 13,
  },

  botao: {
    backgroundColor: "#C54C86",

    padding: 16,

    marginTop: 16,

    borderRadius: 16,

    alignItems: "center",

    shadowColor: "#7B3057",
    shadowOpacity: 0.15,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  textoBotaoBranco: {
    color: "#FFFFFF",

    fontWeight: "700",

    fontSize: 15,

    letterSpacing: 0.2,
  },

  botaoCancelar: {
    marginTop: 15,

    padding: 10,

    alignItems: "center",
  },

  textoCancelar: {
    color: "#C54C86",

    fontWeight: "600",

    fontSize: 14,
  },

  textoBotaoFechar: {
    textAlign: "center",

    marginTop: 16,

    color: "#FFFFFF",

    fontWeight: "700",

    fontSize: 15,
  },

  textoVazio: {
    color: "#FFF0F7",

    textAlign: "center",

    marginVertical: 24,

    fontSize: 15,

    lineHeight: 24,
  },
});