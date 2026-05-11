import { Link, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

// 🔥 Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "@/src/services/firebase";

// 🧠 CONTEXT
import { useAuth } from "@/src/context/AuthContext";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setUser } = useAuth();

  const formularioValido = email.trim() !== "" && senha.trim() !== "";

  async function entrar() {

    if (!formularioValido) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      // 🔐 LOGIN
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      // 🔎 BUSCAR DADOS NO REALTIME DATABASE
      const snapshot = await get(ref(db, "usuarios/" + uid));

      if (!snapshot.exists()) {
        Alert.alert("Erro", "Dados do usuário não encontrados");
        return;
      }

      const dados = snapshot.val();

      // 🧠 PEGAR TIPO
      const tipo: "pai" | "gestante" = dados.tipo;

      if (!tipo) {
        Alert.alert("Erro", "Tipo de usuário não definido");
        return;
      }

      // 💾 SALVAR NO CONTEXT
      setUser({
        uid,
        email,
        tipo
      });

      // 🚀 REDIRECIONAMENTO CORRETO
      if (tipo === "pai") {
        router.replace("/(pai)/(tabs)/menu" as any);
      } else {
        router.replace("/(gestante)/(tabs)/gestacao" as any);
      }

    } catch (error: any) {

      if (error.code === "auth/invalid-email") {
        Alert.alert("Erro", "Email inválido");
      } else if (error.code === "auth/user-not-found") {
        Alert.alert("Erro", "Usuário não encontrado");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Erro", "Senha incorreta");
      } else {
        Alert.alert("Erro", "Erro ao fazer login");
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

        <Text style={styles.subtitulo}>
          Faça login para continuar
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Link href="/recuperacao">
          <Text style={styles.esqueceu}>Esqueceu a senha?</Text>
        </Link>

      </View>

      <View style={styles.footer}>

        <TouchableOpacity
          style={styles.fullWidth}
          onPress={entrar}
          disabled={!formularioValido || loading}
        >
          <LinearGradient
            colors={['#28174cca', '#7050d8']}
            style={[
              styles.botao,
              (!formularioValido || loading) && styles.botaoDesativado
            ]}
          >
            <Text style={styles.textoBotao}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Link href="/cadastro">
          <Text style={styles.link}>Criar conta</Text>
        </Link>

        <Link href="/questionario" asChild>
          <TouchableOpacity style={styles.botaoColaborador}>
            <Text style={styles.textoColaborador}>
              Seja colaborador
            </Text>
          </TouchableOpacity>
        </Link>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 30,
    backgroundColor: "#b390d8"
  },

  content: {
    marginTop: 120,
    gap: 20
  },

  titulo: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    color: "#28174cca"
  },

  subtitulo: {
    textAlign: "center",
    fontSize: 16,
    color: "#7050b3",
    marginBottom: 20
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16
  },

  esqueceu: {
    textAlign: "right",
    color: "#7b2cff",
    fontWeight: "bold"
  },

  footer: {
    alignItems: "center",
    gap: 15,
    marginBottom: 40
  },

  fullWidth: {
    width: "100%"
  },

  botao: {

    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center"
  },

  botaoDesativado: {
    borderColor: "#905ec5",
    opacity: 0.5
  },

  textoBotao: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },

  link: {
    color: "#7b2cff",
    fontWeight: "bold"
  },

  botaoColaborador: {
    borderWidth: 2,
    borderColor: "#a381c7",
    backgroundColor: "#7050b3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10
  },

  textoColaborador: {
    color: "#ece3ff",
    fontWeight: "bold",
    fontSize: 16
  }

});