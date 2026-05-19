import { theme } from "@/src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
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

// 🔥 IMPORTS DO FIREBASE
import { auth, firestore } from "@/src/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

interface Consulta {
  id: string;
  tipo: "Consulta" | "Exame";
  titulo: string;
  data: string;
  hora: string;
  localMedico: string;
  notas: string;
  createdAt?: string;
}

export default function ConsultasScreen() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);

  // Estados do Formulário
  const [tipoAtual, setTipoAtual] = useState<"Consulta" | "Exame">("Consulta");
  const [tituloAtual, setTituloAtual] = useState("");
  const [dataAtual, setDataAtual] = useState("");
  const [horaAtual, setHoraAtual] = useState("");
  const [localAtual, setLocalAtual] = useState("");
  const [notasAtual, setNotasAtual] = useState("");

  // DatePickers
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Usuário logado
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Escuta quem está logado
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        // 2. Busca as consultas em tempo real na subcoleção do usuário
        const consultasRef = collection(
          firestore,
          "usuarios",
          user.uid,
          "consultas",
        );
        const q = query(consultasRef, orderBy("createdAt", "desc")); // Ordena da mais recente adicionada para a mais antiga

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const listaConsultas = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Consulta[];

          setConsultas(listaConsultas);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUserId(null);
        setConsultas([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const abrirNovoAgendamento = () => {
    setTipoAtual("Consulta");
    setTituloAtual("");
    setDataAtual("");
    setHoraAtual("");
    setLocalAtual("");
    setNotasAtual("");
    setDateObj(new Date());
    setModalVisivel(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateObj(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDataAtual(`${day}/${month}/${year}`);

      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateObj(selectedDate);
      const hours = String(selectedDate.getHours()).padStart(2, "0");
      const minutes = String(selectedDate.getMinutes()).padStart(2, "0");
      setHoraAtual(`${hours}:${minutes}`);

      if (Platform.OS === "android") {
        setShowTimePicker(false);
      }
    }
  };

  const salvarAgendamento = async () => {
    if (!userId) return;

    if (tituloAtual.trim() === "" || dataAtual.trim() === "") {
      if (Platform.OS === "web") {
        window.alert("Atenção: O título e a data são obrigatórios!");
      } else {
        Alert.alert("Atenção", "O título e a data são obrigatórios!");
      }
      return;
    }

    try {
      const novaConsulta = {
        tipo: tipoAtual,
        titulo: tituloAtual.trim(),
        data: dataAtual.trim(),
        hora: horaAtual.trim(),
        localMedico: localAtual.trim(),
        notas: notasAtual.trim(),
        createdAt: new Date().toISOString(), // Para ajudar na ordenação
      };

      // Adiciona o documento na subcoleção do usuário logado
      const consultasRef = collection(
        firestore,
        "usuarios",
        userId,
        "consultas",
      );
      await addDoc(consultasRef, novaConsulta);

      setModalVisivel(false);
    } catch (error) {
      if (Platform.OS === "web") {
        window.alert("Erro: Não foi possível guardar o agendamento.");
      } else {
        Alert.alert("Erro", "Não foi possível guardar o agendamento.");
      }
      console.log("Erro ao salvar no Firestore: ", error);
    }
  };

  const confirmarExclusao = (id: string) => {
    if (Platform.OS === "web") {
      const confirmou = window.confirm(
        "Tem a certeza que deseja cancelar e apagar este agendamento?",
      );
      if (confirmou) {
        apagarConsulta(id);
      }
    } else {
      Alert.alert(
        "Apagar Agendamento",
        "Tem a certeza que deseja cancelar e apagar este agendamento?",
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim, apagar",
            style: "destructive",
            onPress: () => apagarConsulta(id),
          },
        ],
      );
    }
  };

  const apagarConsulta = async (idParaApagar: string) => {
    if (!userId) return;
    try {
      // Deleta o documento específico pelo ID
      const docRef = doc(
        firestore,
        "usuarios",
        userId,
        "consultas",
        idParaApagar,
      );
      await deleteDoc(docRef);
    } catch (error) {
      console.log("Erro ao apagar no Firestore: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerLeft}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={theme.colors.texts}
          />
        </TouchableOpacity>

        <Text style={styles.tituloHeader}>Consultas & Exames</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          onPress={abrirNovoAgendamento}
          activeOpacity={0.8}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name="calendar-plus"
            size={22}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Novo Agendamento</Text>
        </TouchableOpacity>

        <FlatList
          data={consultas}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={70}
                color={theme.colors.cards}
              />
              <Text style={styles.emptyText}>
                Nenhuma consulta ou exame agendado.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      item.tipo === "Consulta"
                        ? theme.colors.quaternary
                        : theme.colors.secondary,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    item.tipo === "Consulta" ? "stethoscope" : "flask-outline"
                  }
                  size={28}
                  color={
                    item.tipo === "Consulta"
                      ? theme.colors.background
                      : theme.colors.primary
                  }
                />
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardTipo}>{item.tipo.toUpperCase()}</Text>
                <Text style={styles.cardTitulo} numberOfLines={1}>
                  {item.titulo}
                </Text>

                <View style={styles.rowInfo}>
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={14}
                    color={theme.colors.subtitle}
                  />
                  <Text style={styles.cardData}>
                    {" "}
                    {item.data} {item.hora ? `às ${item.hora}` : ""}
                  </Text>
                </View>

                {item.localMedico ? (
                  <View style={styles.rowInfo}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={14}
                      color={theme.colors.subtitle}
                    />
                    <Text style={styles.cardData} numberOfLines={1}>
                      {" "}
                      {item.localMedico}
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => confirmarExclusao(item.id)}
                style={styles.lixeira}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={24}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Novo Agendamento</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={28}
                  color={theme.colors.title}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.tipoContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoBotao,
                    tipoAtual === "Consulta" && styles.tipoAtivoConsulta,
                  ]}
                  onPress={() => setTipoAtual("Consulta")}
                >
                  <Text
                    style={[
                      styles.tipoTexto,
                      tipoAtual === "Consulta" && { color: "#FFF" },
                    ]}
                  >
                    Consulta Médico
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoBotao,
                    tipoAtual === "Exame" && styles.tipoAtivoExame,
                  ]}
                  onPress={() => setTipoAtual("Exame")}
                >
                  <Text
                    style={[
                      styles.tipoTexto,
                      tipoAtual === "Exame" && { color: "#FFF" },
                    ]}
                  >
                    Realizar Exame
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>
                Título (Ex: Ultrassom Morfológico)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="O que vai fazer?"
                value={tituloAtual}
                onChangeText={setTituloAtual}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Data</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.inputPicker}
                  >
                    <Text
                      style={{
                        color: dataAtual
                          ? theme.colors.title
                          : theme.colors.subtitle,
                        fontSize: 16,
                      }}
                    >
                      {dataAtual || "Selecionar Data"}
                    </Text>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={20}
                      color={theme.colors.cards}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Hora</Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    style={styles.inputPicker}
                  >
                    <Text
                      style={{
                        color: horaAtual
                          ? theme.colors.title
                          : theme.colors.subtitle,
                        fontSize: 16,
                      }}
                    >
                      {horaAtual || "Selecionar Hora"}
                    </Text>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={20}
                      color={theme.colors.cards}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={dateObj}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={onChangeTime}
                />
              )}

              <Text style={styles.label}>Médico ou Local (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do médico ou clínica"
                value={localAtual}
                onChangeText={setLocalAtual}
              />

              <Text style={styles.label}>Notas / Perguntas para o médico</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                placeholder="Ex: Perguntar sobre as vitaminas..."
                multiline
                value={notasAtual}
                onChangeText={setNotasAtual}
              />

              <TouchableOpacity
                onPress={salvarAgendamento}
                activeOpacity={0.8}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Guardar Agendamento</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7FB",
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingTop: 46,

    paddingHorizontal: 22,

    paddingBottom: 18,

    backgroundColor: "#C85C90",

  

    shadowColor: "#c2548f",
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  headerLeft: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: "#f773b3",

    alignItems: "center",

    justifyContent: "center",
  },

  headerRight: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: "#c85c90",

    alignItems: "center",

    justifyContent: "center",
  },

  tituloHeader: {
    fontSize: 23,

    fontWeight: "700",

    color: "#FFF8FC",

    letterSpacing: 0.2,
  },

  content: {
    flex: 1,

    padding: 22,
  },

  button: {
    flexDirection: "row",

    paddingVertical: 16,
    paddingHorizontal: 18,

    borderRadius: 18,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 24,

    backgroundColor: "#C85C90",

    shadowColor: "#A64D78",

    shadowOpacity: 0.10,

    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  buttonText: {
    color: "#FFF",

    fontWeight: "700",

    fontSize: 16,

    letterSpacing: 0.3,
  },

  emptyCard: {
    backgroundColor: "#FFF9FC",

    borderRadius: 24,

    paddingVertical: 42,
    paddingHorizontal: 26,

    alignItems: "center",

    marginTop: 24,

    shadowColor: "#A64D78",

    shadowOpacity: 0.05,

    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  emptyText: {
    marginTop: 16,

    color: "#B18A9D",

    fontSize: 15,

    textAlign: "center",

    lineHeight: 22,
  },

  card: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFF9FC",

    padding: 16,

    marginBottom: 14,

    borderRadius: 22,

    borderWidth: 1,

    borderColor: "#F5D3E3",

    shadowColor: "#A64D78",

    shadowOpacity: 0.04,

    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  iconContainer: {
    width: 52,
    height: 52,

    borderRadius: 26,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 16,

    backgroundColor: "#FDEAF2",
  },

  cardInfo: {
    flex: 1,

    paddingRight: 10,
  },

  cardTipo: {
    fontSize: 11,

    fontWeight: "700",

    color: "#B18A9D",

    letterSpacing: 1,

    marginBottom: 4,
  },

  cardTitulo: {
    fontWeight: "700",

    color: "#8D3E67",

    fontSize: 17,

    marginBottom: 6,
  },

  rowInfo: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 3,
  },

  cardData: {
    color: "#A2748B",

    fontSize: 13,
  },

  lixeira: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: "#FFF3F7",

    justifyContent: "center",

    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.40)",

    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFF9FC",

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    paddingTop: 24,
    paddingHorizontal: 24,

    height: "90%",
  },

  modalHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 24,
  },

  modalTitulo: {
    fontSize: 24,

    fontWeight: "700",

    color: "#91486F",
  },

  tipoContainer: {
    flexDirection: "row",

    backgroundColor: "#FDEAF2",

    borderRadius: 16,

    padding: 5,

    marginBottom: 24,
  },

  tipoBotao: {
    flex: 1,

    paddingVertical: 13,

    alignItems: "center",

    borderRadius: 12,
  },

  tipoAtivoConsulta: {
    backgroundColor: "#C85C90",
  },

  tipoAtivoExame: {
    backgroundColor: "#A64D78",
  },

  tipoTexto: {
    fontWeight: "700",

    color: "#B18A9D",

    fontSize: 14,
  },

  label: {
    fontWeight: "600",

    color: "#91486F",

    marginBottom: 8,

    marginTop: 12,

    fontSize: 14,
  },

  input: {
    backgroundColor: "#FDEAF2",

    borderRadius: 16,

    padding: 15,

    fontSize: 15,

    color: "#8D3E67",

    borderWidth: 1,

    borderColor: "#F5D3E3",
  },

  inputPicker: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    backgroundColor: "#FDEAF2",

    borderRadius: 16,

    padding: 15,

    borderWidth: 1,

    borderColor: "#F5D3E3",
  },

  rowInputs: {
    flexDirection: "row",

    justifyContent: "space-between",

    gap: 14,
  },

  saveButton: {
    backgroundColor: "#C85C90",

    marginTop: 26,

    paddingVertical: 16,

    borderRadius: 20,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 42,

    shadowColor: "#A64D78",

    shadowOpacity: 0.10,

    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  saveButtonText: {
    color: "#FFF",

    fontWeight: "700",

    fontSize: 17,

    letterSpacing: 0.3,
  },
});
