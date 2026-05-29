import { auth, firestore } from "@/src/services/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
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
        <Text style={styles.emoji}>🤰</Text>
        <Text style={styles.titulo}>Configurar Gravidez</Text>
        <Text style={styles.subtitulo}>
          Informe a data da sua última menstruação
        </Text>
        <Text style={styles.label}>DUM</Text>

        <TouchableOpacity
          style={styles.input}
          onPress={() => setMostrarDate(true)}
        >
          <Text style={{ color: dataTexto ? "#000" : "#999" }}>
            {dataTexto || "Selecionar data"}
          </Text>
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
          style={[styles.botao, { opacity: !dataTexto || loading ? 0.5 : 1 }]}
        >
          <Text style={styles.botaoTexto}>
            {loading ? "Salvando..." : "Começar Acompanhamento"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3e6ef",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#e9d5e5",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  emoji: { fontSize: 40, marginBottom: 10 },
  titulo: { fontSize: 20, fontWeight: "bold" },
  subtitulo: { textAlign: "center", marginBottom: 20 },
  label: { alignSelf: "flex-start", marginBottom: 5 },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  botao: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#a75dff",
  },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
});
