import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/src/context/ThemeContext";

export default function Filhos() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [sexo, setSexo] = useState("");
  const [relacao, setRelacao] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  const router = useRouter();
  const hoje = new Date();

  function handleData(text: string) {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    let formatted = cleaned;

    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    } else if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    setData(formatted);
  }

  function formatarData(date: Date) {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  function onChange(event: any, selectedDate?: Date) {
    setShowPicker(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      setData(formatarData(selectedDate));
    }
  }

  async function salvarFilho() {
    if (!nome || !data || !sexo || !relacao) {
      Alert.alert("Aviso", "Preencha todos os campos para continuar.");
      return;
    }

    if (data.length !== 10) {
      Alert.alert("Aviso", "Preencha a data no formato DD/MM/AAAA");
      return;
    }

    const partes = data.split("/");
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);
    const dataNascimento = new Date(ano, mes, dia);

    if (dataNascimento > hoje) {
      Alert.alert(
        "Data Inválida",
        "A data de nascimento não pode ser no futuro.",
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Erro", "Usuário não logado");
        return;
      }

      const filhosRef = collection(firestore, "usuarios", user.uid, "filhos");

      await addDoc(filhosRef, {
        nome,
        dataNascimento: data,
        sexo,
        relacao,
        criadoEm: new Date().toISOString(),
      });

      Alert.alert("Sucesso", "Filho cadastrado com sucesso!");
      router.replace("/(drawer)/(pais)/(tabs)/menu");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.icone}>
        <Text style={{ fontSize: 30 }}>👶</Text>
      </View>

      <Text style={styles.titulo}>Conte-nos sobre seu filho</Text>

      <View style={styles.card}>
        <Text style={styles.texto}>Nome</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Digite o nome"
          placeholderTextColor={theme.colors.subtitle}
        />

        <Text style={styles.texto}>Data de nascimento</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputInside}
            value={data}
            onChangeText={handleData}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={theme.colors.subtitle}
            keyboardType="numeric"
            maxLength={10}
          />
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.iconArea}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={24}
              color={theme.colors.subtitle || theme.colors.title}
            />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={hoje}
            onChange={onChange}
          />
        )}

        <Text style={styles.texto}>Você é:</Text>
        <View style={styles.sexoContainer}>
          <TouchableOpacity
            style={[styles.sexoBotao, relacao === "pai" && styles.relacaoPai]}
            onPress={() => setRelacao("pai")}
          >
            <Text style={styles.texto}>👨 Pai</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sexoBotao, relacao === "mae" && styles.relacaoMae]}
            onPress={() => setRelacao("mae")}
          >
            <Text style={styles.texto}>👩 Mãe</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.texto}>Sexo da criança</Text>

        <View style={styles.sexoContainer}>
          <TouchableOpacity
            style={[
              styles.sexoBotao,
              sexo === "menino" && styles.sexoMasculino,
            ]}
            onPress={() => setSexo("menino")}
          >
            <Text style={styles.texto}>👦 Menino</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sexoBotao, sexo === "menina" && styles.sexoFeminino]}
            onPress={() => setSexo("menina")}
          >
            <Text style={styles.texto}>👧 Menina</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botao, { opacity: loading ? 0.5 : 1 }]}
        onPress={salvarFilho}
        disabled={loading}
      >
        <Text style={styles.textoBotao}>
          {loading ? "Salvando..." : "Salvar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
      alignItems: "center",
    },
    icone: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 40,
      marginBottom: 20,
      backgroundColor: theme.colors.primary,
    },
    titulo: {
      fontSize: theme.texts.title,
      marginBottom: 30,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.colors.title,
    },
    texto: {
      fontSize: theme.texts.text,
      marginTop: 10,
      marginBottom: 5,
      color: theme.colors.text,
      fontWeight: "500",
    },
    card: {
      width: "100%",
      backgroundColor: theme.colors.card,
      padding: 15,
      borderRadius: 15,
      marginBottom: 20,
    },
    input: {
      backgroundColor: "#f2f2f2",
      paddingHorizontal: 16,
      height: 55,
      borderRadius: 10,
      marginBottom: 10,
      fontSize: theme.texts.text,
      color: theme.colors.title,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f2f2f2",
      borderRadius: 10,
      marginBottom: 10,
      paddingHorizontal: 16,
      height: 55,
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
    sexoContainer: {
      flexDirection: "row",
      gap: 10,
      marginTop: 5,
      marginBottom: 15,
    },
    sexoBotao: {
      flex: 1,
      padding: 8,
      borderWidth: 1,
      borderRadius: 10,
      alignItems: "center",
      borderColor: "#ccc",
      backgroundColor: "transparent",
    },
    sexoFeminino: {
      backgroundColor: "#ff7dc0",
      borderColor: "#ff4db8",
    },
    sexoMasculino: {
      backgroundColor: "#5e61ee",
      borderColor: "#4d8bff",
    },
    relacaoPai: {
      backgroundColor: "rgba(94, 97, 238, 0.8)",
      borderColor: "#5e61ee",
    },
    relacaoMae: {
      backgroundColor: "rgba(255, 125, 192, 0.8)",
    },
    botao: {
      width: "100%",
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: theme.colors.card,
    },
    textoBotao: {
      color: theme.colors.text,
      fontSize: theme.texts.text,
      fontWeight: "bold",
    },
  });
