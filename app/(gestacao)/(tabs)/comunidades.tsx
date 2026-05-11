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
import { saveData, getData } from "@/src/services/database";
import { getCurrentUser } from "@/src/services/auth";

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
    getCurrentUser().then((user) => {
      if (user) setUserIdLogado(user.uid);
    });
    carregarPosts();
  }, []);

  useEffect(() => {
    carregarComentarios();
  }, [postSelecionado]);

  const carregarPosts = async () => {
    try {
      const userLogado = await getCurrentUser();
      if (!userLogado) return;

      const dbData = await getData(userLogado.uid);
      const postsData = dbData?.comunidade?.posts || {};

      const lista = Object.keys(postsData).map((key) => ({
        id: key,
        ...postsData[key]
      }));

      lista.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(lista);
    } catch (error) {}
  };

  const carregarComentarios = async () => {
    if (!postSelecionado) return;
    try {
      const userLogado = await getCurrentUser();
      if (!userLogado) return;

      const dbData = await getData(userLogado.uid);
      const comentariosData = dbData?.comunidade?.posts?.[postSelecionado.id]?.comentarios || {};

      const lista = Object.keys(comentariosData).map((key) => ({
        id: key,
        ...comentariosData[key]
      }));

      lista.sort((a: any, b: any) => a.createdAt - b.createdAt);
      setComentarios(lista);
    } catch (error) {}
  };

  const toggleLike = async (postId: string, scale: Animated.Value) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const dbData = await getData(user.uid) || {};
      
      if (!dbData.comunidade) dbData.comunidade = {};
      if (!dbData.comunidade.posts) dbData.comunidade.posts = {};
      if (!dbData.comunidade.posts[postId]) return;
      if (!dbData.comunidade.posts[postId].likes) dbData.comunidade.posts[postId].likes = {};

      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true })
      ]).start();

      if (dbData.comunidade.posts[postId].likes[user.uid]) {
        delete dbData.comunidade.posts[postId].likes[user.uid];
      } else {
        dbData.comunidade.posts[postId].likes[user.uid] = true;
      }

      await saveData(user.uid, dbData);
      carregarPosts();
    } catch (error) {}
  };

  const publicar = async () => {
    if (!textoPost.trim()) return;

    try {
      const userLogado = await getCurrentUser();
      if (!userLogado) return;

      const dbData = await getData(userLogado.uid) || {};
      
      const id = Date.now().toString();
      const novoPost = { 
        id, 
        userId: userLogado.uid,
        nome: userLogado.email ? userLogado.email.split('@')[0] : "Membro",
        texto: textoPost, 
        likes: {},
        comentarios: {},
        createdAt: Date.now()
      };

      const postsAntigos = dbData?.comunidade?.posts || {};
      const novosPosts = { ...postsAntigos, [id]: novoPost };

      await saveData(userLogado.uid, {
        ...dbData,
        comunidade: { 
          ...dbData.comunidade, 
          posts: novosPosts 
        }
      });

      setModalPost(false);
      setTextoPost("");
      carregarPosts(); 
    } catch (error) {}
  };

  const enviarComentario = async () => {
    if (!textoComentario.trim() || !postSelecionado) return;

    try {
      const user = await getCurrentUser();
      if (!user) return;
      
      const dbData = await getData(user.uid) || {};
      const postRef = dbData?.comunidade?.posts?.[postSelecionado.id];
      if (!postRef) return;

      if (!postRef.comentarios) postRef.comentarios = {};

      const nomeMock = user.email ? user.email.split('@')[0] : "Usuário";
      const newCommentId = "comentario_" + Date.now().toString();

      postRef.comentarios[newCommentId] = {
        userId: user.uid,
        nome: nomeMock,
        texto: textoComentario,
        createdAt: Date.now()
      };

      await saveData(user.uid, dbData);
      setTextoComentario("");
      carregarComentarios();
      carregarPosts();
    } catch (error) {}
  };

  const denunciarPost = async () => {
    if (!postOpcoes) return;
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const dbData = await getData(user.uid) || {};
      if (!dbData.denuncias) dbData.denuncias = {};

      const novaDenunciaId = "denuncia_" + Date.now().toString();

      dbData.denuncias[novaDenunciaId] = {
        postId: postOpcoes.id,
        denunciadoId: postOpcoes.userId,
        denuncianteId: user.uid,
        texto: postOpcoes.texto,
        createdAt: Date.now()
      };

      await saveData(user.uid, dbData);
      setModalOpcoes(false);
    } catch (error) {}
  };

  const deletarPost = async () => {
    if (!postOpcoes) return;
    try {
      const user = await getCurrentUser();
      if (!user) return;
      
      const dbData = await getData(user.uid);

      if (dbData?.comunidade?.posts?.[postOpcoes.id]) {
        delete dbData.comunidade.posts[postOpcoes.id];
        await saveData(user.uid, dbData);
        carregarPosts();
      }
      
      setModalOpcoes(false);
    } catch (error) {}
  };

  const renderPost = ({ item }: any) => {
    const scale = new Animated.Value(1);
    const liked = userIdLogado && item.likes && item.likes[userIdLogado];
    const totalComentarios = item.comentarios ? Object.keys(item.comentarios).length : 0;

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
          <TouchableOpacity onPress={() => toggleLike(item.id, scale)}>
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
          {item.likes ? Object.keys(item.likes).length : 0} curtidas • {totalComentarios} comentários
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
          <Text style={aba === "profissionais" ? styles.tabTextActive : styles.tabText}>
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
              multiline
              value={textoPost}
              onChangeText={setTextoPost}
              style={styles.input}
            />

            <TouchableOpacity style={styles.botao} onPress={publicar}>
              <Text style={{ color: "#fff" }}>Publicar</Text>
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

      <Modal visible={modalComentario} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.titulo}>Comentários</Text>

          <FlatList
            data={comentarios}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text>{item.texto}</Text>
              </View>
            )}
          />

          <TextInput
            placeholder="Escreva um comentário..."
            value={textoComentario}
            onChangeText={setTextoComentario}
            style={styles.input}
          />

          <TouchableOpacity style={styles.botao} onPress={enviarComentario}>
            <Text style={{ color: "#fff" }}>Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalComentario(false)}>
            <Text style={{ textAlign: "center", marginTop: 10, color: "#fff" }}>
              Fechar
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={modalOpcoes} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            {postOpcoes?.userId === userIdLogado ? (
              <TouchableOpacity style={styles.botao} onPress={deletarPost}>
                <Text style={{ color: "#fff" }}>Apagar publicação</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.botao} onPress={denunciarPost}>
                <Text style={{ color: "#fff" }}>Denunciar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setModalOpcoes(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>
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
    backgroundColor: "#7050B3"
  },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitulo: { color: "#e1ceea", marginBottom: 15 },
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
  tabTextActive: { color: "#28174cca", fontWeight: "bold" },
  inputFake: {
    backgroundColor: "#ece3ff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3
  },
  inputFakeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  avatarFake: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#ddd"
  },
  inputFakeText: {
    color: "#777",
    fontSize: 14
  },
  card: {
    backgroundColor: "#ece3ff",
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
    height: 120,
    backgroundColor: "#fff"
  },
  botao: {
    backgroundColor: "#C642A6",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    alignItems: "center"
  },
  botaoCancelar: {
    marginTop: 8,
    padding: 10,
    alignItems: "center"
  },
  textoCancelar: {
    color: "#C642A6",
    fontWeight: "bold"
  }
});
