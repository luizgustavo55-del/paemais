import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
  useWindowDimensions,
} from "react-native";

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
  const { theme } = useTheme();

  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;

  const styles = getStyles(theme, isModoCompacto);

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
      <StatusBar hidden={true} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerLeft}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={isModoCompacto ? 24 : 28}
            color={theme.colors.text}
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
              <MaterialCommunityIcons
                name="plus"
                size={isModoCompacto ? 22 : 24}
                color="#FFF"
              />
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
                  fontSize: theme.texts.text,
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
                        backgroundColor: theme.colors.gestantesCard,
                        borderColor: theme.colors.gestantesCard,
                      },
                    ]}
                  >
                    {item.marcado && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#4cb80df3"
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

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFF7FB",
    },
    header: {
      height: isModoCompacto ? 70 : 92,
      paddingTop: isModoCompacto ? 20 : 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      backgroundColor: theme.colors.gestantesPrimary,
      shadowColor: "#8E3D68",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    headerLeft: {
      width: isModoCompacto ? 34 : 40,
      height: isModoCompacto ? 34 : 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.20)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerRight: {
      width: isModoCompacto ? 34 : 40,
      height: isModoCompacto ? 34 : 40,
      backgroundColor: "transparent",
    },
    tituloHeader: {
      fontSize: isModoCompacto ? theme.texts.subtitle : theme.texts.title,
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },
    content: {
      flex: 1,
      padding: isModoCompacto ? 16 : 22,
      backgroundColor: "#FFF9FC",
      margin: isModoCompacto ? 12 : 18,
      borderRadius: 28,
      shadowColor: "#A64D78",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    tituloSecao: {
      fontSize: isModoCompacto ? theme.texts.text : theme.texts.subtitle,
      fontWeight: "700",
      color: "#793459",
      marginBottom: isModoCompacto ? 14 : 18,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isModoCompacto ? 16 : 22,
    },
    input: {
      flex: 1,
      backgroundColor: "#FDEAF2",
      borderWidth: 1,
      borderColor: "#F5D3E3",
      borderRadius: 16,
      padding: isModoCompacto ? 12 : 15,
      fontSize: theme.texts.text,
      color: theme.colors.title,
    },
    addButton: {
      borderRadius: 16,
      width: isModoCompacto ? 46 : 52,
      height: isModoCompacto ? 46 : 52,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 12,
      backgroundColor: theme.colors.gestantesPrimary,
      shadowColor: "#A64D78",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    itemCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FDEAF2",
      borderWidth: 1,
      borderColor: "#F5D3E3",
      borderRadius: 18,
      padding: isModoCompacto ? 12 : 16,
      marginBottom: isModoCompacto ? 10 : 14,
      shadowColor: "#A64D78",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    itemCardMarcado: {
      backgroundColor: "#F7DDE9",
      borderColor: "#E7BDD0",
      opacity: 0.8,
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    checkbox: {
      width: isModoCompacto ? 22 : 26,
      height: isModoCompacto ? 22 : 26,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.gestantesPrimary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
      backgroundColor: "#FFF6FA",
    },
    itemTexto: {
      fontSize: theme.texts.text,
      color: "#91486F",
      flex: 1,
      fontWeight: "500",
    },
    itemTextoMarcado: {
      color: "#B18A9D",
      textDecorationLine: "line-through",
    },
    progressContainer: {
      marginTop: isModoCompacto ? 12 : 18,
      paddingTop: isModoCompacto ? 12 : 18,
      borderTopWidth: 1,
      borderTopColor: "#F0D4E1",
    },
    progressTextRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    progressLabel: {
      fontSize: theme.texts.text,
      fontWeight: "600",
      color: "#91486F",
    },
    progressValue: {
      fontSize: theme.texts.text,
      fontWeight: "700",
      color: theme.colors.gestantesPrimary,
    },
    progressBarBackground: {
      height: 13,
      backgroundColor: "#F3DCE7",
      borderRadius: 12,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 12,
      backgroundColor: theme.colors.gestantesPrimary,
    },
  });
