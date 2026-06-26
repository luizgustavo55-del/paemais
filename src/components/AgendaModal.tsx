import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";

import { auth, firestore } from "@/src/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import * as Notifications from "expo-notifications";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Evento = {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  data: number; // timestamp ms
  notificationId?: string;
  _tipo: "evento";
};

type Lembrete = {
  id: string;
  titulo?: string;
  nome?: string;        // alguns lembretes podem usar "nome"
  descricao?: string;
  data: number;
  hora?: string;        // ex: "08:00" caso venha separado
  _tipo: "lembrete";
};

type Item = Evento | Lembrete;

// ─── Utilitários ──────────────────────────────────────────────────────────────

const CATEGORIAS = ["Geral", "Consulta", "Vacinação", "Exame"];

const COR_CATEGORIA: Record<string, string> = {
  Geral: "#7050b3",
  Consulta: "#0891b2",
  Vacinação: "#16a34a",
  Exame: "#d97706",
};

function dateToKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatHora(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function keyToDate(dateStr: string) {
  const [y, m, day] = dateStr.split("-").map(Number);
  return { y, m, day };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AgendaModal({ onClose }: { onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [showCategorias, setShowCategorias] = useState(false);
  const [modoAdicionar, setModoAdicionar] = useState(false);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(auth.currentUser?.uid ?? null);

  // Reagir a mudanças de autenticação
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserId(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // ── Snapshot: Eventos ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;
    const ref = collection(firestore, "usuarios", userId, "eventos");
    return onSnapshot(ref, (snap) => {
      setEventos(
        snap.docs.map((d) => ({ id: d.id, _tipo: "evento", ...d.data() } as Evento))
      );
    });
  }, [userId]);

  // ── Snapshot: Lembretes ───────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;
    const ref = collection(firestore, "usuarios", userId, "lembretes");
    return onSnapshot(ref, (snap) => {
      setLembretes(
        snap.docs.map((d) => {
          const data = d.data();
          // Normaliza timestamp: aceita campo "data" (ms), "dataHora" ou constrói a partir de "data"+"hora"
          let ts: number = data.data;
          if (!ts && data.dataHora) ts = new Date(data.dataHora).getTime();
          if (!ts && data.hora) {
            // "hora" como "HH:mm" + "data" como "YYYY-MM-DD"
            const [h, min] = (data.hora as string).split(":").map(Number);
            const base = data.data ? new Date(data.data) : new Date();
            base.setHours(h, min, 0, 0);
            ts = base.getTime();
          }
          return { id: d.id, _tipo: "lembrete", ...data, data: ts } as Lembrete;
        })
      );
    });
  }, [userId]);

  // ── Marked dates ──────────────────────────────────────────────────────────

  const marked: Record<string, any> = {};

  [...eventos, ...lembretes].forEach((item) => {
    if (!item.data) return;
    const key = dateToKey(item.data);
    marked[key] = {
      marked: true,
      dotColor: item._tipo === "lembrete" ? "#e11d48" : "#7050b3",
    };
  });

  // Se há lembretes E eventos no mesmo dia, mostra dois dots (react-native-calendars >= 1.1296)
  const multiDot: Record<string, any> = {};
  [...eventos, ...lembretes].forEach((item) => {
    if (!item.data) return;
    const key = dateToKey(item.data);
    if (!multiDot[key]) multiDot[key] = { dots: [] };
    const already = multiDot[key].dots.find(
      (d: any) => d.key === item._tipo
    );
    if (!already) {
      multiDot[key].dots.push({
        key: item._tipo,
        color: item._tipo === "lembrete" ? "#e11d48" : "#7050b3",
      });
    }
  });

  if (selectedDate) {
    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: "#28174c",
    };
  }

  // ── Itens do dia selecionado ──────────────────────────────────────────────

  const itensDoDia: Item[] = [...eventos, ...lembretes]
    .filter((i) => i.data && dateToKey(i.data) === selectedDate)
    .sort((a, b) => a.data - b.data);

  // ── Lógica de salvar ─────────────────────────────────────────────────────

  function juntarDataHora(): number {
    if (!selectedDate) return Date.now();
    const { y, m, day } = keyToDate(selectedDate);
    const d = new Date();
    d.setFullYear(y, m - 1, day);
    d.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return d.getTime();
  }

  async function agendarNotificacao(tit: string, ts: number): Promise<string | null> {
    if (ts <= Date.now()) return null;
    return Notifications.scheduleNotificationAsync({
      content: { title: "📅 Evento", body: tit },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(ts),
      },
    });
  }

  async function cancelarNotificacao(notificationId?: string) {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
    }
  }

  async function salvarEvento() {
    if (!titulo.trim() || !selectedDate || !userId) {
      Alert.alert("Atenção", "Preencha o título e selecione uma data.");
      return;
    }

    const ts = juntarDataHora();
    const notificationId = await agendarNotificacao(titulo, ts) ?? undefined;

    try {
      if (editandoId) {
        const ref = doc(firestore, "usuarios", userId, "eventos", editandoId);
        await updateDoc(ref, { titulo, descricao, categoria, data: ts, notificationId });
        setEditandoId(null);
      } else {
        const ref = collection(firestore, "usuarios", userId, "eventos");
        await addDoc(ref, { titulo, descricao, categoria, data: ts, notificationId });
      }
      resetForm();
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível salvar o evento.");
    }
  }

  async function excluirEvento(ev: Evento) {
    if (!userId) return;
    await cancelarNotificacao(ev.notificationId);
    await deleteDoc(doc(firestore, "usuarios", userId, "eventos", ev.id)).catch(console.error);
  }

  function editarEvento(ev: Evento) {
    const d = new Date(ev.data);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    setTitulo(ev.titulo);
    setDescricao(ev.descricao || "");
    setCategoria(ev.categoria || "Geral");
    setSelectedDate(`${y}-${mo}-${day}`);
    setTime(d);
    setEditandoId(ev.id);
    setModoAdicionar(true);
  }

  function resetForm() {
    setTitulo("");
    setDescricao("");
    setCategoria("Geral");
    setTime(new Date());
    setModoAdicionar(false);
    setEditandoId(null);
    setShowCategorias(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.pill} />
          <Text style={styles.headerTitle}>Agenda</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#28174c" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Calendário */}
          <Calendar
            onDayPress={(d) => {
              setSelectedDate(d.dateString);
              setModoAdicionar(false);
              setEditandoId(null);
            }}
            markedDates={marked}
            markingType="multi-dot"
            theme={{
              todayTextColor: "#7050b3",
              selectedDayBackgroundColor: "#28174c",
              arrowColor: "#7050b3",
              dotColor: "#7050b3",
              textDayFontSize: 14,
            }}
          />

          {selectedDate !== "" && (
            <>
              {/* Título da seção */}
              <View style={styles.sectionRow}>
                <Text style={styles.section}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itensDoDia.length}</Text>
                </View>
              </View>

              {/* Lista de itens */}
              {itensDoDia.length === 0 && (
                <View style={styles.emptyBox}>
                  <Ionicons name="calendar-outline" size={32} color="#c4b5e8" />
                  <Text style={styles.emptyText}>Nenhum evento ou lembrete neste dia.</Text>
                </View>
              )}

              {itensDoDia.map((item) => {
                const isLembrete = item._tipo === "lembrete";
                const tit = isLembrete
                  ? (item as Lembrete).titulo || (item as Lembrete).nome || "Lembrete"
                  : (item as Evento).titulo;
                const desc = item.descricao || "";
                const hora = item.data ? formatHora(item.data) : "";

                return (
                  <View
                    key={item.id}
                    style={[styles.card, isLembrete && styles.cardLembrete]}
                  >
                    <View style={styles.cardLeft}>
                      <View
                        style={[
                          styles.cardIcon,
                          { backgroundColor: isLembrete ? "#fce7f3" : "#ede9fe" },
                        ]}
                      >
                        <Ionicons
                          name={isLembrete ? "notifications-outline" : "calendar-outline"}
                          size={16}
                          color={isLembrete ? "#e11d48" : "#7050b3"}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{tit}</Text>
                        {!!desc && <Text style={styles.cardDesc}>{desc}</Text>}
                        <View style={styles.cardMeta}>
                          {!!hora && (
                            <View style={styles.metaChip}>
                              <Ionicons name="time-outline" size={11} color="#888" />
                              <Text style={styles.metaText}>{hora}</Text>
                            </View>
                          )}
                          {!isLembrete && (
                            <View
                              style={[
                                styles.metaChip,
                                {
                                  backgroundColor:
                                    COR_CATEGORIA[(item as Evento).categoria] + "22",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.categoryText,
                                  {
                                    color:
                                      COR_CATEGORIA[(item as Evento).categoria] ||
                                      "#7050b3",
                                  },
                                ]}
                              >
                                {(item as Evento).categoria}
                              </Text>
                            </View>
                          )}
                          {isLembrete && (
                            <View style={[styles.metaChip, { backgroundColor: "#fce7f3" }]}>
                              <Text style={[styles.categoryText, { color: "#e11d48" }]}>
                                Lembrete
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Ações apenas para eventos */}
                    {!isLembrete && (
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          onPress={() => editarEvento(item as Evento)}
                          style={styles.actionBtn}
                        >
                          <Ionicons name="create-outline" size={18} color="#7050b3" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert("Excluir", "Deseja excluir este evento?", [
                              { text: "Cancelar", style: "cancel" },
                              {
                                text: "Excluir",
                                style: "destructive",
                                onPress: () => excluirEvento(item as Evento),
                              },
                            ])
                          }
                          style={styles.actionBtn}
                        >
                          <Ionicons name="trash-outline" size={18} color="#e11d48" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Botão adicionar */}
              {!modoAdicionar && (
                <TouchableOpacity
                  style={styles.addFloating}
                  onPress={() => setModoAdicionar(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={22} color="#fff" />
                  <Text style={styles.addFloatingText}>Novo evento</Text>
                </TouchableOpacity>
              )}

              {/* Formulário */}
              {modoAdicionar && (
                <View style={styles.form}>
                  <Text style={styles.formTitle}>
                    {editandoId ? "Editar evento" : "Novo evento"}
                  </Text>

                  {/* Hora */}
                  <Text style={styles.label}>Horário</Text>
                  <TouchableOpacity
                    style={styles.timeRow}
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="time-outline" size={18} color="#7050b3" />
                    <Text style={styles.timeText}>
                      {time.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text style={styles.tapText}>Toque para alterar</Text>
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      value={time}
                      mode="time"
                      is24Hour
                      onChange={(_e, s) => {
                        setShowTimePicker(false);
                        if (s) setTime(s);
                      }}
                    />
                  )}

                  {/* Título */}
                  <Text style={styles.label}>Título *</Text>
                  <TextInput
                    placeholder="Ex: Consulta com o veterinário"
                    placeholderTextColor="#bbb"
                    style={styles.input}
                    value={titulo}
                    onChangeText={setTitulo}
                    returnKeyType="next"
                  />

                  {/* Descrição */}
                  <Text style={styles.label}>Descrição</Text>
                  <TextInput
                    placeholder="Detalhes opcionais…"
                    placeholderTextColor="#bbb"
                    style={[styles.input, styles.inputMulti]}
                    value={descricao}
                    onChangeText={setDescricao}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  {/* Categoria */}
                  <Text style={styles.label}>Categoria</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.inputSelect]}
                    onPress={() => setShowCategorias(!showCategorias)}
                  >
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: COR_CATEGORIA[categoria] || "#7050b3" },
                      ]}
                    />
                    <Text style={{ color: "#28174c", flex: 1 }}>{categoria}</Text>
                    <Ionicons
                      name={showCategorias ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#888"
                    />
                  </TouchableOpacity>

                  {showCategorias && (
                    <View style={styles.dropdown}>
                      {CATEGORIAS.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCategoria(cat);
                            setShowCategorias(false);
                          }}
                        >
                          <View
                            style={[
                              styles.catDot,
                              { backgroundColor: COR_CATEGORIA[cat] || "#7050b3" },
                            ]}
                          />
                          <Text
                            style={[
                              styles.dropdownText,
                              cat === categoria && { fontWeight: "bold", color: "#28174c" },
                            ]}
                          >
                            {cat}
                          </Text>
                          {cat === categoria && (
                            <Ionicons name="checkmark" size={16} color="#7050b3" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Pré-visualização */}
                  {(titulo || descricao) && (
                    <>
                      <Text style={[styles.label, { marginTop: 10 }]}>Pré-visualização</Text>
                      <View style={[styles.card, { marginBottom: 4 }]}>
                        <View style={styles.cardLeft}>
                          <View style={[styles.cardIcon, { backgroundColor: "#ede9fe" }]}>
                            <Ionicons name="calendar-outline" size={16} color="#7050b3" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{titulo || "Título do evento"}</Text>
                            {!!descricao && (
                              <Text style={styles.cardDesc}>{descricao}</Text>
                            )}
                            <View style={styles.cardMeta}>
                              <View style={styles.metaChip}>
                                <Ionicons name="time-outline" size={11} color="#888" />
                                <Text style={styles.metaText}>
                                  {time.toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.metaChip,
                                  { backgroundColor: (COR_CATEGORIA[categoria] || "#7050b3") + "22" },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.categoryText,
                                    { color: COR_CATEGORIA[categoria] || "#7050b3" },
                                  ]}
                                >
                                  {categoria}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </>
                  )}

                  {/* Botões */}
                  <View style={styles.formActions}>
                    <TouchableOpacity style={styles.btnCancel} onPress={resetForm}>
                      <Text style={styles.btnCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSave} onPress={salvarEvento}>
                      <Ionicons
                        name={editandoId ? "checkmark-circle-outline" : "add-circle-outline"}
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.btnSaveText}>
                        {editandoId ? "Atualizar" : "Adicionar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={{ height: 40 }} />
            </>
          )}

          {selectedDate === "" && (
            <View style={styles.emptyBox}>
              <Ionicons name="hand-left-outline" size={32} color="#c4b5e8" />
              <Text style={styles.emptyText}>Selecione um dia no calendário.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  backdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    marginTop: "auto",
    height: "92%",
    backgroundColor: "#faf9ff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ede9fe",
    backgroundColor: "#fff",
  },
  pill: {
    position: "absolute",
    top: 6,
    alignSelf: "center",
    left: "50%",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d4c8f0",
    transform: [{ translateX: -18 }],
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#28174c",
    textAlign: "center",
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 16,
  },

  // Seção
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    gap: 8,
  },
  section: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#28174c",
    textTransform: "capitalize",
  },
  badge: {
    backgroundColor: "#7050b3",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: "#28174c",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLembrete: {
    borderLeftWidth: 3,
    borderLeftColor: "#e11d48",
  },
  cardLeft: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#28174c",
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f3f0fa",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 11,
    color: "#666",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f5f3ff",
  },

  // Botão adicionar
  addFloating: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7050b3",
    padding: 14,
    borderRadius: 14,
    marginVertical: 12,
  },
  addFloatingText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // Formulário
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#28174c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#28174c",
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7050b3",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#d4c8f0",
    backgroundColor: "#faf9ff",
    padding: 11,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
    color: "#28174c",
  },
  inputMulti: {
    minHeight: 72,
  },
  inputSelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#d4c8f0",
    backgroundColor: "#faf9ff",
    padding: 11,
    borderRadius: 12,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#28174c",
  },
  tapText: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#aaa",
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#d4c8f0",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0ecff",
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
  },

  // Botões do form
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  btnCancel: {
    flex: 1,
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d4c8f0",
  },
  btnCancelText: {
    color: "#28174c",
    fontWeight: "600",
    fontSize: 14,
  },
  btnSave: {
    flex: 2,
    flexDirection: "row",
    gap: 6,
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7050b3",
  },
  btnSaveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // Empty state
  emptyBox: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },
});