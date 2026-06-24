import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface EntradaDiario {
  id: string | number;
  titulo: string;
  data: string;
  hora: string;
  texto: string;
  userId: string | null;
  ultimaEdicao?: string;
}

export default function DiarioScreen() {
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;
  const styles = getStyles(theme, isModoCompacto);

  const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modoExclusao, setModoExclusao] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [idEditando, setIdEditando] = useState<string | number | null>(null);
  const [tituloAtual, setTituloAtual] = useState("");
  const [textoAtual, setTextoAtual] = useState("");

  useFocusEffect(
    useCallback(() => {
      carregarDiario();
    }, []),
  );

  const carregarDiario = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dados = userSnap.data();
        if (dados.diario) {
          setEntradas(dados.diario);
        }
      }
    } catch (e) {
      console.log("Erro ao carregar diário", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDiario();
    setRefreshing(false);
  };

  const abrirNovaEntrada = () => {
    setIdEditando(null);
    setTituloAtual("");
    setTextoAtual("");
    setModalVisivel(true);
  };

  const abrirParaVer = (item: EntradaDiario) => {
    setIdEditando(item.id);
    setTituloAtual(item.titulo || "");
    setTextoAtual(item.texto);
    setModalVisivel(true);
  };

  const salvarEntrada = async () => {
    if (textoAtual.trim() === "") {
      if (Platform.OS === "web") {
        window.alert("Atenção: O conteúdo do diário não pode estar vazio!");
      } else {
        Alert.alert("Atenção", "O conteúdo do diário não pode estar vazio!");
      }
      return;
    }

    const dataAtual = new Date();
    const dataStr = dataAtual.toLocaleDateString("pt-BR");
    const horaStr = dataAtual.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let novasEntradas = [];
    const currentUser = auth.currentUser;

    if (idEditando) {
      novasEntradas = entradas.map((e) => {
        if (String(e.id) === String(idEditando)) {
          return {
            ...e,
            titulo: tituloAtual.trim() || "Sem Título",
            texto: textoAtual.trim(),
            ultimaEdicao: `${dataStr} às ${horaStr}`,
          };
        }
        return e;
      });
    } else {
      const novaEntrada: EntradaDiario = {
        id: Date.now().toString(),
        titulo: tituloAtual.trim() || "Sem Título",
        data: dataStr,
        hora: horaStr,
        texto: textoAtual.trim(),
        ultimaEdicao: `${dataStr} às ${horaStr}`,
        userId: currentUser ? currentUser.uid : null,
      };
      novasEntradas = [novaEntrada, ...entradas];
    }

    setEntradas(novasEntradas);

    try {
      if (currentUser) {
        const userRef = doc(firestore, "usuarios", currentUser.uid);
        await updateDoc(userRef, { diario: novasEntradas });
      }
      setModalVisivel(false);
    } catch (error) {
      if (Platform.OS === "web") {
        window.alert("Erro: Não foi possível guardar o seu diário.");
      } else {
        Alert.alert("Erro", "Não foi possível guardar o seu diário.");
      }
    }
  };

  const confirmarExclusaoItem = (id: string | number) => {
    if (Platform.OS === "web") {
      const confirmou = window.confirm(
        "Tem a certeza que deseja apagar esta entrada?",
      );
      if (confirmou) {
        apagarEntrada(id);
      }
    } else {
      Alert.alert(
        "Apagar Página",
        "Tem a certeza que deseja apagar esta entrada?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Apagar",
            style: "destructive",
            onPress: () => apagarEntrada(id),
          },
        ],
      );
    }
  };

  const apagarEntrada = async (idParaApagar: string | number) => {
    try {
      const novasEntradas = entradas.filter(
        (e) => String(e.id) !== String(idParaApagar),
      );
      setEntradas(novasEntradas);

      if (novasEntradas.length === 0) {
        setModoExclusao(false);
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(firestore, "usuarios", currentUser.uid);
        await updateDoc(userRef, { diario: novasEntradas });
      }
    } catch (error) {
      console.log("Erro ao apagar: ", error);
    }
  };

  const confirmarApagarTodos = () => {
    if (entradas.length === 0) return;

    if (Platform.OS === "web") {
      const confirmou = window.confirm(
        "Tem a certeza que deseja APAGAR TODAS as entradas? Esta ação não pode ser desfeita.",
      );
      if (confirmou) {
        apagarTodos();
      }
    } else {
      Alert.alert(
        "Limpar Diário",
        "Tem a certeza que deseja APAGAR TODAS as entradas? Esta ação não pode ser desfeita.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim, apagar tudo",
            style: "destructive",
            onPress: apagarTodos,
          },
        ],
      );
    }
  };

  const apagarTodos = async () => {
    try {
      setEntradas([]);
      setModoExclusao(false);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(firestore, "usuarios", currentUser.uid);
        await updateDoc(userRef, { diario: [] });
      }
    } catch (error) {
      console.log("Erro ao limpar tudo: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloHeader}>
          {modoExclusao ? "Excluir" : "Meu Diário"}
        </Text>

        <TouchableOpacity
          onPress={confirmarApagarTodos}
          style={styles.apagar}
          disabled={entradas.length === 0 || !modoExclusao}
        >
          {entradas.length > 0 && modoExclusao && (
            <MaterialCommunityIcons
              name="delete-sweep-outline"
              size={isModoCompacto ? 24 : 28}
              color="#e11d48"
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList
          data={entradas}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: isModoCompacto ? 20 : 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.gestantesPrimary]}
              tintColor={theme.colors.gestantesPrimary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="book-heart-outline"
                size={isModoCompacto ? 50 : 70}
                color={theme.colors.gestantesSecondary}
              />
              <Text style={styles.emptyText}>O seu diário está vazio.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[styles.card, modoExclusao && { borderColor: "#fca5a5" }]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  modoExclusao ? setModoExclusao(false) : abrirParaVer(item)
                }
                onLongPress={() => setModoExclusao(true)}
                delayLongPress={500}
                style={styles.cardInfo}
              >
                <Text style={styles.cardTitulo} numberOfLines={1}>
                  {item.titulo}
                </Text>

                <View style={styles.dataContainer}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color="#64748B"
                  />
                  <Text style={styles.cardData}>
                    {" "}
                    Atualizado em{" "}
                    {item.ultimaEdicao || `${item.data} às ${item.hora}`}
                  </Text>
                </View>
              </TouchableOpacity>

              {modoExclusao && (
                <TouchableOpacity
                  onPress={() => confirmarExclusaoItem(item.id)}
                  style={styles.lixeira}
                  hitSlop={{ top: 20, bottom: 20, left: 15, right: 15 }}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={isModoCompacto ? 22 : 26}
                    color="#EF4444"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        />

        {!modoExclusao && (
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={abrirNovaEntrada}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Escrever</Text>

              <MaterialCommunityIcons
                name="fountain-pen-tip"
                size={isModoCompacto ? 16 : 18}
                color={theme.colors.text}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {idEditando ? "Página do Diário" : "Nova Página"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.inputTitulo}
              placeholder="Título"
              placeholderTextColor="#94A3B8"
              value={tituloAtual}
              onChangeText={setTituloAtual}
              maxLength={50}
            />

            <TextInput
              style={styles.inputArea}
              placeholder="Escreva sobre o seu dia"
              placeholderTextColor="#94A3B8"
              multiline
              autoFocus={!idEditando}
              textAlignVertical="top"
              value={textoAtual}
              onChangeText={setTextoAtual}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={salvarEntrada}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {idEditando ? "Atualizar" : "Salvar"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    header: {
      width: "100%",
      height: isModoCompacto ? 45 : 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: isModoCompacto ? 10 : 0,
    },
    headerLeft: { width: 40, alignItems: "flex-start" },
    apagar: {
      position: "absolute",
      right: 20,
      top: isModoCompacto ? 8 : 10,
    },
    tituloHeader: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.gestantesPrimary,
    },
    content: { flex: 1, padding: isModoCompacto ? 16 : 20 },
    button: {
      backgroundColor: theme.colors.gestantesPrimary,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      height: isModoCompacto ? 50 : 60,
      borderRadius: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    buttonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: theme.texts.text,
    },
    emptyCard: {
      backgroundColor: "#FFF",
      borderRadius: 16,
      padding: isModoCompacto ? 25 : 40,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#e2e8f0",
      marginTop: isModoCompacto ? 10 : 20,
    },
    emptyText: {
      marginTop: 15,
      color: theme.colors.title,
      fontSize: theme.texts.text,
      textAlign: "center",
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
      paddingVertical: isModoCompacto ? 10 : 12,
      paddingHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
    cardInfo: { flex: 1, paddingRight: 15 },
    cardTitulo: {
      fontWeight: "bold",
      color: theme.colors.gestantesSecondary,
      fontSize: theme.texts.subtitle,
      marginBottom: 6,
    },
    dataContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    cardData: {
      color: theme.colors.subtitle,
      fontSize: theme.texts.text,
    },
    lixeira: { padding: 5, justifyContent: "center", alignItems: "center" },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: "#fff",
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: isModoCompacto ? 20 : 25,
      height: isModoCompacto ? "95%" : "85%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isModoCompacto ? 14 : 20,
    },
    modalTitulo: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.gestantesPrimary,
    },
    inputTitulo: {
      backgroundColor: "#f8fafc",
      borderRadius: 12,
      padding: isModoCompacto ? 12 : 15,
      fontSize: theme.texts.title,
      color: theme.colors.title,
      marginBottom: isModoCompacto ? 10 : 15,
      fontWeight: "bold",
    },
    inputArea: {
      flex: 1,
      backgroundColor: "#f8fafc",
      borderRadius: 16,
      padding: isModoCompacto ? 16 : 20,
      fontSize: theme.texts.text,
      color: theme.colors.title,
      marginBottom: isModoCompacto ? 14 : 20,
    },
  });
