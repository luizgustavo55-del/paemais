import { theme } from "@/src/constants/theme";
import { auth } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    verifyBeforeUpdateEmail,
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

type AlterarEmailProps = {
  visivel: boolean;
  fechar: () => void;
};

export function AlterarEmail({ visivel, fechar }: AlterarEmailProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const validarFormatoEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAlterarEmail = async () => {
    if (!senhaAtual || !novoEmail) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (!validarFormatoEmail(novoEmail)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }

    setSalvando(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        Alert.alert("Erro", "Utilizador não autenticado.");
        setSalvando(false);
        return;
      }

      if (user.email.toLowerCase() === novoEmail.toLowerCase()) {
        Alert.alert(
          "Aviso",
          "O novo e-mail não pode ser igual ao e-mail atual.",
        );
        setSalvando(false);
        return;
      }

      const credencial = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credencial);

      await verifyBeforeUpdateEmail(user, novoEmail);

      Alert.alert(
        "Verificação Enviada",
        "Enviámos um link de confirmação para o seu novo e-mail. A alteração será concluída assim que clicar no link.",
      );

      setSenhaAtual("");
      setNovoEmail("");
      fechar();
    } catch (error: any) {
      console.log("Erro interno ocultado:", error.code);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        Alert.alert("Erro", "A senha de confirmação está incorreta.");
      } else if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Erro",
          "Este e-mail já está a ser utilizado por outra conta.",
        );
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível iniciar o processo de alteração do e-mail.",
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
            <Text style={styles.modalTitle}>Alterar E-mail</Text>
            <TouchableOpacity onPress={fechar} disabled={salvando}>
              <Feather name="x" size={24} color={theme.colors.textMenu} />
            </TouchableOpacity>
          </View>

          <View style={styles.bodyContainer}>
            <Text style={styles.modalSubTitle}>
              Será enviado um link de verificação para o novo endereço de e-mail
              por motivos de segurança.
            </Text>

            <Text style={styles.labelInput}>Novo E-mail</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputBoxModal}
                placeholder="Ex: seu-novo@email.com"
                placeholderTextColor={theme.colors.subtitle}
                value={novoEmail}
                onChangeText={setNovoEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.labelInput}>Confirme a sua Senha</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputBoxModal}
                placeholder="Insira a sua senha atual"
                placeholderTextColor={theme.colors.subtitle}
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry={!verSenha}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setVerSenha(!verSenha)}>
                <Feather
                  name={verSenha ? "eye" : "eye-off"}
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
              onPress={handleAlterarEmail}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={styles.saveButtonText}>Enviar Link</Text>
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
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
    color: theme.colors.textMenu,
  },
  modalSubTitle: {
    fontSize: 13,
    color: theme.colors.textMenu,
    opacity: 0.7,
    lineHeight: 18,
    marginBottom: 10,
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
