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
    backgroundColor: theme.colors.terceary,
  },
  header: {
    height: 110,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconBtn: { padding: 5 },
  titulo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.title,
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cardResumo: {
    flexDirection: "row",
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  infoResumo: {
    alignItems: "center",
    flex: 1,
  },
  labelResumo: {
    fontSize: theme.texts.text,
    color: theme.colors.subtitle,
    marginBottom: 5,
  },
  valorResumo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.title,
  },
  divisor: {
    width: 1,
    height: "80%",
    backgroundColor: theme.colors.primary,
    opacity: 0.5,
  },
  inputContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: theme.texts.subtitle,
    color: theme.colors.title,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  input: {
    fontSize: 50,
    fontWeight: "bold",
    color: theme.colors.title,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.title,
    minWidth: 90,
    textAlign: "center",
    paddingBottom: 5,
  },
  unidade: {
    fontSize: 50,
    paddingBottom: 5,
    color: theme.colors.title,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.title,
    minWidth: 40,
  },
  botaoSalvar: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
  },
  botaoTexto: {
    color: theme.colors.texts,
    fontSize: theme.texts.text,
    fontWeight: "bold",
  },
  historicoContainer: {
    flex: 1,
  },
  historicoTitulo: {
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
    color: theme.colors.title,
    marginBottom: 15,
  },
  textoVazio: {
    fontSize: theme.texts.text,
    color: theme.colors.subtitle,
    textAlign: "center",
    marginTop: 20,
  },
  cardHistorico: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.cards,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardData: {
    fontSize: theme.texts.text,
    color: theme.colors.texts,
    fontWeight: "bold",
  },
  cardDireita: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  cardPeso: {
    fontSize: theme.texts.text,
    color: theme.colors.texts,
    fontWeight: "bold",
  },
});
