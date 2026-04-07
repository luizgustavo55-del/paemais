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
import { Ionicons } from "@expo/vector-icons";

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
  const [categoria, setCategoria] = useState("Geral");

  const [showCategorias, setShowCategorias] = useState(false);

  const categorias = ["Geral", "Consulta", "Vacinação", "Exame"];

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
    const [year, month, day] = selectedDate.split("-").map(Number);

    const d = new Date(year, month - 1, day);
    d.setHours(time.getHours());
    d.setMinutes(time.getMinutes());
    d.setSeconds(0);

    return d;
  }

  async function notificar(titulo: string, data: Date) {
    if (data <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Evento",
        body: titulo,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: data,
      },
    });

    return id;
  }

  async function adicionarEvento() {
    if (!titulo || !selectedDate || !user?.email) {
      Alert.alert("Preencha tudo");
      return;
    }

    const path = user.email.replace(/[.#$[\]]/g, "_");
    const dataFinal = juntarDataHora();

    let notificationId = await notificar(titulo, dataFinal);

    if (editandoId) {
      await update(ref(db, `eventos/${path}/${editandoId}`), {
        titulo,
        descricao,
        categoria,
        data: dataFinal.toISOString(),
        notificationId
      });

      setEditandoId(null);
    } else {
      await push(ref(db, `eventos/${path}`), {
        titulo,
        descricao,
        categoria,
        data: dataFinal.toISOString(),
        notificationId
      });
    }

    setTitulo("");
    setDescricao("");
    setCategoria("Geral");
  }

  function editarEvento(evento: any) {
    const d = new Date(evento.data);

    setTitulo(evento.titulo);
    setDescricao(evento.descricao || "");
    setCategoria(evento.categoria || "Geral");
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

  // 🔥 AQUI ESTÁ A CORREÇÃO PEDIDA (HISTÓRICO)
  const historico = eventos.filter((e) =>
    new Date(e.data) < new Date()
  );

  const marked: any = {};

  eventos.forEach((e) => {
    const d = e.data.split("T")[0];
    marked[d] = { marked: true, dotColor: "#7050b3" };
  });

  if (selectedDate) {
    marked[selectedDate] = {
      selected: true,
      selectedColor: "#28174c",
    };
  }

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      <View style={styles.container}>

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
                      <Text style={styles.title}>{e.titulo}</Text>
                      <Text>{e.descricao}</Text>
                      <Text style={styles.category}>{e.categoria}</Text>

                      <View style={styles.actions}>
                        <TouchableOpacity onPress={() => editarEvento(e)}>
                          <Ionicons name="create-outline" size={20} color="#7050b3" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => excluirEvento(e.id)}>
                          <Ionicons name="trash-outline" size={20} color="#e11d48" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  <View style={styles.timeRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={time.toLocaleTimeString("pt-BR").slice(0, 5)}
                    />

                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                      <Ionicons name="time-outline" size={22} color="#28174c" />
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

                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowCategorias(!showCategorias)}
                  >
                    <Text>{categoria}</Text>
                  </TouchableOpacity>

                  {showCategorias && (
                    <View style={styles.dropdown}>
                      {categorias.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => {
                            setCategoria(cat);
                            setShowCategorias(false);
                          }}
                        >
                          <Text style={styles.dropdownItem}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity style={styles.add} onPress={adicionarEvento}>
                    <Text style={{ color: "#fff" }}>
                      {editandoId ? "Atualizar" : "Salvar"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* 🔥 HISTÓRICO AGORA FUNCIONANDO */}
          {aba === "historico" && (
            <>
              <Text style={styles.section}>Eventos passados</Text>

              {historico.map((e) => (
                <View key={e.id} style={styles.card}>
                  <Text style={styles.title}>{e.titulo}</Text>
                  <Text>{e.descricao}</Text>
                  <Text style={styles.category}>{e.categoria}</Text>
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

  active: { color: "#28174c", fontWeight: "bold" },

  content: { padding: 15 },

  section: { fontWeight: "bold", marginVertical: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#b390d8",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  add: {
    backgroundColor: "#7050b3",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  card: {
    padding: 10,
    backgroundColor: "#f9f7ff",
    borderRadius: 10,
    marginBottom: 8,
  },

  title: {
    fontWeight: "bold",
    color: "#28174c",
  },

  category: {
    color: "#7050b3",
    fontSize: 12,
  },

  actions: {
    flexDirection: "row",
    marginTop: 5,
    gap: 15,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#b390d8",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },

  dropdown: {
    backgroundColor: "#7050d8",
    borderWidth: 1,
    borderColor: "#b390d8",
    borderRadius: 10,
    marginBottom: 10,
  },

  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});