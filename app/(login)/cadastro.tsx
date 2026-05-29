import { useState } from "react";
import {
  Alert,
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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

  async function salvar() {
    if (!nome || !email || !telefone || !cidade || !senha || !confirmarSenha) {
      Alert.alert("Aviso", "Preencha todos os campos");
      return;
    }

    if (!tipo) {
      Alert.alert("Aviso", "Selecione uma opção de perfil");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Aviso", "As senhas não coincidem");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha,
      );
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

      if (tipo === "gestante") {
        router.replace("/dum");
      } else {
        Alert.alert("Sucesso", "Conta de parceiro criada!");
        router.replace("/addFilho");
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro", "Este email já está em uso.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Erro", "Formato de email inválido.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Erro", "A senha é muito fraca (mínimo 6 caracteres).");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao criar a conta.");
        console.log(error);
      }
    }
  }

  return (
    <LinearGradient
      colors={[theme.colors.secondary, theme.colors.primary]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
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
            placeholder="(00) 00000-0000"
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
              onChange={(event: DateTimePickerEvent, date?: Date) => {
                setMostrarDate(false);
                if (date) {
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
                  backgroundColor: theme.colors.cards,
                  borderColor: theme.colors.cards,
                },
              ]}
              onPress={() => setTipo("pai")}
            >
              <Text
                style={[styles.textoOpcao, tipo === "pai" && { color: "#FFF" }]}
              >
                Já tenho filho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.opcao,
                tipo === "gestante" && {
                  backgroundColor: theme.colors.cards,
                  borderColor: theme.colors.cards,
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

          <TouchableOpacity onPress={salvar} activeOpacity={0.8}>
            <View
              style={[styles.botao, { backgroundColor: theme.colors.cards }]}
            >
              <Text style={styles.textoBotao}>CRIAR CONTA</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: theme.colors.terceary,
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
    borderColor: theme.colors.secondary,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#FFF",
    fontSize: theme.texts.text,
    color: theme.colors.title,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.secondary,
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
    borderColor: theme.colors.secondary,
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
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: theme.texts.text,
  },
});
