import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

type SonsVibracaoProps = {
  visivel: boolean;
  fechar: () => void;
  notificacoesAtivas: boolean;
};

export function SonsVibracao({
  visivel,
  fechar,
  notificacoesAtivas,
}: SonsVibracaoProps) {
  const [vibracaoAtiva, setVibracaoAtiva] = useState(true);
  const [somSelecionado, setSomSelecionado] = useState("padrao_app"); // 'padrao_app' ou 'sistema'
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Carrega as configurações guardadas no Firestore
  useEffect(() => {
    const carregarPreferenciasSons = async () => {
      setCarregando(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(firestore, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const dados = userDoc.data();
          if (dados?.configuracoes) {
            if (dados.configuracoes.vibracaoAtiva !== undefined) {
              setVibracaoAtiva(dados.configuracoes.vibracaoAtiva);
            }
            if (dados.configuracoes.somSelecionado) {
              setSomSelecionado(dados.configuracoes.somSelecionado);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar preferências de som:", error);
      } finally {
        setCarregando(false);
      }
    };

    if (visivel) {
      carregarPreferenciasSons();
    }
  }, [visivel]);

  // Feedback de vibração local ao alternar o Switch
  const handleToggleVibracao = (value: boolean) => {
    setVibracaoAtiva(value);
    if (value) {
      Vibration.vibrate(400); // Feedback de 400ms conforme o teu arquivo original
    }
  };

  // Abre as configurações do sistema nativo do telemóvel
  const handleAbrirConfiguracoesSistema = () => {
    Linking.openSettings();
  };

  // Grava as alterações de volta no Firestore
  const handleSalvarSonsVibracao = async () => {
    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(firestore, "usuarios", user.uid);
      await updateDoc(userDocRef, {
        "configuracoes.vibracaoAtiva": vibracaoAtiva,
        "configuracoes.somSelecionado": somSelecionado,
      });

      Alert.alert("Sucesso", "Preferências de sons e vibração atualizadas!");
      fechar();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as preferências.");
      console.error(error);
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
          {/* Cabeçalho */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Sons e Vibração</Text>
            <TouchableOpacity
              onPress={fechar}
              disabled={salvando || carregando}
            >
              <Feather name="x" size={24} color={theme.colors.textMenu} />
            </TouchableOpacity>
          </View>

          {carregando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.gestantesPrimary}
              />
            </View>
          ) : (
            <View style={styles.bodyContainer}>
              <Text style={styles.modalSubTitle}>
                Personalize como quer ser avisada:
              </Text>

              {/* Linha do Switch de Vibração */}
              <View style={styles.settingItemRow}>
                <Text style={styles.settingItemMain}>Vibração</Text>
                <Switch
                  value={vibracaoAtiva}
                  onValueChange={handleToggleVibracao}
                  trackColor={{
                    true: theme.colors.gestantesPrimary,
                    false: "#ddd",
                  }}
                  thumbColor={vibracaoAtiva ? theme.colors.primary : "#f4f3f4"}
                />
              </View>

              <Text style={styles.sectionTitle}>SOM DA NOTIFICAÇÃO</Text>

              {/* Radio Button: Padrão do App */}
              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => setSomSelecionado("padrao_app")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    somSelecionado === "padrao_app" &&
                      styles.radioCircleSelected,
                  ]}
                />
                <Text style={styles.radioText}>Padrão do App</Text>
              </TouchableOpacity>

              {/* Radio Button: Personalizado (Sistema) */}
              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => setSomSelecionado("sistema")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    somSelecionado === "sistema" && styles.radioCircleSelected,
                  ]}
                />
                <View style={styles.textColumn}>
                  <Text style={styles.radioText}>Personalizado (Sistema)</Text>
                  <Text style={styles.radioSubText}>
                    Use as configurações do celular para escolher uma música.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Botão de Link Externo se escolher Sistema */}
              {somSelecionado === "sistema" && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={handleAbrirConfiguracoesSistema}
                >
                  <Feather
                    name="external-link"
                    size={16}
                    color={theme.colors.gestantesPrimary}
                  />
                  <Text style={styles.linkButtonText}>
                    Abrir Configurações do Aparelho
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Rodapé com botões de Ação */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={fechar}
              disabled={salvando || carregando}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSalvarSonsVibracao}
              disabled={salvando || carregando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
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
    backgroundColor: theme.colors.text, // #fff
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
    color: "#666",
    marginBottom: 15,
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyContainer: {
    marginBottom: 10,
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  settingItemMain: {
    fontSize: theme.texts.text, // 18
    color: theme.colors.title, // #000
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gestantesPrimary,
    marginTop: 15,
    marginBottom: 10,
    letterSpacing: 1,
  },
  textColumn: {
    flex: 1,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.gestantesPrimary,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    backgroundColor: theme.colors.gestantesPrimary,
  },
  radioText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  radioSubText: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 6,
  },
  linkButtonText: {
    color: theme.colors.gestantesPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    textDecorationLine: "underline",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: theme.colors.gestantesPrimary,
  },
  saveButtonText: {
    color: theme.colors.text, // #fff
    fontWeight: "600",
  },
});
