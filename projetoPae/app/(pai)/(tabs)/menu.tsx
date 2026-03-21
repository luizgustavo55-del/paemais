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

// 🔥 Drawer
import { useNavigation } from "@react-navigation/native";

// 🔥 Firebase
import { ref, push, onValue, remove, update } from "firebase/database";
import { db, auth } from "@/src/services/firebase";

// 🔔 Notificações
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [reminders, setReminders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [editingId, setEditingId] = useState<string | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    if (!user || !user.email) return;

    const path = user.email.replace(/[.#$[\]]/g, "_");
    const refUser = ref(db, `lembretes/${path}`);

    const unsubscribe = onValue(refUser, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        list.sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setReminders(list);
      } else {
        setReminders([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

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
          Math.floor((finalDate.getTime() - Date.now()) / 1000)
        ),
      },
    });
  }

  function mergeDateAndTime() {
    const final = new Date(date);
    final.setHours(time.getHours());
    final.setMinutes(time.getMinutes());
    final.setSeconds(0);
    return final;
  }

  async function saveReminder() {
    if (!title || !user || !user.email) return;

    const path = user.email.replace(/[.#$[\]]/g, "_");
    const finalDate = mergeDateAndTime();

    const data = {
      title,
      description,
      date: finalDate.toISOString(),
      createdAt: Date.now(),
    };

    if (editingId) {
      await update(ref(db, `lembretes/${path}/${editingId}`), data);
    } else {
      await push(ref(db, `lembretes/${path}`), data);
      await scheduleNotification(title, finalDate);
    }

    setTitle("");
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  }

  async function deleteReminder(id: string) {
    if (!user || !user.email) return;

    const path = user.email.replace(/[.#$[\]]/g, "_");
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
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Como está o seu dia hoje?
        </Text>

        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* CARDS */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.card} onPress={() => router.push("/agenda")}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={26} color="#e91e63" />
          </View>
          <Text style={styles.label}>Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/saude")}>
          <View style={styles.iconBox}>
            <Ionicons name="heart-outline" size={26} color="#e91e63" />
          </View>
          <Text style={styles.label}>Saúde</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/desenvolvimento")}>
          <View style={styles.iconBox}>
            <Ionicons name="happy-outline" size={26} color="#e91e63" />
          </View>
          <Text style={styles.label}>Desenvolvimento</Text>
        </TouchableOpacity>
      </View>

      {/* HEADER LEMBRETES */}
      <View style={styles.reminderHeader}>
        <Text style={styles.sectionTitle}>Lembretes</Text>

        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Text style={styles.add}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* FORM */}
      {showForm && (
        <View style={styles.inputBox}>

          {/* DATA */}
          <View style={styles.row}>
            <TextInput
              style={styles.halfInput}
              value={date.toLocaleDateString("pt-BR")}
              onChangeText={(text) => {
                const parsed = new Date(text);
                if (!isNaN(parsed.getTime())) setDate(parsed);
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

          {/* HORA */}
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

        </View>
      )}

      {/* LISTA */}
      {reminders.map((item) => (
        <View key={item.id} style={styles.item}>
          <View>
            <Text style={styles.title}>{item.title}</Text>
            {item.description && (
              <Text style={styles.subtitle}>{item.description}</Text>
            )}
            <Text style={styles.subtitle}>
              {new Date(item.date).toLocaleString("pt-BR")}
            </Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={() => editReminder(item)} style={{ marginRight: 12 }}>
              <Ionicons name="pencil-outline" size={20} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteReminder(item.id)}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6f0",
    padding: 16,
  },

  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  card: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#ac384b",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  iconBox: {
    backgroundColor: "#ffc0cb",
    padding: 10,
    borderRadius: 12,
    marginBottom: 5,
  },

  label: {
    color: "#fff",
    fontWeight: "600",
  },

  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#380516",
  },

  add: {
    color: "#e91e63",
    fontWeight: "bold",
  },

  inputBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  halfInput: {
    flex: 1,
    backgroundColor: "#f1f2f6",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },

  input: {
    backgroundColor: "#f1f2f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: "#e91e63",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#666",
    fontSize: 13,
  },
});