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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import MaskInput from "react-native-mask-input";

import { auth, db, firestore } from "@/src/services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { doc, setDoc } from "firebase/firestore";

// 👇 Importação adicionada para usar o contexto
import { useAuth } from "@/src/context/AuthContext";

export default function Cadastro() {
  const router = useRouter();

  // 👇 Extração do setUser adicionada
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
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (!tipo) {
      Alert.alert("Erro", "Selecione uma opção de perfil");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha,
      );
      const uid = userCredential.user.uid;

      // ---------------------------------------------------------
      // GERA O CÓDIGO DE COMPARTILHAMENTO
      // ---------------------------------------------------------
      const prefixo =
        nome.trim().length >= 3
          ? nome.trim().substring(0, 3).toUpperCase()
          : "USR";
      const codigoGerado = prefixo + Math.floor(1000 + Math.random() * 9000);

      // Dados que serão salvos (iguais para ambos para manter padrão)
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

      // 🔥 DIVISÃO DE BANCO DE DADOS
      if (tipo === "gestante") {
        // Gestante vai para o FIRESTORE
        await setDoc(doc(firestore, "usuarios", uid), dadosUsuario);

        // 👇 Atualização manual do state antes de navegar
        setUser({ uid, email, tipo: "gestante" });

        router.replace("/dum");
      } else {
        // Pai vai para o REALTIME DATABASE na estrutura solicitada (usuarios/[UID])
        await set(ref(db, "usuarios/" + uid), dadosUsuario);
        Alert.alert("Sucesso", "Conta de parceiro criada!");

        // 👇 Atualização manual do state antes de navegar
        setUser({ uid, email, tipo: "pai" });

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

          <View style={styles.rowInput}>
            <TextInput
              style={[styles.input, { flex: 1, marginTop: 0 }]}
              placeholder="Data de Nascimento"
              placeholderTextColor={theme.colors.subtitle}
              value={dataTexto}
              onChangeText={handleData}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setMostrarDate(true)}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={theme.colors.cards}
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

          <View style={styles.rowInput}>
            <TextInput
              secureTextEntry={!showSenha}
              style={[styles.input, { flex: 1, marginTop: 0 }]}
              placeholder="Senha"
              placeholderTextColor={theme.colors.subtitle}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowSenha(!showSenha)}
            >
              <MaterialCommunityIcons
                name={showSenha ? "eye-off" : "eye"}
                size={24}
                color={theme.colors.cards}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.rowInput}>
            <TextInput
              secureTextEntry={!showConfirmSenha}
              style={[styles.input, { flex: 1, marginTop: 0 }]}
              placeholder="Confirmar senha"
              placeholderTextColor={theme.colors.subtitle}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowConfirmSenha(!showConfirmSenha)}
            >
              <MaterialCommunityIcons
                name={showConfirmSenha ? "eye-off" : "eye"}
                size={24}
                color={theme.colors.cards}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.opcaoContainer}>
            <TouchableOpacity
              style={[
                styles.opcao,
                tipo === "pai" && { backgroundColor: theme.colors.cards },
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
                tipo === "gestante" && { backgroundColor: theme.colors.cards },
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
            <LinearGradient
              colors={[theme.colors.cards, "#99acff"]}
              style={styles.botao}
            >
              <Text style={styles.textoBotao}>CRIAR CONTA</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
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
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFF",
    fontSize: theme.texts.text,
    color: theme.colors.title,
  },
  rowInput: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  iconButton: {
    padding: 10,
    marginLeft: 5,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    width: 55,
  },
  opcaoContainer: { flexDirection: "row", gap: 10, marginTop: 25 },
  opcao: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cards,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  textoOpcao: {
    color: theme.colors.title,
    fontWeight: "600",
    fontSize: theme.texts.text,
  },
  botao: { marginTop: 30, padding: 18, borderRadius: 14, alignItems: "center" },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: theme.texts.text },
});
