import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert
} from "react-native";

import { useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ref, push, onValue, remove, update } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

import * as Notifications from "expo-notifications";

export default function AgendaModal({ onClose }: any) {

  const [aba, setAba] = useState<"agenda" | "historico">("agenda");

  const [selectedDate, setSelectedDate] = useState("");
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const [eventos, setEventos] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.email) return;

    const path = user.email.replace(/[.#$[\]]/g, "_");

    onValue(ref(db, `eventos/${path}`), (snap) => {
      const data = snap.val();
      if (!data) return;

      const lista = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));

      setEventos(lista);
    });
  }, []);

  function juntarDataHora() {
    const d = new Date(selectedDate);
    d.setHours(time.getHours());
    d.setMinutes(time.getMinutes());
    d.setSeconds(0);
    return d;
  }

  async function notificar(titulo: string, data: Date) {
    if (data <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📅 Evento",
        body: titulo,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: data,
      },
    });
  }

  async function adicionarEvento() {
    if (!titulo || !selectedDate || !user?.email) {
      Alert.alert("Preencha tudo");
      return;
    }

    const path = user.email.replace(/[.#$[\]]/g, "_");
    const dataFinal = juntarDataHora();

    if (editandoId) {
      await update(ref(db, `eventos/${path}/${editandoId}`), {
        titulo,
        descricao,
        data: dataFinal.toISOString(),
      });

      setEditandoId(null);
    } else {
      await push(ref(db, `eventos/${path}`), {
        titulo,
        descricao,
        data: dataFinal.toISOString(),
      });

      await notificar(titulo, dataFinal);
    }

    setTitulo("");
    setDescricao("");
  }

  function editarEvento(evento: any) {
    const d = new Date(evento.data);

    setTitulo(evento.titulo);
    setDescricao(evento.descricao || "");
    setSelectedDate(evento.data.split("T")[0]);
    setTime(d);
    setEditandoId(evento.id);
    setAba("agenda");
  }

  async function excluirEvento(id: string) {
    if (!user?.email) return;

    const path = user.email.replace(/[.#$[\]]/g, "_");

    await remove(ref(db, `eventos/${path}/${id}`));
  }

  const eventosDoDia = eventos.filter((e) =>
    e.data.startsWith(selectedDate)
  );

  const historico = eventos.filter((e) => {
    return new Date(e.data) < new Date();
  });

  const marked: any = {};

  eventos.forEach((e) => {
    const d = e.data.split("T")[0];
    marked[d] = { marked: true, dotColor: "#e91e63" };
  });

  if (selectedDate) {
    marked[selectedDate] = {
      selected: true,
      selectedColor: "#8b5cf6",
    };
  }

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      <View style={styles.container}>

        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setAba("agenda")}>
            <Text style={[styles.tab, aba === "agenda" && styles.active]}>
              Agenda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAba("historico")}>
            <Text style={[styles.tab, aba === "historico" && styles.active]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>

          {/* AGENDA */}
          {aba === "agenda" && (
            <>
              <Calendar
                onDayPress={(d) => setSelectedDate(d.dateString)}
                markedDates={marked}
              />

              {selectedDate !== "" && (
                <>
                  <Text style={styles.section}>Eventos do dia</Text>

                  {eventosDoDia.map((e) => (
                    <View key={e.id} style={styles.card}>
                      <Text style={{ fontWeight: "bold" }}>{e.titulo}</Text>
                      <Text>{e.descricao}</Text>

                      <View style={{ flexDirection: "row", marginTop: 5 }}>
                        <TouchableOpacity onPress={() => editarEvento(e)}>
                          <Text style={{ marginRight: 15 }}>✏️</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => excluirEvento(e.id)}>
                          <Text>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {/* HORA */}
                  <View style={styles.timeRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={time.toLocaleTimeString("pt-BR").slice(0, 5)}
                      onChangeText={(t) => {
                        const [h, m] = t.split(":");
                        if (h && m) {
                          const d = new Date(time);
                          d.setHours(Number(h));
                          d.setMinutes(Number(m));
                          setTime(d);
                        }
                      }}
                    />

                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                      <Text style={{ fontSize: 18 }}>🕒</Text>
                    </TouchableOpacity>
                  </View>

                  {showTimePicker && (
                    <DateTimePicker
                      value={time}
                      mode="time"
                      is24Hour
                      onChange={(e, s) => {
                        setShowTimePicker(false);
                        if (s) setTime(s);
                      }}
                    />
                  )}

                  <TextInput
                    placeholder="Título"
                    style={styles.input}
                    value={titulo}
                    onChangeText={setTitulo}
                  />

                  <TextInput
                    placeholder="Descrição"
                    style={styles.input}
                    value={descricao}
                    onChangeText={setDescricao}
                  />

                  <TouchableOpacity style={styles.add} onPress={adicionarEvento}>
                    <Text style={{ color: "#fff" }}>
                      {editandoId ? "Atualizar" : "Salvar"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* HISTÓRICO */}
          {aba === "historico" && (
            <>
              <Text style={styles.section}>Eventos passados</Text>

              {historico.map((e) => (
                <View key={e.id} style={styles.card}>
                  <Text style={{ fontWeight: "bold" }}>{e.titulo}</Text>
                  <Text>{e.descricao}</Text>

                  <View style={{ flexDirection: "row", marginTop: 5 }}>
                    <TouchableOpacity onPress={() => editarEvento(e)}>
                      <Text style={{ marginRight: 15 }}>✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => excluirEvento(e.id)}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", width: "100%", height: "100%" },

  backdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  container: {
    marginTop: "auto",
    height: "90%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
  },

  tab: { fontSize: 16, color: "#888" },

  active: { color: "#8b5cf6", fontWeight: "bold" },

  content: { padding: 15 },

  section: { fontWeight: "bold", marginVertical: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  add: {
    backgroundColor: "#8b5cf6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  card: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 8,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
});