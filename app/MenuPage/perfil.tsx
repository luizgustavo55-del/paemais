import { auth, firestore } from "@/src/services/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── PALETA ──────────────────────────────────────────────────────────────────

const colors = {
  paisBackground: "#7050b3",
  paisPrimary: "#8b64de",
  paisSecondary: "#9b5de5",

  background: "#b390d8",
  primary: "#7b2cff",
  card: "#5407b8",
  textMenu: "#28174cca",

  title: "#000",
  subtitle: "#ccc",
  text: "#fff",

  white: "#fff",
  black: "#000",

  softWhite: "#ffffff22",
  softWhiteStrong: "#ffffff33",
  softWhiteLight: "#ffffff18",

  darkOverlay: "#00000066",

  success: "#1FAA59",
  danger: "#E0245E",

  boy: "#5e61ee",
  girl: "#e91e8c",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function calcularIdade(dataNascimento: string): string {
  if (!dataNascimento) return "";

  const partes = dataNascimento.split("/");

  if (partes.length !== 3) return "";

  const nasc = new Date(
    parseInt(partes[2], 10),
    parseInt(partes[1], 10) - 1,
    parseInt(partes[0], 10)
  );

  const hoje = new Date();

  const totalMeses =
    (hoje.getFullYear() - nasc.getFullYear()) * 12 +
    (hoje.getMonth() - nasc.getMonth());

  if (totalMeses < 1) {
    const dias = Math.floor((hoje.getTime() - nasc.getTime()) / 86400000);

    return `${dias} dia${dias !== 1 ? "s" : ""}`;
  }

  if (totalMeses < 12) {
    return `${totalMeses} ${totalMeses === 1 ? "mês" : "meses"}`;
  }

  const anos = Math.floor(totalMeses / 12);
  const meses = totalMeses % 12;

  return meses > 0
    ? `${anos} ano${anos !== 1 ? "s" : ""} e ${meses} ${
        meses === 1 ? "mês" : "meses"
      }`
    : `${anos} ano${anos !== 1 ? "s" : ""}`;
}

function relacaoLabel(rel: string) {
  if (rel === "pai") {
    return {
      label: "Pai",
      icon: "human-male",
    };
  }

  if (rel === "mae") {
    return {
      label: "Mãe",
      icon: "human-female",
    };
  }

  return {
    label: rel || "—",
    icon: "account",
  };
}

function sexoInfo(sexo: string) {
  if (sexo === "menino") {
    return {
      label: "Menino",
      icon: "male" as const,
      color: colors.boy,
    };
  }

  if (sexo === "menina") {
    return {
      label: "Menina",
      icon: "female" as const,
      color: colors.girl,
    };
  }

  return {
    label: sexo || "Não informado",
    icon: "person" as const,
    color: colors.subtitle,
  };
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────

function Avatar({ nome, size = 88 }: { nome: string; size?: number }) {
  const initials = nome
    ? nome
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.paisSecondary,
        borderWidth: 4,
        borderColor: colors.text,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.black,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: {
          width: 0,
          height: 5,
        },
        elevation: 5,
      }}
    >
      <Text
        style={{
          fontSize: size * 0.36,
          fontWeight: "900",
          color: colors.text,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

// ─── CHIP ────────────────────────────────────────────────────────────────────

function Chip({
  icon,
  label,
  accent,
}: {
  icon: ReactNode;
  label: string;
  accent?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: accent ? accent + "22" : colors.softWhite,
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: accent ? accent + "55" : colors.softWhiteStrong,
      }}
    >
      {icon}

      <Text
        style={{
          fontSize: 12,
          color: accent ?? colors.text,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── MODAL: EDITAR FILHO ─────────────────────────────────────────────────────

function EditarFilhoModal({
  filho,
  visible,
  onClose,
  onSave,
}: {
  filho: any;
  visible: boolean;
  onClose: () => void;
  onSave: (id: string, d: any) => void;
}) {
  const [nome, setNome] = useState(filho?.nome || "");
  const [peso, setPeso] = useState(filho?.peso || "");
  const [altura, setAltura] = useState(filho?.altura || "");
  const [descricao, setDescricao] = useState(filho?.descricao || "");

  useEffect(() => {
    if (filho) {
      setNome(filho.nome || "");
      setPeso(filho.peso || "");
      setAltura(filho.altura || "");
      setDescricao(filho.descricao || "");
    }
  }, [filho]);

  function handleSave() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome da criança.");
      return;
    }

    onSave(filho.id, {
      nome,
      peso,
      altura,
      descricao,
    });

    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />

          <Text style={s.modalTitulo}>Editar {filho?.nome}</Text>

          <Text style={s.modalLabel}>Nome</Text>
          <TextInput
            style={s.modalInput}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome da criança"
            placeholderTextColor={colors.subtitle}
          />

          <View style={s.modalRow}>
            <View style={s.modalColumn}>
              <Text style={s.modalLabel}>Peso</Text>
              <TextInput
                style={s.modalInput}
                value={peso}
                onChangeText={setPeso}
                placeholder="ex: 8,5 kg"
                placeholderTextColor={colors.subtitle}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={s.modalColumn}>
              <Text style={s.modalLabel}>Altura</Text>
              <TextInput
                style={s.modalInput}
                value={altura}
                onChangeText={setAltura}
                placeholder="ex: 72 cm"
                placeholderTextColor={colors.subtitle}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={s.modalLabel}>Observações</Text>
          <TextInput
            style={[s.modalInput, s.modalTextArea]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Anotações livres..."
            placeholderTextColor={colors.subtitle}
            multiline
          />

          <View style={s.modalActions}>
            <TouchableOpacity style={s.modalBtnOutline} onPress={onClose}>
              <Text style={s.modalBtnOutlineText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.modalBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={17} color={colors.text} />
              <Text style={s.modalBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── MODAL: EDITAR PERFIL ────────────────────────────────────────────────────

function EditarPerfilModal({
  userData,
  visible,
  onClose,
  onSave,
}: {
  userData: any;
  visible: boolean;
  onClose: () => void;
  onSave: (d: any) => void;
}) {
  const [nome, setNome] = useState(userData?.nome || "");
  const [cidade, setCidade] = useState(userData?.cidade || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [username, setUsername] = useState(userData?.username || "");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUser, setCheckingUser] = useState(false);

  useEffect(() => {
    if (userData) {
      setNome(userData.nome || "");
      setCidade(userData.cidade || "");
      setBio(userData.bio || "");
      setUsername(userData.username || "");
      setUsernameError("");
    }
  }, [userData]);

  async function verificarUsername(val: string) {
    const clean = val.toLowerCase().replace(/[^a-z0-9_.]/g, "");

    setUsername(clean);
    setUsernameError("");

    if (!clean || clean === userData?.username) return;

    if (clean.length < 3) {
      setUsernameError("Mínimo 3 caracteres");
      return;
    }

    setCheckingUser(true);

    try {
      const q = query(
        collection(firestore, "usuarios"),
        where("username", "==", clean)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        setUsernameError("Nome de usuário já em uso");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCheckingUser(false);
    }
  }

  function handleSave() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe seu nome.");
      return;
    }

    if (usernameError) return;

    onSave({
      nome,
      cidade,
      bio,
      username,
    });

    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />

          <Text style={s.modalTitulo}>Editar perfil</Text>

          <Text style={s.modalLabel}>Nome completo</Text>
          <TextInput
            style={s.modalInput}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            placeholderTextColor={colors.subtitle}
          />

          <Text style={s.modalLabel}>Nome de usuário</Text>

          <View style={s.usernameInputBox}>
            <Text style={s.usernameAt}>@</Text>

            <TextInput
              style={s.usernameInput}
              value={username}
              onChangeText={verificarUsername}
              placeholder="seunome"
              placeholderTextColor={colors.subtitle}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {checkingUser && <Text style={s.usernameChecking}>...</Text>}

            {!checkingUser &&
              username &&
              !usernameError &&
              username !== userData?.username && (
                <Ionicons name="checkmark-circle" size={19} color={colors.success} />
              )}
          </View>

          {usernameError ? (
            <Text style={s.usernameError}>{usernameError}</Text>
          ) : null}

          <Text style={s.modalLabel}>Cidade</Text>
          <TextInput
            style={s.modalInput}
            value={cidade}
            onChangeText={setCidade}
            placeholder="Sua cidade"
            placeholderTextColor={colors.subtitle}
          />

          <Text style={s.modalLabel}>Bio</Text>
          <TextInput
            style={[s.modalInput, s.modalTextArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Fale um pouco sobre você..."
            placeholderTextColor={colors.subtitle}
            multiline
          />

          <View style={s.modalActions}>
            <TouchableOpacity style={s.modalBtnOutline} onPress={onClose}>
              <Text style={s.modalBtnOutlineText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.modalBtn, !!usernameError && s.disabledBtn]}
              onPress={handleSave}
              disabled={!!usernameError}
            >
              <Ionicons name="checkmark" size={17} color={colors.text} />
              <Text style={s.modalBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── CARD DO FILHO ───────────────────────────────────────────────────────────

function FilhoCard({ item, onEdit }: { item: any; onEdit: (f: any) => void }) {
  const idade = calcularIdade(item.dataNascimento);
  const { label: sLabel, icon: sIcon, color: sColor } = sexoInfo(item.sexo);
  const { label: rLabel, icon: rIcon } = relacaoLabel(item.relacao);

  return (
    <View style={s.filhoCard}>
      <View style={s.filhoTop}>
        <View
          style={[
            s.filhoAvatar,
            {
              backgroundColor: sColor + "22",
              borderColor: sColor + "55",
            },
          ]}
        >
          <Ionicons name={sIcon} size={27} color={sColor} />
        </View>

        <View style={s.filhoHeaderText}>
          <Text style={s.filhoNome}>{item.nome}</Text>
          {idade ? <Text style={s.filhoIdade}>{idade}</Text> : null}
        </View>

        <TouchableOpacity style={s.filhoEditBtn} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={17} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={s.chipsArea}>
        {item.dataNascimento ? (
          <Chip
            icon={<Ionicons name="calendar-outline" size={13} color={colors.text} />}
            label={item.dataNascimento}
          />
        ) : null}

        <Chip
          icon={<Ionicons name={sIcon} size={13} color={sColor} />}
          label={sLabel}
          accent={sColor}
        />

        <Chip
          icon={
            <MaterialCommunityIcons
              name={rIcon as any}
              size={14}
              color={colors.text}
            />
          }
          label={rLabel}
        />

        {item.peso ? (
          <Chip
            icon={<Ionicons name="barbell-outline" size={13} color={colors.text} />}
            label={`${item.peso} kg`}
          />
        ) : null}

        {item.altura ? (
          <Chip
            icon={<Ionicons name="resize-outline" size={13} color={colors.text} />}
            label={`${item.altura} cm`}
          />
        ) : null}
      </View>

      {item.descricao ? (
        <View style={s.filhoObs}>
          <Text style={s.filhoObsText}>{item.descricao}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── CARD DO POST ────────────────────────────────────────────────────────────

function PostCard({
  item,
  userIdLogado,
}: {
  item: any;
  userIdLogado: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const liked = userIdLogado && item.likes?.includes(userIdLogado);
  const totalCurtidas = item.likes?.length ?? 0;
  const totalComentarios = item.totalComentarios ?? 0;

  async function toggleLike() {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.35,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
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
    <View style={s.postCard}>
      <Text style={s.postTexto}>{item.texto}</Text>

      <View style={s.postFooter}>
        <View style={s.postDateBox}>
          <Ionicons name="time-outline" size={12} color={colors.subtitle} />

          <Text style={s.postInfo}>
            {new Date(item.createdAt).toLocaleString("pt-BR")}
          </Text>
        </View>

        <View style={s.postActions}>
          {totalComentarios > 0 && (
            <View style={s.postActionItem}>
              <Ionicons
                name="chatbubble-outline"
                size={15}
                color={colors.subtitle}
              />

              <Text style={s.postStat}>{totalComentarios}</Text>
            </View>
          )}

          <TouchableOpacity onPress={toggleLike} style={s.postActionItem}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={19}
                color={liked ? colors.paisSecondary : colors.subtitle}
              />
            </Animated.View>

            <Text
              style={[
                s.postStat,
                liked && {
                  color: colors.paisSecondary,
                  fontWeight: "900",
                },
              ]}
            >
              {totalCurtidas}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── TELA PRINCIPAL ──────────────────────────────────────────────────────────

export default function Perfil() {
  const router = useRouter();
  const user = auth.currentUser;
  const userIdLogado = user?.uid ?? "";

  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [filhos, setFilhos] = useState<any[]>([]);
  const [aba, setAba] = useState<"posts" | "filhos">("posts");
  const [modalPerfil, setModalPerfil] = useState(false);
  const [filhoEditando, setFilhoEditando] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(doc(firestore, "usuarios", user.uid), (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      }
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(
      collection(firestore, "usuarios", user.uid, "filhos"),
      (snap) => {
        setFilhos(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      }
    );

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(firestore, "comunidade"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      lista.sort((a: any, b: any) => b.createdAt - a.createdAt);

      setPosts(lista);
    });

    return () => unsub();
  }, [user]);

  async function salvarPerfil(dados: any) {
    if (!user?.uid) return;

    try {
      await updateDoc(doc(firestore, "usuarios", user.uid), dados);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar o perfil.");
    }
  }

  async function salvarFilho(id: string, dados: any) {
    if (!user?.uid) return;

    try {
      await updateDoc(doc(firestore, "usuarios", user.uid, "filhos", id), dados);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar os dados da criança.");
    }
  }

  const relacao = userData?.relacao ?? filhos[0]?.relacao;
  const { label: relLabel, icon: relIcon } = relacaoLabel(relacao);
  const totalCurtidas = posts.reduce((acc, p) => acc + (p.likes?.length ?? 0), 0);

  return (
    <View style={s.container}>
      <Animated.View style={[s.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={s.botaoVoltar}
          onPress={() => router.replace("/menu")}
        >
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </TouchableOpacity>

        <View style={s.avatarArea}>
          <Avatar nome={userData?.nome || ""} size={90} />

          {relacao ? (
            <View style={s.relBadge}>
              <MaterialCommunityIcons
                name={relIcon as any}
                size={13}
                color={colors.text}
              />

              <Text style={s.relBadgeText}>{relLabel}</Text>
            </View>
          ) : null}
        </View>

        <Text style={s.nome}>{userData?.nome || "Carregando..."}</Text>

        {userData?.username ? (
          <Text style={s.handle}>@{userData.username}</Text>
        ) : (
          <TouchableOpacity
            onPress={() => setModalPerfil(true)}
            style={s.addUsernamePill}
          >
            <Ionicons name="at" size={14} color={colors.text} />

            <Text style={s.addUsernameText}>Adicionar @usuário</Text>
          </TouchableOpacity>
        )}

        {userData?.bio ? (
          <View style={s.bioBox}>
            <Text style={s.bioText}>{userData.bio}</Text>
          </View>
        ) : null}

        <View style={s.infoRow}>
          {userData?.cidade ? (
            <View style={s.infoChip}>
              <Ionicons name="location-outline" size={13} color={colors.text} />

              <Text style={s.infoChipText}>{userData.cidade}</Text>
            </View>
          ) : null}

          <View style={s.infoChip}>
            <Ionicons name="mail-outline" size={13} color={colors.text} />

            <Text style={s.infoChipText} numberOfLines={1}>
              {userData?.email || user?.email}
            </Text>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statNum}>{posts.length}</Text>
            <Text style={s.statLabel}>Posts</Text>
          </View>

          <View style={s.statDiv} />

          <View style={s.statItem}>
            <Text style={s.statNum}>{totalCurtidas}</Text>
            <Text style={s.statLabel}>Curtidas</Text>
          </View>

          <View style={s.statDiv} />

          <View style={s.statItem}>
            <Text style={s.statNum}>{filhos.length}</Text>
            <Text style={s.statLabel}>
              {filhos.length === 1 ? "Filho" : "Filhos"}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={s.editBtn} onPress={() => setModalPerfil(true)}>
          <Ionicons name="create-outline" size={16} color={colors.text} />

          <Text style={s.editBtnText}>Editar perfil</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={s.tabs}>
        {(["posts", "filhos"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, aba === tab && s.tabActive]}
            onPress={() => setAba(tab)}
          >
            <Ionicons
              name={tab === "posts" ? "reader-outline" : "people-outline"}
              size={17}
              color={aba === tab ? colors.text : colors.subtitle}
            />

            <Text style={[s.tabText, aba === tab && s.tabTextActive]}>
              {tab === "posts" ? "Publicações" : "Filhos"}
            </Text>

            {tab === "filhos" && filhos.length > 0 && (
              <View style={s.tabBadge}>
                <Text style={s.tabBadgeText}>{filhos.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {aba === "posts" && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIconBox}>
                <Ionicons name="pencil-outline" size={42} color={colors.text} />
              </View>

              <Text style={s.emptyTitle}>Nenhuma publicação ainda</Text>

              <Text style={s.emptySubtitle}>
                Compartilhe algo com a comunidade e suas publicações aparecerão aqui.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard item={item} userIdLogado={userIdLogado} />
          )}
        />
      )}

      {aba === "filhos" && (
        <FlatList
          data={filhos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIconBox}>
                <MaterialCommunityIcons
                  name="baby-face-outline"
                  size={46}
                  color={colors.text}
                />
              </View>

              <Text style={s.emptyTitle}>Nenhum filho cadastrado</Text>

              <Text style={s.emptySubtitle}>
                Adicione um filho para começar o acompanhamento.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <FilhoCard item={item} onEdit={setFilhoEditando} />
          )}
        />
      )}

      <EditarPerfilModal
        userData={userData}
        visible={modalPerfil}
        onClose={() => setModalPerfil(false)}
        onSave={salvarPerfil}
      />

      {filhoEditando && (
        <EditarFilhoModal
          filho={filhoEditando}
          visible={!!filhoEditando}
          onClose={() => setFilhoEditando(null)}
          onSave={salvarFilho}
        />
      )}
    </View>
  );
}

// ─── STYLE ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    backgroundColor: colors.card,
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 5,
    alignItems: "center",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: colors.black,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },

  botaoVoltar: {
    position: "absolute",
    top: 52,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.softWhite,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarArea: {
    alignItems: "center",
    marginBottom: 12,
  },

  relBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: -12,
    borderWidth: 1,
    borderColor: colors.softWhiteStrong,
  },

  relBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  nome: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    marginTop: 8,
    marginBottom: 2,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  handle: {
    fontSize: 14,
    color: colors.subtitle,
    marginBottom: 12,
    fontWeight: "700",
  },

  addUsernamePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.softWhite,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    borderStyle: "dashed",
    marginBottom: 12,
  },

  addUsernameText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "800",
  },

  bioBox: {
    backgroundColor: colors.softWhite,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    maxWidth: "92%",
  },

  bioText: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 16,
  },

  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.softWhite,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.softWhiteStrong,
  },

  infoChipText: {
    fontSize: 12,
    color: colors.text,
    maxWidth: 160,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.softWhite,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 26,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    gap: 22,
    alignItems: "center",
  },

  statItem: {
    alignItems: "center",
    minWidth: 52,
  },

  statNum: {
    fontSize: 23,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.4,
  },

  statLabel: {
    fontSize: 11,
    color: colors.subtitle,
    marginTop: 3,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  statDiv: {
    width: 1.5,
    height: 34,
    backgroundColor: colors.softWhiteStrong,
    borderRadius: 2,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.7,
    borderColor: colors.softWhiteStrong,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 22,
    backgroundColor: colors.primary,
  },

  editBtnText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 14,
  },

  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 6,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    padding: 5,
    shadowColor: colors.black,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  tab: {
    flex: 1,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 17,
  },

  tabActive: {
    backgroundColor: colors.primary,
  },

  tabText: {
    color: colors.subtitle,
    fontWeight: "800",
    fontSize: 13,
  },

  tabTextActive: {
    color: colors.text,
    fontWeight: "900",
  },

  tabBadge: {
    backgroundColor: colors.paisSecondary,
    borderRadius: 999,
    minWidth: 19,
    height: 19,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  tabBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
  },

  listContent: {
    padding: 16,
    paddingBottom: 44,
  },

  postCard: {
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    shadowColor: colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  postTexto: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 23,
    marginBottom: 14,
    fontWeight: "600",
  },

  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.softWhiteStrong,
    paddingTop: 12,
  },

  postDateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },

  postInfo: {
    fontSize: 11,
    color: colors.subtitle,
    fontWeight: "700",
  },

  postActions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },

  postActionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  postStat: {
    fontSize: 13,
    color: colors.subtitle,
    fontWeight: "800",
  },

  filhoCard: {
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    shadowColor: colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },

  filhoTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  filhoAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.7,
    alignItems: "center",
    justifyContent: "center",
  },

  filhoHeaderText: {
    flex: 1,
    marginLeft: 13,
  },

  filhoNome: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.2,
  },

  filhoIdade: {
    fontSize: 13,
    color: colors.subtitle,
    marginTop: 3,
    fontWeight: "700",
  },

  filhoEditBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.softWhite,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
  },

  chipsArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  filhoObs: {
    marginTop: 14,
    backgroundColor: colors.softWhite,
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.softWhiteStrong,
  },

  filhoObsText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.darkOverlay,
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 24,
    paddingBottom: 42,
    shadowColor: colors.black,
    shadowOpacity: 0.26,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: -8,
    },
    elevation: 14,
  },

  modalHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.softWhiteStrong,
    alignSelf: "center",
    marginBottom: 22,
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 22,
    textAlign: "center",
    letterSpacing: -0.3,
  },

  modalLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.subtitle,
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  modalInput: {
    backgroundColor: colors.softWhite,
    borderRadius: 17,
    padding: 15,
    fontSize: 15,
    color: colors.text,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    fontWeight: "600",
  },

  modalTextArea: {
    height: 76,
    textAlignVertical: "top",
  },

  modalRow: {
    flexDirection: "row",
    gap: 12,
  },

  modalColumn: {
    flex: 1,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  modalBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  modalBtnText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },

  modalBtnOutline: {
    flex: 1,
    backgroundColor: colors.softWhite,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
  },

  modalBtnOutlineText: {
    color: colors.subtitle,
    fontWeight: "900",
    fontSize: 15,
  },

  disabledBtn: {
    opacity: 0.5,
  },

  usernameInputBox: {
    backgroundColor: colors.softWhite,
    borderRadius: 17,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    flexDirection: "row",
    alignItems: "center",
  },

  usernameAt: {
    color: colors.subtitle,
    fontSize: 15,
    marginRight: 2,
    fontWeight: "900",
  },

  usernameInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: 50,
    fontWeight: "700",
  },

  usernameChecking: {
    fontSize: 12,
    color: colors.subtitle,
    fontWeight: "800",
  },

  usernameError: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -9,
    marginBottom: 10,
    fontWeight: "800",
  },

  empty: {
    alignItems: "center",
    paddingVertical: 58,
    gap: 9,
  },

  emptyIconBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.softWhiteStrong,
    marginBottom: 4,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.text,
  },

  emptySubtitle: {
    fontSize: 14,
    color: colors.subtitle,
    textAlign: "center",
    paddingHorizontal: 34,
    lineHeight: 21,
    fontWeight: "700",
  },
});