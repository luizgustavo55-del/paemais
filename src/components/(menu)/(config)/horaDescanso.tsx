import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type HoraDescansoProps = {
  visivel: boolean;
  fechar: () => void;
  notificacoesAtivas: boolean;
};

export function HoraDescanso({
  visivel,
  fechar,
  notificacoesAtivas,
}: HoraDescansoProps) {
  const [descansoAtivo, setDescansoAtivo] = useState(false);
  const [horaInicio, setHoraInicio] = useState("22:00");
  const [horaFim, setHoraFim] = useState("07:00");
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [salvandoDescanso, setSalvandoDescanso] = useState(false);

  const [pickerInicioVisivel, setPickerInicioVisivel] = useState(false);
  const [pickerFimVisivel, setPickerFimVisivel] = useState(false);
  const [horaSelecionada, setHoraSelecionada] = useState(new Date());

  // Carrega as configurações guardadas no Firestore
  useEffect(() => {
    const carregarPreferenciasDescanso = async () => {
      setCarregandoDados(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(firestore, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const dados = userDoc.data();
          if (dados?.configuracoes) {
            if (dados.configuracoes.descansoAtivo !== undefined) {
              setDescansoAtivo(dados.configuracoes.descansoAtivo);
            }
            if (dados.configuracoes.horaInicio) {
              setHoraInicio(dados.configuracoes.horaInicio);
            }
            if (dados.configuracoes.horaFim) {
              setHoraFim(dados.configuracoes.horaFim);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar preferências de descanso:", error);
      } finally {
        setCarregandoDados(false);
      }
    };

    if (visivel) {
      carregarPreferenciasDescanso();
    }
  }, [visivel]);

  // Aplica a máscara de hora HH:MM enquanto o usuário digita
  const handleMascaraHora = (texto: string, setHora: (val: string) => void) => {
    let v = texto.replace(/\D/g, "");
    if (v.length > 4) v = v.substring(0, 4);
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1:$2");
    setHora(v);
  };

  // Abre o calendário/picker nativo na hora correta que já estava selecionada
  const abrirPickerHora = (tipo: "inicio" | "fim") => {
    const dataAuxiliar = new Date();
    const horaAtualStr = tipo === "inicio" ? horaInicio : horaFim;

    if (horaAtualStr.length === 5) {
      const [h, m] = horaAtualStr.split(":");
      dataAuxiliar.setHours(parseInt(h, 10));
      dataAuxiliar.setMinutes(parseInt(m, 10));
    }

    setHoraSelecionada(dataAuxiliar);
    if (tipo === "inicio") {
      setPickerInicioVisivel(true);
    } else {
      setPickerFimVisivel(true);
    }
  };

  // Pega a hora selecionada no calendário nativo e guarda no estado
  const handleSelecionarHora = (
    event: any,
    selectedTime?: Date,
    tipo?: "inicio" | "fim",
  ) => {
    if (tipo === "inicio") setPickerInicioVisivel(false);
    else setPickerFimVisivel(false);

    if (selectedTime) {
      const horas = String(selectedTime.getHours()).padStart(2, "0");
      const minutos = String(selectedTime.getMinutes()).padStart(2, "0");
      if (tipo === "inicio") {
        setHoraInicio(`${horas}:${minutos}`);
      } else {
        setHoraFim(`${horas}:${minutos}`);
      }
    }
  };

  // Regex para validar se as horas digitadas estão no formato 00:00 a 23:59
  const validarFormatoHora = (hora: string) => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
  };

  // Grava as alterações no Firestore
  const handleSalvarDescanso = async () => {
    if (
      descansoAtivo &&
      (!validarFormatoHora(horaInicio) || !validarFormatoHora(horaFim))
    ) {
      Alert.alert(
        "Aviso",
        "Por favor, insira horários válidos (00:00 a 23:59).",
      );
      return;
    }

    setSalvandoDescanso(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(firestore, "usuarios", user.uid);
      await updateDoc(userDocRef, {
        "configuracoes.descansoAtivo": descansoAtivo,
        "configuracoes.horaInicio": horaInicio,
        "configuracoes.horaFim": horaFim,
      });

      Alert.alert("Sucesso", "Hora de descanso guardada com sucesso!");
      fechar();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a hora de descanso.");
      console.error(error);
    } finally {
      setSalvandoDescanso(false);
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
            <Text style={styles.modalTitle}>Hora de Descanso</Text>
            <TouchableOpacity
              onPress={fechar}
              disabled={salvandoDescanso || carregandoDados}
            >
              <Feather name="x" size={24} color={theme.colors.textMenu} />
            </TouchableOpacity>
          </View>

          {carregandoDados ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.gestantesPrimary}
              />
            </View>
          ) : (
            <View style={styles.bodyContainer}>
              <Text style={styles.modalSubTitle}>
                Pausar lembretes durante o seu descanso.
              </Text>

              {/* Botão para Ligar/Desligar a funcionalidade */}
              <View style={styles.settingItemRow}>
                <Text style={styles.settingItemMain}>Ativar Descanso</Text>
                <Switch
                  value={descansoAtivo}
                  onValueChange={setDescansoAtivo}
                  trackColor={{
                    true: theme.colors.gestantesPrimary,
                    false: theme.colors.subtitle,
                  }}
                  thumbColor={
                    descansoAtivo ? theme.colors.primary : theme.colors.text
                  }
                />
              </View>

              {/* Se estiver ativo, mostra os inputs de hora */}
              {descansoAtivo && (
                <View style={styles.timeInputsContainer}>
                  {/* HORA DE INÍCIO */}
                  <Text style={styles.labelInput}>Início</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputBoxModal}
                      placeholder="22:00"
                      value={horaInicio}
                      onChangeText={(t) => handleMascaraHora(t, setHoraInicio)}
                      keyboardType="numeric"
                      maxLength={5}
                      textAlign="center"
                    />
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => abrirPickerHora("inicio")}
                    >
                      <Feather
                        name="clock"
                        size={24}
                        color={theme.colors.gestantesPrimary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* HORA DO FIM */}
                  <Text style={styles.labelInput}>Fim</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputBoxModal}
                      placeholder="07:00"
                      value={horaFim}
                      onChangeText={(t) => handleMascaraHora(t, setHoraFim)}
                      keyboardType="numeric"
                      maxLength={5}
                      textAlign="center"
                    />
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => abrirPickerHora("fim")}
                    >
                      <Feather
                        name="clock"
                        size={24}
                        color={theme.colors.gestantesPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Calendários Nativos (Escondidos, abrem por cima) */}
          {pickerInicioVisivel && (
            <DateTimePicker
              value={horaSelecionada}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(e, d) => handleSelecionarHora(e, d, "inicio")}
            />
          )}
          {pickerFimVisivel && (
            <DateTimePicker
              value={horaSelecionada}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(e, d) => handleSelecionarHora(e, d, "fim")}
            />
          )}

          {/* Botões de Ação */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={fechar}
              disabled={salvandoDescanso || carregandoDados}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSalvarDescanso}
              disabled={salvandoDescanso || carregandoDados}
            >
              {salvandoDescanso ? (
                <ActivityIndicator color={theme.colors.text} />
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
    backgroundColor: theme.colors.text, // #fff do teu tema
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
    fontSize: theme.texts.subtitle, // 24
    fontWeight: "bold",
    color: theme.colors.textMenu,
  },
  modalSubTitle: {
    fontSize: 14,
    color: theme.colors.textMenu,
    opacity: 0.7,
    marginBottom: 15,
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyContainer: {
    marginBottom: 20,
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 15,
  },
  settingItemMain: {
    fontSize: theme.texts.text, // 18
    color: theme.colors.title, // #000
    fontWeight: "500",
  },
  timeInputsContainer: {
    marginTop: 5,
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
    borderColor: theme.colors.subtitle, // #ccc
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    width: "100%",
  },
  inputBoxModal: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: theme.colors.title,
    fontWeight: "500",
  },
  iconButton: {
    padding: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.subtitle,
  },
  cancelButtonText: {
    color: theme.colors.textMenu,
    fontWeight: "600",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: theme.colors.gestantesPrimary,
  },
  saveButtonText: {
    color: theme.colors.text, // #fff
    fontWeight: "600",
    fontSize: 15,
  },
});
