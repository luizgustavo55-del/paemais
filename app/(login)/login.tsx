import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db, firestore } from "@/src/services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { get as getDatabase, ref } from "firebase/database";
import { doc, getDoc as getFirestore } from "firebase/firestore";

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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        senha,
      );
      const uid = userCredential.user.uid;

      type UsuarioTipo = "pai" | "gestante";
      let dadosUser = null;
      let tipoIdentificado: UsuarioTipo | null = null;

      // 🔥 1. PROCURA NO FIRESTORE (Coleção "usuarios")
      const userSnap = await getFirestore(
        doc(firestore, "usuarios", uid), // <--- CORRIGIDO AQUI!
      );

      if (userSnap.exists()) {
        dadosUser = userSnap.data();
        // Pega o tipo exato que foi salvo no cadastro (ex: "gestante", "pai")
        const tipo = dadosUser.tipo as string | undefined;
        if (tipo === "gestante" || tipo === "pai") {
          tipoIdentificado = tipo;
        } else {
          Alert.alert(
            "Aviso",
            `Redirecionamento não configurado para o tipo: ${tipo}`,
          );
          setLoading(false);
          return;
        }
      } else {
        const paiSnap = await getDatabase(ref(db, "usuarios_pais/" + uid));
        if (paiSnap.exists()) {
          dadosUser = paiSnap.val();
          tipoIdentificado = "pai";
        }
      }

      if (!tipoIdentificado || !dadosUser) {
        Alert.alert("Erro", "Perfil não encontrado em nenhum banco de dados.");
        setLoading(false);
        return;
      }

      setUser({
        uid,
        email: userCredential.user.email || "",
        tipo: tipoIdentificado,
      });

      // 🔀 REDIRECIONAMENTO COM BASE NO TIPO
      if (tipoIdentificado === "pai") {
        router.replace("/(pais)/(tabs)/menu" as any);
      } else if (tipoIdentificado === "gestante") {
        router.replace("/(drawer)/(gestantes)/(tabs)/gestacao" as any);
      } else {
        // Se no futuro tiver outro perfil, você pode adicionar o redirecionamento dele aqui!
        Alert.alert(
          "Aviso",
          `Redirecionamento não configurado para o tipo: ${tipoIdentificado}`,
        );
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
            colors={["#28174cca", "#7050d8"]}
            style={[
              styles.botao,
              (!formularioValido || loading) && styles.botaoDesativado,
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
            <Text style={styles.textoColaborador}>Seja colaborador</Text>
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
    backgroundColor: "#b390d8",
  },
  content: { marginTop: 120, gap: 20 },
  titulo: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    color: "#28174cca",
  },
  subtitulo: {
    textAlign: "center",
    fontSize: 16,
    color: "#7050b3",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  esqueceu: { textAlign: "right", color: "#7b2cff", fontWeight: "bold" },
  footer: { alignItems: "center", gap: 15, marginBottom: 40 },
  fullWidth: { width: "100%" },
  botao: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  botaoDesativado: { opacity: 0.5 },
  textoBotao: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  link: { color: "#7b2cff", fontWeight: "bold" },
  botaoColaborador: {
    borderWidth: 2,
    borderColor: "#a381c7",
    backgroundColor: "#7050b3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  textoColaborador: { color: "#ece3ff", fontWeight: "bold", fontSize: 16 },
});
