import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface EnviarFeedbackProps {
  visivel: boolean;
  fechar: () => void;
}

export function EnviarFeedback({ visivel, fechar }: EnviarFeedbackProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!texto.trim()) {
      Alert.alert(
        "Aviso",
        "Por favor, escreva o seu feedback antes de enviar.",
      );
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        Alert.alert(
          "Erro",
          "Precisa de estar autenticado para enviar feedback.",
        );
        return;
      }

      // Cria a coleção "feedbacks" geral no Firestore
      const feedbacksRef = collection(firestore, "feedbacks");

      await addDoc(feedbacksRef, {
        usuarioId: user.uid,
        email: user.email,
        mensagem: texto,
        lida: false, // Útil para você saber no painel se já leu essa mensagem
        enviadoEm: new Date().toISOString(),
      });

      Alert.alert(
        "Sucesso",
        "Muito obrigado! O seu feedback foi enviado e vai ajudar-nos a melhorar o app.",
      );

      // Limpa a caixa de texto e fecha o modal
      setTexto("");
      fechar();
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar o feedback. Tente novamente mais tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visivel} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Enviar Feedback</Text>
                <TouchableOpacity
                  onPress={() => {
                    setTexto("");
                    fechar();
                  }}
                  disabled={loading}
                >
                  <Feather name="x" size={24} color={theme.colors.textMenu} />
                </TouchableOpacity>
              </View>

              <Text style={styles.descricao}>
                Encontrou algum problema ou tem uma sugestão? Escreva abaixo, a
                nossa equipa lê todas as mensagens!
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Escreva a sua mensagem aqui..."
                placeholderTextColor={theme.colors.subtitle}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top" // Faz o texto começar do topo no Android
                value={texto}
                onChangeText={setTexto}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.botaoEnviar, loading && { opacity: 0.7 }]}
                onPress={handleEnviar}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.textoBotaoEnviar}>Enviar Mensagem</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    keyboardContainer: {
      width: "100%",
    },
    modalContent: {
      backgroundColor: theme.colors.text,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 20,
      paddingBottom: Platform.OS === "ios" ? 40 : 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.subtitle,
    },
    title: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.textMenu,
    },
    descricao: {
      fontSize: theme.texts.text - 2,
      color: theme.colors.subtitle,
      marginBottom: 15,
      lineHeight: 20,
    },
    input: {
      backgroundColor: "#f2f2f2",
      borderRadius: 12,
      padding: 15,
      fontSize: theme.texts.text,
      color: theme.colors.title,
      minHeight: 120,
      marginBottom: 20,
    },
    botaoEnviar: {
      backgroundColor: theme.colors.gestantesPrimary,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: "center",
    },
    textoBotaoEnviar: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: theme.texts.text,
    },
  });
