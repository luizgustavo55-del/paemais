import { View, Text, StyleSheet } from "react-native";

export default function Profissionais() {
  return (
    <View style={styles.card}>
      <Text style={styles.nome}>👩‍⚕️ Pediatra</Text>
      <Text style={styles.nome}>🧠 Psicóloga</Text>
      <Text style={styles.nome}>🍼 Consultora de amamentação</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F3F3F3",
    padding: 15,
    borderRadius: 15,
    margin: 20
  },

  nome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8
  }
});