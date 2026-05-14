import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db, firestore } from "@/src/services/firebase";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database"; // Para o Pai
import { doc, setDoc } from "firebase/firestore"; // Para a Gestante
import { Calendar, Eye, EyeOff } from "lucide-react-native";
import MaskInput from "react-native-mask-input";

export default function Cadastro() {
  const router = useRouter();

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
      Alert.alert("Erro", "Selecione uma opção");
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
      // NOVO: GERA O CÓDIGO DE COMPARTILHAMENTO AQUI!
      // ---------------------------------------------------------
      const prefixo =
        nome.trim().length >= 3
          ? nome.trim().substring(0, 3).toUpperCase()
          : "USR";
      const codigoGerado = prefixo + Math.floor(1000 + Math.random() * 9000);

      // Adicionamos o código e o perfilVinculado aos dados do usuário
      const dadosUsuario = {
        nome,
        email,
        telefone,
        cidade,
        dataNascimento: dataTexto,
        tipo,
        criadoEm: new Date().toISOString(),
        codigoCompartilhamento: codigoGerado, // O código já nasce com o usuário
        perfilVinculado: null, // Prepara o espaço para quando vincular alguém
      };

      if (tipo === "gestante") {
        await setDoc(doc(firestore, "usuarios", uid), dadosUsuario);
        router.replace("/dum");
      } else {
        await set(ref(db, "usuarios_pais/" + uid), dadosUsuario);
        Alert.alert("Sucesso", "Conta de parceiro criada!");
        router.replace("/addFilho");
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro", "Email já em uso");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Erro", "Email inválido");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Erro", "Senha fraca");
      } else {
        Alert.alert("Erro", "Erro ao criar conta");
        console.log(error);
      }
    }
  }

  return (
    <LinearGradient colors={["#ece3ff", "#ffc2e8"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.titulo}>Criar Conta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          <MaskInput
            style={styles.input}
            value={telefone}
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

          <View style={styles.dataContainer}>
            <TextInput
              style={styles.dataInput}
              placeholder="dd/mm/aaaa"
              value={dataTexto}
              onChangeText={handleData}
            />
            <TouchableOpacity onPress={() => setMostrarDate(true)}>
              <Calendar size={22} color="#7050b3" />
            </TouchableOpacity>
          </View>

          {mostrarDate && (
            <DateTimePicker
              value={data}
              mode="date"
              onChange={(event: DateTimePickerEvent, date?: Date) => {
                if (date) {
                  const dia = String(date.getDate()).padStart(2, "0");
                  const mes = String(date.getMonth() + 1).padStart(2, "0");
                  const ano = date.getFullYear();
                  setDataTexto(`${dia}/${mes}/${ano}`);
                  setData(date);
                }
                setMostrarDate(false);
              }}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={cidade}
            onChangeText={setCidade}
          />

          <View style={styles.senhaContainer}>
            <TextInput
              secureTextEntry={!showSenha}
              style={styles.senhaInput}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
              {showSenha ? <EyeOff color="#7050b3" /> : <Eye color="#7050b3" />}
            </TouchableOpacity>
          </View>

          <View style={styles.senhaContainer}>
            <TextInput
              secureTextEntry={!showConfirmSenha}
              style={styles.senhaInput}
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmSenha(!showConfirmSenha)}
            >
              {showConfirmSenha ? (
                <EyeOff color="#7050b3" />
              ) : (
                <Eye color="#7050b3" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.opcaoContainer}>
            <TouchableOpacity
              style={[styles.opcao, tipo === "pai" && styles.opcaoAtiva]}
              onPress={() => setTipo("pai")}
            >
              <Text style={styles.textoOpcao}>Já tenho filho</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.opcao, tipo === "gestante" && styles.opcaoAtiva]}
              onPress={() => setTipo("gestante")}
            >
              <Text style={styles.textoOpcao}>Estou grávida</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={salvar}>
            <LinearGradient
              colors={["#7050b3", "#99acff"]}
              style={styles.botao}
            >
              <Text style={styles.textoBotao}>Criar Conta</Text>
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
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 25,
    elevation: 10,
  },
  titulo: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    color: "#28174cca",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#b390d8",
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f8f4ff",
  },
  dataContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b390d8",
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f8f4ff",
  },
  dataInput: { flex: 1, padding: 12 },
  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b390d8",
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f8f4ff",
  },
  senhaInput: { flex: 1, padding: 12 },
  opcaoContainer: { flexDirection: "row", gap: 12, marginTop: 25 },
  opcao: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: "#7050b3",
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#ece3ff",
  },
  opcaoAtiva: { backgroundColor: "#7050b3" },
  textoOpcao: { color: "#28174cca", fontWeight: "500" },
  botao: { marginTop: 25, padding: 16, borderRadius: 14, alignItems: "center" },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
