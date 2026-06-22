import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type TrocarDumProps = {
  visivel: boolean;
  fechar: () => void;
};

export function TrocarDum({ visivel, fechar }: TrocarDumProps) {
  const [novaDum, setNovaDum] = useState("");
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [loadingDum, setLoadingDum] = useState(false);

  // Aplica a máscara de data DD/MM/AAAA enquanto o usuário digita
  const handleMascaraData = (texto: string) => {
    let v = texto.replace(/\D/g, "");
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1/$2");
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    setNovaDum(v);
  };

  // Captura a data selecionada no calendário nativo
  const handleSelecionarData = (event: any, selectedDate?: Date) => {
    setMostrarPicker(false);
    if (selectedDate) {
      const hoje = new Date();
      if (selectedDate > hoje) {
        Alert.alert("Aviso", "A DUM não pode ser uma data futura.");
        return;
      }
      setDataSelecionada(selectedDate);
      const dia = String(selectedDate.getDate()).padStart(2, "0");
      const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const ano = selectedDate.getFullYear();
      setNovaDum(`${dia}/${mes}/${ano}`);
    }
  };

  // Valida e envia a nova DUM para a gestação ativa no Firebase
  const handleAtualizarDUM = async () => {
    if (novaDum.length !== 10) {
      Alert.alert(
        "Aviso",
        "Por favor, introduza uma data válida no formato DD/MM/AAAA.",
      );
      return;
    }

    const partes = novaDum.split("/");
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);
    const dataInserida = new Date(ano, mes, dia);
    const hoje = new Date();

    if (
      isNaN(dataInserida.getTime()) ||
      dataInserida.getDate() !== dia ||
      dataInserida.getMonth() !== mes
    ) {
      Alert.alert("Aviso", "Por favor, introduza uma data válida.");
      return;
    }

    if (dataInserida > hoje) {
      Alert.alert("Aviso", "A DUM não pode ser uma data futura.");
      return;
    }

    setLoadingDum(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoadingDum(false);
        return;
      }

      // Consulta a gestação que está com o status "ativa"
      const gestacoesRef = collection(
        firestore,
        "usuarios",
        user.uid,
        "gestacoes",
      );
      const q = query(gestacoesRef, where("status", "==", "ativa"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Erro", "Não foi encontrada nenhuma gestação ativa.");
        setLoadingDum(false);
        return;
      }

      // Executa as atualizações em lote de forma limpa e aguarda a finalização
      const atualizacoes = querySnapshot.docs.map((documento) => {
        const docRef = doc(
          firestore,
          "usuarios",
          user.uid,
          "gestacoes",
          documento.id,
        );
        return updateDoc(docRef, { dataUltimaMenstruacao: novaDum });
      });

      await Promise.all(atualizacoes);

      Alert.alert("Sucesso", "A sua DUM foi atualizada com sucesso!");
      setNovaDum("");
      fechar(); // Fecha o modal após o sucesso
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível atualizar a data. Tente novamente.",
      );
      console.error(error);
    } finally {
      setLoadingDum(false);
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
          <Text style={styles.modalTitle}>Alterar DUM</Text>
          <Text style={styles.modalSubTitle}>
            Insira a nova Data da Última Menstruação:
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputBoxModal}
              placeholder="DD/MM/AAAA"
              value={novaDum}
              onChangeText={handleMascaraData}
              keyboardType="numeric"
              maxLength={10}
              editable={!loadingDum}
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setMostrarPicker(true)}
              disabled={loadingDum}
            >
              <Feather
                name="calendar"
                size={24}
                color={theme.colors.gestantesPrimary}
              />
            </TouchableOpacity>
          </View>

          {mostrarPicker && (
            <DateTimePicker
              value={dataSelecionada}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={handleSelecionarData}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={fechar}
              disabled={loadingDum}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleAtualizarDUM}
              disabled={loadingDum}
            >
              {loadingDum ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
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
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 340,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.textMenu,
    marginBottom: 10,
  },
  modalSubTitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    width: "100%",
    marginBottom: 20,
  },
  inputBoxModal: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  iconButton: {
    padding: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: theme.colors.gestantesPrimary,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
