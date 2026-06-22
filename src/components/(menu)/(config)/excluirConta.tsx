import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Importando o router para o redirecionamento
import {
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
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

interface ExcluirContaProps {
  visivel: boolean;
  fechar: () => void;
}

export function ExcluirConta({ visivel, fechar }: ExcluirContaProps) {
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleExcluirConta = async () => {
    if (!senha.trim()) {
      Alert.alert(
        "Aviso",
        "Por favor, digite sua senha para confirmar a exclusão.",
      );
      return;
    }

    Alert.alert(
      "Aviso Irreversível",
      "Tem certeza? Todos os seus dados serão apagados para sempre.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const user = auth.currentUser;

              if (!user || !user.email) {
                throw new Error("Usuário não encontrado.");
              }

              // 1. Criar a credencial com o email do usuário e a senha digitada
              const credential = EmailAuthProvider.credential(
                user.email,
                senha,
              );

              // 2. Reautenticar o usuário
              await reauthenticateWithCredential(user, credential);

              // 3. Deletar os dados do usuário no Firestore
              const userDocRef = doc(firestore, "usuarios", user.uid);
              await deleteDoc(userDocRef);

              // 4. Deletar a conta no Firebase Auth
              await deleteUser(user);

              Alert.alert("Sucesso", "Sua conta foi excluída permanentemente.");

              // Limpa o estado e fecha o modal
              setSenha("");
              fechar();

              // Redireciona para a tela de login (ajuste o caminho se o seu for diferente, ex: "/(auth)/login")
              router.replace("/");
            } catch (error: any) {
              console.log(error);

              // Tratando o erro específico de senha errada
              if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password"
              ) {
                Alert.alert("Erro", "A senha informada está incorreta.");
              } else {
                Alert.alert(
                  "Erro",
                  "Não foi possível excluir a conta. Tente novamente mais tarde.",
                );
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visivel} animationType="fade" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Excluir Conta</Text>
            <TouchableOpacity
              onPress={() => {
                setSenha(""); // Limpa a senha ao fechar
                fechar();
              }}
              disabled={loading}
            >
              <Feather name="x" size={24} color={theme.colors.textMenu} />
            </TouchableOpacity>
          </View>

          <View style={styles.warningContainer}>
            <Feather
              name="alert-triangle"
              size={40}
              color={theme.colors.gestantesBackground}
            />
            <Text style={styles.warningText}>
              Esta ação é permanente. Para confirmar sua identidade e excluir a
              conta, digite sua senha atual abaixo:
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color={theme.colors.subtitle} />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor={theme.colors.subtitle}
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setMostrarSenha(!mostrarSenha)}
              disabled={loading}
            >
              <Feather
                name={mostrarSenha ? "eye" : "eye-off"}
                size={20}
                color={theme.colors.subtitle}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleExcluirConta}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.deleteButtonText}>Excluir minha conta</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.text,
    width: "85%",
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.textMenu,
  },
  warningContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 0, 0.05)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  warningText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: theme.texts.text,
    color: theme.colors.title,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.subtitle,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: theme.texts.text,
    color: theme.colors.title,
  },
  deleteButton: {
    backgroundColor: theme.colors.gestantesBackground,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: theme.texts.text,
    fontWeight: "bold",
  },
});
