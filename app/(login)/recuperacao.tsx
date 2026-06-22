import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { theme } from "@/src/constants/theme";
import { auth } from "@/src/services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function Recuperacao() {
  const [email, setEmail] = useState("");

  async function handleRecuperarSenha() {
    if (!email) {
      Alert.alert("Aviso", "Por favor, digite o seu email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Sucesso",
        "Um link de recuperação foi enviado para o seu email.",
      );
    } catch (error: any) {
      if (error.code === "auth/invalid-email") {
        Alert.alert("Erro", "Formato de email inválido.");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao enviar o email.");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Recuperar senha</Text>

      <Text style={styles.texto}>
        Digite seu email para receber um link de recuperação de senha.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.botao} onPress={handleRecuperarSenha}>
        <Text style={styles.textoBotao}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: theme.colors.background,
  },
  titulo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: theme.colors.textMenu,
  },
  texto: {
    textAlign: "center",
    marginBottom: 30,
    color: theme.colors.subtitle,
    fontSize: theme.texts.subtitle,
  },
  input: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  botao: {
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: theme.texts.text,
  },
});
