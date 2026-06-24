import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  documentId,
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
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Compartilhar() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [nomeUser, setNomeUser] = useState("...");
  const [codigo, setCodigo] = useState("------");
  const [tipoUser, setTipoUser] = useState<"gestante" | "pai" | "mae" | "">("");
  const [codigoInput, setCodigoInput] = useState("");
  const [carregandoVinculo, setCarregandoVinculo] = useState(false);

  const [amigos, setAmigos] = useState<any[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);

  const [amigoSelecionado, setAmigoSelecionado] = useState<any>(null);
  const [detalhesGestacao, setDetalhesGestacao] = useState<any>(null);
  const [detalhesFilhos, setDetalhesFilhos] = useState<any[]>([]);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalSolicitacoesVisivel, setModalSolicitacoesVisivel] =
    useState(false);

  const [imagemZoomVisivel, setImagemZoomVisivel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const corPrimaria =
    tipoUser === "gestante"
      ? theme.colors.gestantesPrimary || "#a339b8"
      : theme.colors.paisSecondary || "#5407b8";

  const getTipoTexto = (tipo: string) => {
    if (tipo === "gestante") return "Gestante";
    if (tipo === "mae") return "Mãe";
    if (tipo === "pai") return "Pai";
    return "Pai / Mãe";
  };

  const carregarDadosListas = async (dados: any) => {
    const solicitacoesArray = dados.solicitacoesRecebidas || [];
    if (solicitacoesArray.length > 0) {
      const qSolicitacoes = query(
        collection(firestore, "usuarios"),
        where(documentId(), "in", solicitacoesArray.slice(0, 30)),
      );
      const snapSolicitacoes = await getDocs(qSolicitacoes);
      const listaSolicitacoes = snapSolicitacoes.docs.map((d) => ({
        id: d.id,
        nome: d.data().nome || "Usuário",
      }));
      setSolicitacoes(listaSolicitacoes);
    } else {
      setSolicitacoes([]);
    }

    const amigosArray = dados.amigos || [];
    if (amigosArray.length > 0) {
      const qAmigos = query(
        collection(firestore, "usuarios"),
        where(documentId(), "in", amigosArray.slice(0, 30)),
      );
      const snapAmigos = await getDocs(qAmigos);
      const listaAmigos = snapAmigos.docs.map((d) => {
        const amigoDados = d.data();
        return {
          id: d.id,
          nome: amigoDados.nome || "Sem nome",
          tipo: amigoDados.tipo || "Não definido",
          fotoPerfil: amigoDados.fotoPerfil || null,
          bio: amigoDados.bio || "",
          cidade: amigoDados.cidade || "",
          dataNascimento: amigoDados.dataNascimento || "",
        };
      });
      setAmigos(listaAmigos);
    } else {
      setAmigos([]);
    }
  };

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsub = onSnapshot(
      doc(firestore, "usuarios", uid),
      async (docSnap) => {
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setNomeUser(dados.nome || "Usuário");
          setCodigo(dados.codigoCompartilhamento || "------");
          setTipoUser(dados.tipo || "");
          await carregarDadosListas(dados);
        }
      },
    );

    return () => unsub();
  }, []);

  const onRefresh = React.useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setRefreshing(true);
    try {
      const docRef = doc(firestore, "usuarios", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const dados = docSnap.data();
        setNomeUser(dados.nome || "Usuário");
        setCodigo(dados.codigoCompartilhamento || "------");
        setTipoUser(dados.tipo || "");
        await carregarDadosListas(dados);
      }
    } catch (error) {
      console.log("Erro ao atualizar dados:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  async function buscarDetalhesAmigo(amigo: any) {
    setAmigoSelecionado(amigo);
    setModalVisivel(true);
    setCarregandoDetalhes(true);
    setDetalhesGestacao(null);
    setDetalhesFilhos([]);

    try {
      if (amigo.tipo === "gestante") {
        const gestacoesRef = collection(
          firestore,
          "usuarios",
          amigo.id,
          "gestacoes",
        );
        const q = query(gestacoesRef, where("status", "==", "ativa"));
        const snap = await getDocs(q);

        if (!snap.empty) {
          setDetalhesGestacao(snap.docs[0].data());
        }
      } else {
        const filhosRef = collection(firestore, "usuarios", amigo.id, "filhos");
        const snap = await getDocs(filhosRef);

        if (!snap.empty) {
          const listaFilhos = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
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

  async function enviarSolicitacao() {
    const uidAtual = auth.currentUser?.uid;
    if (codigoInput.length < 4 || !uidAtual) return;

    setCarregandoVinculo(true);

    try {
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

      if (amigos.some((amigo) => amigo.id === uidOutro)) {
        Alert.alert("Aviso", "Vocês já são amigos.");
        setCarregandoVinculo(false);
        return;
      }

      await updateDoc(doc(firestore, "usuarios", uidOutro), {
        solicitacoesRecebidas: arrayUnion(uidAtual),
      });

      setCodigoInput("");
      Alert.alert("Enviado!", `Solicitação enviada. Aguarde ele(a) aceitar.`);
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar solicitação.");
    } finally {
      setCarregandoVinculo(false);
    }
  }

  async function aceitarSolicitacao(solicitacao: any) {
    const uidAtual = auth.currentUser?.uid;
    if (!uidAtual) return;

    try {
      await updateDoc(doc(firestore, "usuarios", uidAtual), {
        solicitacoesRecebidas: arrayRemove(solicitacao.id),
        amigos: arrayUnion(solicitacao.id),
      });

      await updateDoc(doc(firestore, "usuarios", solicitacao.id), {
        amigos: arrayUnion(uidAtual),
      });

      Alert.alert(
        "Sucesso!",
        `Você aceitou ter amizade com ${solicitacao.nome}.`,
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível aceitar a solicitação.");
    }
  }

  async function recusarSolicitacao(solicitanteId: string) {
    const uidAtual = auth.currentUser?.uid;
    if (!uidAtual) return;

    try {
      await updateDoc(doc(firestore, "usuarios", uidAtual), {
        solicitacoesRecebidas: arrayRemove(solicitanteId),
      });
    } catch (error) {
      Alert.alert("Erro", "Falha ao recusar.");
    }
  }

  // --- NOVA FUNÇÃO PARA REMOVER AMIZADE ---
  function removerAmizade(amigoId: string, nomeAmigo: string) {
    Alert.alert(
      "Remover Amizade",
      `Tem certeza que deseja remover ${nomeAmigo} da sua lista de amigos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            const uidAtual = auth.currentUser?.uid;
            if (!uidAtual) return;

            try {
              await updateDoc(doc(firestore, "usuarios", uidAtual), {
                amigos: arrayRemove(amigoId),
              });
              await updateDoc(doc(firestore, "usuarios", amigoId), {
                amigos: arrayRemove(uidAtual),
              });

              setModalVisivel(false);
              Alert.alert("Sucesso", "Amizade removida.");
            } catch (error) {
              Alert.alert("Erro", "Falha ao remover amizade.");
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[corPrimaria]}
          tintColor={corPrimaria}
        />
      }
    >
      {/* CARD DO CÓDIGO */}
      <View style={[styles.card, { borderColor: corPrimaria, borderWidth: 1 }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="qr-code" size={30} color={corPrimaria} />
        </View>
        <Text
          style={{
            color: theme.colors.subtitle,
            marginTop: 2,
            fontSize: theme.texts.text,
          }}
        >
          {getTipoTexto(tipoUser)}
        </Text>
        <Text style={styles.title}>Seu Código</Text>

        <View style={styles.codeRow}>
          <Text style={[styles.codeText, { color: corPrimaria }]}>
            {codigo}
          </Text>
          <TouchableOpacity
            style={[styles.copyBtn, { backgroundColor: corPrimaria }]}
            onPress={() =>
              Share.share({
                message: `Me adicione no app! Meu código de compartilhamento é: ${codigo}`,
              })
            }
          >
            <Ionicons name="share-social-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ENVIAR SOLICITAÇÃO */}
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
            style={[styles.btnVincular, { backgroundColor: corPrimaria }]}
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

      {/* SEÇÃO DA LISTA */}
      <View style={styles.headerAmigosRow}>
        <Text style={styles.sectionLabelSemMargem}>
          Amigos ({amigos.length})
        </Text>
        <TouchableOpacity
          style={styles.btnSolicitacoes}
          onPress={() => setModalSolicitacoesVisivel(true)}
        >
          <Ionicons name="person-add-outline" size={24} color={corPrimaria} />
          {solicitacoes.length > 0 && <View style={styles.badgeVermelho} />}
        </TouchableOpacity>
      </View>

      {amigos.length > 0 ? (
        amigos.map((amigo) => (
          <View
            key={amigo.id}
            style={[styles.personCardDestaque, { borderColor: corPrimaria }]}
          >
            <View style={styles.row}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: corPrimaria, overflow: "hidden" },
                ]}
              >
                {amigo.fotoPerfil ? (
                  <Image
                    source={{ uri: amigo.fotoPerfil }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={
                      amigo.tipo === "gestante"
                        ? "human-pregnant"
                        : "baby-face-outline"
                    }
                    size={24}
                    color="white"
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.nomeText}>{amigo.nome}</Text>
                <Text style={styles.subText}>{getTipoTexto(amigo.tipo)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnVerPerfil, { backgroundColor: corPrimaria }]}
              onPress={() => buscarDetalhesAmigo(amigo)}
            >
              <Text style={styles.btnVerPerfilText}>Ver Perfil</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.vazioCard}>
          <Text style={styles.vazioText}>Nenhuma amizade ainda.</Text>
        </View>
      )}

      {/* MODAL SOLICITAÇÕES RECEBIDAS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalSolicitacoesVisivel}
        onRequestClose={() => setModalSolicitacoesVisivel(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitações Recebidas</Text>
              <TouchableOpacity
                onPress={() => setModalSolicitacoesVisivel(false)}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {solicitacoes.length > 0 ? (
                solicitacoes.map((solicitacao) => (
                  <View
                    key={solicitacao.id}
                    style={[
                      styles.itemSolicitacaoModal,
                      { borderLeftColor: corPrimaria },
                    ]}
                  >
                    <Text style={styles.solicitacaoTexto}>
                      <Text style={{ fontWeight: "bold" }}>
                        {solicitacao.nome}
                      </Text>{" "}
                      te enviou um pedido de amizade.
                    </Text>
                    <View style={styles.botoesAlerta}>
                      <TouchableOpacity
                        style={[styles.btnAcao, { backgroundColor: "#4CAF50" }]}
                        onPress={() => aceitarSolicitacao(solicitacao)}
                      >
                        <Text style={styles.btnAcaoText}>Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btnAcao, { backgroundColor: "#F44336" }]}
                        onPress={() => recusarSolicitacao(solicitacao.id)}
                      >
                        <Text style={styles.btnAcaoText}>Recusar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.textoVazioDetalhes}>
                  Nenhuma solicitação pendente.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DE VISUALIZAÇÃO DO PERFIL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <View style={styles.headerModalPerfil}>
              <Text style={styles.modalTituloPerfil}>Perfil do Amigo</Text>

              <View style={styles.botoesAcaoModal}>
                {amigoSelecionado && (
                  <TouchableOpacity
                    onPress={() =>
                      removerAmizade(amigoSelecionado.id, amigoSelecionado.nome)
                    }
                    style={styles.fecharModalPerfilBtn}
                  >
                    <Feather name="user-x" size={24} color="#F44336" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setModalVisivel(false)}
                  style={styles.fecharModalPerfilBtn}
                >
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {amigoSelecionado && (
              <ScrollView
                style={{ width: "100%" }}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.containerFoto}>
                  <TouchableOpacity
                    style={[styles.bordaFoto, { borderColor: corPrimaria }]}
                    onPress={() => {
                      if (amigoSelecionado.fotoPerfil) {
                        setImagemZoomVisivel(true);
                      }
                    }}
                    activeOpacity={amigoSelecionado.fotoPerfil ? 0.7 : 1}
                  >
                    {amigoSelecionado.fotoPerfil ? (
                      <Image
                        source={{ uri: amigoSelecionado.fotoPerfil }}
                        style={styles.foto}
                      />
                    ) : (
                      <Ionicons name="person" size={50} color="#ccc" />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={styles.nomePerfilExibicao}>
                  {amigoSelecionado.nome}
                </Text>
                <Text style={styles.tipoContaExibicao}>
                  {getTipoTexto(amigoSelecionado.tipo)}
                </Text>

                <View style={styles.containerBio}>
                  {amigoSelecionado.bio ? (
                    <Text style={styles.textoBio}>
                      {'"'}
                      {amigoSelecionado.bio}
                      {'"'}
                    </Text>
                  ) : (
                    <Text style={[styles.textoBio, { color: "#999" }]}>
                      Nenhuma biografia informada.
                    </Text>
                  )}
                </View>

                <View style={styles.blocoCampos}>
                  <Text style={styles.labelCampo}>Cidade</Text>
                  <View style={styles.containerCampoLeitura}>
                    <Text style={styles.textoCampoLeitura}>
                      {amigoSelecionado.cidade || "Não informada"}
                    </Text>
                  </View>

                  <Text style={styles.labelCampo}>Data de Nascimento</Text>
                  <View style={styles.containerCampoLeitura}>
                    <Text style={styles.textoCampoLeitura}>
                      {amigoSelecionado.dataNascimento || "Não informada"}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#EAEAEA",
                    marginVertical: 15,
                  }}
                />

                {carregandoDetalhes ? (
                  <ActivityIndicator
                    size="large"
                    color={corPrimaria}
                    style={{ marginVertical: 15 }}
                  />
                ) : (
                  <>
                    {amigoSelecionado.tipo === "gestante" &&
                      detalhesGestacao && (
                        <View style={{ marginTop: 5 }}>
                          <Text
                            style={[
                              styles.tituloSubsecao,
                              { color: corPrimaria },
                            ]}
                          >
                            Gravidez
                          </Text>
                          <View
                            style={[
                              styles.cardDadosExtras,
                              { borderLeftColor: corPrimaria },
                            ]}
                          >
                            <Text style={styles.labelExtra}>
                              DUM (Data da Última Menstruação):
                            </Text>
                            <Text style={styles.valorExtra}>
                              {detalhesGestacao.dataUltimaMenstruacao}
                            </Text>
                          </View>
                        </View>
                      )}

                    {amigoSelecionado.tipo !== "gestante" &&
                      detalhesFilhos.length > 0 && (
                        <View style={{ marginTop: 5 }}>
                          <Text
                            style={[
                              styles.tituloSubsecao,
                              { color: corPrimaria },
                            ]}
                          >
                            Filhos
                          </Text>
                          {detalhesFilhos.map((filho) => (
                            <View
                              key={filho.id}
                              style={[
                                styles.cardDadosExtras,
                                { borderLeftColor: corPrimaria },
                              ]}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Text style={styles.nomeFilhoText}>
                                  {filho.nome}
                                </Text>
                                <Text
                                  style={{ fontSize: theme.texts.subtitle }}
                                >
                                  {filho.sexo === "menino" ? "👦" : "👧"}
                                </Text>
                              </View>
                              <Text style={styles.dataFilhoText}>
                                Nascimento: {filho.dataNascimento}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {amigoSelecionado.tipo === "gestante" &&
                      !detalhesGestacao && (
                        <Text style={styles.textoVazioInterno}>
                          Sem informações de gestação ativa de momento.
                        </Text>
                      )}
                    {amigoSelecionado.tipo !== "gestante" &&
                      detalhesFilhos.length === 0 && (
                        <Text style={styles.textoVazioInterno}>
                          Nenhum filho cadastrado por este utilizador.
                        </Text>
                      )}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={imagemZoomVisivel}
        onRequestClose={() => setImagemZoomVisivel(false)}
      >
        <View style={styles.modalZoomFundo}>
          <TouchableOpacity
            style={styles.fecharZoomBtn}
            onPress={() => setImagemZoomVisivel(false)}
          >
            <Feather name="x" size={32} color="#FFF" />
          </TouchableOpacity>
          {amigoSelecionado?.fotoPerfil && (
            <Image
              source={{ uri: amigoSelecionado.fotoPerfil }}
              style={styles.fotoZoom}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#F8F9FA" },
    card: {
      backgroundColor: theme.colors.gestantesCard || "#FFF",
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
      color: theme.colors.text,
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
      color: theme.colors.subtitle,
    },
    sectionLabelSemMargem: {
      fontWeight: "bold",
      fontSize: theme.texts.subtitle,
      color: theme.colors.subtitle,
    },
    headerAmigosRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    btnSolicitacoes: {
      position: "relative",
      padding: 8,
      backgroundColor: "white",
      borderRadius: 10,
      elevation: 1,
    },
    badgeVermelho: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#F44336",
      borderWidth: 1,
      borderColor: "white",
    },
    itemSolicitacaoModal: {
      backgroundColor: "#F8F9FA",
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
    },
    solicitacaoTexto: {
      fontSize: theme.texts.text,
      color: "#333",
      marginBottom: 10,
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
    vazioText: {
      color: "#999",
      fontStyle: "italic",
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
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: {
      backgroundColor: "#FFF",
      width: "100%",
      maxHeight: "75%",
      padding: 20,
      borderRadius: 25,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
    },
    modalTitle: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      color: "#333",
    },
    modalBody: {
      width: "100%",
    },
    modalFundo: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalCard: {
      backgroundColor: "#FFF",
      width: "100%",
      maxHeight: "85%",
      padding: 20,
      borderRadius: 25,
      alignItems: "center",
    },
    headerModalPerfil: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
    },
    modalTituloPerfil: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: "#333",
    },
    botoesAcaoModal: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    fecharModalPerfilBtn: {
      padding: 4,
    },
    containerFoto: {
      alignItems: "center",
      marginVertical: 10,
    },
    bordaFoto: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F4F4F4",
      overflow: "hidden",
    },
    foto: {
      width: "100%",
      height: "100%",
    },
    nomePerfilExibicao: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      textAlign: "center",
      color: "#333",
      marginTop: 5,
    },
    tipoContaExibicao: {
      fontSize: theme.texts.text,
      color: "#777",
      textAlign: "center",
      marginBottom: 10,
      fontWeight: "500",
    },
    containerBio: {
      backgroundColor: "#F9F9F9",
      padding: 12,
      borderRadius: 12,
      marginVertical: 5,
    },
    textoBio: {
      fontSize: theme.texts.text,
      color: "#555",
      textAlign: "center",
      fontStyle: "italic",
    },
    blocoCampos: {
      width: "100%",
      marginTop: 10,
    },
    labelCampo: {
      fontSize: theme.texts.text,
      fontWeight: "600",
      color: "#666",
      marginBottom: 4,
      marginTop: 8,
    },
    containerCampoLeitura: {
      backgroundColor: "#F5F5F5",
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 50,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#EAEAEA",
    },
    textoCampoLeitura: {
      fontSize: theme.texts.text,
      color: "#333",
    },
    tituloSubsecao: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      marginBottom: 10,
      marginTop: 5,
    },
    cardDadosExtras: {
      backgroundColor: "#F9F9F9",
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderLeftWidth: 4,
    },
    labelExtra: {
      fontSize: theme.texts.text,
      color: "#666",
      fontWeight: "500",
    },
    valorExtra: {
      fontSize: theme.texts.text,
      color: "#333",
      fontWeight: "bold",
      marginTop: 2,
    },
    nomeFilhoText: {
      fontSize: theme.texts.text,
      fontWeight: "bold",
      color: "#333",
    },
    dataFilhoText: {
      fontSize: theme.texts.text,
      color: "#666",
      marginTop: 2,
    },
    textoVazioInterno: {
      textAlign: "center",
      color: "#999",
      fontStyle: "italic",
      marginVertical: 10,
      fontSize: theme.texts.text,
    },
    textoVazioDetalhes: {
      textAlign: "center",
      color: "#999",
      fontStyle: "italic",
      marginVertical: 20,
      fontSize: theme.texts.text,
    },
    modalZoomFundo: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    fecharZoomBtn: {
      position: "absolute",
      top: 50,
      right: 20,
      zIndex: 10,
      padding: 10,
    },
    fotoZoom: {
      width: "100%",
      height: "80%",
    },
  });
