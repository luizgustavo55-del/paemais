import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
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
  useWindowDimensions,
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Consulta {
  id: string;
  tipo: "Consulta" | "Exame";
  titulo: string;
  data: string;
  hora: string;
  localMedico: string;
  notas: string;
  createdAt?: string;
  notificationId?: string | null;
}

interface ConfiguracoesApp {
  notificacoesAtivas: boolean;
  descansoAtivo: boolean;
  horaInicio: string;
  horaFim: string;
  vibracaoAtiva: boolean;
  somSelecionado: string;
}

export default function ConsultasScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;

  const styles = getStyles(theme, isModoCompacto);

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);

  const [tipoAtual, setTipoAtual] = useState<"Consulta" | "Exame">("Consulta");
  const [tituloAtual, setTituloAtual] = useState("");
  const [dataAtual, setDataAtual] = useState("");
  const [horaAtual, setHoraAtual] = useState("");
  const [localAtual, setLocalAtual] = useState("");
  const [notasAtual, setNotasAtual] = useState("");

  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesApp>({
    notificacoesAtivas: true,
    descansoAtivo: false,
    horaInicio: "22:00",
    horaFim: "07:00",
    vibracaoAtiva: true,
    somSelecionado: "padrao_app",
  });

  useEffect(() => {
    async function pedirPermissao() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    }
    pedirPermissao();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarConfiguracoes();
    }, []),
  );

  const carregarConfiguracoes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dados = userSnap.data();
        if (dados.configuracoes) {
          setConfiguracoes((prev) => ({ ...prev, ...dados.configuracoes }));
        }
      }
    } catch (error) {
      console.log("Erro ao carregar configurações", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const consultasRef = collection(
          firestore,
          "usuarios",
          user.uid,
          "consultas",
        );
        const q = query(consultasRef, orderBy("createdAt", "desc"));

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
      const currentDate = dateObj;
      currentDate.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
      setDateObj(new Date(currentDate));

      const day = String(selectedDate.getDate()).padStart(2, "0");
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDataAtual(`${day}/${month}/${year}`);

      if (Platform.OS === "android") setShowDatePicker(false);
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      const currentDate = dateObj;
      currentDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDateObj(new Date(currentDate));

      const hours = String(selectedDate.getHours()).padStart(2, "0");
      const minutes = String(selectedDate.getMinutes()).padStart(2, "0");
      setHoraAtual(`${hours}:${minutes}`);

      if (Platform.OS === "android") setShowTimePicker(false);
    }
  };

  const agendarNotificacaoImportante = async (
    titulo: string,
    dataHora: Date,
  ) => {
    if (!configuracoes.notificacoesAtivas) return null;

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          "agendamentos-importantes",
          {
            name: "Consultas e Exames (Críticos)",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 250, 500, 250, 500],
            sound:
              configuracoes.somSelecionado === "padrao_app"
                ? "default"
                : undefined,
            bypassDnd: true,
          },
        );
      }

      const idNotificacao = await Notifications.scheduleNotificationAsync({
        content: {
          title: `IMPORTANTE: ${tipoAtual} Agendado(a)`,
          body: `${titulo} - Não se esqueça da sua marcação médica!`,
          sound:
            configuracoes.somSelecionado === "padrao_app" ? true : undefined,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dataHora,
          channelId: "agendamentos-importantes",
        },
      });

      return idNotificacao;
    } catch (error) {
      console.log("Erro ao agendar notificação:", error);
      return null;
    }
  };

  const verificarHoraDescanso = (dataHora: Date) => {
    if (!configuracoes.descansoAtivo) return false;

    const h = dataHora.getHours();
    const m = dataHora.getMinutes();
    const minutosAtuais = h * 60 + m;

    const [iH, iM] = configuracoes.horaInicio.split(":").map(Number);
    const inicio = iH * 60 + iM;

    const [fH, fM] = configuracoes.horaFim.split(":").map(Number);
    const fim = fH * 60 + fM;

    if (inicio > fim) {
      return minutosAtuais >= inicio || minutosAtuais <= fim;
    }
    return minutosAtuais >= inicio && minutosAtuais <= fim;
  };

  const tentarSalvarAgendamento = () => {
    if (!userId) return;

    if (
      tituloAtual.trim() === "" ||
      dataAtual.trim() === "" ||
      horaAtual.trim() === ""
    ) {
      Alert.alert("Atenção", "O título, a data e a hora são obrigatórios!");
      return;
    }

    if (dateObj.getTime() <= Date.now()) {
      Alert.alert("Aviso", "Escolha uma data e hora no futuro.");
      return;
    }

    if (verificarHoraDescanso(dateObj)) {
      Alert.alert(
        "Modo Descanso Ativo",
        `Este agendamento (${horaAtual}) será no seu período de descanso (${configuracoes.horaInicio} às ${configuracoes.horaFim}). Deseja agendar mesmo assim?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Agendar", onPress: processarAgendamento },
        ],
      );
    } else {
      processarAgendamento();
    }
  };

  const processarAgendamento = async () => {
    try {
      const notificationId = await agendarNotificacaoImportante(
        tituloAtual.trim(),
        dateObj,
      );

      const novaConsulta = {
        tipo: tipoAtual,
        titulo: tituloAtual.trim(),
        data: dataAtual.trim(),
        hora: horaAtual.trim(),
        localMedico: localAtual.trim(),
        notas: notasAtual.trim(),
        createdAt: new Date().toISOString(),
        notificationId: notificationId || null,
      };

      if (!userId) return;

      const consultasRef = collection(
        firestore,
        "usuarios",
        userId,
        "consultas",
      );
      await addDoc(consultasRef, novaConsulta);

      setModalVisivel(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível guardar o agendamento.");
      console.log("Erro ao salvar no Firestore: ", error);
    }
  };

  const confirmarExclusao = (id: string, notificationId?: string | null) => {
    Alert.alert(
      "Apagar Agendamento",
      "Tem a certeza que deseja cancelar e apagar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, apagar",
          style: "destructive",
          onPress: () => apagarConsulta(id, notificationId),
        },
      ],
    );
  };

  const apagarConsulta = async (
    idParaApagar: string,
    notificationId?: string | null,
  ) => {
    if (!userId) return;
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

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
      <StatusBar hidden={true} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerLeft}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={isModoCompacto ? 24 : 28}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <Text style={styles.tituloHeader}>Consultas & Exames</Text>
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
                color={theme.colors.gestantesSecondary}
              />
              <Text style={styles.emptyText}>
                Nenhuma consulta ou exame agendado.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={
                    item.tipo === "Consulta" ? "stethoscope" : "flask-outline"
                  }
                  size={28}
                  color={
                    item.tipo === "Consulta" ? "#40ca2e" : theme.colors.primary
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
                onPress={() => confirmarExclusao(item.id, item.notificationId)}
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
                    Consulta
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
                    Exame
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="O que vai fazer?"
                placeholderTextColor={theme.colors.subtitle}
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
                      color={theme.colors.subtitle}
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
                      color={theme.colors.subtitle}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
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
                placeholderTextColor={theme.colors.subtitle}
                value={localAtual}
                onChangeText={setLocalAtual}
              />

              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                placeholder="Perguntas ou dicas que irá querer"
                placeholderTextColor={theme.colors.subtitle}
                multiline
                value={notasAtual}
                onChangeText={setNotasAtual}
              />

              <TouchableOpacity
                onPress={tentarSalvarAgendamento}
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

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFF7FB",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 22,
      paddingTop: isModoCompacto ? 20 : 40,
      paddingBottom: isModoCompacto ? 15 : 22,
      backgroundColor: theme.colors.gestantesPrimary,
      shadowColor: "#c2548f",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    headerLeft: {
      width: isModoCompacto ? 34 : 42,
      height: isModoCompacto ? 34 : 42,
      borderRadius: 21,
      backgroundColor: "#dbc4cf6e",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      left: 12,
      bottom: isModoCompacto ? 10 : 18,
    },
    tituloHeader: {
      fontSize: isModoCompacto ? theme.texts.subtitle : theme.texts.title,
      fontWeight: "700",
      color: "#FFF8FC",
      letterSpacing: 0.2,
    },
    content: {
      flex: 1,
      padding: isModoCompacto ? 16 : 22,
    },
    button: {
      flexDirection: "row",
      paddingVertical: isModoCompacto ? 14 : 16,
      paddingHorizontal: 18,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isModoCompacto ? 16 : 24,
      backgroundColor: theme.colors.gestantesPrimary,
      shadowColor: "#A64D78",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    buttonText: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: theme.texts.text,
      letterSpacing: 0.3,
    },
    emptyCard: {
      backgroundColor: "#FFF9FC",
      borderRadius: 24,
      paddingVertical: isModoCompacto ? 30 : 42,
      paddingHorizontal: 26,
      alignItems: "center",
      marginTop: 24,
      shadowColor: "#A64D78",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    emptyText: {
      marginTop: 16,
      color: theme.colors.title,
      fontSize: theme.texts.text,
      textAlign: "center",
      lineHeight: 22,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF9FC",
      padding: isModoCompacto ? 14 : 16,
      marginBottom: 14,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowColor: "#A64D78",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    iconContainer: {
      width: isModoCompacto ? 42 : 52,
      height: isModoCompacto ? 42 : 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
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
      fontSize: theme.texts.text,
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
      height: isModoCompacto ? "95%" : "90%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    modalTitulo: {
      fontSize: theme.texts.title,
      fontWeight: "700",
      color: theme.colors.gestantesPrimary,
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
      backgroundColor: theme.colors.gestantesPrimary,
    },
    tipoAtivoExame: {
      backgroundColor: theme.colors.gestantesPrimary,
    },
    tipoTexto: {
      fontWeight: "700",
      color: theme.colors.title,
      fontSize: theme.texts.text,
    },
    label: {
      fontWeight: "600",
      color: "#91486F",
      marginBottom: 8,
      marginTop: 12,
      fontSize: theme.texts.subtitle,
    },
    input: {
      backgroundColor: "#FDEAF2",
      borderRadius: 16,
      padding: 15,
      fontSize: theme.texts.text,
      color: theme.colors.title,
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
      backgroundColor: theme.colors.gestantesPrimary,
      marginTop: 26,
      paddingVertical: 16,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 42,
      shadowColor: "#A64D78",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: theme.texts.text,
      letterSpacing: 0.3,
    },
  });
