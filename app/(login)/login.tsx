import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/context/AuthContext";
import { auth, firestore } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const router = useRouter();
  const { setUser } = useAuth();

  const formularioValido = email.trim() !== "" && senha.trim() !== "";

  async function entrar() {
    if (!formularioValido) {
      Alert.alert("Aviso", "Preencha todos os campos");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        senha,
      );
      const uid = userCredential.user.uid;

      const userSnap = await getDoc(doc(firestore, "usuarios", uid));

      if (!userSnap.exists()) {
        Alert.alert("Erro", "Perfil não encontrado no banco de dados.");
        setLoading(false);
        return;
      }

      const dadosUser = userSnap.data();
      const tipoIdentificado = dadosUser.tipo as "pai" | "gestante" | undefined;

      if (tipoIdentificado !== "gestante" && tipoIdentificado !== "pai") {
        Alert.alert(
          "Aviso",
          `Redirecionamento não configurado para o tipo: ${tipoIdentificado || "Desconhecido"}`,
        );
        setLoading(false);
        return;
      }

      setUser({
        uid,
        email: userCredential.user.email || "",
        tipo: tipoIdentificado,
      });

      if (tipoIdentificado === "pai") {
        router.replace("/(drawer)/(pais)/(tabs)/menu");
      } else if (tipoIdentificado === "gestante") {
        router.replace("/(drawer)/(gestantes)/(tabs)/gestacao");
      }
    } catch (error: any) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        Alert.alert("Erro", "E-mail ou senha incorretos");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao entrar");
        console.log(error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titulo}>Pãe+</Text>
        <Text style={styles.subtitulo}>Faça login para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={theme.colors.subtitle}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
            placeholderTextColor={theme.colors.subtitle}
            secureTextEntry={!mostrarSenha}
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity
            onPress={() => setMostrarSenha(!mostrarSenha)}
            activeOpacity={0.6}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={theme.colors.subtitle}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/recuperacao")}>
          <Text style={styles.esqueceu}>Esqueceu a senha?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.botao,
            styles.fullWidth,
            (!formularioValido || loading) && styles.botaoDesativado,
          ]}
          onPress={entrar}
          disabled={!formularioValido || loading}
        >
          <Text style={styles.textoBotao}>
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/cadastro")}>
          <Text style={styles.link}>Criar conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoColaborador}
          onPress={() => router.push("/questionario")}
        >
          <Text style={styles.textoColaborador}>Seja colaborador</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 30,
    backgroundColor: theme.colors.background,
  },
  content: { marginTop: 120, gap: 20 },
  titulo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    textAlign: "center",
    color: "#28174cca",
  },
  subtitulo: {
    textAlign: "center",
    fontSize: theme.texts.subtitle,
    color: theme.colors.subtitle,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: theme.texts.text,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: theme.texts.text,
    color: "#000",
  },
  eyeIcon: {
    padding: 4,
  },
  esqueceu: {
    textAlign: "right",
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  footer: { alignItems: "center", gap: 15, marginBottom: 40 },
  fullWidth: { width: "100%" },
  botao: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: theme.colors.card,
  },
  botaoDesativado: { opacity: 0.5 },
  textoBotao: {
    color: theme.colors.text,
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
  },
  link: { color: theme.colors.primary, fontWeight: "bold" },
  botaoColaborador: {
    backgroundColor: theme.colors.card,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  textoColaborador: {
    color: "#ece3ff",
    fontWeight: "bold",
    fontSize: theme.texts.text,
  },
});
