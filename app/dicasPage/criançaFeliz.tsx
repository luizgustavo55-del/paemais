import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TelaExemplo() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* 🔙 BOTÃO VOLTAR */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/(pai)/(tabs)/dicas" as any)} // volta pra tela Dicas
      >
        <Ionicons name="arrow-back" size={24} color="#C642A6" />
      </TouchableOpacity>

      {/* CONTEÚDO */}
      <Text style={styles.title}>Marco Legal da Primeira Infancia</Text>
      <Text style={styles.text}>
        Aqui vai o conteúdo da sua página.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 40,
  },

  text: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },
});