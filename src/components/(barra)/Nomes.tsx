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
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: theme.texts.text,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  filterBtnActive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: theme.colors.terceary,
    marginHorizontal: 5,
  },
  filterTextActive: {
    color: theme.colors.texts,
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: theme.colors.cards,
    padding: 16,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  nameText: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: "#333",
  },
  genderTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  genderTagText: {
    fontSize: theme.texts.text,
    fontWeight: "bold",
  },
  infoText: {
    color: theme.colors.texts,
    marginBottom: 4,
    fontSize: theme.texts.text,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
    color: "#333",
  },
});
