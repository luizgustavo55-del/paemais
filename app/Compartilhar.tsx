import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
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
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function CompartilharPais() {
  const { theme } = useTheme();
  const router = useRouter();

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

  const qtdSolicitacoesRef = useRef(0);
  const primeiraCargaRef = useRef(true);

  // Cores ESTÁTICAS para a interface de Pais
  const corPrimaria = theme.colors.paisSecondary || "#7050b3";
  const styles = getStyles(theme, corPrimaria);

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

          const solicitacoesAtuais = dados.solicitacoesRecebidas || [];

          if (
            !primeiraCargaRef.current &&
            solicitacoesAtuais.length > qtdSolicitacoesRef.current
          ) {
            const config = dados.configuracoes || {};
            const notificacoesDesligadas = config.notificacoesAtivas === false;

            let emDescanso = false;
            if (config.descansoAtivo && config.horaInicio && config.horaFim) {
              const agora = new Date();
              const minutosAtual = agora.getHours() * 60 + agora.getMinutes();

              const [hI, mI] = config.horaInicio.split(":").map(Number);
              const minutosInicio = hI * 60 + mI;

              const [hF, mF] = config.horaFim.split(":").map(Number);
              const minutosFim = hF * 60 + mF;

              if (minutosInicio < minutosFim) {
                emDescanso =
                  minutosAtual >= minutosInicio && minutosAtual < minutosFim;
              } else {
                emDescanso =
                  minutosAtual >= minutosInicio || minutosAtual < minutosFim;
              }
            }

            if (!notificacoesDesligadas && !emDescanso) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: "Novo Pedido de Amizade! 🤝",
                  body: "Alguém adicionou o seu código de compartilhamento.",
                  sound: true,
                  autoDismiss: false,
                },
                trigger: {
                  seconds: 1,
                  channelId: "lembretes-dia-a-dia",
                },
              });
            }
          }

          qtdSolicitacoesRef.current = solicitacoesAtuais.length;
          primeiraCargaRef.current = false;

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
      console.log(error);
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
      console.log(error);
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER DE NAVEGAÇÃO COM BOTÃO VOLTAR */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Comunidade</Text>
          </View>
        </View>

        <Text style={styles.titleScreen}>Compartilhar Perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
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
        <View
          style={[styles.card, { borderColor: corPrimaria, borderWidth: 1 }]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="qr-code" size={30} color={corPrimaria} />
          </View>
          <Text
            style={{
              fontSize: theme.texts.subtitle,
              fontWeight: "600",
              color: "#333",
            }}
          >
            Olá, {nomeUser}
          </Text>
          <Text
            style={{
              color: "#666",
              marginTop: 2,
              fontSize: theme.texts.text,
            }}
          >
            {getTipoTexto(tipoUser)}
          </Text>
          <Text style={[styles.title, { marginTop: 10 }]}>Seu Código</Text>

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

              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  paddingTop: 10,
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.btnVerPerfil,
                    { backgroundColor: corPrimaria, flex: 1 },
                  ]}
                  onPress={() => buscarDetalhesAmigo(amigo)}
                >
                  <Text style={styles.btnVerPerfilText}>Ver Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btnVerPerfil,
                    { backgroundColor: corPrimaria, flex: 1 },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/chat",
                      params: { id: amigo.id, nomeAmigo: amigo.nome },
                    })
                  }
                >
                  <Text style={styles.btnVerPerfilText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.vazioCard}>
            <Text style={styles.vazioText}>Nenhuma amizade ainda.</Text>
          </View>
        )}
      </ScrollView>

      {/* MODALS */}
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
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {solicitacoes.length > 0 ? (
                solicitacoes.map((sol) => (
                  <View
                    key={sol.id}
                    style={[
                      styles.itemSolicitacaoModal,
                      { borderLeftColor: corPrimaria },
                    ]}
                  >
                    <Text style={styles.solicitacaoTexto}>
                      <Text style={{ fontWeight: "bold" }}>{sol.nome}</Text>{" "}
                      quer ser seu amigo(a).
                    </Text>
                    <View style={styles.rowBotoesAcao}>
                      <TouchableOpacity
                        style={[
                          styles.btnAcaoList,
                          { backgroundColor: corPrimaria },
                        ]}
                        onPress={() => aceitarSolicitacao(sol)}
                      >
                        <Text style={styles.btnAcaoText}>Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.btnAcaoList,
                          { backgroundColor: "#E0E0E0" },
                        ]}
                        onPress={() => recusarSolicitacao(sol.id)}
                      >
                        <Text style={[styles.btnAcaoText, { color: "#333" }]}>
                          Recusar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.textoVazioDetalhes}>
                  Nenhuma solicitação no momento.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                      {'"'} {amigoSelecionado.bio} {'"'}
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
                    {/* AQUI ESTÁ O DUM RETORNANDO EXATAMENTE COMO NO CÓDIGO ANTIGO */}
                    {amigoSelecionado.tipo === "gestante" &&
                      detalhesGestacao && (
                        <View style={{ marginTop: 5 }}>
                          <Text style={styles.tituloSubsecao}>
                            Detalhes da Gestação
                          </Text>
                          <View
                            style={[
                              styles.cardDadosExtras,
                              { borderLeftColor: corPrimaria },
                            ]}
                          >
                            <Text style={styles.labelExtra}>
                              DUM (Última Menstruação)
                            </Text>
                            <Text style={styles.valorExtra}>
                              {detalhesGestacao.dum || "--"}
                            </Text>

                            <Text
                              style={[styles.labelExtra, { marginTop: 10 }]}
                            >
                              Data Prevista do Parto
                            </Text>
                            <Text style={styles.valorExtra}>
                              {detalhesGestacao.dataPrevistaParto || "--"}
                            </Text>
                          </View>
                        </View>
                      )}

                    {amigoSelecionado.tipo !== "gestante" &&
                      detalhesFilhos.length > 0 && (
                        <View style={{ marginTop: 5 }}>
                          <Text style={styles.tituloSubsecao}>Filhos</Text>
                          {detalhesFilhos.map((f) => (
                            <View
                              key={f.id}
                              style={[
                                styles.cardDadosExtras,
                                { borderLeftColor: corPrimaria },
                              ]}
                            >
                              <Text style={styles.nomeFilhoText}>{f.nome}</Text>
                              <Text style={styles.dataFilhoText}>
                                Nascimento: {f.dataNascimento}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {amigoSelecionado.tipo !== "gestante" &&
                      detalhesFilhos.length === 0 && (
                        <Text style={styles.textoVazioDetalhes}>
                          Nenhum filho cadastrado.
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
    </View>
  );
}

const getStyles = (theme: any, corPrimaria: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.paisBackground || "#F4F0FB",
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      backgroundColor: corPrimaria,
      paddingTop: 42,
      paddingHorizontal: 22,
      paddingBottom: 22,
      elevation: 10,
      shadowColor: "#2A1852",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#8D6ECA",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    badge: {
      backgroundColor: "#8D6ECA",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 18,
    },
    badgeText: {
      color: "#FFFFFF",
      fontSize: theme.texts.text,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    titleScreen: {
      color: "#FFFFFF",
      fontSize: theme.texts.title,
      fontWeight: "bold",
      marginTop: 16,
      lineHeight: 32,
    },
    content: {
      padding: 16,
      paddingTop: 180, // Espaço exato para descer além do Header
      paddingBottom: 40,
    },
    card: {
      backgroundColor: "#FFF",
      padding: 20,
      borderRadius: 20,
      alignItems: "center",
      marginBottom: 20,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
    },
    iconCircle: {
      backgroundColor: "#F9F9F9",
      padding: 12,
      borderRadius: 50,
      marginBottom: 10,
      elevation: 1,
    },
    title: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: "#333",
    },
    codeRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      backgroundColor: "#F9F9F9",
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
    vincularSection: {
      marginBottom: 25,
    },
    sectionLabel: {
      fontWeight: "bold",
      fontSize: theme.texts.subtitle,
      marginBottom: 10,
      color: corPrimaria,
    },
    sectionLabelSemMargem: {
      fontWeight: "bold",
      fontSize: theme.texts.subtitle,
      color: corPrimaria,
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
      backgroundColor: "#FFF",
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
    inputRow: {
      flexDirection: "row",
      gap: 10,
    },
    input: {
      flex: 1,
      backgroundColor: "#FFF",
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: "#EEE",
      color: "#333",
      fontSize: theme.texts.text,
    },
    btnVincular: {
      padding: 12,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      width: 50,
    },
    personCardDestaque: {
      backgroundColor: "#FFF",
      padding: 15,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      elevation: 1,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    nomeText: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      color: "#333",
    },
    subText: {
      fontSize: theme.texts.text,
      color: corPrimaria,
      marginTop: 2,
    },
    btnVerPerfil: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    btnVerPerfilText: {
      color: "white",
      fontWeight: "bold",
      fontSize: theme.texts.text,
    },
    vazioCard: {
      backgroundColor: "#FFF",
      padding: 20,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    vazioText: {
      color: "#999",
      fontStyle: "italic",
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
      borderBottomColor: "#EEE",
    },
    modalTitle: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      color: "#333",
    },
    modalBody: {
      width: "100%",
    },
    itemSolicitacaoModal: {
      backgroundColor: "#F9F9F9",
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
    rowBotoesAcao: {
      flexDirection: "row",
      gap: 10,
    },
    btnAcaoList: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    btnAcaoText: {
      color: "white",
      fontWeight: "bold",
      fontSize: theme.texts.text,
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
      borderBottomColor: "#EEE",
    },
    modalTituloPerfil: {
      fontSize: theme.texts.subtitle,
      fontWeight: "bold",
      color: "#333",
    },
    botoesAcaoModal: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    fecharModalPerfilBtn: {
      padding: 5,
    },
    containerFoto: {
      alignItems: "center",
      marginTop: 10,
      marginBottom: 15,
    },
    bordaFoto: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F9F9F9",
      overflow: "hidden",
    },
    foto: {
      width: "100%",
      height: "100%",
    },
    nomePerfilExibicao: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
    },
    tipoContaExibicao: {
      fontSize: theme.texts.subtitle,
      color: corPrimaria,
      textAlign: "center",
      marginTop: 2,
    },
    containerBio: {
      marginTop: 15,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    textoBio: {
      fontSize: theme.texts.text,
      fontStyle: "italic",
      color: "#666",
      textAlign: "center",
      lineHeight: 22,
    },
    blocoCampos: {
      width: "100%",
      gap: 15,
    },
    labelCampo: {
      fontSize: theme.texts.text,
      color: "#666",
      fontWeight: "600",
      marginBottom: 5,
    },
    containerCampoLeitura: {
      backgroundColor: "#F9F9F9",
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#EEE",
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
      color: "#333",
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
      width: "90%",
      height: "70%",
    },
  });
