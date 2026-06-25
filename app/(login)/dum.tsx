import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function Dum() {
  const router = useRouter();

  const [data, setData] = useState(new Date());
  const [dataTexto, setDataTexto] = useState("");
  const [mostrarDate, setMostrarDate] = useState(false);
  const [loading, setLoading] = useState(false);

  function formatarData(date: Date) {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  async function salvarDUM() {
    if (!dataTexto) {
      Alert.alert("Aviso", "Selecione uma data");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
      }

      const gestacoesRef = collection(
        firestore,
        "usuarios",
        user.uid,
        "gestacoes",
      );

      await addDoc(gestacoesRef, {
        dataUltimaMenstruacao: dataTexto,
        status: "ativa",
        criadoEm: new Date().toISOString(),
      });

      Alert.alert("Sucesso", "Conta criada!");
      router.replace("/gestacao");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar dados");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.topIconContainer}>
          <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="human-pregnant"
                size={38}
                color={colors.primary}
              />
          </View>

          <View style={styles.badge}>
            
            <Text style={styles.badgeTexto}>Nova gestação</Text>
          </View>
        </View>

        <Text style={styles.titulo}>Configurar Gravidez</Text>

        <Text style={styles.subtitulo}>
          Informe a data da sua última menstruação para começarmos seu
          acompanhamento com carinho.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </View>

          <View style={styles.infoTextBox}>
            <Text style={styles.infoTitulo}>Data importante</Text>
            <Text style={styles.infoTexto}>
              A DUM ajuda o app a estimar semanas, fases e lembretes da gestação.
            </Text>
          </View>
        </View>

        <Text style={styles.label}>DUM — Data da última menstruação</Text>

        <TouchableOpacity
          style={[
            styles.input,
            dataTexto ? styles.inputSelecionado : styles.inputVazio,
          ]}
          onPress={() => setMostrarDate(true)}
          activeOpacity={0.82}
        >
          <View style={styles.inputLeft}>
          
 
            <Text 
               
                style={[
                styles.inputTexto,
                  dataTexto
                  ?  styles.inputTextoSelecionado
                  : styles.inputPlaceholder,
              ]}
            >
              {dataTexto || "Selecionar data"}
            </Text>
          </View>

                <Ionicons
                name="calendar"
                size={18}
                color={dataTexto ? colors.primary : colors.textMuted}
              />
        </TouchableOpacity>

        {mostrarDate && (
          <DateTimePicker
            value={data}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setMostrarDate(Platform.OS === "ios");

              if (date) {
                setData(date);
                setDataTexto(formatarData(date));
              }
            }}
          />
        )}

        <TouchableOpacity
          onPress={salvarDUM}
          disabled={!dataTexto || loading}
          activeOpacity={0.86}
          style={[
            styles.botao,
            (!dataTexto || loading) && styles.botaoDesativado,
          ]}
        >
          <Ionicons
            name={loading ? "hourglass-outline" : "arrow-forward-circle"}
            size={20}
            color={colors.surface}
          />

          <Text style={styles.botaoTexto}>
            {loading ? "Salvando..." : "Começar Acompanhamento"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={colors.success}
          />

          <Text style={styles.footerTexto}>
            Seus dados serão usados para personalizar sua experiência.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  emoji: {
    fontSize: 42,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputVazio: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },

  inputSelecionado: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },

  inputLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  inputIconBox: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  inputTexto: {
    fontSize: 15,
    fontWeight: "400",
  },

  inputTextoSelecionado: {
    color: colors.textDark,
  },

  inputPlaceholder: {
    color: colors.textMuted,
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