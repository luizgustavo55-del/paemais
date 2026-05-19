import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Nomes() {
  const [nomes, setNomes] = useState<any[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<"sugestoes" | "favoritos">("sugestoes");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
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
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  async function favoritar(nome: string) {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert("Erro", "Usuário não autenticado");
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
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  }

  const nomesFiltrados = nomes.filter((item) => {
    const nomeMatch = item.nome.toLowerCase().includes(busca.toLowerCase());
    const abaMatch = aba === "sugestoes" ? true : favoritos.includes(item.nome);
    return nomeMatch && abaMatch;
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
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={
            aba === "sugestoes"
              ? [
                  styles.filterBtnActive,
                  { backgroundColor: theme.colors.quaternary },
                ]
              : styles.filterBtn
          }
          onPress={() => setAba("sugestoes")}
        >
          <Text
            style={
              aba === "sugestoes"
                ? styles.filterTextActive
                : {
                    color: theme.colors.subtitle,
                    fontSize: theme.texts.subtitle,
                  }
            }
          >
            Sugestões
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            aba === "favoritos"
              ? [
                  styles.filterBtnActive,
                  { backgroundColor: theme.colors.secondary },
                ]
              : styles.filterBtn
          }
          onPress={() => setAba("favoritos")}
        >
          <Text
            style={
              aba === "favoritos"
                ? styles.filterTextActive
                : {
                    color: theme.colors.subtitle,
                    fontSize: theme.texts.subtitle,
                  }
            }
          >
            Favoritos ({favoritos.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={nomesFiltrados}
        keyExtractor={(item) => String(item.nome)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
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
                  backgroundColor:
                    item.genero === "F"
                      ? theme.colors.terceary
                      : theme.colors.quaternary,
                },
              ]}
            >
              <Text
                style={[
                  styles.genderTagText,
                  { color: item.genero === "F" ? "#D81B60" : "#2196F3" },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 18,

    backgroundColor: "#FFF7FB",
  },

  searchBar: {
    flexDirection: "row",

    backgroundColor: "#ffe5f2",

    paddingVertical: 13,
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

    fontSize: 15,

    color: "#8D3E67",
  },

  filterContainer: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 18,

    gap: 10,
  },

  filterBtnActive: {
    flex: 1,

    paddingVertical: 13,

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

    elevation: 2,
  },

  filterBtn: {
    flex: 1,

    paddingVertical: 13,

    alignItems: "center",

    borderRadius: 14,

    backgroundColor: "#f397bd",

    marginHorizontal: 2,

    borderWidth: 1,

    borderColor: "#F5D3E3",
  },

  filterTextActive: {
    color: "#FFF",

    fontSize: 15,

    fontWeight: "700",
  },

  card: {
    backgroundColor: "#f5a8cf",

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
    fontSize: 21,

    fontWeight: "700",

    color: "#8D3E67",
  },

  genderTag: {
    alignSelf: "flex-start",

    paddingHorizontal: 12,

    paddingVertical: 5,

    borderRadius: 12,

    marginTop: 8,

    backgroundColor: "#f8a6ce",
  },

  genderTagText: {
    fontSize: 13,

    fontWeight: "700",

    color: "#91486F",
  },

  infoText: {
    color: "#8E7180",

    marginBottom: 6,

    fontSize: 14,

    lineHeight: 22,
  },

  bold: {
    fontWeight: "700",

    color: "#8D3E67",
  },
});
