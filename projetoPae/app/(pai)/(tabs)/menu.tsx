import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ref, onValue, push, remove, update } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";

import AgendaModal from "@/src/components/AgendaModal";

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [reminders, setReminders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);

  const [userName, setUserName] = useState("Usuário");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser?.uid) return;

      const userRef = ref(db, `usuarios/${currentUser.uid}/nome`);

      onValue(userRef, (snapshot) => {
        const nome = snapshot.val();
        setUserName(nome || "Usuário");
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser?.email) return;

      const path = currentUser.email.replace(/[.#$[\]]/g, "_");
      const refUser = ref(db, `lembretes/${path}`);

      onValue(refUser, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setReminders([]);
          return;
        }

        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        list.sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setReminders(list);
      });
    });

    return () => unsubscribe();
  }, []);

  function mergeDateTime() {
    const final = new Date(date);
    final.setHours(time.getHours());
    final.setMinutes(time.getMinutes());
    return final;
  }

  async function scheduleNotification(title: string, finalDate: Date) {
    if (finalDate <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Lembrete",
        body: title,
      },
      trigger: {
        seconds: Math.max(
          1,
          (finalDate.getTime() - Date.now()) / 1000
        ),
      },
    });
  }

  async function saveReminder() {
    const currentUser = auth.currentUser;
    if (!title || !currentUser?.email) return;

    const path = currentUser.email.replace(/[.#$[\]]/g, "_");
    const finalDate = mergeDateTime();

    const data = {
      title,
      description,
      date: finalDate.toISOString(),
    };

    if (editingId) {
      await update(ref(db, `lembretes/${path}/${editingId}`), data);
    } else {
      await push(ref(db, `lembretes/${path}`), data);
      await scheduleNotification(title, finalDate);
    }

    // ✅ LIMPAR CAMPOS
    setTitle("");
    setDescription("");
    setDate(new Date());
    setTime(new Date());

    // ✅ RESET E FECHAR
    setEditingId(null);
    setShowForm(false);
  }

  async function deleteReminder(id: string) {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) return;

    const path = currentUser.email.replace(/[.#$[\]]/g, "_");
    await remove(ref(db, `lembretes/${path}/${id}`));
  }

  function editReminder(item: any) {
    const d = new Date(item.date);

    setTitle(item.title);
    setDescription(item.description || "");
    setDate(d);
    setTime(d);
    setEditingId(item.id);
    setShowForm(true);
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.topHeader}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Ionicons name="person-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </View>

          <Text style={styles.hello}>Olá,</Text>
          <Text style={styles.name}>{userName}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.cardList}>
            <TouchableOpacity style={styles.mainCard} onPress={() => setShowAgenda(true)}>
              <View style={styles.iconPink}>
                <Ionicons name="calendar-outline" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Agenda</Text>
                <Text style={styles.cardSubtitle}>Compromissos e consultas</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainCard} onPress={() => router.push("/MenuPage/saude")}>
              <View style={styles.iconRed}>
                <Ionicons name="heart-outline" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Saúde</Text>
                <Text style={styles.cardSubtitle}>Acompanhamento médico</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainCard} onPress={() => router.push("/MenuPage/desenvolvimento")}>
              <View style={styles.iconPurple}>
                <Ionicons name="trending-up-outline" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Desenvolvimento</Text>
                <Text style={styles.cardSubtitle}>Crescimento do bebê</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.reminderBox}>
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderTitle}>Lembretes</Text>

              <TouchableOpacity onPress={() => setShowForm(!showForm)}>
                <Text style={styles.add}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            {showForm && (
              <View style={styles.inputBox}>
                <View style={styles.row}>
                  <TextInput
                    style={styles.halfInput}
                    value={date.toLocaleDateString("pt-BR")}
                    onChangeText={(text) => {
                      const d = new Date(text);
                      if (!isNaN(d.getTime())) setDate(d);
                    }}
                  />
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={22} color="#e91e63" />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    onChange={(e, selected) => {
                      setShowDatePicker(false);
                      if (selected) setDate(selected);
                    }}
                  />
                )}

                <View style={styles.row}>
                  <TextInput
                    style={styles.halfInput}
                    value={time.toLocaleTimeString("pt-BR").slice(0, 5)}
                    onChangeText={(text) => {
                      const [h, m] = text.split(":");
                      if (h && m) {
                        const t = new Date(time);
                        t.setHours(Number(h));
                        t.setMinutes(Number(m));
                        setTime(t);
                      }
                    }}
                  />
                  <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                    <Ionicons name="time-outline" size={22} color="#e91e63" />
                  </TouchableOpacity>
                </View>

                {showTimePicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour
                    onChange={(e, selected) => {
                      setShowTimePicker(false);
                      if (selected) setTime(selected);
                    }}
                  />
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Título"
                  value={title}
                  onChangeText={setTitle}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Descrição"
                  value={description}
                  onChangeText={setDescription}
                />

                <TouchableOpacity style={styles.addButton} onPress={saveReminder}>
                  <Text style={styles.addButtonText}>
                    {editingId ? "Atualizar" : "Salvar"}
                  </Text>
                </TouchableOpacity>

                {/* ✅ BOTÃO CANCELAR */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setTitle("");
                    setDescription("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}

            {reminders.length === 0 ? (
              <Text style={styles.empty}>nenhum lembrete adicionado</Text>
            ) : (
              reminders.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.reminderItem}>
                  <Ionicons name="time-outline" size={18} color="#4CAF50" />

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.reminderText}>{item.title}</Text>
                    <Text style={styles.reminderTime}>
                      {new Date(item.date).toLocaleString("pt-BR")}
                    </Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => editReminder(item)}>
                      <Ionicons name="pencil-outline" size={18} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => deleteReminder(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {showAgenda && (
        <AgendaModal onClose={() => setShowAgenda(false)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ba11f2" },

  topHeader: {
    backgroundColor: "#c837f9",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  hello: { color: "#fff", fontSize: 16 },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },

  content: { padding: 16, marginTop: -20 },

  cardList: { marginBottom: 20 },

  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },

  iconPink: { backgroundColor: "#ff6b9d", padding: 10, borderRadius: 10, marginRight: 10 },
  iconRed: { backgroundColor: "#ff4d6d", padding: 10, borderRadius: 10, marginRight: 10 },
  iconPurple: { backgroundColor: "#9b5de5", padding: 10, borderRadius: 10, marginRight: 10 },

  cardTitle: { fontWeight: "bold", fontSize: 15 },
  cardSubtitle: { fontSize: 12, color: "#777" },

  reminderBox: { backgroundColor: "#fff", borderRadius: 15, padding: 15 },

  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  reminderTitle: { fontSize: 16, fontWeight: "bold" },
  add: { color: "#e91e63", fontWeight: "bold" },

  inputBox: { marginBottom: 10 },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },

  halfInput: {
    flex: 1,
    backgroundColor: "#f1f2f6",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },

  input: {
    backgroundColor: "#f1f2f6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  addButton: {
    backgroundColor: "#e91e63",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  addButtonText: { color: "#fff", fontWeight: "bold" },

  // ✅ NOVO STYLE
  cancelButton: {
    marginTop: 8,
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },

  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  reminderText: { fontSize: 14 },
  reminderTime: { fontSize: 12, color: "#666" },

  empty: { textAlign: "center", color: "#999" },

  actionsRow: { flexDirection: "row", gap: 10 },
});