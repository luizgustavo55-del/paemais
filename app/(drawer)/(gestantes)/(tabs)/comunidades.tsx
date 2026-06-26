import { auth, firestore } from "@/src/services/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const colors = {
  background: "#851f57",
  backgroundSoft: "#F9DDEA",
  primary: "#C54C86",
  primarySoft: "#D982AF",
  primaryDark: "#9A3E6D",
  card: "#F8D3E4",
  cardWhite: "#FFF8FB",
  cardSoft: "#FFF0F6",
  border: "#EDB5CF",
  borderSoft: "#F8D3E4",
  title: "#FFF1F7",
  subtitle: "#F9DDEA",
  textDark: "#5E3750",
  textMuted: "#8A3D66",
  textSoft: "#92677E",
  white: "#FFFFFF",
  black: "#000000",
  success: "#4FA66A",
  successSoft: "#EAF8EF",
  danger: "#D94A64",
  dangerSoft: "#FDEAF0",
  warning: "#D8893A",
  warningSoft: "#FFF2E8",
  pink: "#C54C86",
  pinkSoft: "#F8D3E4",
  overlay: "rgba(94, 55, 80, 0.58)",
  softWhite: "rgba(255, 242, 248, 0.22)",
  tabBackground: "#C86A9B",
  tabActive: "#FFF2F8",
  input: "#FFF8FB",
  item: "#FFF0F6",
  tipBorder: "#C54C86",
  iconCircle: "#EDB5CF",
  shadow: "#7C3158",
};

function tipoLabel(tipo: string, relacao?: string): string {
  if (tipo === "gestante") return "Gestante";
  if (tipo === "pai" || tipo === "pais") {
    if (relacao === "mae") return "Mãe";
    if (relacao === "pai") return "Pai";
    return "Pai/Mãe";
  }
  if (tipo === "profissional") return "Profissional";
  return tipo || "Membro";
}

function tipoIcon(tipo: string, relacao?: string) {
  if (tipo === "gestante") return "human-pregnant";
  if (tipo === "profissional") return "stethoscope";
  if (relacao === "mae") return "human-female";
  if (relacao === "pai") return "human-male";
  return "account";
}

function tipoColor(tipo: string): string {
  if (tipo === "gestante") return colors.pink;
  if (tipo === "profissional") return colors.success;
  return colors.primary;
}

function formatarData(valor: any) {
  if (!valor) return "";
  try {
    return new Date(valor).toLocaleString("pt-BR");
  } catch {
    return "";
  }
}

