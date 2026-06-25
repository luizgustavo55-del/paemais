import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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

import { auth, firestore } from "@/src/services/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import MaskInput from "react-native-mask-input";

import { useAuth } from "@/src/context/AuthContext";

// ──────────────────────────────────────────────
// PALETA — mesma usada em CadastroColaborador
// ──────────────────────────────────────────────
const colors = {
  paisBackground: "#7050b3",
  paisPrimary: "#8b64de",
  paisSecondary: "#9b5de5",
  background: "#b390d8",
  primary: "#7b2cff",
  card: "#5407b8",
  textMenu: "#28174cca",

  surface: "#FFFFFF",
  surfaceMuted: "#F3EEFC",
  border: "#E1D4F7",
  textDark: "#28174c",
  textMuted: "#6B5C8F",
  success: "#1FAA59",
  successBg: "#E8F8EE",
  danger: "#E0245E",
  dangerBg: "#FDEAF0",
};

type Errors = {
  nome?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  dataTexto?: string;
  senha?: string;
  confirmarSenha?: string;
  tipo?: string;
};

export default function Cadastro() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);

  const [data, setData] = useState<Date>(new Date());
  const [dataTexto, setDataTexto] = useState("");
  const [mostrarDate, setMostrarDate] = useState(false);

  const [tipo, setTipo] = useState<"pai" | "gestante" | "">("");

  const [modalVisivel, setModalVisivel] = useState(false);

  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [loadingVerificacao, setLoadingVerificacao] = useState(false);
  const [loadingReenviar, setLoadingReenviar] = useState(false);

  const [paddingScroll, setPaddingScroll] = useState(60);

  // ── estado puramente visual (foco + validação inline) ──
  // não substitui nem altera as checagens originais feitas em salvar()
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const hoje = new Date();
  const dataMinima = new Date();
  dataMinima.setFullYear(hoje.getFullYear() - 100);

  useEffect(() => {
    const tecladoAberto = Keyboard.addListener("keyboardDidShow", () => {
      setPaddingScroll(150);
    });
    const tecladoFechado = Keyboard.addListener("keyboardDidHide", () => {
      setPaddingScroll(60);
    });

    return () => {
      tecladoAberto.remove();
      tecladoFechado.remove();
    };
  }, []);

  // ── validação visual por campo (apenas exibição) ──
  function validarCampoVisual(campo: keyof Errors, valor: string): string | undefined {
    switch (campo) {
      case "nome":
        return valor.trim().length < 3 ? "Informe seu nome completo" : undefined;
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
          ? "Informe um e-mail válido"
          : undefined;
      case "telefone":
        return valor.replace(/\D/g, "").length < 10
          ? "Informe um telefone válido"
          : undefined;
      case "cidade":
        return valor.trim().length < 2 ? "Informe sua cidade" : undefined;
      case "dataTexto":
        return !valor || valor.length !== 10
          ? "Use o formato DD/MM/AAAA"
          : undefined;
      case "senha":
        return valor.length < 6 ? "Mínimo de 6 caracteres" : undefined;
      case "confirmarSenha":
        return valor !== senha ? "As senhas não coincidem" : undefined;
      default:
        return undefined;
    }
  }

  function handleBlur(campo: keyof Errors, valor: string) {
    setFocusedField(null);
    setTouched((prev) => ({ ...prev, [campo]: true }));
    setErrors((prev) => ({ ...prev, [campo]: validarCampoVisual(campo, valor) }));
  }

  function borderColorFor(campo: string) {
    if (errors[campo as keyof Errors] && touched[campo]) return colors.danger;
    if (focusedField === campo) return colors.primary;
    return colors.border;
  }

  function handleData(text: string) {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    } else if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    setDataTexto(formatted);
  }

  const validarDataNascimento = (dataSelecionada: Date): boolean => {
    if (dataSelecionada > hoje) {
      Alert.alert(
        "Data Inválida",
        "A data de nascimento não pode ser no futuro.",
      );
      return false;
    }
    if (dataSelecionada < dataMinima) {
      Alert.alert(
        "Data Inválida",
        "A data de nascimento não pode ser anterior a 100 anos atrás.",
      );
      return false;
    }
    return true;
  };

  async function salvar() {
    // ── feedback visual (não altera a lógica original abaixo) ──
    setTouched({
      nome: true,
      email: true,
      telefone: true,
      cidade: true,
      dataTexto: true,
      senha: true,
      confirmarSenha: true,
      tipo: true,
    });
    setErrors({
      nome: validarCampoVisual("nome", nome),
      email: validarCampoVisual("email", email),
      telefone: validarCampoVisual("telefone", telefone),
      cidade: validarCampoVisual("cidade", cidade),
      dataTexto: validarCampoVisual("dataTexto", dataTexto),
      senha: validarCampoVisual("senha", senha),
      confirmarSenha: validarCampoVisual("confirmarSenha", confirmarSenha),
      tipo: tipo ? undefined : "Selecione uma opção de perfil",
    });

    if (!nome || !email || !telefone || !cidade || !senha || !confirmarSenha) {
      Alert.alert("Aviso", "Preencha todos os campos");
      return;
    }

    if (!tipo) {
      Alert.alert("Aviso", "Selecione uma opção de perfil");
      return;
    }

    if (!dataTexto || dataTexto.length !== 10) {
      Alert.alert(
        "Aviso",
        "Preencha a data de nascimento no formato DD/MM/AAAA",
      );
      return;
    }

    const partes = dataTexto.split("/");
    if (partes.length !== 3) {
      Alert.alert("Erro", "Formato de data inválido.");
      return;
    }

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);
    const dataObj = new Date(ano, mes, dia);

    if (
      dataObj.getFullYear() !== ano ||
      dataObj.getMonth() !== mes ||
      dataObj.getDate() !== dia
    ) {
      Alert.alert("Erro", "Data inválida (dia/mês incorretos).");
      return;
    }

    if (!validarDataNascimento(dataObj)) {
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Aviso", "As senhas não coincidem");
      return;
    }

    setLoadingCadastro(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha,
      );

      await sendEmailVerification(userCredential.user);

      const uid = userCredential.user.uid;

      const prefixo =
        nome.trim().length >= 3
          ? nome.trim().substring(0, 3).toUpperCase()
          : "USR";
      const codigoGerado = prefixo + Math.floor(1000 + Math.random() * 9000);

      const dadosUsuario = {
        nome,
        email,
        telefone,
        cidade,
        dataNascimento: dataTexto,
        tipo,
        criadoEm: new Date().toISOString(),
        codigoCompartilhamento: codigoGerado,
        perfilVinculado: null,
      };

      await setDoc(doc(firestore, "usuarios", uid), dadosUsuario);
      setUser({ uid, email, tipo });

      setModalVisivel(true);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro", "Este email já está em uso.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Erro", "Formato de email inválido.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Erro", "A senha é muito fraca (mínimo 6 caracteres).");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao criar a conta.");
      }
    } finally {
      setLoadingCadastro(false);
    }
  }

  async function verificarSeEmailFoiConfirmado() {
    const user = auth.currentUser;
    if (user) {
      setLoadingVerificacao(true);
      try {
        await user.reload();

        if (user.emailVerified) {
          setModalVisivel(false);

          if (tipo === "gestante") {
            router.replace("/dum");
          } else {
            Alert.alert("Sucesso", "Conta de parceiro criada!");
            router.replace("/addFilho");
          }
        } else {
          Alert.alert(
            "Aguardando verificação",
            "O email ainda não foi verificado. Por favor, verifique sua caixa de entrada e pasta de Spam.",
          );
        }
      } finally {
        setLoadingVerificacao(false);
      }
    }
  }

  async function reenviarEmail() {
    const user = auth.currentUser;
    if (user) {
      setLoadingReenviar(true);
      try {
        await sendEmailVerification(user);
        Alert.alert("Sucesso", "O email foi reenviado.");
      } catch (error) {
        Alert.alert("Erro", "Aguarde um momento antes de pedir outro email.");
      } finally {
        setLoadingReenviar(false);
      }
    }
  }

  return (
    <View style={styles.root}>
      {/* ── HERO ───────────────────────────────── */}
      <LinearGradient
        colors={[colors.paisBackground, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <MaterialCommunityIcons name="account-plus-outline" size={26} color={colors.surface} />
        </View>
        <Text style={styles.heroTitle}>Criar conta</Text>
        <Text style={styles.heroSubtitle}>
          Preencha seus dados para começar sua jornada
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 40}
      >
        {/* ── SHEET ─────────────────────────────── */}
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: paddingScroll },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Seus dados</Text>

          <Text style={styles.label}>Nome completo</Text>
          <View style={[styles.fieldRow, { borderColor: borderColorFor("nome") }]}>
            <MaterialCommunityIcons name="account-outline" size={17} color={colors.textMuted} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.textMuted}
              value={nome}
              onChangeText={setNome}
              onFocus={() => setFocusedField("nome")}
              onBlur={() => handleBlur("nome", nome)}
            />
          </View>
          {touched.nome && errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}

          <Text style={styles.label}>E-mail</Text>
          <View style={[styles.fieldRow, { borderColor: borderColorFor("email") }]}>
            <MaterialCommunityIcons name="email-outline" size={17} color={colors.textMuted} />
            <TextInput
              style={styles.fieldInput}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => handleBlur("email", email)}
            />
          </View>
          {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Telefone</Text>
          <View style={[styles.fieldRow, { borderColor: borderColorFor("telefone") }]}>
            <MaterialCommunityIcons name="phone-outline" size={17} color={colors.textMuted} />
            <MaskInput
              style={styles.fieldInput}
              value={telefone}
              placeholder="(00) 00000-0000"
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
              onChangeText={(masked) => setTelefone(masked)}
              onFocus={() => setFocusedField("telefone")}
              onBlur={() => handleBlur("telefone", telefone)}
              mask={[
                "(",
                /\d/,
                /\d/,
                ")",
                " ",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
                /\d/,
                "-",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
              ]}
            />
          </View>
          {touched.telefone && errors.telefone && (
            <Text style={styles.errorText}>{errors.telefone}</Text>
          )}

          <Text style={styles.label}>Data de nascimento</Text>
          <View style={[styles.fieldRow, { borderColor: borderColorFor("dataTexto") }]}>
            <MaterialCommunityIcons name="cake-variant-outline" size={17} color={colors.textMuted} />
            <TextInput
              style={styles.fieldInput}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textMuted}
              value={dataTexto}
              onChangeText={handleData}
              onFocus={() => setFocusedField("dataTexto")}
              onBlur={() => handleBlur("dataTexto", dataTexto)}
              keyboardType="numeric"
              maxLength={10}
            />
            <TouchableOpacity
              onPress={() => setMostrarDate(true)}
              style={styles.iconArea}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          {touched.dataTexto && errors.dataTexto && (
            <Text style={styles.errorText}>{errors.dataTexto}</Text>
          )}

          {mostrarDate && (
            <DateTimePicker
              value={data}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={hoje}
              minimumDate={dataMinima}
              onChange={(event: DateTimePickerEvent, date?: Date) => {
                setMostrarDate(false);
                if (date) {
                  if (!validarDataNascimento(date)) {
                    return;
                  }
                  const dia = String(date.getDate()).padStart(2, "0");
                  const mes = String(date.getMonth() + 1).padStart(2, "0");
                  const ano = date.getFullYear();
                  setDataTexto(`${dia}/${mes}/${ano}`);
                  setData(date);
                  setErrors((prev) => ({ ...prev, dataTexto: undefined }));
                }
              }}
            />
          )}

          <Text style={styles.label}>Cidade</Text>
          <View style={[styles.fieldRow, { borderColor: borderColorFor("cidade") }]}>
            <MaterialCommunityIcons name="map-marker-outline" size={17} color={colors.textMuted} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Onde você mora?"
              placeholderTextColor={colors.textMuted}
              value={cidade}
              onChangeText={setCidade}
              onFocus={() => setFocusedField("cidade")}
              onBlur={() => handleBlur("cidade", cidade)}
            />
          </View>
          {touched.cidade && errors.cidade && (
            <Text style={styles.errorText}>{errors.cidade}</Text>
          )}

          <Text style={styles.sectionTitle}>Crie sua senha</Text>

          <Text style={styles.label}>Senha</Text>
          <View style={[styles.fieldRow, { borderColor: borderColorFor("senha") }]}>
            <MaterialCommunityIcons name="lock-outline" size={17} color={colors.textMuted} />
            <TextInput
              secureTextEntry={!showSenha}
              style={styles.fieldInput}
              placeholder="Mínimo de 6 caracteres"
              placeholderTextColor={colors.textMuted}
              value={senha}
              onChangeText={setSenha}
              onFocus={() => setFocusedField("senha")}
              onBlur={() => handleBlur("senha", senha)}
            />
            <TouchableOpacity
              onPress={() => setShowSenha(!showSenha)}
              style={styles.iconArea}
            >
              <MaterialCommunityIcons
                name={showSenha ? "eye-off" : "eye"}
                size={19}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {touched.senha && errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}

          <Text style={styles.label}>Confirmar senha</Text>
          <View style={[styles.fieldRow, { borderColor: borderColorFor("confirmarSenha") }]}>
            <MaterialCommunityIcons name="lock-check-outline" size={17} color={colors.textMuted} />
            <TextInput
              secureTextEntry={!showConfirmSenha}
              style={styles.fieldInput}
              placeholder="Repita a senha"
              placeholderTextColor={colors.textMuted}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              onFocus={() => setFocusedField("confirmarSenha")}
              onBlur={() => handleBlur("confirmarSenha", confirmarSenha)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmSenha(!showConfirmSenha)}
              style={styles.iconArea}
            >
              <MaterialCommunityIcons
                name={showConfirmSenha ? "eye-off" : "eye"}
                size={19}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {touched.confirmarSenha && errors.confirmarSenha && (
            <Text style={styles.errorText}>{errors.confirmarSenha}</Text>
          )}

          <Text style={styles.sectionTitle}>Qual é o seu momento?</Text>

          <View style={styles.opcaoContainer}>
            <TouchableOpacity
              style={[styles.opcao, tipo === "pai" && styles.opcaoSelecionada]}
              onPress={() => {
                setTipo("pai");
                setErrors((prev) => ({ ...prev, tipo: undefined }));
              }}
            >
              <MaterialCommunityIcons
                name="human-male-child"
                size={22}
                color={tipo === "pai" ? colors.surface : colors.paisPrimary}
              />
              <Text style={[styles.textoOpcao, tipo === "pai" && { color: colors.surface }]}>
                Já tenho filho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.opcao, tipo === "gestante" && styles.opcaoSelecionada]}
              onPress={() => {
                setTipo("gestante");
                setErrors((prev) => ({ ...prev, tipo: undefined }));
              }}
            >
              <MaterialCommunityIcons
                name="human-pregnant"
                size={22}
                color={tipo === "gestante" ? colors.surface : colors.paisPrimary}
              />
              <Text style={[styles.textoOpcao, tipo === "gestante" && { color: colors.surface }]}>
                Estou grávida
              </Text>
            </TouchableOpacity>
          </View>
          {touched.tipo && errors.tipo && <Text style={styles.errorText}>{errors.tipo}</Text>}

          {/* ── SUBMIT ───────────────────────────── */}
          <TouchableOpacity onPress={salvar} disabled={loadingCadastro} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.paisPrimary, colors.primary, colors.paisSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.button, loadingCadastro && { opacity: 0.7 }]}
            >
              {loadingCadastro ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-check-outline" size={16} color={colors.surface} />
                  <Text style={styles.buttonText}>Criar conta</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisivel} transparent={true} animationType="fade">
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.botaoFechar}
              onPress={() => setModalVisivel(false)}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons
                name="email-check-outline"
                size={44}
                color={colors.primary}
              />
            </View>

            <Text style={styles.modalTitulo}>Verifique seu email</Text>
            <Text style={styles.modalTexto}>
              Enviamos um link de confirmação para:{"\n"}
              <Text style={{ fontWeight: "bold" }}>{email}</Text>
            </Text>

            <TouchableOpacity
              style={[styles.botaoModal, loadingVerificacao && { opacity: 0.7 }]}
              onPress={verificarSeEmailFoiConfirmado}
              disabled={loadingVerificacao}
            >
              {loadingVerificacao ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text style={styles.textoBotaoModal}>Já cliquei no link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoReenviar, loadingReenviar && { opacity: 0.7 }]}
              onPress={reenviarEmail}
              disabled={loadingReenviar}
            >
              {loadingReenviar ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.textoBotaoReenviar}>Reenviar email</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── HERO ──
  hero: {
    paddingTop: Platform.select({ ios: 64, android: 48, default: 48 }),
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF26",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFFFFF40",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: "#EAE0FB",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 12,
    lineHeight: 19,
  },

  // ── SHEET (cartão elevado sobre o hero) ──
  keyboardContainer: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -32,
  },
  sheetContent: {
    padding: 22,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.paisPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 4,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMenu,
    marginBottom: 6,
    marginTop: 2,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14.5,
    color: colors.textDark,
    height: "100%",
  },
  iconArea: {
    padding: 5,
  },

  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },

  opcaoContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  opcao: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
  },
  opcaoSelecionada: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textoOpcao: {
    color: colors.textDark,
    fontWeight: "600",
    fontSize: 13.5,
    textAlign: "center",
  },

  // ── SUBMIT ──
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 28,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 15.5,
    fontWeight: "700",
  },

  // ── MODAL ──
  botaoFechar: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(40,23,76,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    width: "100%",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  modalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalTitulo: {
    fontSize: 19,
    fontWeight: "bold",
    color: colors.textDark,
    marginTop: 5,
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  botaoModal: {
    backgroundColor: colors.card,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  textoBotaoModal: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 14.5,
  },
  botaoReenviar: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  textoBotaoReenviar: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
});