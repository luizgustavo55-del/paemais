import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/context/AuthContext";
import { auth, firestore } from "@/src/services/firebase";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const colors = {
  paisBackground: "#7050b3",
  paisPrimary: "#8b64de",
  paisSecondary: "#9b5de5",
  background: "#b390d8",
  primary: "#7b2cff",
  card: "#5407b8",
  textMenu: "#28174cca",

  surface: "#FFFFFF",
  surfaceMuted: "#F3EEFC",
  border: "#E1D4F7",
  textDark: "#28174c",
  textMuted: "#6B5C8F",
  success: "#1FAA59",
  successBg: "#E8F8EE",
  danger: "#E0245E",
  dangerBg: "#FDEAF0",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const { setUser } = useAuth();

  const formularioValido = email.trim() !== "" && senha.trim() !== "";

  function borderColorFor(campo: string) {
    if (focusedField === campo) return colors.primary;
    return colors.border;
  }

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
    <View style={styles.root}>
      {/* ── HERO ───────────────────────────────── */}
      <View style={styles.header}>
  <Text style={styles.headerTitle}>Pãe+</Text>

  <Text style={styles.headerSubtitle}>
    Sua jornada começa aqui. Entre para continuar.
  </Text>
</View>

      {/* ── SHEET ──────────────────────────────── */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email */}
        <Text style={styles.label}>E-mail</Text>
        <View style={[styles.fieldRow, { borderColor: borderColorFor("email") }]}>
          <Feather name="mail" size={17} color={colors.textMuted} />
          <TextInput
            style={styles.fieldInput}
            placeholder="Digite seu e-mail"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Senha */}
        <Text style={styles.label}>Senha</Text>
        <View style={[styles.fieldRow, { borderColor: borderColorFor("senha") }]}>
          <Feather name="lock" size={17} color={colors.textMuted} />
          <TextInput
            style={styles.fieldInput}
            placeholder="Digite sua senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!mostrarSenha}
            value={senha}
            onChangeText={setSenha}
            onFocus={() => setFocusedField("senha")}
            onBlur={() => setFocusedField(null)}
          />
          <TouchableOpacity
            onPress={() => setMostrarSenha(!mostrarSenha)}
            activeOpacity={0.6}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/recuperacao")}>
          <Text style={styles.esqueceu}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <TouchableOpacity
          onPress={entrar}
          disabled={!formularioValido || loading}
          activeOpacity={0.85}
          style={{ marginTop: 28 }}
        >
          <LinearGradient
            colors={[colors.paisPrimary, colors.primary, colors.paisSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.botao, (!formularioValido || loading) && styles.botaoDesativado]}
          >
            {loading ? (
              <Text style={styles.textoBotao}>Entrando...</Text>
            ) : (
              <>
                <Feather name="log-in" size={16} color={colors.surface} />
                <Text style={styles.textoBotao}>Entrar</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Criar conta */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Não tem uma conta?</Text>
          <TouchableOpacity onPress={() => router.push("/cadastro")}>
            <Text style={styles.loginLink}> Criar conta</Text>
          </TouchableOpacity>
        </View>

        {/* Colaborador */}
        <TouchableOpacity
          style={styles.botaoColaborador}
          onPress={() => router.push("/questionario")}
          activeOpacity={0.8}
        >
          <Feather name="briefcase" size={15} color={colors.paisPrimary} />
          <Text style={styles.textoColaborador}>Seja colaborador</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },

 header: {
  paddingTop: Platform.select({ ios: 92, android: 72, default: 72 }),
  paddingBottom: 92,
  paddingHorizontal: 26,
  alignItems: "center",
  backgroundColor: colors.paisBackground,
  borderBottomLeftRadius: 38,
  borderBottomRightRadius: 38,
},
headerTitle: {
  fontSize: 30,
  fontWeight: "800",
  color: colors.surface,
  letterSpacing: 1.5,
},

headerSubtitle: {
  fontSize: 13.5,
  color: "#EAE0FB",
  textAlign: "center",
  marginTop: 8,
  paddingHorizontal: 12,
  lineHeight: 20,
},

  // ── SHEET ──
  sheet: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  
    marginTop: -32,
  },
  sheetContent: {
    padding: 24,
    paddingBottom: 48,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMenu,
    marginBottom: 6,
    marginTop: 14,
    marginLeft: 2,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14.5,
    color: colors.textDark,
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  esqueceu: {
    textAlign: "right",
    color: colors.paisPrimary,
    fontWeight: "700",
    fontSize: 13,
    marginTop: 10,
  },

  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  botaoDesativado: { opacity: 0.45 },
  textoBotao: {
    color: colors.surface,
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginText: {
    color: colors.textMuted,
    fontSize: 13.5,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13.5,
  },

  botaoColaborador: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginTop: 4,
  },
  textoColaborador: {
    color: colors.paisPrimary,
    fontWeight: "700",
    fontSize: theme.texts.text,
  },
});