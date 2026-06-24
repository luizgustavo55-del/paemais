import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Nomes() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [nomes, setNomes] = useState<any[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<"sugestoes" | "favoritos">("sugestoes");
  const [filtroGenero, setFiltroGenero] = useState<"todos" | "M" | "F">(
    "todos",
  );
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const resposta = await fetch(
        "https://raw.githubusercontent.com/Ander-sonx/Nomes/refs/heads/main/nomes.json",
      );
      const dadosNomes = await resposta.json();
      setNomes(dadosNomes);

      const uid = auth.currentUser?.uid;
      if (uid) {
        const userRef = doc(firestore, "usuarios", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().nomesFavoritos) {
          setFavoritos(userSnap.data().nomesFavoritos);
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os nomes.");
    }
  };

  useEffect(() => {
    carregarDados().finally(() => setCarregando(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  async function favoritar(nome: string) {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert("Erro", "Utilizador não autenticado");
      return;
    }

    let novaLista = [...favoritos];

    if (novaLista.includes(nome)) {
      novaLista = novaLista.filter((favNome) => favNome !== nome);
    } else {
      novaLista.push(nome);
    }

    setFavoritos(novaLista);

    try {
      const userRef = doc(firestore, "usuarios", uid);
      await updateDoc(userRef, { nomesFavoritos: novaLista });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível guardar.");
    }
  }

  const nomesFiltrados = nomes.filter((item) => {
    const nomeMatch = item.nome.toLowerCase().includes(busca.toLowerCase());
    const abaMatch = aba === "sugestoes" ? true : favoritos.includes(item.nome);
    const generoMatch =
      filtroGenero === "todos" ? true : item.genero === filtroGenero;

    return nomeMatch && abaMatch && generoMatch;
  });

  if (carregando) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={18} color="#BBB" />
        <TextInput
          placeholder="Buscar nomes"
          placeholderTextColor={theme.colors.subtitle}
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={
            aba === "sugestoes" ? styles.filterBtnActive : styles.filterBtn
          }
          onPress={() => setAba("sugestoes")}
        >
          <Text style={styles.filterTextActive}>Sugestões</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            aba === "favoritos" ? styles.filterBtnActive : styles.filterBtn
          }
          onPress={() => setAba("favoritos")}
        >
          <Text style={styles.filterTextActive}>
            Favoritos ({favoritos.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.genderFilterContainer}>
        <TouchableOpacity
          style={[
            styles.genderBtn,
            filtroGenero === "todos" && styles.genderBtnActive,
          ]}
          onPress={() => setFiltroGenero("todos")}
        >
          <Text
            style={[
              styles.genderBtnText,
              filtroGenero === "todos" && styles.genderBtnTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderBtn,
            filtroGenero === "F" && styles.genderBtnActiveF,
          ]}
          onPress={() => setFiltroGenero("F")}
        >
          <Text
            style={[
              styles.genderBtnText,
              filtroGenero === "F" && styles.genderBtnTextActiveF,
            ]}
          >
            Meninas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderBtn,
            filtroGenero === "M" && styles.genderBtnActiveM,
          ]}
          onPress={() => setFiltroGenero("M")}
        >
          <Text
            style={[
              styles.genderBtnText,
              filtroGenero === "M" && styles.genderBtnTextActiveM,
            ]}
          >
            Meninos
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={nomesFiltrados}
        keyExtractor={(item) => String(item.nome)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#C85C90", "#A855F7"]}
            tintColor="#C85C90"
          />
        }
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: "#666",
              fontSize: theme.texts.text,
            }}
          >
            Nenhum nome encontrado.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => favoritar(item.nome)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.nameText}>{item.nome}</Text>

              <MaterialCommunityIcons
                name={favoritos.includes(item.nome) ? "heart" : "heart-outline"}
                size={28}
                color={favoritos.includes(item.nome) ? "#D81B60" : "#BBB"}
              />
            </View>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Significado: </Text>
              {item.significado}
            </Text>

            <View
              style={[
                styles.genderTag,
                {
                  backgroundColor: item.genero === "F" ? "#ff7dc0" : "#2196F3",
                },
              ]}
            >
              <Text
                style={[
                  styles.genderTagText,
                  { color: item.genero === "F" ? "#D81B60" : "#5e61ee" },
                ]}
              >
                {item.genero === "F" ? "Feminino" : "Masculino"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 5,
    },
    searchBar: {
      flexDirection: "row",
      backgroundColor: "#ffe5f2",
      paddingVertical: 4,
      paddingHorizontal: 14,
      borderRadius: 18,
      alignItems: "center",
      marginBottom: 18,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowColor: "#A64D78",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },
    input: {
      marginLeft: 10,
      flex: 1,
      fontSize: theme.texts.text,
      color: theme.colors.title,
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 14,
      gap: 10,
    },
    filterBtnActive: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 14,
      marginHorizontal: 2,
      backgroundColor: "#C85C90",
      shadowColor: "#A64D78",
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
    filterBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 14,
      backgroundColor: "#f397bd",
      marginHorizontal: 2,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
    filterTextActive: {
      color: theme.colors.text,
      fontSize: theme.texts.text,
      fontWeight: "700",
    },
    genderFilterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 18,
      gap: 8,
    },
    genderBtn: {
      flex: 1,
      paddingVertical: 6,
      alignItems: "center",
      borderRadius: 10,
      backgroundColor: "#f0f0f0",
      borderWidth: 1,
      borderColor: "#ddd",
    },
    genderBtnActive: {
      backgroundColor: "#666",
      borderColor: "#555",
    },
    genderBtnActiveF: {
      backgroundColor: "#ff7dc0",
      borderColor: "#D81B60",
    },
    genderBtnActiveM: {
      backgroundColor: "#2196F3",
      borderColor: "#5e61ee",
    },
    genderBtnText: {
      fontSize: theme.texts.text,
      color: "#666",
      fontWeight: "600",
    },
    genderBtnTextActive: {
      color: "#fff",
    },
    genderBtnTextActiveF: {
      color: "#fff",
    },
    genderBtnTextActiveM: {
      color: "#fff",
    },
    card: {
      backgroundColor: theme.colors.gestantesCard,
      padding: 18,
      borderRadius: 22,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowColor: "#A64D78",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      justifyContent: "space-between",
    },
    nameText: {
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: theme.colors.gestantesPrimary,
    },
    genderTag: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      marginTop: 8,
    },
    genderTagText: {
      fontSize: theme.texts.text,
      fontWeight: "700",
    },
    infoText: {
      color: theme.colors.subtitle,
      marginBottom: 6,
      fontSize: theme.texts.text,
      lineHeight: 22,
    },
    bold: {
      fontWeight: "700",
      color: "#8D3E67",
    },
  });
