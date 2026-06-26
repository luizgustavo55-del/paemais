import { auth, firestore } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TipoNotificacao =
  | "comunidade"
  | "curtida"
  | "comentario"
  | "lembrete"
  | "sistema";

type Filtro = "todas" | "naoLidas" | "comunidade" | "lembretes";

type Notificacao = {
  id: string;
  origem: "notificacoes" | "lembretes" | "comunidade";
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  dataTexto: string;
  dataMs: number;
  lida: boolean;
  destino?: string;
  firestoreId?: string;
};

type FiltroConfig = {
  valor: Filtro;
  label: string;
  icone: keyof typeof Ionicons.glyphMap;
};

type TipoConfig = {
  cor: string;
  fundo: string;
  icone: keyof typeof Ionicons.glyphMap;
  label: string;
};

const FILTROS: FiltroConfig[] = [
  {
    valor: "todas",
    label: "Todas",
    icone: "notifications-outline",
  },
  {
    valor: "naoLidas",
    label: "Não lidas",
    icone: "ellipse-outline",
  },
  {
    valor: "comunidade",
    label: "Comunidade",
    icone: "chatbubbles-outline",
  },
  {
    valor: "lembretes",
    label: "Lembretes",
    icone: "alarm-outline",
  },
];

const TIPO_CONFIG: Record<TipoNotificacao, TipoConfig> = {
  comunidade: {
    cor: "#7050B3",
    fundo: "#EFE7FF",
    icone: "people-outline",
    label: "Comunidade",
  },
  curtida: {
    cor: "#E84A8A",
    fundo: "#FFE8F2",
    icone: "heart-outline",
    label: "Curtida",
  },
  comentario: {
    cor: "#0891B2",
    fundo: "#E6F8FC",
    icone: "chatbubble-ellipses-outline",
    label: "Comentário",
  },
  lembrete: {
    cor: "#D8893A",
    fundo: "#FFF3DF",
    icone: "alarm-outline",
    label: "Lembrete",
  },
  sistema: {
    cor: "#64748B",
    fundo: "#EEF2F7",
    icone: "information-circle-outline",
    label: "Sistema",
  },
};

function converterDataMs(valor: any): number {
  if (!valor) return Date.now();

  if (valor?.toDate) {
    return valor.toDate().getTime();
  }

  if (typeof valor === "number") {
    return valor;
  }

  if (typeof valor === "string") {
    const tentativa = new Date(valor).getTime();

    if (!Number.isNaN(tentativa)) {
      return tentativa;
    }
  }

  return Date.now();
}

