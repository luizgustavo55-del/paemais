import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Compartilhar() {
  const [nomeUser, setNomeUser] = useState("Carregando...");
  const [codigo, setCodigo] = useState("------");
  const [codigoInput, setCodigoInput] = useState("");
  const [carregandoVinculo, setCarregandoVinculo] = useState(false);

  // Estados para Vínculo e Solicitação
  const [dadosVinculado, setDadosVinculado] = useState<{
    id: string;
    nome: string;
    email: string;
    tipo: string;
  } | null>(null);
  const [solicitacao, setSolicitacao] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  // Estado do Modal
  const [modalVisivel, setModalVisivel] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // onSnapshot escuta as mudanças em tempo real!
    const unsub = onSnapshot(
      doc(firestore, "usuarios", uid),
      async (docSnap) => {
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setNomeUser(dados.nome || "Usuário");
          setCodigo(dados.codigoCompartilhamento || "------");

          // 1. Verifica se alguém me enviou uma solicitação
          if (dados.solicitacaoRecebidaDe) {
            const remetenteRef = doc(
              firestore,
              "usuarios",
              dados.solicitacaoRecebidaDe,
            );
            const remetenteSnap = await getDoc(remetenteRef);
            if (remetenteSnap.exists()) {
              setSolicitacao({
                id: dados.solicitacaoRecebidaDe,
                nome: remetenteSnap.data().nome,
              });
            }
          } else {
            setSolicitacao(null);
          }

          // 2. Verifica se eu já tenho alguém vinculado para montar o Modal
          if (dados.perfilVinculado) {
            const parceiroRef = doc(
              firestore,
              "usuarios",
              dados.perfilVinculado,
            );
            const parceiroSnap = await getDoc(parceiroRef);
            if (parceiroSnap.exists()) {
              const parceiroDados = parceiroSnap.data();
              setDadosVinculado({
                id: dados.perfilVinculado,
                nome: parceiroDados.nome || "Sem nome",
                email: parceiroDados.email || "Sem email",
                tipo: parceiroDados.tipo || "Não definido",
              });
            }
          } else {
            setDadosVinculado(null);
          }
        }
      },
    );

    return () => unsub(); // Limpa a escuta ao sair da tela
  }, []);

  // -------------------------------------------------------------
  // FUNÇÃO: ENVIAR SOLICITAÇÃO (Em vez de vincular direto)
  // -------------------------------------------------------------
  async function enviarSolicitacao() {
    const uidAtual = auth.currentUser?.uid;
    if (codigoInput.length < 4 || !uidAtual) return;

    setCarregandoVinculo(true);

    try {
      // Busca a pessoa pelo código
      const q = query(
        collection(firestore, "usuarios"),
        where("codigoCompartilhamento", "==", codigoInput.toUpperCase().trim()),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Erro", "Código não encontrado.");
        setCarregandoVinculo(false);
        return;
      }

      const outroUsuarioDoc = querySnapshot.docs[0];
      const uidOutro = outroUsuarioDoc.id;

      if (uidOutro === uidAtual) {
        Alert.alert("Aviso", "Você não pode enviar solicitação para si mesmo.");
        setCarregandoVinculo(false);
        return;
      }

      if (dadosVinculado?.id === uidOutro) {
        Alert.alert("Aviso", "Vocês já estão conectados.");
        setCarregandoVinculo(false);
        return;
      }

      // ATUALIZA O PERFIL DA OUTRA PESSOA (Envia a notificação)
      await updateDoc(doc(firestore, "usuarios", uidOutro), {
        solicitacaoRecebidaDe: uidAtual,
      });

      setCodigoInput("");
      Alert.alert("Enviado!", `Solicitação enviada. Aguarde ele(a) aceitar.`);
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar solicitação.");
    } finally {
      setCarregandoVinculo(false);
    }
  }

  // -------------------------------------------------------------
  // FUNÇÕES: ACEITAR OU RECUSAR
  // -------------------------------------------------------------
  async function aceitarSolicitacao() {
    const uidAtual = auth.currentUser?.uid;
    if (!uidAtual || !solicitacao) return;

    try {
      // Atualiza o meu perfil (Cria o vínculo e apaga o aviso de solicitação)
      await updateDoc(doc(firestore, "usuarios", uidAtual), {
        perfilVinculado: solicitacao.id,
        solicitacaoRecebidaDe: null,
      });

      // Atualiza o perfil da outra pessoa (Cria o vínculo para ela também)
      await updateDoc(doc(firestore, "usuarios", solicitacao.id), {
        perfilVinculado: uidAtual,
      });

      Alert.alert(
        "Sucesso!",
        `Você aceitou ter amizade com ${solicitacao.nome}.`,
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível aceitar a solicitação.");
    }
  }

  async function recusarSolicitacao() {
    const uidAtual = auth.currentUser?.uid;
    if (!uidAtual) return;

    try {
      await updateDoc(doc(firestore, "usuarios", uidAtual), {
        solicitacaoRecebidaDe: null,
      });
    } catch (error) {
      Alert.alert("Erro", "Falha ao recusar.");
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* SEÇÃO DE SOLICITAÇÃO RECEBIDA PENDENTE */}
      {solicitacao && (
        <View style={styles.alertaContainer}>
          <Text style={styles.alertaTitle}>Nova Solicitação!</Text>
          <Text style={styles.alertaDesc}>
            <Text style={{ fontWeight: "bold" }}>{solicitacao.nome}</Text> quer
            te adicionar de amizade
          </Text>
          <View style={styles.botoesAlerta}>
            <TouchableOpacity
              style={[styles.btnAcao, { backgroundColor: "#4CAF50" }]}
              onPress={aceitarSolicitacao}
            >
              <Text style={styles.btnAcaoText}>Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAcao, { backgroundColor: "#F44336" }]}
              onPress={recusarSolicitacao}
            >
              <Text style={styles.btnAcaoText}>Recusar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MEU CÓDIGO */}
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="qr-code" size={30} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Meu Código</Text>
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>{codigo}</Text>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={() =>
              Share.share({
                message: `Me adicione no app de nomes! Código: ${codigo}`,
              })
            }
          >
            <Ionicons name="share-social-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* INPUT PARA ENVIAR SOLICITAÇÃO */}
      <View style={styles.vincularSection}>
        <Text style={styles.sectionLabel}>Adicionar Amigos</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Digite o código de Usuario"
            autoCapitalize="characters"
            value={codigoInput}
            onChangeText={setCodigoInput}
          />
          <TouchableOpacity
            style={styles.btnVincular}
            onPress={enviarSolicitacao}
          >
            {carregandoVinculo ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Amigos</Text>

      {/* CARD DA PESSOA VINCULADA */}
      {dadosVinculado ? (
        <View style={styles.personCardDestaque}>
          <View style={styles.row}>
            <View
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons name="heart" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.nomeText}>{dadosVinculado.nome}</Text>
              <Text style={styles.subText}>Amigo</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnVerPerfil}
            onPress={() => setModalVisivel(true)}
          >
            <Text style={styles.btnVerPerfilText}>Ver Perfil</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.vazioCard}>
          <Text style={styles.vazioText}>Nenhuma Amizade ainda.</Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Informações do Perfil</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {dadosVinculado && (
              <View style={styles.modalBody}>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Nome:</Text>
                    <Text style={styles.infoValor}>{dadosVinculado.nome}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValor}>{dadosVinculado.email}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="star-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Tipo de Conta:</Text>
                    <Text
                      style={[
                        styles.infoValor,
                        { textTransform: "capitalize" },
                      ]}
                    >
                      {dadosVinculado.tipo}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8F9FA" },
  card: {
    backgroundColor: theme.colors.terceary,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  iconCircle: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.title,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  codeText: {
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 10,
  },

  vincularSection: { marginBottom: 25 },
  sectionLabel: {
    fontWeight: "bold",
    fontSize: theme.texts.subtitle,
    marginBottom: 10,
    color: "#333",
  },
  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    fontSize: theme.texts.text,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  btnVincular: {
    backgroundColor: theme.colors.primary,
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  personCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  personCardDestaque: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "column",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    gap: 12,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  nomeText: { fontWeight: "bold", fontSize: theme.texts.subtitle },
  subText: { fontSize: theme.texts.text, color: "#666" },

  btnVerPerfil: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnVerPerfilText: {
    color: "white",
    fontWeight: "bold",
    fontSize: theme.texts.text,
  },
  vazioCard: { padding: 20, alignItems: "center" },
  vazioText: { color: "#999", fontStyle: "italic", fontSize: theme.texts.text },

  alertaContainer: {
    backgroundColor: theme.colors.cards,
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  alertaTitle: {
    fontWeight: "bold",
    fontSize: theme.texts.title,
    color: theme.colors.title,
  },
  alertaDesc: {
    marginVertical: 10,
    color: theme.colors.texts,
    fontSize: theme.texts.text,
  },

  botoesAlerta: { flexDirection: "row", gap: 10 },
  btnAcao: { flex: 1, padding: 10, borderRadius: 10, alignItems: "center" },
  btnAcaoText: {
    color: "white",
    fontWeight: "bold",
    fontSize: theme.texts.text,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#EEE",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: { gap: 15 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
  },
  infoTextContainer: { flex: 1 },
  infoLabel: {
    fontSize: theme.texts.subtitle,
    color: "#333",
    fontWeight: "bold",
  },
  infoValor: {
    fontSize: theme.texts.text,
    color: "#888",
    fontWeight: "500",
    marginTop: 2,
  },
});
