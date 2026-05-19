import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface RegistroPeso {
  id: string;
  data: string;
  peso: string;
}

export default function Peso() {
  const router = useRouter();
  const [pesoInput, setPesoInput] = useState("");
  const [historico, setHistorico] = useState<RegistroPeso[]>([]);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, []),
  );

  const carregarHistorico = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dados = userSnap.data();
        const lista = dados.historicoPeso || [];
        setHistorico(lista);
      }
    } catch {
      console.log("Erro ao carregar histórico de peso");
    }
  };

  const registrarPeso = async () => {
    if (!pesoInput) return;

    const pesoFormatado = pesoInput.replace(",", ".");

    if (isNaN(Number(pesoFormatado))) {
      Alert.alert("Aviso", "Por favor, digite um número válido.");
      return;
    }

    const novoRegistro: RegistroPeso = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString("pt-BR"),
      peso: pesoFormatado,
    };

    const novaLista = [novoRegistro, ...historico];

    setHistorico(novaLista);
    setPesoInput("");

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      await updateDoc(userRef, { historicoPeso: novaLista });
    } catch {
      Alert.alert("Erro", "Não foi possível salvar seu peso. Tente novamente.");

      setHistorico(historico);
    }
  };

  const apagarRegistro = async (id: string) => {
    const novaLista = historico.filter((item) => item.id !== id);
    setHistorico(novaLista);

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, "usuarios", user.uid);
        await updateDoc(userRef, { historicoPeso: novaLista });
      }
    } catch {
      Alert.alert("Erro", "Não foi possível apagar o registro.");
      setHistorico(historico);
    }
  };

  const ganhoTotal = useMemo(() => {
    if (historico.length < 2) return "0.0";

    const pesoAtual = parseFloat(historico[0].peso);
    const ultimoPeso = parseFloat(historico[1].peso);
    const diferenca = pesoAtual - ultimoPeso;

    if (diferenca > 0) return `+ ${diferenca.toFixed(1)}`;
    if (diferenca < 0) return diferenca.toFixed(1);
    return "0.0";
  }, [historico]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={theme.colors.title}
          />
        </TouchableOpacity>
        <Text style={styles.titulo}>Meu Peso</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.main}>
        <View style={styles.cardResumo}>
          <View style={styles.infoResumo}>
            <Text style={styles.labelResumo}>Último Peso</Text>
            <Text style={styles.valorResumo}>
              {historico.length > 0 ? `${historico[0].peso} kg` : "--"}
            </Text>
          </View>
          <View style={styles.divisor} />
          <View style={styles.infoResumo}>
            <Text style={styles.labelResumo}>Ganhou/Perdeu</Text>
            <Text style={styles.valorResumo}>{ganhoTotal} kg</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Qual seu peso hoje?</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="00.0"
              placeholderTextColor={theme.colors.title}
              value={pesoInput}
              onChangeText={setPesoInput}
              maxLength={6}
            />
            <Text style={styles.unidade}>kg</Text>
          </View>

          <TouchableOpacity style={styles.botaoSalvar} onPress={registrarPeso}>
            <Text style={styles.botaoTexto}>REGISTRAR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historicoContainer}>
          <Text style={styles.historicoTitulo}>Histórico</Text>

          <FlatList
            data={historico}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.textoVazio}>Nenhum registro ainda.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.cardHistorico}>
                <Text style={styles.cardData}>{item.data}</Text>
                <View style={styles.cardDireita}>
                  <Text style={styles.cardPeso}>{item.peso} kg</Text>
                  <TouchableOpacity onPress={() => apagarRegistro(item.id)}>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={24}
                      color={theme.colors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7FB",
  },

  header: {
    height: 95,

    paddingTop: 42,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 22,

    backgroundColor: "#C85C90",

   

    shadowColor: "#8E3D68",
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  iconBtn: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.20)",

    alignItems: "center",
    justifyContent: "center",
  },

  titulo: {
    fontSize: 23,

    fontWeight: "700",

    color: "#FFF8FC",

    letterSpacing: 0.2,
  },

  main: {
    flex: 1,

    paddingHorizontal: 22,
    paddingTop: 22,
  },

  cardResumo: {
    flexDirection: "row",

    backgroundColor: "#FDEAF2",

    borderRadius: 24,

    paddingVertical: 22,
    paddingHorizontal: 18,

    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 30,

    borderWidth: 1,
    borderColor: "#F5D3E3",

    shadowColor: "#A64D78",
    shadowOpacity: 0.05,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  infoResumo: {
    alignItems: "center",

    flex: 1,
  },

  labelResumo: {
    fontSize: 14,

    color: "#9C7388",

    marginBottom: 6,

    fontWeight: "500",
  },

  valorResumo: {
    fontSize: 28,

    fontWeight: "700",

    color: "#91486F",
  },

  divisor: {
    width: 1,

    height: "75%",

    backgroundColor: "#E7BDD0",
  },

  inputContainer: {
    alignItems: "center",

    marginBottom: 34,
  },

  inputLabel: {
    fontSize: 17,

    color: "#91486F",

    marginBottom: 16,

    fontWeight: "600",
  },

  inputRow: {
    flexDirection: "row",

    alignItems: "flex-end",

    marginBottom: 26,
  },

  input: {
    fontSize: 52,

    fontWeight: "700",

    color: "#B2487D",

    borderBottomWidth: 2,

    borderBottomColor: "#D48CAE",

    minWidth: 95,

    textAlign: "center",

    paddingBottom: 6,
  },

  unidade: {
    fontSize: 48,

    paddingBottom: 6,

    color: "#B2487D",

    fontWeight: "700",

    borderBottomWidth: 2,

    borderBottomColor: "#D48CAE",

    minWidth: 45,

    textAlign: "center",
  },

  botaoSalvar: {
    backgroundColor: "#C85C90",

    paddingVertical: 15,
    paddingHorizontal: 44,

    borderRadius: 28,

    shadowColor: "#A64D78",
    shadowOpacity: 0.10,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  botaoTexto: {
    color: "#FFF",

    fontSize: 15,

    fontWeight: "700",

    letterSpacing: 0.2,
  },

  historicoContainer: {
    flex: 1,
  },

  historicoTitulo: {
    fontSize: 18,

    fontWeight: "700",

    color: "#91486F",

    marginBottom: 16,
  },

  textoVazio: {
    fontSize: 15,

    color: "#A2748B",

    textAlign: "center",

    marginTop: 28,

    lineHeight: 22,
  },

  cardHistorico: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    backgroundColor: "#FDEAF2",

    padding: 18,

    borderRadius: 22,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: "#F5D3E3",

    shadowColor: "#A64D78",
    shadowOpacity: 0.05,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  cardData: {
    fontSize: 15,

    color: "#8D3E67",

    fontWeight: "700",
  },

  cardDireita: {
    flexDirection: "row",

    alignItems: "center",

    gap: 14,
  },

  cardPeso: {
    fontSize: 16,

    color: "#B2487D",

    fontWeight: "700",
  },
});