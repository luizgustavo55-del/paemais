import { theme } from "@/src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 🔥 IMPORTS DO FIREBASE
import { auth, firestore } from "@/src/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

interface ItemEnxoval {
  id: string;
  nome: string;
  marcado: boolean;
}

export default function EnxovalScreen() {
  const router = useRouter();

  const [itens, setItens] = useState<ItemEnxoval[]>([]);
  const [novoItemNome, setNovoItemNome] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        const enxovalRef = collection(
          firestore,
          "usuarios",
          user.uid,
          "enxoval",
        );

        const unsubscribeSnapshot = onSnapshot(enxovalRef, (snapshot) => {
          // Agora apenas lê os dados, ninguém começa com lista pronta
          const listaEnxoval = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ItemEnxoval[];

          listaEnxoval.sort((a, b) => a.nome.localeCompare(b.nome));
          setItens(listaEnxoval);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUserId(null);
        setItens([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const alternarItem = async (item: ItemEnxoval) => {
    if (!userId) return;
    try {
      const itemRef = doc(firestore, "usuarios", userId, "enxoval", item.id);
      await setDoc(
        itemRef,
        { ...item, marcado: !item.marcado },
        { merge: true },
      );
    } catch (error) {
      console.log("Erro ao alternar item", error);
    }
  };

  const adicionarItem = async () => {
    const nomeFormatado = novoItemNome.trim();
    if (!userId || nomeFormatado === "") return;

    const novo: ItemEnxoval = {
      id: nomeFormatado,
      nome: nomeFormatado,
      marcado: false,
    };

    try {
      const itemRef = doc(
        firestore,
        "usuarios",
        userId,
        "enxoval",
        nomeFormatado,
      );
      await setDoc(itemRef, novo);
      setNovoItemNome("");
    } catch (error) {
      console.log("Erro ao adicionar item", error);
    }
  };

  const confirmarExclusao = (id: string, nome: string) => {
    if (Platform.OS === "web") {
      const confirmou = window.confirm(
        `Deseja apagar "${nome}"? (OK = Apagar este / Cancelar = Opções de apagar tudo)`,
      );
      if (confirmou) {
        apagarItem(id);
      } else {
        const confirmouTudo = window.confirm(
          "Atenção: Deseja apagar TODOS os itens do seu enxoval?",
        );
        if (confirmouTudo) apagarTudo();
      }
    } else {
      Alert.alert("Opções de Exclusão", `O que deseja fazer com "${nome}"?`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar apenas este", onPress: () => apagarItem(id) },
        // 🔥 Nova opção para apagar tudo!
        {
          text: "Apagar TUDO",
          style: "destructive",
          onPress: confirmarApagarTudo,
        },
      ]);
    }
  };

  const apagarItem = async (idParaApagar: string) => {
    if (!userId) return;
    try {
      const itemRef = doc(
        firestore,
        "usuarios",
        userId,
        "enxoval",
        idParaApagar,
      );
      await deleteDoc(itemRef);
    } catch (error) {
      console.log("Erro ao apagar item", error);
    }
  };

  const confirmarApagarTudo = () => {
    Alert.alert(
      "Apagar Tudo?",
      "Tem certeza que deseja limpar toda a sua lista de enxoval? Isso não pode ser desfeito.",
      [
        { text: "Não, cancelar", style: "cancel" },
        {
          text: "Sim, limpar lista",
          style: "destructive",
          onPress: apagarTudo,
        },
      ],
    );
  };

  const apagarTudo = async () => {
    if (!userId) return;
    try {
      // Loop para apagar cada documento da coleção do usuário
      for (const item of itens) {
        const itemRef = doc(firestore, "usuarios", userId, "enxoval", item.id);
        await deleteDoc(itemRef);
      }
    } catch (error) {
      console.log("Erro ao apagar tudo", error);
    }
  };

  const totalItens = itens.length;
  const itensMarcados = itens.filter((i) => i.marcado).length;
  const progressoPorcentagem =
    totalItens === 0 ? 0 : (itensMarcados / totalItens) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/gestacao")}
          style={styles.headerLeft}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={theme.colors.texts}
          />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Enxoval</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.tituloSecao}>Checklist do Enxoval</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Adicionar item..."
              placeholderTextColor={theme.colors.subtitle}
              value={novoItemNome}
              onChangeText={setNovoItemNome}
              onSubmitEditing={adicionarItem}
            />
            <TouchableOpacity
              onPress={adicionarItem}
              activeOpacity={0.8}
              style={styles.addButton}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={itens}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.subtitle,
                  marginTop: 20,
                }}
              >
                Nenhum item adicionado ainda.
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => alternarItem(item)}
                onLongPress={() => confirmarExclusao(item.id, item.nome)}
                style={[
                  styles.itemCard,
                  item.marcado && styles.itemCardMarcado,
                ]}
              >
                <View style={styles.itemLeft}>
                  <View
                    style={[
                      styles.checkbox,
                      item.marcado && {
                        backgroundColor: theme.colors.cards,
                        borderColor: theme.colors.cards,
                      },
                    ]}
                  >
                    {item.marcado && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#FFF"
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.itemTexto,
                      item.marcado && styles.itemTextoMarcado,
                    ]}
                  >
                    {item.nome}
                  </Text>
                </View>

                {item.marcado && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={theme.colors.cards}
                  />
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>Progresso</Text>
              <Text style={styles.progressValue}>
                {itensMarcados}/{totalItens}
              </Text>
            </View>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressoPorcentagem}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: theme.colors.background,
  },
  headerLeft: { width: 40, alignItems: "flex-start" },
  headerRight: { width: 40, alignItems: "flex-end" },
  tituloHeader: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.texts,
  },

  content: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.terceary,
    margin: 15,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  tituloSecao: {
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
    color: theme.colors.title,
    marginBottom: 15,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 15,
    fontSize: theme.texts.text,
    color: theme.colors.title,
  },
  addButton: {
    borderRadius: 12,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: theme.colors.cards,
  },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  itemCardMarcado: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.cards,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  itemTexto: { fontSize: theme.texts.text, color: theme.colors.title, flex: 1 },
  itemTextoMarcado: {
    color: theme.colors.subtitle,
    textDecorationLine: "line-through",
  },

  progressContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: theme.texts.text,
    fontWeight: "600",
    color: theme.colors.title,
  },
  progressValue: {
    fontSize: theme.texts.text,
    fontWeight: "bold",
    color: theme.colors.cards,
  },

  progressBarBackground: {
    height: 12,
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: theme.colors.cards,
  },
});
