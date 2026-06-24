import { useTheme } from "@/src/context/ThemeContext";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
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

interface Lembrete {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  concluido: boolean;
  notificationId?: string | null;
  tipo: "dia a dia" | "importante";
}

interface ConfiguracoesApp {
  notificacoesAtivas: boolean;
  descansoAtivo: boolean;
  horaInicio: string;
  horaFim: string;
  vibracaoAtiva: boolean;
  somSelecionado: string;
}

export default function Lembretes() {
  const router = useRouter();
  const { theme } = useTheme();

  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;

  const styles = getStyles(theme, isModoCompacto);

  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tituloInput, setTituloInput] = useState("");
  const [tipoInput, setTipoInput] = useState<"dia a dia" | "importante">(
    "dia a dia",
  );

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      carregarDados();
    }, []),
  );

  const carregarDados = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dados = userSnap.data();
        setLembretes(dados.lembretes || []);

        if (dados.configuracoes) {
          setConfiguracoes((prev) => ({ ...prev, ...dados.configuracoes }));
        }
      }
    } catch (error) {
      console.log("Erro ao carregar dados", error);
    }
  };

  const lembretesOrdenados = useMemo(() => {
    return [...lembretes].sort((a, b) => {
      const [diaA, mesA, anoA] = a.data.split("/");
      const [diaB, mesB, anoB] = b.data.split("/");
      const dataA = new Date(`${anoA}-${mesA}-${diaA}T${a.hora}:00`).getTime();
      const dataB = new Date(`${anoB}-${mesB}-${diaB}T${b.hora}:00`).getTime();
      return dataA - dataB;
    });
  }, [lembretes]);

  const agendarNotificacao = async (
    titulo: string,
    dataHora: Date,
    tipo: "dia a dia" | "importante",
  ) => {
    if (!configuracoes.notificacoesAtivas) return null;

    try {
      const ehImportante = tipo === "importante";

      if (Platform.OS === "android") {
        const canalId = ehImportante
          ? "lembretes-importantes"
          : "lembretes-dia-a-dia";
        const canalNome = ehImportante
          ? "Lembretes Importantes (Críticos)"
          : "Lembretes Comuns";

        await Notifications.setNotificationChannelAsync(canalId, {
          name: canalNome,
          importance: ehImportante
            ? Notifications.AndroidImportance.MAX
            : Notifications.AndroidImportance.HIGH,
          vibrationPattern: ehImportante
            ? [0, 500, 250, 500, 250, 500]
            : configuracoes.vibracaoAtiva
              ? [0, 250, 250, 250]
              : [0],
          sound:
            configuracoes.somSelecionado === "padrao_app"
              ? "default"
              : undefined,
          bypassDnd: ehImportante,
        });
      }

      const prefixo = ehImportante ? "IMPORTANTE: " : "Ei! Não se esqueça: ";
      const canalDestino = ehImportante
        ? "lembretes-importantes"
        : "lembretes-dia-a-dia";

      const idNotificacao = await Notifications.scheduleNotificationAsync({
        content: {
          title: prefixo + titulo,
          body: ehImportante
            ? "Aviso de alta importância! Verifique os detalhes imediatamente."
            : "Está na hora do seu lembrete agendado!",
          sound:
            configuracoes.somSelecionado === "padrao_app" ? true : undefined,
          priority: ehImportante
            ? Notifications.AndroidNotificationPriority.MAX
            : Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dataHora,
          channelId: canalDestino,
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

  const tentarAdicionarLembrete = () => {
    if (!tituloInput) {
      Alert.alert("Aviso", "Por favor, digite o que quer lembrar.");
      return;
    }

    if (date.getTime() <= Date.now()) {
      Alert.alert("Aviso", "Escolha uma data e hora no futuro.");
      return;
    }

    if (verificarHoraDescanso(date)) {
      Alert.alert(
        "Modo Descanso Ativo",
        `Este horário (${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}) está no seu período de descanso (${configuracoes.horaInicio} às ${configuracoes.horaFim}). Deseja agendar mesmo assim?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Agendar", onPress: processarAdicaoLembrete },
        ],
      );
    } else {
      processarAdicaoLembrete();
    }
  };

  const processarAdicaoLembrete = async () => {
    const dataFormatada = date.toLocaleDateString("pt-BR");
    const horaFormatada = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const notificationId = await agendarNotificacao(
      tituloInput,
      date,
      tipoInput,
    );

    const novoLembrete: Lembrete = {
      id: Date.now().toString(),
      titulo: tituloInput,
      data: dataFormatada,
      hora: horaFormatada,
      concluido: false,
      notificationId: notificationId || null,
      tipo: tipoInput,
    };

    const novaLista = [...lembretes, novoLembrete];
    setLembretes(novaLista);

    setTituloInput("");
    setTipoInput("dia a dia");
    setDate(new Date());
    setModalVisivel(false);

    try {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(firestore, "usuarios", user.uid);
      await setDoc(userRef, { lembretes: novaLista }, { merge: true });
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar no banco de dados.");
      carregarDados();
    }
  };

  const apagarLembrete = async (item: Lembrete) => {
    if (item.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(item.notificationId);
    }

    const novaLista = lembretes.filter((l) => l.id !== item.id);
    setLembretes(novaLista);

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, "usuarios", user.uid);
        await setDoc(userRef, { lembretes: novaLista }, { merge: true });
      }
    } catch (error) {
      console.log(error);
      carregarDados();
    }
  };

  const alternarConcluido = async (id: string) => {
    const novaLista = lembretes.map((item) =>
      item.id === id ? { ...item, concluido: !item.concluido } : item,
    );
    setLembretes(novaLista);

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, "usuarios", user.uid);
        await setDoc(userRef, { lembretes: novaLista }, { merge: true });
      }
    } catch (error) {
      console.log(error);
      carregarDados();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={isModoCompacto ? 22 : 26}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.titulo}>Lembretes</Text>
        <TouchableOpacity
          onPress={() => setModalVisivel(true)}
          style={styles.iconBtn}
        >
          <MaterialCommunityIcons
            name="plus"
            size={isModoCompacto ? 24 : 28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={lembretesOrdenados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.textoVazio}>
            Nenhum lembrete. Toque no + para criar!
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              item.concluido && styles.cardConcluido,
              item.tipo === "importante" &&
                !item.concluido &&
                styles.cardImportante,
            ]}
          >
            <TouchableOpacity
              onPress={() => alternarConcluido(item.id)}
              style={styles.checkboxArea}
            >
              <MaterialCommunityIcons
                name={
                  item.concluido
                    ? "checkbox-marked-circle"
                    : "checkbox-blank-circle-outline"
                }
                size={26}
                color={
                  item.concluido ? "#4cb80df3" : theme.colors.gestantesPrimary
                }
              />
            </TouchableOpacity>

            <View style={styles.infoArea}>
              <View style={styles.tituloRow}>
                <Text
                  style={[
                    styles.cardTitulo,
                    item.concluido && styles.textoRiscado,
                    item.tipo === "importante" &&
                      !item.concluido && { color: "#8D3E67" },
                  ]}
                >
                  {item.titulo}
                </Text>
                {item.tipo === "importante" && !item.concluido && (
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={16}
                    color="#E11D48"
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
              <Text style={styles.cardDataHora}>
                <MaterialCommunityIcons name="calendar-clock" size={14} />{" "}
                {item.data} às {item.hora}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => apagarLembrete(item)}
              style={styles.deleteBtn}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color="#FF4D4D"
              />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal animationType="slide" transparent visible={modalVisivel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Novo Lembrete</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={26}
                  color="#91486F"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>O que lembrar?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Exercitar ou tomar Vitamina"
              placeholderTextColor="#A2748B"
              value={tituloInput}
              onChangeText={setTituloInput}
            />

            <Text style={styles.inputLabel}>Tipo de Lembrete</Text>
            <View style={styles.rowTipos}>
              <TouchableOpacity
                style={[
                  styles.btnTipo,
                  tipoInput === "dia a dia" && styles.btnTipoAtivo,
                ]}
                onPress={() => setTipoInput("dia a dia")}
              >
                <Text
                  style={[
                    styles.btnTipoTexto,
                    tipoInput === "dia a dia" && styles.btnTipoTextoAtivo,
                  ]}
                >
                  Dia a dia
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnTipo,
                  tipoInput === "importante" && styles.btnTipoImportanteAtivo,
                ]}
                onPress={() => setTipoInput("importante")}
              >
                <Text
                  style={[
                    styles.btnTipoTexto,
                    tipoInput === "importante" && styles.btnTipoTextoAtivo,
                  ]}
                >
                  Importante
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Quando?</Text>
            <View style={styles.rowInputs}>
              <TouchableOpacity
                style={styles.seletorBotao}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#8D3E67"
                />
                <Text style={styles.seletorTexto}>
                  {date.toLocaleDateString("pt-BR")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.seletorBotao}
                onPress={() => setShowTimePicker(true)}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#8D3E67"
                />
                <Text style={styles.seletorTexto}>
                  {date.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const novaData = new Date(date);
                    novaData.setFullYear(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                    );
                    setDate(novaData);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                is24Hour
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    const novaData = new Date(date);
                    novaData.setHours(
                      selectedTime.getHours(),
                      selectedTime.getMinutes(),
                    );
                    setDate(novaData);
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={styles.botaoSalvar}
              onPress={tentarAdicionarLembrete}
            >
              <Text style={styles.botaoTexto}>ADICIONAR</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      height: isModoCompacto ? 70 : 92,
      paddingTop: isModoCompacto ? 20 : 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      backgroundColor: theme.colors.gestantesPrimary,
      shadowColor: "#8E3D68",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    iconBtn: {
      width: isModoCompacto ? 34 : 40,
      height: isModoCompacto ? 34 : 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.20)",
      alignItems: "center",
      justifyContent: "center",
    },
    titulo: {
      fontSize: isModoCompacto ? theme.texts.subtitle : theme.texts.title,
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },
    listaContent: {
      padding: isModoCompacto ? 16 : 22,
      paddingBottom: 40,
    },
    textoVazio: {
      fontSize: theme.texts.text,
      color: "#A2748B",
      textAlign: "center",
      marginTop: 45,
      lineHeight: 22,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF9FC",
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowColor: "#A64D78",
      shadowOpacity: 0.05,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardImportante: {
      borderColor: "#FCA5A5",
      backgroundColor: "#FEF2F2",
    },
    cardConcluido: {
      opacity: 0.65,
      backgroundColor: "#F7DDE9",
      borderColor: "#EBC5D6",
    },
    checkboxArea: {
      paddingRight: 12,
    },
    infoArea: {
      flex: 1,
      justifyContent: "center",
    },
    tituloRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    cardTitulo: {
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#8D3E67",
    },
    textoRiscado: {
      textDecorationLine: "line-through",
      color: "#B18A9D",
    },
    cardDataHora: {
      fontSize: theme.texts.text,
      color: "#9C7388",
      lineHeight: 20,
    },
    deleteBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "#FFF3F7",
      alignItems: "center",
      justifyContent: "center",
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
      paddingTop: 26,
      paddingHorizontal: 24,
      paddingBottom: isModoCompacto ? 20 : 40,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitulo: {
      fontSize: theme.texts.title,
      fontWeight: "700",
      color: "#91486F",
    },
    inputLabel: {
      fontSize: theme.texts.subtitle,
      color: "#91486F",
      fontWeight: "700",
      marginBottom: 8,
    },
    input: {
      backgroundColor: "#FDEAF2",
      borderWidth: 1,
      borderColor: "#F5D3E3",
      borderRadius: 16,
      padding: 14,
      fontSize: theme.texts.text,
      color: "#8D3E67",
      marginBottom: 20,
    },
    rowTipos: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },
    btnTipo: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#E7BDD0",
      alignItems: "center",
      backgroundColor: "#FDEAF2",
    },
    btnTipoAtivo: {
      backgroundColor: theme.colors.gestantesPrimary,
      borderColor: theme.colors.gestantesPrimary,
    },
    btnTipoImportanteAtivo: {
      backgroundColor: "#E11D48",
      borderColor: "#E11D48",
    },
    btnTipoTexto: {
      fontSize: theme.texts.text,
      color: "#9C7388",
      fontWeight: "600",
    },
    btnTipoTextoAtivo: {
      color: "#FFF",
    },
    rowInputs: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
      marginBottom: 28,
    },
    seletorBotao: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FDEAF2",
      borderWidth: 1,
      borderColor: "#F5D3E3",
      paddingVertical: 15,
      borderRadius: 16,
      gap: 10,
    },
    seletorTexto: {
      fontSize: theme.texts.text,
      color: "#8D3E67",
      fontWeight: "700",
    },
    botaoSalvar: {
      backgroundColor: theme.colors.gestantesPrimary,
      paddingVertical: 16,
      borderRadius: 28,
      alignItems: "center",
      shadowColor: "#A64D78",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    botaoTexto: {
      color: theme.colors.text,
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
  });
