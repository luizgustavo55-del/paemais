import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/context/AuthContext";
import { auth, db, firestore } from "@/src/services/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// 👇 Importações ajustadas para suportar ambos os bancos
import {
  equalTo,
  get,
  onValue,
  orderByChild,
  query as queryRTDB,
  ref,
  update as updateRTDB,
} from "firebase/database";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query as queryFirestore,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Função utilitária para buscar um usuário, não importa em qual banco ele esteja
async function buscarQualquerUsuario(uid: string) {
  // 1. Tenta no Firestore (Gestante)
  const snap = await getDoc(doc(firestore, "usuarios", uid));
  if (snap.exists()) return snap.data();

  // 2. Tenta no Realtime Database (Pai)
  const rtdbSnap = await get(ref(db, `usuarios/${uid}`));
  if (rtdbSnap.exists()) return rtdbSnap.val();

  return null;
}

export default function Compartilhar() {
  const { user } = useAuth();
  const isPai = user?.tipo === "pai";

  const corPrincipal = "#9333EA";
  const corFundoCard = "#F3E8FF";

  const [nomeUser, setNomeUser] = useState("Carregando...");
  const [codigo, setCodigo] = useState("------");
  const [codigoInput, setCodigoInput] = useState("");
  const [carregandoVinculo, setCarregandoVinculo] = useState(false);

  const [dadosVinculado, setDadosVinculado] = useState<any>(null);
  const [solicitacao, setSolicitacao] = useState<any>(null);

  const [detalhesGestacao, setDetalhesGestacao] = useState<any>(null);
  const [detalhesFilhos, setDetalhesFilhos] = useState<any[]>([]);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);

  // 🔥 Efeito que escuta as mudanças do perfil (CÓDIGO RESOLVIDO AQUI)
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Função interna para processar os dados recebidos de qualquer banco
    const processarDadosUsuario = async (dados: any) => {
      setNomeUser(dados.nome || "Usuário");
      setCodigo(dados.codigoCompartilhamento || "------");

      // Verifica solicitações
      if (dados.solicitacaoRecebidaDe) {
        const remetenteDados = await buscarQualquerUsuario(
          dados.solicitacaoRecebidaDe,
        );
        if (remetenteDados) {
          setSolicitacao({
            id: dados.solicitacaoRecebidaDe,
            nome: remetenteDados.nome,
          });
        }
      } else {
        setSolicitacao(null);
      }

      // Verifica vínculo (Amigo)
      if (dados.perfilVinculado) {
        const parceiroDados = await buscarQualquerUsuario(
          dados.perfilVinculado,
        );
        if (parceiroDados) {
          setDadosVinculado({
            id: dados.perfilVinculado,
            nome: parceiroDados.nome || "Sem nome",
            email: parceiroDados.email || "Sem email",
            tipo: parceiroDados.tipo || parceiroDados.perfil || "Não definido",
          });
        }
      } else {
        setDadosVinculado(null);
      }
    };

    if (isPai) {
      // PAI ESCUTA O REALTIME DATABASE
      const userRef = ref(db, `usuarios/${uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          processarDadosUsuario(snapshot.val());
        }
      });
      return () => unsubscribe();
    } else {
      // GESTANTE ESCUTA O FIRESTORE
      const unsub = onSnapshot(doc(firestore, "usuarios", uid), (docSnap) => {
        if (docSnap.exists()) {
          processarDadosUsuario(docSnap.data());
        }
      });
      return () => unsub();
    }
  }, [isPai]);

  async function buscarDetalhesAmigo(amigoId: string, tipoAmigo: string) {
    setCarregandoDetalhes(true);
    setDetalhesGestacao(null);
    setDetalhesFilhos([]);

    try {
      if (tipoAmigo === "gestante") {
        const gestacoesRef = collection(
          firestore,
          "usuarios",
          amigoId,
          "gestacoes",
        );
        const q = queryFirestore(gestacoesRef, where("status", "==", "ativa"));
        const snap = await getDocs(q);

        if (!snap.empty) {
          setDetalhesGestacao(snap.docs[0].data());
        }
      } else {
        const filhosRef = ref(db, `usuarios/${amigoId}/filhos`);
        const snap = await get(filhosRef);

        if (snap.exists()) {
          const dadosObj = snap.val();
          const listaFilhos = Object.keys(dadosObj).map((key) => ({
            id: key,
            ...dadosObj[key],
          }));
          setDetalhesFilhos(listaFilhos);
        }
      }
    } catch (error) {
      console.log("Erro ao buscar detalhes:", error);
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  // 🔥 Busca o código da pessoa misturando os dois bancos
  async function enviarSolicitacao() {
    const uidAtual = auth.currentUser?.uid;
    const codigoBusca = codigoInput.toUpperCase().trim();
    if (codigoBusca.length < 4 || !uidAtual) return;

    setCarregandoVinculo(true);

    try {
      let uidOutro = null;
      let tipoOutro = "";

      // 1. Procura no Firestore
      const qFs = queryFirestore(
        collection(firestore, "usuarios"),
        where("codigoCompartilhamento", "==", codigoBusca),
      );
      const snapFs = await getDocs(qFs);

      if (!snapFs.empty) {
        uidOutro = snapFs.docs[0].id;
        tipoOutro = "gestante";
      } else {
        // 2. Procura no Realtime Database
        const qRtdb = queryRTDB(
          ref(db, "usuarios"),
          orderByChild("codigoCompartilhamento"),
          equalTo(codigoBusca),
        );
        const snapRtdb = await get(qRtdb);

        if (snapRtdb.exists()) {
          const result = snapRtdb.val();
          uidOutro = Object.keys(result)[0]; // Pega o ID encontrado
          tipoOutro = "pai";
        }
      }

      if (!uidOutro) {
        Alert.alert("Erro", "Código não encontrado.");
        setCarregandoVinculo(false);
        return;
      }

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

      // Salva a solicitação no banco correto da outra pessoa
      if (tipoOutro === "gestante") {
        await updateDoc(doc(firestore, "usuarios", uidOutro), {
          solicitacaoRecebidaDe: uidAtual,
        });
      } else {
        await updateRTDB(ref(db, `usuarios/${uidOutro}`), {
          solicitacaoRecebidaDe: uidAtual,
        });
      }

      setCodigoInput("");
      Alert.alert("Enviado!", `Solicitação enviada. Aguarde ele(a) aceitar.`);
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar solicitação.");
    } finally {
      setCarregandoVinculo(false);
    }
  }

  async function aceitarSolicitacao() {
    const uidAtual = auth.currentUser?.uid;
    if (!uidAtual || !solicitacao) return;

    try {
      // 1. Atualiza o SEU perfil
      if (isPai) {
        await updateRTDB(ref(db, `usuarios/${uidAtual}`), {
          perfilVinculado: solicitacao.id,
          solicitacaoRecebidaDe: null,
        });
      } else {
        await updateDoc(doc(firestore, "usuarios", uidAtual), {
          perfilVinculado: solicitacao.id,
          solicitacaoRecebidaDe: null,
        });
      }

      // 2. Atualiza o perfil do AMIGO
      const friendData = await buscarQualquerUsuario(solicitacao.id);
      if (friendData?.tipo === "gestante") {
        await updateDoc(doc(firestore, "usuarios", solicitacao.id), {
          perfilVinculado: uidAtual,
        });
      } else {
        await updateRTDB(ref(db, `usuarios/${solicitacao.id}`), {
          perfilVinculado: uidAtual,
        });
      }

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
      if (isPai) {
        await updateRTDB(ref(db, `usuarios/${uidAtual}`), {
          solicitacaoRecebidaDe: null,
        });
      } else {
        await updateDoc(doc(firestore, "usuarios", uidAtual), {
          solicitacaoRecebidaDe: null,
        });
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao recusar.");
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      <View style={[styles.card, { backgroundColor: corFundoCard }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="qr-code" size={30} color={corPrincipal} />
        </View>
        <Text style={styles.title}>Meu Código</Text>
        <View style={styles.codeRow}>
          <Text style={[styles.codeText, { color: corPrincipal }]}>
            {codigo}
          </Text>
          <TouchableOpacity
            style={[styles.copyBtn, { backgroundColor: corPrincipal }]}
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

      <View style={styles.vincularSection}>
        <Text style={styles.sectionLabel}>Adicionar Amigos</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Digite o código do amigo"
            autoCapitalize="characters"
            value={codigoInput}
            onChangeText={setCodigoInput}
          />
          <TouchableOpacity
            style={[styles.btnVincular, { backgroundColor: corPrincipal }]}
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

      {dadosVinculado ? (
        <View
          style={[styles.personCardDestaque, { borderColor: corPrincipal }]}
        >
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: corPrincipal }]}>
              <Ionicons name="heart" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.nomeText}>{dadosVinculado.nome}</Text>
              <Text style={styles.subText}>Amigo</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnVerPerfil, { backgroundColor: corPrincipal }]}
            onPress={() => {
              setModalVisivel(true);
              buscarDetalhesAmigo(dadosVinculado.id, dadosVinculado.tipo);
            }}
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
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.infoRow}>
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={corPrincipal}
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
                    color={corPrincipal}
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
                    color={corPrincipal}
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

                <View style={styles.divisor} />

                {carregandoDetalhes ? (
                  <View style={{ padding: 20 }}>
                    <ActivityIndicator size="large" color={corPrincipal} />
                  </View>
                ) : (
                  <>
                    {dadosVinculado.tipo === "gestante" && detalhesGestacao && (
                      <View style={styles.extraContainer}>
                        <Text
                          style={[styles.extraTitle, { color: corPrincipal }]}
                        >
                          Status da Gravidez 🤰
                        </Text>
                        <View style={styles.infoRow}>
                          <MaterialCommunityIcons
                            name="calendar-heart"
                            size={24}
                            color={corPrincipal}
                          />
                          <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>DUM:</Text>
                            <Text style={styles.infoValor}>
                              {detalhesGestacao.dataUltimaMenstruacao}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {dadosVinculado.tipo !== "gestante" &&
                      detalhesFilhos.length > 0 && (
                        <View style={styles.extraContainer}>
                          <Text
                            style={[styles.extraTitle, { color: corPrincipal }]}
                          >
                            Filhos Cadastrados 👶
                          </Text>
                          {detalhesFilhos.map((filho) => (
                            <View
                              key={filho.id}
                              style={[
                                styles.filhoCard,
                                { borderLeftColor: corPrincipal },
                              ]}
                            >
                              <View style={styles.filhoHeader}>
                                <Text style={styles.filhoNome}>
                                  {filho.nome}
                                </Text>
                                <Text style={styles.filhoSexo}>
                                  {filho.sexo === "menino" ? "👦" : "👧"}
                                </Text>
                              </View>
                              <Text style={styles.filhoData}>
                                Nascimento: {filho.dataNascimento}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {dadosVinculado.tipo === "gestante" &&
                      !detalhesGestacao && (
                        <Text style={styles.textoVazioDetalhes}>
                          Esta pessoa ainda não configurou a DUM.
                        </Text>
                      )}
                    {dadosVinculado.tipo !== "gestante" &&
                      detalhesFilhos.length === 0 && (
                        <Text style={styles.textoVazioDetalhes}>
                          Nenhum filho cadastrado ainda.
                        </Text>
                      )}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 10
          : 40
        : 16,
    backgroundColor: "#F8F9FA",
  },
  card: {
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
    letterSpacing: 2,
  },
  copyBtn: {
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
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  personCardDestaque: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "column",
    borderWidth: 2,
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
    maxHeight: "85%",
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
  modalBody: { gap: 10 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
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
  divisor: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 15,
  },
  extraContainer: { marginTop: 5 },
  extraTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  filhoCard: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  filhoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  filhoNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  filhoSexo: { fontSize: 18 },
  filhoData: {
    fontSize: 14,
    color: "#777",
  },
  textoVazioDetalhes: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginVertical: 20,
  },
});
