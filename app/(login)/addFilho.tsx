import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
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

export default function Filhos() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [sexo, setSexo] = useState("");
  const [relacao, setRelacao] = useState("");

  const [dateObj, setDateObj] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const hoje = new Date();

  const formularioValido =
    nome.trim() !== "" &&
    data.trim() !== "" &&
    sexo.trim() !== "" &&
    relacao.trim() !== "";

  function handleData(text: string) {
    let cleaned = text.replace(/\D/g, "");

    if (cleaned.length > 8) {
      cleaned = cleaned.slice(0, 8);
    }

    let formatted = cleaned;

    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
        2,
        4,
      )}/${cleaned.slice(4)}`;
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

  function onChange(_event: any, selectedDate?: Date) {
    setShowPicker(Platform.OS === "ios");

    if (selectedDate) {
      setDateObj(selectedDate);
      setData(formatarData(selectedDate));
    }
  }

  async function salvarFilho() {
    if (!formularioValido) {
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

    if (
      dataNascimento.getDate() !== dia ||
      dataNascimento.getMonth() !== mes ||
      dataNascimento.getFullYear() !== ano
    ) {
      Alert.alert("Data inválida", "Informe uma data de nascimento válida.");
      return;
    }

    if (dataNascimento > hoje) {
      Alert.alert(
        "Data inválida",
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
        nome: nome.trim(),
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <View style={styles.topIconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="baby-face-outline"
              size={42}
              color={colors.primary}
            />
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>Novo filho</Text>
          </View>
        </View>

        <Text style={styles.titulo}>Cadastrar Criança</Text>

        <Text style={styles.subtitulo}>
          Informe os dados principais para começarmos o acompanhamento da
          criança com carinho.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons
              name="heart-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.infoTextBox}>
            <Text style={styles.infoTitulo}>Dados importantes</Text>

            <Text style={styles.infoTexto}>
              Essas informações ajudam o app a organizar vacinas, consultas,
              lembretes e desenvolvimento.
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Nome da criança</Text>

        <View style={styles.input}>
          <View style={styles.inputLeft}>
            <TextInput
              style={styles.inputTexto}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite o nome"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Ionicons
            name="person-outline"
            size={18}
            color={nome ? colors.primary : colors.textMuted}
          />
        </View>

        <Text style={styles.label}>Data de nascimento</Text>

        <View style={styles.input}>
          <View style={styles.inputLeft}>
            <TextInput
              style={styles.inputTexto}
              value={data}
              onChangeText={handleData}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            activeOpacity={0.82}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={data ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display="default"
            maximumDate={hoje}
            onChange={onChange}
          />
        )}

        <Text style={styles.label}>Sexo da criança</Text>

        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              sexo === "menino" && styles.optionSelected,
            ]}
            onPress={() => setSexo("menino")}
            activeOpacity={0.82}
          >
            <Ionicons
              name="male-outline"
              size={20}
              color={sexo === "menino" ? colors.surface : colors.primary}
            />

            <Text
              style={[
                styles.optionText,
                sexo === "menino" && styles.optionTextSelected,
              ]}
            >
              Menino
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              sexo === "menina" && styles.optionSelected,
            ]}
            onPress={() => setSexo("menina")}
            activeOpacity={0.82}
          >
            <Ionicons
              name="female-outline"
              size={20}
              color={sexo === "menina" ? colors.surface : colors.primary}
            />

            <Text
              style={[
                styles.optionText,
                sexo === "menina" && styles.optionTextSelected,
              ]}
            >
              Menina
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Você é</Text>

        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              relacao === "pai" && styles.optionSelected,
            ]}
            onPress={() => setRelacao("pai")}
            activeOpacity={0.82}
          >
            <MaterialCommunityIcons
              name="human-male"
              size={21}
              color={relacao === "pai" ? colors.surface : colors.primary}
            />

            <Text
              style={[
                styles.optionText,
                relacao === "pai" && styles.optionTextSelected,
              ]}
            >
              Pai
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              relacao === "mae" && styles.optionSelected,
            ]}
            onPress={() => setRelacao("mae")}
            activeOpacity={0.82}
          >
            <MaterialCommunityIcons
              name="human-female"
              size={21}
              color={relacao === "mae" ? colors.surface : colors.primary}
            />

            <Text
              style={[
                styles.optionText,
                relacao === "mae" && styles.optionTextSelected,
              ]}
            >
              Mãe
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={salvarFilho}
          disabled={!formularioValido || loading}
          activeOpacity={0.86}
          style={[
            styles.botao,
            (!formularioValido || loading) && styles.botaoDesativado,
          ]}
        >
          <Ionicons
            name={loading ? "hourglass-outline" : "checkmark-circle"}
            size={20}
            color={colors.surface}
          />

          <Text style={styles.botaoTexto}>
            {loading ? "Salvando..." : "Salvar Cadastro"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={colors.success}
          />

          <Text style={styles.footerTexto}>
            Seus dados serão usados para personalizar a experiência da família.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 22,
    justifyContent: "center",
  },

  card: {
    backgroundColor: colors.surface,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,

    shadowColor: colors.textDark,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },

  topIconContainer: {
    alignItems: "center",
    marginBottom: 14,
  },

  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badgeTexto: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "400",
  },

  titulo: {
    fontSize: theme.texts.title,
    fontWeight: "500",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 8,
  },

  subtitulo: {
    textAlign: "center",
    marginBottom: 18,
    fontSize: theme.texts.text,
    color: colors.textMuted,
    lineHeight: 21,
    paddingHorizontal: 3,
  },

  infoCard: {
    width: "100%",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  infoTextBox: {
    flex: 1,
  },

  infoTitulo: {
    fontSize: 13.5,
    fontWeight: "500",
    color: colors.textDark,
    marginBottom: 3,
  },

  infoTexto: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 17,
  },

  label: {
    alignSelf: "flex-start",
    marginBottom: 8,
    color: colors.textDark,
    fontWeight: "400",
    fontSize: 13,
  },

  input: {
    width: "100%",
    height: 58,
    paddingHorizontal: 13,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1.6,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  inputTexto: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "400",
    color: colors.textDark,
  },

  optionContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  optionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1.6,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
  },

  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  optionText: {
    color: colors.primary,
    fontSize: theme.texts.text,
    fontWeight: "400",
  },

  optionTextSelected: {
    color: colors.surface,
  },

  botao: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    flexDirection: "row",
    gap: 8,

    shadowColor: colors.primary,
    shadowOpacity: 0.34,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 6,
  },

  botaoDesativado: {
    opacity: 0.5,
  },

  botaoTexto: {
    color: colors.surface,
    fontWeight: "400",
    fontSize: theme.texts.text,
    letterSpacing: 0.2,
  },

  footerInfo: {
    marginTop: 16,
    backgroundColor: colors.successBg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  footerTexto: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "400",
    lineHeight: 16,
  },
});