function formatarData(ms: number): string {
  const data = new Date(ms);
  const hoje = new Date();
  const ontem = new Date();

  ontem.setDate(hoje.getDate() - 1);

  const mesmoDia =
    data.getDate() === hoje.getDate() &&
    data.getMonth() === hoje.getMonth() &&
    data.getFullYear() === hoje.getFullYear();

  const foiOntem =
    data.getDate() === ontem.getDate() &&
    data.getMonth() === ontem.getMonth() &&
    data.getFullYear() === ontem.getFullYear();

  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (mesmoDia) {
    return `Hoje às ${hora}`;
  }

  if (foiOntem) {
    return `Ontem às ${hora}`;
  }

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function limitarTexto(texto: string, limite = 90): string {
  if (!texto) return "";

  if (texto.length <= limite) {
    return texto;
  }

  return `${texto.slice(0, limite).trim()}...`;
}

function textoSeguro(valor: any, padrao = ""): string {
  if (typeof valor === "string" && valor.trim()) {
    return valor.trim();
  }

  return padrao;
}

export default function Notificacoes() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );

  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [carregando, setCarregando] = useState(true);

  const [notificacoesBanco, setNotificacoesBanco] = useState<Notificacao[]>([]);
  const [notificacoesLembretes, setNotificacoesLembretes] = useState<
    Notificacao[]
  >([]);
  const [notificacoesComunidade, setNotificacoesComunidade] = useState<
    Notificacao[]
  >([]);

  const [lidasLocais, setLidasLocais] = useState<string[]>([]);

  const storageKey = userId
    ? `notificacoes_lidas_locais_${userId}`
    : "notificacoes_lidas_locais";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUserId(usuario?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function carregarLidasLocais() {
      try {
        const salvo = await AsyncStorage.getItem(storageKey);

        if (salvo) {
          setLidasLocais(JSON.parse(salvo));
        } else {
          setLidasLocais([]);
        }
      } catch {
        setLidasLocais([]);
      }
    }

    carregarLidasLocais();
  }, [storageKey]);

  useEffect(() => {
    if (!userId) {
      setCarregando(false);
      setNotificacoesBanco([]);
      return;
    }

    setCarregando(true);

    const ref = collection(firestore, "usuarios", userId, "notificacoes");

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const lista: Notificacao[] = snapshot.docs.map((documento) => {
          const dados = documento.data();

          const dataMs = converterDataMs(
            dados.criadoEm ?? dados.dataCriacao ?? dados.data ?? dados.createdAt,
          );

          const tipoRecebido = dados.tipo as TipoNotificacao;
          const tipo: TipoNotificacao =
            tipoRecebido === "curtida" ||
            tipoRecebido === "comentario" ||
            tipoRecebido === "comunidade" ||
            tipoRecebido === "lembrete" ||
            tipoRecebido === "sistema"
              ? tipoRecebido
              : "sistema";

          return {
            id: `notificacao-${documento.id}`,
            firestoreId: documento.id,
            origem: "notificacoes",
            tipo,
            titulo: textoSeguro(dados.titulo, "Notificação"),
            descricao: textoSeguro(
              dados.descricao ?? dados.texto ?? dados.mensagem,
              "Você tem uma nova atualização no app.",
            ),
            dataTexto: formatarData(dataMs),
            dataMs,
            lida: Boolean(dados.lida),
            destino: dados.destino,
          };
        });

        setNotificacoesBanco(lista);
        setCarregando(false);
      },
      (error) => {
        console.log("Erro ao carregar notificações:", error);
        setCarregando(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setNotificacoesLembretes([]);
      return;
    }

    const ref = collection(firestore, "usuarios", userId, "lembretes");

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const lista: Notificacao[] = snapshot.docs.map((documento) => {
          const dados = documento.data();

          const titulo = textoSeguro(dados.title ?? dados.titulo, "Lembrete");

          const descricao = textoSeguro(
            dados.description ?? dados.descricao,
            "Você tem um lembrete cadastrado.",
          );

          const dataBase =
            dados.criadoEm ??
            dados.createdAt ??
            dados.dataCriacao ??
            dados.date ??
            dados.data;

          const dataMs = converterDataMs(dataBase);

          return {
            id: `lembrete-${documento.id}`,
            firestoreId: documento.id,
            origem: "lembretes",
            tipo: "lembrete",
            titulo,
            descricao: limitarTexto(descricao),
            dataTexto:
              dados.date || dados.data
                ? `${dados.date ?? dados.data}${
                    dados.time || dados.hora
                      ? ` às ${dados.time ?? dados.hora}`
                      : ""
                  }`
                : formatarData(dataMs),
            dataMs,
            lida: lidasLocais.includes(`lembrete-${documento.id}`),
            destino: "/(drawer)/(pais)/(tabs)/menu",
          };
        });

        setNotificacoesLembretes(lista);
      },
      (error) => {
        console.log("Erro ao carregar lembretes:", error);
      },
    );

    return () => unsubscribe();
  }, [userId, lidasLocais]);

  useEffect(() => {
    if (!userId) {
      setNotificacoesComunidade([]);
      return;
    }

    let comentariosUnsubscribes: Unsubscribe[] = [];

    const postsRef = collection(firestore, "comunidade");

    const unsubscribePosts = onSnapshot(
      postsRef,
      (snapshot) => {
        comentariosUnsubscribes.forEach((unsubscribe) => unsubscribe());
        comentariosUnsubscribes = [];

        const postsDoUsuario = snapshot.docs
          .map((documento) => ({
            id: documento.id,
            dados: documento.data(),
          }))
          .filter((post) => {
            const autorId =
              post.dados.userId ??
              post.dados.uid ??
              post.dados.autorId ??
              post.dados.donoId;

            return autorId === userId;
          });

        const curtidas: Notificacao[] = [];

        postsDoUsuario.forEach((post) => {
          const likes = Array.isArray(post.dados.likes)
            ? post.dados.likes
            : Array.isArray(post.dados.curtidas)
              ? post.dados.curtidas
              : [];

          const tituloPost = textoSeguro(post.dados.titulo, "Sua publicação");

          if (likes.length > 0) {
            const dataMs = converterDataMs(
              post.dados.atualizadoEm ??
                post.dados.criadoEm ??
                post.dados.createdAt,
            );

            curtidas.push({
              id: `curtida-${post.id}`,
              firestoreId: post.id,
              origem: "comunidade",
              tipo: "curtida",
              titulo:
                likes.length === 1
                  ? "Nova curtida na comunidade"
                  : "Curtidas na comunidade",
              descricao:
                likes.length === 1
                  ? `${tituloPost} recebeu 1 curtida.`
                  : `${tituloPost} recebeu ${likes.length} curtidas.`,
              dataTexto: formatarData(dataMs),
              dataMs,
              lida: lidasLocais.includes(`curtida-${post.id}`),
              destino: "/(drawer)/(pais)/(tabs)/comunidade",
            });
          }

          const comentariosRef = collection(
            firestore,
            "comunidade",
            post.id,
            "comentarios",
          );

          const unsubscribeComentarios = onSnapshot(
            comentariosRef,
            (comentariosSnapshot) => {
              const comentarios: Notificacao[] = comentariosSnapshot.docs
                .map((documento) => {
                  const dados = documento.data();

                  const comentarioAutorId =
                    dados.userId ?? dados.uid ?? dados.autorId;

                  if (comentarioAutorId === userId) {
                    return null;
                  }

                  const nomeAutor = textoSeguro(
                    dados.nomeAutor ?? dados.nome ?? dados.autorNome,
                    "Alguém",
                  );

                  const textoComentario = textoSeguro(
                    dados.texto ?? dados.comentario ?? dados.mensagem,
                    "comentou na sua publicação.",
                  );

                  const dataMs = converterDataMs(
                    dados.criadoEm ?? dados.createdAt ?? dados.data,
                  );

                  return {
                    id: `comentario-${post.id}-${documento.id}`,
                    firestoreId: documento.id,
                    origem: "comunidade",
                    tipo: "comentario",
                    titulo: "Novo comentário",
                    descricao: `${nomeAutor}: ${limitarTexto(
                      textoComentario,
                      80,
                    )}`,
                    dataTexto: formatarData(dataMs),
                    dataMs,
                    lida: lidasLocais.includes(
                      `comentario-${post.id}-${documento.id}`,
                    ),
                    destino: "/(drawer)/(pais)/(tabs)/comunidade",
                  };
                })
                .filter(Boolean) as Notificacao[];

              setNotificacoesComunidade((anteriores) => {
                const semComentariosDessePost = anteriores.filter(
                  (notificacao) =>
                    !notificacao.id.startsWith(`comentario-${post.id}-`),
                );

                const apenasCurtidas = semComentariosDessePost.filter(
                  (notificacao) => notificacao.tipo === "curtida",
                );

                const outrosComentarios = semComentariosDessePost.filter(
                  (notificacao) => notificacao.tipo !== "curtida",
                );

                const curtidasSemDuplicar = [
                  ...apenasCurtidas.filter(
                    (notificacao) => notificacao.id !== `curtida-${post.id}`,
                  ),
                  ...curtidas.filter(
                    (notificacao) => notificacao.id === `curtida-${post.id}`,
                  ),
                ];

                return [
                  ...outrosComentarios,
                  ...curtidasSemDuplicar,
                  ...comentarios,
                ];
              });
            },
            (error) => {
              console.log("Erro ao carregar comentários:", error);
            },
          );

          comentariosUnsubscribes.push(unsubscribeComentarios);
        });

        setNotificacoesComunidade((anteriores) => {
          const somenteComentarios = anteriores.filter(
            (notificacao) => notificacao.tipo === "comentario",
          );

          return [...curtidas, ...somenteComentarios];
        });
      },
      (error) => {
        console.log("Erro ao carregar comunidade:", error);
      },
    );

    return () => {
      unsubscribePosts();
      comentariosUnsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [userId, lidasLocais]);

  const todasNotificacoes = useMemo(() => {
    return [
      ...notificacoesBanco,
      ...notificacoesLembretes,
      ...notificacoesComunidade,
    ].sort((a, b) => b.dataMs - a.dataMs);
  }, [notificacoesBanco, notificacoesLembretes, notificacoesComunidade]);

  const notificacoesFiltradas = useMemo(() => {
    if (filtro === "todas") {
      return todasNotificacoes;
    }

    if (filtro === "naoLidas") {
      return todasNotificacoes.filter((notificacao) => !notificacao.lida);
    }

    if (filtro === "comunidade") {
      return todasNotificacoes.filter(
        (notificacao) =>
          notificacao.tipo === "curtida" ||
          notificacao.tipo === "comentario" ||
          notificacao.tipo === "comunidade",
      );
    }

    if (filtro === "lembretes") {
      return todasNotificacoes.filter(
        (notificacao) => notificacao.tipo === "lembrete",
      );
    }

    return todasNotificacoes;
  }, [filtro, todasNotificacoes]);

  const totalNaoLidas = todasNotificacoes.filter(
    (notificacao) => !notificacao.lida,
  ).length;

  async function marcarComoLida(notificacao: Notificacao) {
    try {
      if (
        notificacao.origem === "notificacoes" &&
        notificacao.firestoreId &&
        userId
      ) {
        await updateDoc(
          doc(
            firestore,
            "usuarios",
            userId,
            "notificacoes",
            notificacao.firestoreId,
          ),
          {
            lida: true,
          },
        );

        return;
      }

      const novasLidas = Array.from(new Set([...lidasLocais, notificacao.id]));

      setLidasLocais(novasLidas);
      await AsyncStorage.setItem(storageKey, JSON.stringify(novasLidas));
    } catch (error) {
      console.log("Erro ao marcar notificação como lida:", error);
    }
  }

  async function marcarTodasComoLidas() {
    try {
      if (!userId) return;

      const notificacoesDoBanco = notificacoesBanco.filter(
        (notificacao) => !notificacao.lida && notificacao.firestoreId,
      );

      await Promise.all(
        notificacoesDoBanco.map((notificacao) =>
          updateDoc(
            doc(
              firestore,
              "usuarios",
              userId,
              "notificacoes",
              notificacao.firestoreId!,
            ),
            {
              lida: true,
            },
          ),
        ),
      );

      const idsLocais = todasNotificacoes
        .filter((notificacao) => notificacao.origem !== "notificacoes")
        .map((notificacao) => notificacao.id);

      const novasLidas = Array.from(new Set([...lidasLocais, ...idsLocais]));

      setLidasLocais(novasLidas);
      await AsyncStorage.setItem(storageKey, JSON.stringify(novasLidas));
    } catch (error) {
      console.log("Erro ao marcar todas como lidas:", error);
      Alert.alert("Erro", "Não foi possível marcar todas como lidas.");
    }
  }

  async function limparLeituraLocal() {
    Alert.alert(
      "Restaurar notificações",
      "Isso fará lembretes e interações locais aparecerem como não lidos novamente.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Restaurar",
          onPress: async () => {
            setLidasLocais([]);
            await AsyncStorage.removeItem(storageKey);
          },
        },
      ],
    );
  }

  function abrirDestino(notificacao: Notificacao) {
    marcarComoLida(notificacao);

    if (notificacao.destino) {
      router.push(notificacao.destino as any);
    }
  }

  function renderNotificacao(notificacao: Notificacao) {
    const config = TIPO_CONFIG[notificacao.tipo] ?? TIPO_CONFIG.sistema;

    return (
      <TouchableOpacity
        key={notificacao.id}
        style={[
          styles.notificacaoCard,
          !notificacao.lida && styles.notificacaoNaoLida,
        ]}
        onPress={() => abrirDestino(notificacao)}
        activeOpacity={0.86}
      >
        <View style={[styles.iconeBox, { backgroundColor: config.fundo }]}>
          <Ionicons name={config.icone} size={22} color={config.cor} />
        </View>

        <View style={styles.notificacaoConteudo}>
          <View style={styles.notificacaoTopo}>
            <View
              style={[
                styles.tipoBadge,
                {
                  backgroundColor: config.fundo,
                },
              ]}
            >
              <Text
                style={[
                  styles.tipoBadgeText,
                  {
                    color: config.cor,
                  },
                ]}
              >
                {config.label}
              </Text>
            </View>

            {!notificacao.lida && <View style={styles.pontoNaoLida} />}
          </View>

          <Text style={styles.notificacaoTitulo}>{notificacao.titulo}</Text>

          <Text style={styles.notificacaoDescricao}>
            {notificacao.descricao}
          </Text>

          <View style={styles.notificacaoRodape}>
            <Ionicons name="time-outline" size={13} color="#8A7BA6" />

            <Text style={styles.notificacaoData}>
              {notificacao.dataTexto}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7050B3" />

        <Text style={styles.loadingText}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Notificações</Text>

            <Text style={styles.headerSubtitle}>
              Curtidas, comentários e lembretes
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={marcarTodasComoLidas}
            activeOpacity={0.75}
          >
            <Ionicons name="checkmark-done-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.resumoCard}>
          <View>
            <Text style={styles.resumoLabel}>Não lidas</Text>

            <Text style={styles.resumoNumero}>{totalNaoLidas}</Text>
          </View>

          <View style={styles.resumoIcone}>
            <Ionicons name="notifications" size={26} color="#7050B3" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosContainer}
        >
          {FILTROS.map((item) => {
            const ativo = filtro === item.valor;

            return (
              <TouchableOpacity
                key={item.valor}
                style={[styles.filtroBtn, ativo && styles.filtroBtnAtivo]}
                onPress={() => setFiltro(item.valor)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icone}
                  size={15}
                  color={ativo ? "#fff" : "#7050B3"}
                />

                <Text
                  style={[
                    styles.filtroTexto,
                    ativo && styles.filtroTextoAtivo,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContainer}
        >
          {notificacoesFiltradas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name="notifications-off-outline"
                  size={42}
                  color="#7050B3"
                />
              </View>

              <Text style={styles.emptyTitle}>Nenhuma notificação</Text>

              <Text style={styles.emptyText}>
                Quando houver curtidas, comentários ou lembretes, eles
                aparecerão aqui.
              </Text>
            </View>
          ) : (
            notificacoesFiltradas.map(renderNotificacao)
          )}

          {todasNotificacoes.length > 0 && (
            <TouchableOpacity
              style={styles.restaurarBtn}
              onPress={limparLeituraLocal}
              activeOpacity={0.75}
            >
              <Ionicons name="refresh-outline" size={16} color="#7050B3" />

              <Text style={styles.restaurarTexto}>
                Restaurar leitura local
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F3EEFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#28174C",
    fontSize: 15,
    fontWeight: "500",
  },

  container: {
    flex: 1,
    backgroundColor: "#F3EEFC",
  },

  header: {
    backgroundColor: "#7050B3",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    marginTop: 2,
  },

  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  resumoCard: {
    marginTop: 22,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resumoLabel: {
    color: "#8A7BA6",
    fontSize: 13,
    fontWeight: "600",
  },

  resumoNumero: {
    color: "#28174C",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 2,
  },

  resumoIcone: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EFE7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginTop: 4,
  },

  filtrosContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },

  filtroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E4D7FA",
  },

  filtroBtnAtivo: {
    backgroundColor: "#7050B3",
    borderColor: "#7050B3",
  },

  filtroTexto: {
    color: "#7050B3",
    fontSize: 13,
    fontWeight: "700",
  },

  filtroTextoAtivo: {
    color: "#fff",
  },

  listaContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },

  notificacaoCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#EEE6FA",
    shadowColor: "#28174C",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  notificacaoNaoLida: {
    borderColor: "#BFA6EF",
    backgroundColor: "#FFFCFF",
  },

  iconeBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  notificacaoConteudo: {
    flex: 1,
  },

  notificacaoTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tipoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },

  tipoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  pontoNaoLida: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#E84A8A",
    marginLeft: 8,
  },

  notificacaoTitulo: {
    color: "#28174C",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 7,
  },

  notificacaoDescricao: {
    color: "#665B7E",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  notificacaoRodape: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  notificacaoData: {
    color: "#8A7BA6",
    fontSize: 12,
    fontWeight: "500",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 22,
  },

  emptyIconBox: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#EFE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    color: "#28174C",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },

  emptyText: {
    color: "#7D6B9D",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  restaurarBtn: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#EFE7FF",
    marginTop: 8,
  },

  restaurarTexto: {
    color: "#7050B3",
    fontSize: 12,
    fontWeight: "700",
  },
});