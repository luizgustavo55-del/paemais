import { theme } from "@/src/constants/theme";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🔥 Imports do Firebase
import { auth, firestore } from "@/src/services/firebase";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

export function Configuracoes() {
  const [visivel, setVisivel] = useState(false);
  const [situacao, setSituacao] = useState<"gestante" | "filhos">("gestante");
  const [modoEscuro, setModoEscuro] = useState(false);
  const [sonsDoApp, setSonsDoApp] = useState(true);

  // Carrega as preferências sempre que o modal abrir
  useEffect(() => {
    const carregarPreferencias = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(firestore, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const dados = userSnap.data();
          if (dados.perfil) setSituacao(dados.perfil);

          // Carrega as preferências de som e tema (se existirem)
          if (dados.modoEscuro !== undefined) setModoEscuro(dados.modoEscuro);
          if (dados.sonsDoApp !== undefined) setSonsDoApp(dados.sonsDoApp);
        }
      } catch (error) {
        console.log("Erro ao carregar configurações:", error);
      }
    };

    if (visivel) {
      carregarPreferencias();
    }
  }, [visivel]);

  // Atualiza o perfil (Gestante/Filhos) no Firestore
  const handleMudarPerfil = async (novoPerfil: "gestante" | "filhos") => {
    setSituacao(novoPerfil);
    await salvarPreferenciaNoFirebase({ perfil: novoPerfil });
  };

  // Atualiza o Modo Escuro no Firestore
  const handleMudarModoEscuro = async (valor: boolean) => {
    setModoEscuro(valor);
    await salvarPreferenciaNoFirebase({ modoEscuro: valor });
  };

  // Atualiza os Sons do App no Firestore
  const handleMudarSonsDoApp = async (valor: boolean) => {
    setSonsDoApp(valor);
    await salvarPreferenciaNoFirebase({ sonsDoApp: valor });
  };

  // Função genérica para salvar qualquer preferência sem apagar as outras
  const salvarPreferenciaNoFirebase = async (dado: object) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(firestore, "usuarios", user.uid);
      await setDoc(userRef, dado, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar a preferência no banco", error);
    }
  };

  // Função para APAGAR TUDO
  const handleExcluirConta = () => {
    Alert.alert(
      "Excluir Conta",
      "Tem a certeza? Esta ação é permanente e apagará todos os seus dados de perfil e o seu acesso.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir Permanentemente",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;

              const userRef = doc(firestore, "usuarios", user.uid);
              await deleteDoc(userRef);
              await deleteUser(user);

              Alert.alert("Sucesso", "A sua conta foi eliminada.");
              setVisivel(false);
            } catch (error: any) {
              console.error(error);
              if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                  "Segurança",
                  "Para eliminar a conta, precisa de ter feito login recentemente. Saia e entre de novo para confirmar.",
                );
              } else {
                Alert.alert("Erro", "Não foi possível eliminar a conta.");
              }
            }
          },
        },
      ],
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => setVisivel(true)}
      >
        <Feather name="settings" size={22} color="#333" />
        <Text style={styles.menuItemText}>Configurações</Text>
      </TouchableOpacity>

      <Modal visible={visivel} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurações</Text>
              <TouchableOpacity onPress={() => setVisivel(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferências</Text>
                <View style={styles.settingItemRow}>
                  <View style={styles.textColumn}>
                    <Text style={styles.settingItemMain}>Modo Escuro</Text>
                    <Text style={styles.settingItemSub}>
                      Visual mais confortável
                    </Text>
                  </View>
                  <Switch
                    value={modoEscuro}
                    onValueChange={handleMudarModoEscuro}
                    trackColor={{ true: theme.colors.cards, false: "#ddd" }}
                  />
                </View>

                <View style={styles.settingItemRow}>
                  <View style={styles.textColumn}>
                    <Text style={styles.settingItemMain}>Sons do App</Text>
                    <Text style={styles.settingItemSub}>
                      Alertas e notificações
                    </Text>
                  </View>
                  <Switch
                    value={sonsDoApp}
                    onValueChange={handleMudarSonsDoApp}
                    trackColor={{ true: theme.colors.cards, false: "#ddd" }}
                  />
                </View>
              </View>

              <View style={[styles.section, { borderBottomWidth: 0 }]}>
                <TouchableOpacity
                  style={styles.settingLinkItem}
                  onPress={handleExcluirConta}
                >
                  <Feather name="trash-2" size={20} color="#ff4d4d" />
                  <Text
                    style={[
                      styles.settingItemMain,
                      { color: "#ff4d4d", marginLeft: 15 },
                    ]}
                  >
                    Excluir conta
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: theme.texts.subtitle,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  section: {
    marginBottom: 25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 15,
    letterSpacing: 1,
  },
  situacaoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#f8f9fa",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  situacaoItemAtiva: {
    backgroundColor: theme.colors.cards,
    borderColor: theme.colors.cards,
  },
  situacaoTextContainer: { marginLeft: 15, flex: 1 },
  situacaoTextMain: { fontSize: 16, fontWeight: "600", color: "#333" },
  situacaoTextSub: { fontSize: 12, color: "#777" },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  textColumn: { flex: 1 },
  settingItemMain: { fontSize: 16, color: "#333", fontWeight: "500" },
  settingItemSub: { fontSize: 12, color: "#888" },
  settingLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
});
