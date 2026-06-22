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

import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
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
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 40}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.container,
            { paddingBottom: paddingScroll },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.titulo}>Criar Conta</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              placeholderTextColor={theme.colors.subtitle}
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={theme.colors.subtitle}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <MaskInput
              style={styles.input}
              value={telefone}
              placeholder="Telefone"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.subtitle}
              onChangeText={(masked) => setTelefone(masked)}
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

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputInside}
                placeholder="Data de Nascimento"
                placeholderTextColor={theme.colors.subtitle}
                value={dataTexto}
                onChangeText={handleData}
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={() => setMostrarDate(true)}
                style={styles.iconArea}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={24}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>

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
                  }
                }}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Cidade"
              placeholderTextColor={theme.colors.subtitle}
              value={cidade}
              onChangeText={setCidade}
            />

            <View style={styles.inputContainer}>
              <TextInput
                secureTextEntry={!showSenha}
                style={styles.inputInside}
                placeholder="Senha"
                placeholderTextColor={theme.colors.subtitle}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity
                onPress={() => setShowSenha(!showSenha)}
                style={styles.iconArea}
              >
                <MaterialCommunityIcons
                  name={showSenha ? "eye-off" : "eye"}
                  size={24}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                secureTextEntry={!showConfirmSenha}
                style={styles.inputInside}
                placeholder="Confirmar senha"
                placeholderTextColor={theme.colors.subtitle}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmSenha(!showConfirmSenha)}
                style={styles.iconArea}
              >
                <MaterialCommunityIcons
                  name={showConfirmSenha ? "eye-off" : "eye"}
                  size={24}
                  color={theme.colors.subtitle}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.opcaoContainer}>
              <TouchableOpacity
                style={[
                  styles.opcao,
                  tipo === "pai" && {
                    backgroundColor: theme.colors.paisSecondary,
                    borderColor: "#a339b8",
                  },
                ]}
                onPress={() => setTipo("pai")}
              >
                <Text
                  style={[
                    styles.textoOpcao,
                    tipo === "pai" && { color: "#FFF" },
                  ]}
                >
                  Já tenho filho
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.opcao,
                  tipo === "gestante" && {
                    backgroundColor: theme.colors.gestantesSecondary,
                    borderColor: "#a339b8",
                  },
                ]}
                onPress={() => setTipo("gestante")}
              >
                <Text
                  style={[
                    styles.textoOpcao,
                    tipo === "gestante" && { color: "#FFF" },
                  ]}
                >
                  Estou grávida
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={salvar}
              activeOpacity={0.8}
              disabled={loadingCadastro}
            >
              <View style={[styles.botao, loadingCadastro && { opacity: 0.7 }]}>
                {loadingCadastro ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.textoBotao}>CRIAR CONTA</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
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
                size={24}
                color={theme.colors.subtitle}
              />
            </TouchableOpacity>

            <MaterialCommunityIcons
              name="email-check"
              size={60}
              color="#a339b8"
            />
            <Text style={styles.modalTitulo}>Verifique seu email</Text>
            <Text style={styles.modalTexto}>
              Enviamos um link de confirmação para:{"\n"}
              <Text style={{ fontWeight: "bold" }}>{email}</Text>
            </Text>

            <TouchableOpacity
              style={[
                styles.botaoModal,
                loadingVerificacao && { opacity: 0.7 },
              ]}
              onPress={verificarSeEmailFoiConfirmado}
              disabled={loadingVerificacao}
            >
              {loadingVerificacao ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.textoBotaoModal}>Já cliquei no link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botaoReenviar,
                loadingReenviar && { opacity: 0.7 },
              ]}
              onPress={reenviarEmail}
              disabled={loadingReenviar}
            >
              {loadingReenviar ? (
                <ActivityIndicator size="small" color="#a339b8" />
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
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  botaoFechar: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  card: {
    backgroundColor: theme.colors.primary,
    padding: 22,
    borderRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  titulo: {
    fontSize: theme.texts.title,
    textAlign: "center",
    fontWeight: "bold",
    color: theme.colors.title,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d25fe9",
    marginTop: 12,
    paddingHorizontal: 14,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#FFF",
    fontSize: theme.texts.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d25fe9",
    marginTop: 12,
    paddingHorizontal: 14,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  inputInside: {
    flex: 1,
    height: "100%",
    fontSize: theme.texts.text,
    color: theme.colors.title,
  },
  iconArea: {
    padding: 5,
  },
  opcaoContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
  },
  opcao: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.subtitle,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  textoOpcao: {
    color: theme.colors.title,
    fontWeight: "600",
    fontSize: theme.texts.text,
  },
  botao: {
    marginTop: 30,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#5407b8",
  },
  textoBotao: {
    color: "#fff",
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
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  modalTitulo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.title,
    marginTop: 15,
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: theme.texts.text,
    color: theme.colors.subtitle,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  botaoModal: {
    backgroundColor: theme.colors.background,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  textoBotaoModal: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: theme.texts.text,
  },
  botaoReenviar: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  textoBotaoReenviar: {
    color: "#a339b8",
    fontWeight: "bold",
    fontSize: 16,
  },
});
