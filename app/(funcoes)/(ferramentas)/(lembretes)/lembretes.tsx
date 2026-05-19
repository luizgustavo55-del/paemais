import { theme } from "@/src/constants/theme";
import { auth, firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
}

export default function Lembretes() {
  const router = useRouter();

  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tituloInput, setTituloInput] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      carregarLembretes();
    }, []),
  );

  const carregarLembretes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(firestore, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setLembretes(userSnap.data().lembretes || []);
      }
    } catch (error) {
      console.log(error);
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

  const agendarNotificacao = async (titulo: string, dataHora: Date) => {
    try {
      const idNotificacao = await Notifications.scheduleNotificationAsync({
        content: {
          title: "EI! Não se esqueca:",
          body: titulo,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dataHora,
          channelId: "lembretes-gestacao",
        },
      });
      return idNotificacao;
    } catch (error) {
      console.log("Erro ao agendar notificação:", error);
      return null;
    }
  };

  const adicionarLembrete = async () => {
    if (!tituloInput) {
      Alert.alert("Aviso", "Por favor, digite o que quer lembrar.");
      return;
    }

    if (date.getTime() <= Date.now()) {
      Alert.alert("Aviso", "Escolha uma data e hora no futuro.");
      return;
    }

    const dataFormatada = date.toLocaleDateString("pt-BR");
    const horaFormatada = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const notificationId = await agendarNotificacao(tituloInput, date);

    const novoLembrete: Lembrete = {
      id: Date.now().toString(),
      titulo: tituloInput,
      data: dataFormatada,
      hora: horaFormatada,
      concluido: false,
      notificationId: notificationId || null,
    };

    const novaLista = [...lembretes, novoLembrete];
    setLembretes(novaLista);
    setTituloInput("");
    setDate(new Date());
    setModalVisivel(false);

    try {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(firestore, "usuarios", user.uid);
      await setDoc(userRef, { lembretes: novaLista }, { merge: true });
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar.");
      carregarLembretes();
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
      carregarLembretes();
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
      carregarLembretes();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={theme.colors.title}
          />
        </TouchableOpacity>
        <Text style={styles.titulo}>Lembretes</Text>
        <TouchableOpacity
          onPress={() => setModalVisivel(true)}
          style={styles.iconBtn}
        >
          <MaterialCommunityIcons
            name="plus"
            size={28}
            color={theme.colors.title}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={lembretesOrdenados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <Text style={styles.textoVazio}>
            Nenhum lembrete. Toque no + para criar!
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, item.concluido && styles.cardConcluido]}>
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
                  item.concluido ? theme.colors.primary : theme.colors.title
                }
              />
            </TouchableOpacity>

            <View style={styles.infoArea}>
              <Text
                style={[
                  styles.cardTitulo,
                  item.concluido && styles.textoRiscado,
                ]}
              >
                {item.titulo}
              </Text>
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
                color={theme.colors.textPrimary}
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
                  color={theme.colors.title}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>O que lembrar?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Consulta ou tomar Vitamina"
              placeholderTextColor={theme.colors.subtitle}
              value={tituloInput}
              onChangeText={setTituloInput}
            />

            <View style={styles.rowInputs}>
              <TouchableOpacity
                style={styles.seletorBotao}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.colors.title}
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
                  color={theme.colors.title}
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
              onPress={adicionarLembrete}
            >
              <Text style={styles.botaoTexto}>ADICIONAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.terceary },
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
  listaContent: { padding: 20, paddingBottom: 40 },
  textoVazio: {
    fontSize: theme.texts.text,
    color: theme.colors.subtitle,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  cardConcluido: {
    opacity: 0.5,
    backgroundColor: theme.colors.quaternary,
    borderColor: "transparent",
  },
  checkboxArea: { paddingRight: 10 },
  infoArea: { flex: 1, justifyContent: "center" },
  cardTitulo: {
    fontSize: theme.texts.subtitle,
    fontWeight: "bold",
    color: theme.colors.title,
    marginBottom: 4,
  },
  textoRiscado: {
    textDecorationLine: "line-through",
    color: theme.colors.subtitle,
  },
  cardDataHora: { fontSize: theme.texts.text, color: theme.colors.subtitle },
  deleteBtn: { padding: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.terceary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitulo: {
    fontSize: theme.texts.title,
    fontWeight: "bold",
    color: theme.colors.title,
  },
  inputLabel: {
    fontSize: theme.texts.text,
    color: theme.colors.title,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 12,
    fontSize: theme.texts.text,
    color: theme.colors.title,
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 25,
  },
  seletorBotao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  seletorTexto: {
    fontSize: theme.texts.text,
    color: theme.colors.title,
    fontWeight: "bold",
  },
  botaoSalvar: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    elevation: 3,
  },
  botaoTexto: {
    color: theme.colors.texts,
    fontSize: theme.texts.text,
    fontWeight: "bold",
  },
});
