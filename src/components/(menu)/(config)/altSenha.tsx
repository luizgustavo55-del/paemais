import { theme } from "@/src/constants/theme";
import { auth } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
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

type AlterarSenhaProps = {
  visivel: boolean;
  fechar: () => void;
};

export function AlterarSenha({ visivel, fechar }: AlterarSenhaProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  const [verSenhaAtual, setVerSenhaAtual] = useState(false);
  const [verNovaSenha, setVerNovaSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);

  const [salvando, setSalvando] = useState(false);

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      Alert.alert("Erro", "A nova senha e a confirmação não coincidem.");
      return;
    }

    setSalvando(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setSalvando(false);
        return;
      }

      const credencial = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credencial);

      await updatePassword(user, novaSenha);

      Alert.alert("Sucesso", "Senha alterada com sucesso!");

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
      fechar();
    } catch (error: any) {
      console.log("Erro interno ocultado:", error.code);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        Alert.alert("Erro", "A senha atual inserida está incorreta.");
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível alterar a senha. Tente novamente mais tarde.",
        );
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      visible={visivel}
      animationType="fade"
      transparent={true}
      onRequestClose={fechar}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={styles.modalSmallContent}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Alterar Senha</Text>
            <TouchableOpacity onPress={fechar} disabled={salvando}>
              <Feather name="x" size={24} color={theme.colors.textMenu} />
            </TouchableOpacity>
          </View>

          <View style={styles.bodyContainer}>
            <Text style={styles.labelInput}>Senha Atual</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputBoxModal}
                placeholder="Digite sua senha atual"
                placeholderTextColor={theme.colors.subtitle}
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry={!verSenhaAtual}
              />
              <TouchableOpacity
                onPress={() => setVerSenhaAtual(!verSenhaAtual)}
              >
                <Feather
                  name={verSenhaAtual ? "eye" : "eye-off"}
                  size={20}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.labelInput}>Nova Senha</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputBoxModal}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={theme.colors.subtitle}
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry={!verNovaSenha}
              />
              <TouchableOpacity onPress={() => setVerNovaSenha(!verNovaSenha)}>
                <Feather
                  name={verNovaSenha ? "eye" : "eye-off"}
                  size={20}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.labelInput}>Confirmar Nova Senha</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputBoxModal}
                placeholder="Repita a nova senha"
                placeholderTextColor={theme.colors.subtitle}
                value={confirmarNovaSenha}
                onChangeText={setConfirmarNovaSenha}
                secureTextEntry={!verConfirmarSenha}
              />
              <TouchableOpacity
                onPress={() => setVerConfirmarSenha(!verConfirmarSenha)}
              >
                <Feather
                  name={verConfirmarSenha ? "eye" : "eye-off"}
                  size={20}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={fechar}
              disabled={salvando}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleAlterarSenha}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={styles.saveButtonText}>Atualizar</Text>
              )}
            </TouchableOpacity>
          </View>
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
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
    color: theme.colors.textMenu,
  },
  bodyContainer: {
    marginBottom: 20,
  },
  labelInput: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMenu,
    marginBottom: 5,
    marginTop: 12,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.subtitle,
  },
  cancelButtonText: {
    color: theme.colors.textMenu,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: theme.colors.gestantesPrimary,
  },
  saveButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
});