function Avatar({
  nome,
  foto,
  size = 40,
  color,
}: {
  nome: string;
  foto?: string | null;
  size?: number;
  color?: string;
}) {
  if (foto) {
    return (
      <Image
        source={{ uri: foto }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: colors.white,
        }}
      />
    );
  }

  const initials = nome
    ? nome
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: colors.white,
      }}
    >
      <Text
        style={{
          fontSize: size * 0.34,
          fontWeight: "600",
          color: colors.white,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

function TipoBadge({ tipo, relacao }: { tipo: string; relacao?: string }) {
  const label = tipoLabel(tipo, relacao);
  const icon = tipoIcon(tipo, relacao);
  const color = tipoColor(tipo);

  return (
    <View
      style={[
        styles.tipoBadge,
        {
          backgroundColor: color + "14",
          borderColor: color + "33",
        },
      ]}
    >
      <MaterialCommunityIcons name={icon as any} size={11} color={color} />
      <Text style={[styles.tipoBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function RelacaoCard({ tipo, relacao }: { tipo: string; relacao?: string }) {
  const label = tipoLabel(tipo, relacao);
  const icon = tipoIcon(tipo, relacao);
  const color = tipoColor(tipo);

  let descricao = "Membro da comunidade";

  if (tipo === "gestante") {
    descricao = "Acompanhando a gestação";
  } else if (tipo === "profissional") {
    descricao = "Profissional parceiro";
  } else if (relacao === "mae") {
    descricao = "Perfil cadastrado como mãe";
  } else if (relacao === "pai") {
    descricao = "Perfil cadastrado como pai";
  } else if (tipo === "pai" || tipo === "pais") {
    descricao = "Responsável familiar";
  }

  return (
    <View style={pc.relacaoCard}>
      <View style={[pc.relacaoIconBox, { backgroundColor: color + "14" }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={pc.relacaoTitulo}>{label}</Text>
        <Text style={pc.relacaoDescricao}>{descricao}</Text>
      </View>

      <View style={[pc.relacaoMiniBadge, { backgroundColor: color + "14" }]}>
        <Text style={[pc.relacaoMiniBadgeText, { color }]}>{label}</Text>
      </View>
    </View>
  );
}

function PerfilCardModal({
  userId,
  visible,
  onClose,
}: {
  userId: string | null;
  visible: boolean;
  onClose: () => void;
}) {
  const [perfil, setPerfil] = useState<any>(null);
  const [filhos, setFilhos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      if (!userId || !visible) return;

      setLoading(true);
      setPerfil(null);
      setFilhos([]);

      try {
        const perfilRef = doc(firestore, "usuarios", userId);
        const perfilSnap = await getDoc(perfilRef);

        if (perfilSnap.exists()) {
          setPerfil({
            id: perfilSnap.id,
            ...perfilSnap.data(),
          });
        }

        const filhosSnap = await getDocs(
          collection(firestore, "usuarios", userId, "filhos"),
        );

        setFilhos(
          filhosSnap.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })),
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
  }, [userId, visible]);

  const tipo = perfil?.tipo || "Membro";
  const relacao = perfil?.relacao || "";
  const corTipo = tipoColor(tipo);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={pc.overlay}>
        <View style={pc.card}>
          <TouchableOpacity style={pc.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.textDark} />
          </TouchableOpacity>

          {loading ? (
            <View style={pc.loadingArea}>
              <Text style={pc.loadingText}>Carregando perfil...</Text>
            </View>
          ) : perfil ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={pc.headerDecor} />

              <View style={pc.avatarArea}>
                <Avatar
                  nome={perfil.nome || "Membro"}
                  foto={perfil.fotoPerfil}
                  size={84}
                  color={corTipo}
                />

                <View style={pc.badgeCentral}>
                  <TipoBadge tipo={tipo} relacao={relacao} />
                </View>
              </View>

              <Text style={pc.nome}>{perfil.nome || "Membro"}</Text>

              {perfil.username ? (
                <Text style={pc.username}>@{perfil.username}</Text>
              ) : null}

              <RelacaoCard tipo={tipo} relacao={relacao} />

              {perfil.bio ? (
                <View style={pc.bioBox}>
                  <Text style={pc.bioText}>{perfil.bio}</Text>
                </View>
              ) : null}

              <View style={pc.infoGrid}>
                {perfil.email ? (
                  <View style={pc.infoItem}>
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={pc.infoText} numberOfLines={1}>
                      {perfil.email}
                    </Text>
                  </View>
                ) : null}

                {perfil.cidade ? (
                  <View style={pc.infoItem}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={pc.infoText}>{perfil.cidade}</Text>
                  </View>
                ) : null}

                {perfil.telefone ? (
                  <View style={pc.infoItem}>
                    <Ionicons
                      name="call-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={pc.infoText}>{perfil.telefone}</Text>
                  </View>
                ) : null}

                {perfil.especialidade ? (
                  <View style={pc.infoItem}>
                    <Ionicons
                      name="medkit-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={pc.infoText}>{perfil.especialidade}</Text>
                  </View>
                ) : null}

                {perfil.crm ? (
                  <View style={pc.infoItem}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={pc.infoText}>CRM {perfil.crm}</Text>
                  </View>
                ) : null}
              </View>

              {filhos.length > 0 ? (
                <View style={pc.section}>
                  <Text style={pc.sectionTitle}>
                    {filhos.length === 1
                      ? "Filho cadastrado"
                      : "Filhos cadastrados"}
                  </Text>

                  {filhos.map((filho) => (
                    <View key={filho.id} style={pc.filhoItem}>
                      <MaterialCommunityIcons
                        name="baby-face-outline"
                        size={22}
                        color={colors.primary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={pc.filhoNome}>
                          {filho.nome || "Criança"}
                        </Text>
                        <Text style={pc.filhoInfo}>
                          {filho.dataNascimento
                            ? `Nascimento: ${filho.dataNascimento}`
                            : "Data não informada"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              <TouchableOpacity style={pc.okBtn} onPress={onClose}>
                <Text style={pc.okBtnText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={pc.loadingArea}>
              <Ionicons
                name="alert-circle-outline"
                size={34}
                color={colors.textMuted}
              />
              <Text style={pc.loadingText}>Perfil não encontrado.</Text>
              <TouchableOpacity style={pc.okBtn} onPress={onClose}>
                <Text style={pc.okBtnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const pc = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  card: {
    width: "100%",
    maxHeight: "84%",
    backgroundColor: colors.cardWhite,
    borderRadius: 22,
    padding: 20,
    elevation: 4,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardSoft,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  headerDecor: {
    height: 70,
    backgroundColor: colors.card,
    borderRadius: 18,
    marginBottom: -40,
  },
  avatarArea: {
    alignItems: "center",
    marginBottom: 12,
  },
  badgeCentral: {
    marginTop: -8,
    backgroundColor: colors.cardWhite,
    borderRadius: 999,
    padding: 3,
  },
  nome: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
    marginTop: 4,
  },
  username: {
    fontSize: 13,
    color: colors.textSoft,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  relacaoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardSoft,
    borderRadius: 17,
    padding: 13,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  relacaoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  relacaoTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDark,
  },
  relacaoDescricao: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "400",
  },
  relacaoMiniBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  relacaoMiniBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  bioBox: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 13,
    marginTop: 15,
  },
  bioText: {
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "400",
  },
  infoGrid: {
    marginTop: 16,
    gap: 9,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.cardSoft,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
    color: colors.textDark,
    fontSize: 13,
    fontWeight: "500",
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 9,
  },
  filhoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.cardSoft,
    borderRadius: 15,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filhoNome: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
  },
  filhoInfo: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "400",
  },
  okBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  okBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  loadingArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 12,
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: "500",
    textAlign: "center",
  },
});

function ModalComentarios({
  post,
  userIdLogado,
  nomeLogado,
  fotoLogado,
  visible,
  onClose,
  onOpenPerfil,
}: {
  post: any;
  userIdLogado: string;
  nomeLogado: string;
  fotoLogado: string | null;
  visible: boolean;
  onClose: () => void;
  onOpenPerfil: (userId: string) => void;
}) {
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!post?.id || !visible) return;

    const q = query(
      collection(firestore, "comunidade", post.id, "comentarios"),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setComentarios(
        snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })),
      );
    });

    return () => unsub();
  }, [post?.id, visible]);

  async function enviar() {
    if (!texto.trim() || !post?.id || !userIdLogado) return;

    setLoading(true);

    try {
      await addDoc(
        collection(firestore, "comunidade", post.id, "comentarios"),
        {
          userId: userIdLogado,
          nome: nomeLogado,
          fotoAutor: fotoLogado,
          texto: texto.trim(),
          createdAt: Date.now(),
        },
      );

      await updateDoc(doc(firestore, "comunidade", post.id), {
        totalComentarios: (post.totalComentarios || 0) + 1,
      });

      setTexto("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={cm.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={cm.header}>
          <TouchableOpacity onPress={onClose} style={cm.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={cm.titulo}>Comentários</Text>
        </View>

        <View style={cm.postOriginal}>
          <Text style={cm.postOriginalText} numberOfLines={3}>
            {post?.texto}
          </Text>
        </View>

        <FlatList
          data={comentarios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={cm.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={cm.empty}>
              <Ionicons
                name="chatbubble-outline"
                size={36}
                color={colors.subtitle}
              />
              <Text style={cm.emptyText}>Seja o primeiro a comentar!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={cm.comentCard}>
              <TouchableOpacity
                onPress={() => onOpenPerfil(item.userId)}
                style={cm.comentHeader}
              >
                <Avatar nome={item.nome} foto={item.fotoAutor} size={34} />
                <View style={cm.comentInfo}>
                  <Text style={cm.comentNome}>{item.nome}</Text>
                  <Text style={cm.comentData}>
                    {formatarData(item.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text style={cm.comentTexto}>{item.texto}</Text>
            </View>
          )}
        />

        <View style={cm.inputArea}>
          <Avatar nome={nomeLogado} foto={fotoLogado} size={36} />
          <TextInput
            style={cm.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva um comentário..."
            placeholderTextColor={colors.textSoft}
            multiline
          />
          <TouchableOpacity
            onPress={enviar}
            disabled={!texto.trim() || loading}
            style={[
              cm.sendBtn,
              (!texto.trim() || loading) && { opacity: 0.45 },
            ]}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cm = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSoft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 18,
    backgroundColor: colors.cardWhite,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.textDark,
  },
  postOriginal: {
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  postOriginalText: {
    color: colors.textDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
  },
  lista: {
    padding: 16,
    paddingBottom: 8,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.textSoft,
    marginTop: 10,
    fontWeight: "500",
  },
  comentCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  comentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  comentInfo: {
    marginLeft: 10,
    flex: 1,
  },
  comentNome: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
  },
  comentData: {
    fontSize: 11,
    color: colors.textSoft,
    marginTop: 2,
  },
  comentTexto: {
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 20,
    fontWeight: "400",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: colors.cardWhite,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textDark,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

function PostCard({
  item,
  userIdLogado,
  onComentarios,
  onOpcoes,
  onOpenPerfil,
}: {
  item: any;
  userIdLogado: string;
  onComentarios: (post: any) => void;
  onOpcoes: (post: any) => void;
  onOpenPerfil: (userId: string) => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const liked = !!userIdLogado && item.likes?.includes(userIdLogado);
  const totalLikes = item.likes?.length ?? 0;
  const totalComments = item.totalComentarios ?? 0;

  async function toggleLike() {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await updateDoc(doc(firestore, "comunidade", item.id), {
        likes: liked ? arrayRemove(userIdLogado) : arrayUnion(userIdLogado),
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={p.card}>
      <View style={p.cardHeader}>
        <TouchableOpacity
          style={p.userRow}
          onPress={() => onOpenPerfil(item.userId)}
          activeOpacity={0.75}
        >
          <Avatar
            nome={item.nome}
            foto={item.fotoAutor}
            size={42}
            color={tipoColor(item.tipoAutor)}
          />
          <View style={p.autorInfo}>
            <Text style={p.autorNome}>{item.nome}</Text>
            <View style={p.badgesRow}>
              <TipoBadge tipo={item.tipoAutor} relacao={item.relacaoAutor} />
              {item.visibilidade === "grupo" && (
                <View style={p.grupoBadge}>
                  <Ionicons
                    name="lock-closed"
                    size={9}
                    color={colors.textSoft}
                  />
                  <Text style={p.grupoText}>Grupo</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onOpcoes(item)}
          style={p.optionsBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={colors.textSoft}
          />
        </TouchableOpacity>
      </View>

      <Text style={p.texto}>{item.texto}</Text>

      <View style={p.footer}>
        <Text style={p.data}>{formatarData(item.createdAt)}</Text>
        <View style={p.actions}>
          <TouchableOpacity
            onPress={() => onComentarios(item)}
            style={p.actionBtn}
          >
            <Ionicons
              name="chatbubble-outline"
              size={17}
              color={colors.textSoft}
            />
            {totalComments > 0 ? (
              <Text style={p.actionCount}>{totalComments}</Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleLike} style={p.actionBtn}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={19}
                color={liked ? colors.primary : colors.textSoft}
              />
            </Animated.View>
            <Text
              style={[
                p.actionCount,
                liked && {
                  color: colors.primary,
                  fontWeight: "700",
                },
              ]}
            >
              {totalLikes}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  card: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  autorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  autorNome: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
    flexWrap: "wrap",
  },
  grupoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.cardSoft,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  grupoText: {
    fontSize: 10,
    color: colors.textSoft,
    fontWeight: "500",
  },
  optionsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardSoft,
  },
  texto: {
    marginVertical: 10,
    color: colors.textDark,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: 10,
  },
  data: {
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: "400",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    color: colors.textSoft,
    fontWeight: "500",
  },
});

export default function Comunidade() {
  const [aba, setAba] = useState<"feed" | "profissionais">("feed");

  const [userIdLogado, setUserIdLogado] = useState<string>("");
  const [nomeLogado, setNomeLogado] = useState<string>("Membro");
  const [tipoLogado, setTipoLogado] = useState<string>("pai");
  const [relacaoLogado, setRelacaoLogado] = useState<string>("");
  const [fotoLogado, setFotoLogado] = useState<string | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);

  const [modalPost, setModalPost] = useState(false);
  const [textoPost, setTextoPost] = useState("");
  const [visibilidade, setVisibilidade] = useState<"todos" | "grupo">("todos");

  const [postComentario, setPostComentario] = useState<any>(null);
  const [postOpcoes, setPostOpcoes] = useState<any>(null);
  const [modalOpcoes, setModalOpcoes] = useState(false);

  const [perfilAbertoId, setPerfilAbertoId] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    setUserIdLogado(user.uid);

    getDoc(doc(firestore, "usuarios", user.uid)).then((snap) => {
      if (snap.exists()) {
        const dados = snap.data();

        setNomeLogado(dados.nome || "Membro");
        setTipoLogado(dados.tipo || "pai");
        setRelacaoLogado(dados.relacao || "");
        setFotoLogado(dados.fotoPerfil || null);
      }
    });
  }, []);

  useEffect(() => {
    if (!tipoLogado) return;

    const q = query(
      collection(firestore, "comunidade"),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter((post: any) => {
          if (post.visibilidade === "grupo") {
            return post.tipoAutor === tipoLogado;
          }
          return true;
        });

      setPosts(lista);
    });

    return () => unsub();
  }, [tipoLogado]);

  useEffect(() => {
    const q = query(
      collection(firestore, "usuarios"),
      where("tipo", "==", "profissional"),
    );

    getDocs(q).then((snap) => {
      setProfissionais(
        snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })),
      );
    });
  }, []);

  async function publicar() {
    if (!textoPost.trim() || !userIdLogado) return;

    try {
      await addDoc(collection(firestore, "comunidade"), {
        userId: userIdLogado,
        nome: nomeLogado,
        fotoAutor: fotoLogado,
        tipoAutor: tipoLogado,
        relacaoAutor: relacaoLogado,
        texto: textoPost.trim(),
        visibilidade,
        likes: [],
        totalComentarios: 0,
        createdAt: Date.now(),
      });

      setModalPost(false);
      setTextoPost("");
      setVisibilidade("todos");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível publicar.");
    }
  }

  async function deletarPost() {
    if (!postOpcoes) return;

    try {
      await deleteDoc(doc(firestore, "comunidade", postOpcoes.id));

      setModalOpcoes(false);
      setPostOpcoes(null);
    } catch (error) {
      console.log(error);
    }
  }

  async function denunciarPost() {
    if (!postOpcoes || !userIdLogado) return;

    try {
      await addDoc(collection(firestore, "denuncias"), {
        postId: postOpcoes.id,
        denunciadoId: postOpcoes.userId,
        denuncianteId: userIdLogado,
        texto: postOpcoes.texto,
        createdAt: Date.now(),
      });

      setModalOpcoes(false);
      setPostOpcoes(null);

      Alert.alert("Denúncia enviada", "Nossa equipe irá analisar em breve.");
    } catch (error) {
      console.log(error);
    }
  }

  function abrirPerfilCard(userId: string) {
    if (!userId) return;
    setPerfilAbertoId(userId);
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Comunidade</Text>
          <Text style={styles.subtitulo}>
            Conecte-se com mães, pais e profissionais
          </Text>
        </View>

        <TouchableOpacity
          style={styles.userBadge}
          onPress={() => abrirPerfilCard(userIdLogado)}
          activeOpacity={0.8}
        >
          <Avatar
            nome={nomeLogado}
            foto={fotoLogado}
            size={34}
            color={tipoColor(tipoLogado)}
          />
          <TipoBadge tipo={tipoLogado} relacao={relacaoLogado} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(["feed", "profissionais"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={aba === tab ? styles.tabActive : styles.tab}
            onPress={() => setAba(tab)}
          >
            <Ionicons
              name={tab === "feed" ? "reader-outline" : "medkit-outline"}
              size={15}
              color={aba === tab ? colors.primaryDark : colors.white}
            />
            <Text style={aba === tab ? styles.tabTextActive : styles.tabText}>
              {tab === "feed" ? "Feed" : "Profissionais"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {aba === "feed" && (
        <>
          <TouchableOpacity
            style={styles.inputFake}
            onPress={() => setModalPost(true)}
            activeOpacity={0.8}
          >
            <Avatar
              nome={nomeLogado}
              foto={fotoLogado}
              size={36}
              color={tipoColor(tipoLogado)}
            />
            <Text style={styles.inputFakeText}>
              Compartilhe algo com a comunidade...
            </Text>
            <View style={styles.inputFakeBtn}>
              <Ionicons name="add" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>

          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={44}
                  color={colors.subtitle}
                />
                <Text style={styles.emptyTitle}>Nenhuma publicação ainda</Text>
                <Text style={styles.emptySubtitle}>
                  Seja o primeiro a compartilhar!
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <PostCard
                item={item}
                userIdLogado={userIdLogado}
                onComentarios={(post) => setPostComentario(post)}
                onOpcoes={(post) => {
                  setPostOpcoes(post);
                  setModalOpcoes(true);
                }}
                onOpenPerfil={abrirPerfilCard}
              />
            )}
          />
        </>
      )}

      {aba === "profissionais" && (
        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaProfissionais}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="medkit-outline"
                size={44}
                color={colors.subtitle}
              />
              <Text style={styles.emptyTitle}>
                Nenhum profissional cadastrado
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.profCard}
              onPress={() => abrirPerfilCard(item.id)}
              activeOpacity={0.8}
            >
              <Avatar
                nome={item.nome}
                foto={item.fotoPerfil}
                size={48}
                color={colors.success}
              />
              <View style={styles.profInfo}>
                <Text style={styles.profNome}>{item.nome}</Text>
                <Text style={styles.profEsp}>
                  {item.especialidade || "Profissional de saúde"}
                </Text>
                {item.crm ? (
                  <Text style={styles.profCrm}>CRM {item.crm}</Text>
                ) : null}
              </View>
              <Ionicons
                name="id-card-outline"
                size={20}
                color={colors.textSoft}
              />
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={modalPost}
        transparent
        animationType="slide"
        onRequestClose={() => setModalPost(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitulo}>Criar publicação</Text>

            <View style={styles.autorPreview}>
              <Avatar
                nome={nomeLogado}
                foto={fotoLogado}
                size={40}
                color={tipoColor(tipoLogado)}
              />
              <View style={styles.autorPreviewInfo}>
                <Text style={styles.autorPreviewNome}>{nomeLogado}</Text>
                <TipoBadge tipo={tipoLogado} relacao={relacaoLogado} />
              </View>
            </View>

            <TextInput
              style={styles.modalTextArea}
              value={textoPost}
              onChangeText={setTextoPost}
              placeholder="O que você quer compartilhar?"
              placeholderTextColor={colors.textSoft}
              multiline
            />

            <Text style={styles.visibilidadeLabel}>Quem pode ver isso?</Text>

            <View style={styles.visibilidadeRow}>
              {(["todos", "grupo"] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.visBtn,
                    visibilidade === item && styles.visBtnActive,
                  ]}
                  onPress={() => setVisibilidade(item)}
                >
                  <Text
                    style={[
                      styles.visBtnText,
                      visibilidade === item && styles.visBtnTextActive,
                    ]}
                  >
                    {item === "todos" ? "Todos" : "Apenas meu grupo"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, !textoPost.trim() && { opacity: 0.45 }]}
              onPress={publicar}
              disabled={!textoPost.trim()}
            >
              <Text style={styles.modalBtnText}>Publicar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelarBtn}
              onPress={() => {
                setModalPost(false);
                setTextoPost("");
                setVisibilidade("todos");
              }}
            >
              <Text style={styles.cancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalOpcoes}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpcoes(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitulo}>Opções</Text>

            {postOpcoes?.userId === userIdLogado ? (
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.danger }]}
                onPress={deletarPost}
              >
                <Text style={styles.modalBtnText}>Apagar publicação</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.warning }]}
                onPress={denunciarPost}
              >
                <Text style={styles.modalBtnText}>Denunciar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelarBtn}
              onPress={() => setModalOpcoes(false)}
            >
              <Text style={styles.cancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {postComentario && (
        <ModalComentarios
          post={postComentario}
          userIdLogado={userIdLogado}
          nomeLogado={nomeLogado}
          fotoLogado={fotoLogado}
          visible={!!postComentario}
          onClose={() => setPostComentario(null)}
          onOpenPerfil={abrirPerfilCard}
        />
      )}

      <PerfilCardModal
        userId={perfilAbertoId}
        visible={!!perfilAbertoId}
        onClose={() => setPerfilAbertoId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  tipoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  tipoBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    gap: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.white,
  },
  subtitulo: {
    color: colors.subtitle,
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  userBadge: {
    alignItems: "flex-end",
    gap: 6,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.softWhite,
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 12,
  },
  tabActive: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  tabText: {
    color: colors.white,
    fontWeight: "500",
    fontSize: 12,
  },
  tabTextActive: {
    color: colors.primaryDark,
    fontWeight: "600",
    fontSize: 12,
  },
  inputFake: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputFakeText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "400",
  },
  inputFakeBtn: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  lista: {
    paddingBottom: 40,
  },
  listaProfissionais: {
    paddingBottom: 40,
  },
  profCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    elevation: 1,
  },
  profInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profNome: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 3,
  },
  profEsp: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "400",
  },
  profCrm: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.subtitle,
    fontWeight: "400",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.overlay,
    padding: 20,
  },
  modalSheet: {
    backgroundColor: colors.cardWhite,
    padding: 20,
    borderRadius: 18,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: colors.primaryDark,
    textAlign: "center",
  },
  autorPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardSoft,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  autorPreviewInfo: {
    marginLeft: 10,
  },
  autorPreviewNome: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryDark,
    marginBottom: 4,
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 12,
    height: 120,
    backgroundColor: colors.white,
    textAlignVertical: "top",
    fontSize: 14,
    color: colors.primaryDark,
    marginBottom: 15,
  },
  visibilidadeLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },
  visibilidadeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  visBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  visBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardSoft,
  },
  visBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "400",
  },
  visBtnTextActive: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  modalBtn: {
    backgroundColor: colors.primary,
    padding: 15,
    marginTop: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  cancelarBtn: {
    marginTop: 15,
    padding: 10,
    alignItems: "center",
  },
  cancelarText: {
    color: colors.primary,
    fontWeight: "500",
    fontSize: 14,
  },
});
