import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, firestore } from "@/src/services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

import AgendaModal from "@/src/components/AgendaModal";

// ---------------------------------------------------------------------------
// Paleta de cores do app
// ---------------------------------------------------------------------------
const COLORS = {
  paisBackground: "#7050b3",
  paisPrimary: "#8b64de",
  paisSecondary: "#9b5de5",
  background: "#b390d8",
  primary: "#7b2cff",
  card: "#5407b8",
  textMenu: "#28174cca",
  white: "#ffffff",
  danger: "#ff4d6d",
  success: "#3ddc97",
};

type Filter = "todos" | "hoje" | "proximos" | "concluidos";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "hoje", label: "Hoje" },
  { key: "proximos", label: "Próximos" },
  { key: "concluidos", label: "Concluídos" },
];

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [reminders, setReminders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);

  const [userName, setUserName] = useState("Usuário");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [important, setImportant] = useState(false);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [filter, setFilter] = useState<Filter>("todos");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser?.uid) return;

      const userDocRef = doc(firestore, "usuarios", currentUser.uid);

      const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setUserName(dados.nome || "Usuário");
        } else {
          setUserName("Usuário");
        }
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser?.uid) return;

      const lembretesRef = collection(
        firestore,
        "usuarios",
        currentUser.uid,
        "lembretes",
      );

      const unsubscribeSnapshot = onSnapshot(lembretesRef, (querySnapshot) => {
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReminders(list);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  // -------------------------------------------------------------------------
  // Helpers de data
  // -------------------------------------------------------------------------
  function mergeDateTime() {
    const final = new Date(date);
    final.setHours(time.getHours());
    final.setMinutes(time.getMinutes());
    final.setSeconds(0);
    return final;
  }

  function formatReminderDate(value: string) {
    const d = new Date(value);
    const now = new Date();
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round(
      (target.getTime() - today.getTime()) / 86400000,
    );
    const time = d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffDays === 0) return `Hoje, ${time}`;
    if (diffDays === 1) return `Amanhã, ${time}`;
    if (diffDays === -1) return `Ontem, ${time}`;

    const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" });
    const dayMonth = d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    return `${weekday}, ${dayMonth} · ${time}`;
  }

  // -------------------------------------------------------------------------
  // Notificações
  // -------------------------------------------------------------------------
  async function scheduleNotification(
    notifTitle: string,
    finalDate: Date,
  ): Promise<string | null> {
    if (finalDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Lembrete",
        body: notifTitle,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: finalDate,
      },
    });

    return id;
  }

  async function cancelNotification(notificationId?: string | null) {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error(error);
    }
  }

  // -------------------------------------------------------------------------
  // CRUD de lembretes
  // -------------------------------------------------------------------------
  function resetForm() {
    setTitle("");
    setDescription("");
    setImportant(false);
    setDate(new Date());
    setTime(new Date());
    setEditingItem(null);
    setShowForm(false);
  }

  async function saveReminder() {
    const currentUser = auth.currentUser;

    if (!title.trim()) {
      Alert.alert("Atenção", "Digite um título para o lembrete.");
      return;
    }
    if (!currentUser?.uid) return;

    const finalDate = mergeDateTime();
    const isPast = finalDate <= new Date();

    try {
      if (editingItem) {
        // cancela a notificação antiga (se houver) antes de reagendar
        await cancelNotification(editingItem.notificationId);

        let notificationId: string | null = null;
        if (!isPast && !editingItem.completed) {
          notificationId = await scheduleNotification(title, finalDate);
        }

        const lembreteDocRef = doc(
          firestore,
          "usuarios",
          currentUser.uid,
          "lembretes",
          editingItem.id,
        );

        await updateDoc(lembreteDocRef, {
          title,
          description,
          important,
          date: finalDate.toISOString(),
          notificationId,
        });
      } else {
        const lembretesRef = collection(
          firestore,
          "usuarios",
          currentUser.uid,
          "lembretes",
        );

        const newDocRef = await addDoc(lembretesRef, {
          title,
          description,
          important,
          completed: false,
          date: finalDate.toISOString(),
          notificationId: null,
        });

        if (!isPast) {
          const notificationId = await scheduleNotification(title, finalDate);
          if (notificationId) {
            await updateDoc(newDocRef, { notificationId });
          }
        }
      }

      resetForm();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o lembrete.");
    }
  }

  function deleteReminder(item: any) {
    Alert.alert(
      "Excluir lembrete",
      `Deseja excluir "${item.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const currentUser = auth.currentUser;
            if (!currentUser?.uid) return;

            try {
              await cancelNotification(item.notificationId);

              const lembreteDocRef = doc(
                firestore,
                "usuarios",
                currentUser.uid,
                "lembretes",
                item.id,
              );
              await deleteDoc(lembreteDocRef);
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
    );
  }

  async function toggleComplete(item: any) {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) return;

    const newCompleted = !item.completed;
    let notificationId = item.notificationId ?? null;

    try {
      if (newCompleted) {
        // concluído: não precisa mais notificar
        await cancelNotification(notificationId);
        notificationId = null;
      } else {
        // reaberto: reagenda notificação se a data ainda estiver no futuro
        const itemDate = new Date(item.date);
        if (itemDate > new Date()) {
          notificationId = await scheduleNotification(item.title, itemDate);
        }
      }

      const lembreteDocRef = doc(
        firestore,
        "usuarios",
        currentUser.uid,
        "lembretes",
        item.id,
      );
      await updateDoc(lembreteDocRef, {
        completed: newCompleted,
        notificationId,
      });
    } catch (error) {
      console.error(error);
    }
  }

  function editReminder(item: any) {
    const d = new Date(item.date);

    setTitle(item.title);
    setDescription(item.description || "");
    setImportant(!!item.important);
    setDate(d);
    setTime(d);
    setEditingItem(item);
    setShowForm(true);
  }

  // -------------------------------------------------------------------------
  // Filtros e ordenação
  // -------------------------------------------------------------------------
  const filteredReminders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    let list = reminders;

    if (filter === "hoje") {
      list = reminders.filter(
        (r) => !r.completed && new Date(r.date).toDateString() === todayStr,
      );
    } else if (filter === "proximos") {
      list = reminders.filter(
        (r) =>
          !r.completed &&
          new Date(r.date) > now &&
          new Date(r.date).toDateString() !== todayStr,
      );
    } else if (filter === "concluidos") {
      list = reminders.filter((r) => r.completed);
    }

    return [...list].sort((a, b) => {
      if (!!a.completed !== !!b.completed) {
        return a.completed ? 1 : -1;
      }
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.completed ? -diff : diff;
    });
  }, [reminders, filter]);

  const pendingCount = useMemo(
    () => reminders.filter((r) => !r.completed).length,
    [reminders],
  );

  const visibleReminders = expanded
    ? filteredReminders
    : filteredReminders.slice(0, 3);

  function emptyMessage() {
    switch (filter) {
      case "hoje":
        return "nenhum lembrete para hoje";
      case "proximos":
        return "nenhum lembrete futuro";
      case "concluidos":
        return "nenhum lembrete concluído ainda";
      default:
        return "nenhum lembrete adicionado";
    }
  }

  const willNotify = mergeDateTime() > new Date();

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.topHeader}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Ionicons name="person-outline" size={24} color="#fff" />
            </TouchableOpacity>

   <TouchableOpacity
  activeOpacity={0.7}
  onPress={() => router.push("/notificacoes" as any)}
>
  <Ionicons name="notifications-outline" size={24} color="#fff" />
</TouchableOpacity>
          </View>

          <Text style={styles.hello}>Olá,</Text>
          <Text style={styles.name}>{userName}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.cardList}>
            <TouchableOpacity
              style={styles.mainCard}
              onPress={() => setShowAgenda(true)}
            >
              <View style={[styles.iconWrap, { backgroundColor: COLORS.paisSecondary }]}>
                <Ionicons name="calendar-outline" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Agenda</Text>
                <Text style={styles.cardSubtitle}>
                  Compromissos e consultas
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMenu} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainCard}
              onPress={() => router.push("/MenuPage/saude")}
            >
              <View style={[styles.iconWrap, { backgroundColor: COLORS.danger }]}>
                <Ionicons name="heart-outline" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Saúde</Text>
                <Text style={styles.cardSubtitle}>Acompanhamento médico</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMenu} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainCard}
              onPress={() => router.push("/MenuPage/desenvolvimento")}
            >
              <View style={[styles.iconWrap, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="trending-up-outline" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Desenvolvimento</Text>
                <Text style={styles.cardSubtitle}>Crescimento do bebé</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMenu} />
            </TouchableOpacity>
          </View>

          <View style={styles.reminderBox}>
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderTitle}>
                Lembretes
                {pendingCount > 0 ? ` · ${pendingCount}` : ""}
              </Text>

              <TouchableOpacity
                style={styles.addPill}
                onPress={() => {
                  if (showForm) {
                    resetForm();
                  } else {
                    setShowForm(true);
                  }
                }}
              >
                <Ionicons
                  name={showForm ? "close" : "add"}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.addPillText}>
                  {showForm ? "Fechar" : "Adicionar"}
                </Text>
              </TouchableOpacity>
            </View>

            {showForm && (
              <View style={styles.inputBox}>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.halfInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={styles.halfInputText}>
                      {date.toLocaleDateString("pt-BR")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.halfInput}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={styles.halfInputText}>
                      {time.toLocaleTimeString("pt-BR").slice(0, 5)}
                    </Text>
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

                {!willNotify && (
                  <Text style={styles.warningText}>
                     Essa data/hora já passou — nenhuma notificação será
                    enviada.
                  </Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Título"
                  placeholderTextColor="#9892a8"
                  value={title}
                  onChangeText={setTitle}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Descrição (opcional)"
                  placeholderTextColor="#9892a8"
                  value={description}
                  onChangeText={setDescription}
                />

                <TouchableOpacity
                  style={styles.importantRow}
                  onPress={() => setImportant(!important)}
                >
                  <Ionicons
                    name={important ? "star" : "star-outline"}
                    size={20}
                    color={important ? "#f5a623" : "#999"}
                  />
                  <Text style={styles.importantText}>
                    Marcar como importante
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={saveReminder}
                >
                  <Text style={styles.addButtonText}>
                    {editingItem ? "Atualizar" : "Salvar"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.filterRow}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.filterChip,
                      active && styles.filterChipActive,
                    ]}
                    onPress={() => {
                      setFilter(f.key);
                      setExpanded(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        active && styles.filterChipTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {filteredReminders.length === 0 ? (
              <Text style={styles.empty}>{emptyMessage()}</Text>
            ) : (
              <>
                {visibleReminders.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.reminderItem,
                      item.completed && styles.reminderItemDone,
                    ]}
                  >
                    <TouchableOpacity onPress={() => toggleComplete(item)}>
                      <Ionicons
                        name={
                          item.completed
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={22}
                        color={item.completed ? COLORS.success : COLORS.primary}
                      />
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={styles.reminderTitleRow}>
                        {item.important && !item.completed && (
                          <Ionicons
                            name="star"
                            size={13}
                            color="#f5a623"
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            styles.reminderText,
                            item.completed && styles.reminderTextDone,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <Text style={styles.reminderTime}>
                        {formatReminderDate(item.date)}
                      </Text>
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity onPress={() => editReminder(item)}>
                        <Ionicons
                          name="pencil-outline"
                          size={18}
                          color={COLORS.textMenu}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => deleteReminder(item)}>
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={COLORS.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {filteredReminders.length > 3 && (
                  <TouchableOpacity
                    style={styles.toggleExpand}
                    onPress={() => setExpanded(!expanded)}
                  >
                    <Text style={styles.toggleExpandText}>
                      {expanded
                        ? "Ver menos"
                        : `Ver todos (${filteredReminders.length})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {showAgenda && <AgendaModal onClose={() => setShowAgenda(false)} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paisBackground },

  topHeader: {
    backgroundColor: COLORS.paisPrimary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  hello: { color: "#fff", fontSize: 16, opacity: 0.85 },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },

  content: { padding: 16, marginTop: -20 },

  cardList: { marginBottom: 20 },

  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  iconWrap: {
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },

  cardTitle: { fontWeight: "bold", fontSize: 15, color: "#221a35" },
  cardSubtitle: { fontSize: 12, color: COLORS.textMenu },

  reminderBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },

  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  reminderTitle: { fontSize: 17, fontWeight: "bold", color: "#221a35" },

  addPill: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  addPillText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  inputBox: { marginBottom: 14 },

  row: { flexDirection: "row", gap: 10, marginBottom: 10 },

  halfInput: {
    flex: 1,
    backgroundColor: "rgba(123,44,255,0.08)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  halfInputText: { color: "#28174c", fontWeight: "500" },

  warningText: {
    color: "#b8860b",
    fontSize: 12,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "rgba(123,44,255,0.08)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    color: "#28174c",
  },

  importantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  importantText: { color: COLORS.textMenu, fontSize: 14 },

  addButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  addButtonText: { color: "#fff", fontWeight: "bold" },

  cancelButton: {
    marginTop: 8,
    backgroundColor: "rgba(40,23,76,0.08)",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelButtonText: {
    color: COLORS.textMenu,
    fontWeight: "bold",
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(123,44,255,0.08)",
  },

  filterChipActive: {
    backgroundColor: COLORS.card,
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMenu,
  },

  filterChipTextActive: {
    color: "#fff",
  },

  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(40,23,76,0.06)",
  },

  reminderItemDone: {
    opacity: 0.55,
  },

  reminderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  reminderText: { fontSize: 14, fontWeight: "500", color: "#221a35" },

  reminderTextDone: {
    textDecorationLine: "line-through",
  },

  reminderTime: { fontSize: 12, color: COLORS.textMenu, marginTop: 2 },

  empty: { textAlign: "center", color: "#999", paddingVertical: 10 },

  actionsRow: { flexDirection: "row", gap: 14 },

  toggleExpand: {
    alignItems: "center",
    paddingVertical: 10,
  },

  toggleExpandText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});