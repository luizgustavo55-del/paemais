import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/context/AuthContext";
import { auth, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type TrocarContaProps = {
  visivel: boolean;
  fechar: () => void;
};

export function TrocarConta({ visivel, fechar }: TrocarContaProps) {
  const { user } = useAuth();
  const [modoLogin, setModoLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    const carregarNome = async () => {
      try {
        if (!user?.uid) return;
        const userDocRef = doc(firestore, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setNomeUsuario(userDoc.data()?.nome || "Usuário");
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (visivel && user) {
      carregarNome();
    }
  }, [visivel, user]);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      setModoLogin(false);
      setEmail("");
      setSenha("");
      fechar();
    } catch (error: any) {
      console.log("Erro interno ocultado:", error.code);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        Alert.alert("Erro", "E-mail ou senha incorretos.");
      } else {
        Alert.alert("Erro", "Não foi possível entrar na conta.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const resetarEFechar = () => {
    setModoLogin(false);
    setEmail("");
    setSenha("");
    fechar();
  };

  return (
    <Modal
      visible={visivel}
      animationType="fade"
      transparent={true}
      onRequestClose={resetarEFechar}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={styles.modalSmallContent}>
          <View style={styles.headerRow}>
            {modoLogin ? (
              <TouchableOpacity
                onPress={() => setModoLogin(false)}
                disabled={carregando}
              >
                <Feather
                  name="arrow-left"
                  size={24}
                  color={theme.colors.textMenu}
                />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 24 }} />
            )}
            <Text style={styles.modalTitle}>
              {modoLogin ? "Entrar" : "Trocar Conta"}
            </Text>
            <TouchableOpacity onPress={resetarEFechar} disabled={carregando}>
              <Feather name="x" size={24} color={theme.colors.textMenu} />
            </TouchableOpacity>
          </View>

          {!modoLogin ? (
            <View style={styles.bodyContainer}>
              {user && (
                <View style={styles.accountRow}>
                  <View style={styles.avatarCircle}>
                    <Feather name="user" size={24} color={theme.colors.text} />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName} numberOfLines={1}>
                      {nomeUsuario || "Carregando..."}
                    </Text>
                    <Text style={styles.accountEmail} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                  <View style={styles.checkCircle}>
                    <Feather name="check" size={14} color={theme.colors.text} />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setModoLogin(true)}
              >
                <View style={styles.addCircle}>
                  <Feather name="plus" size={24} color={theme.colors.title} />
                </View>
                <Text style={styles.actionText}>Adicionar conta existente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bodyContainer}>
              <Text style={styles.labelInput}>E-mail</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputBoxModal}
                  placeholder="Ex: seu@email.com"
                  placeholderTextColor={theme.colors.subtitle}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.labelInput}>Senha</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputBoxModal}
                  placeholder="Sua senha"
                  placeholderTextColor={theme.colors.subtitle}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!verSenha}
                />
                <TouchableOpacity onPress={() => setVerSenha(!verSenha)}>
                  <Feather
                    name={verSenha ? "eye" : "eye-off"}
                    size={20}
                    color={theme.colors.subtitle}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color={theme.colors.text} />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar na Conta</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalSmallContent: {
    backgroundColor: theme.colors.text,
    borderRadius: 20,
    width: "100%",
    maxWidth: 340,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: theme.texts.text,
    fontWeight: "bold",
    color: theme.colors.textMenu,
  },
  bodyContainer: {
    marginBottom: 10,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.gestantesPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.title,
  },
  accountEmail: {
    fontSize: 13,
    color: theme.colors.textMenu,
    marginTop: 2,
    opacity: 0.7,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  addCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.title,
  },
  labelInput: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMenu,
    marginBottom: 5,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.subtitle,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f9f9f9",
    width: "100%",
  },
  inputBoxModal: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: theme.colors.title,
  },
  loginButton: {
    backgroundColor: theme.colors.gestantesPrimary,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  loginButtonText: {
    color: theme.colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
});
