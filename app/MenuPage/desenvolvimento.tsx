import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LineChart } from "react-native-chart-kit";
import MaskInput from "react-native-mask-input";

import { auth, firestore } from "@/src/services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const screenWidth = Dimensions.get("window").width;

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AbaDesenvolvimento = "marcos" | "crescimento" | "diario";

type Filho = {
  id: string;
  nome?: string;
  dataNascimento?: string;
  sexo?: string;
  relacao?: string;
};

type Crescimento = {
  id: string;
  peso: number;
  altura: number;
  data: string;
  criadoEm?: string;
};

type Marco = {
  id: string;
  titulo: string;
  data: string;
  criadoEm?: string;
  atualizadoEm?: string;
};

type DiarioItem = {
  id: string;
  texto: string;
  data: string;
  criadoEm?: string;
};

// ─── Funções auxiliares ───────────────────────────────────────────────────────

function validarDataBR(valor: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return false;
  const [dia, mes, ano] = valor.split("/").map(Number);
  const d = new Date(ano, mes - 1, dia);
  return (
    d.getFullYear() === ano &&
    d.getMonth() === mes - 1 &&
    d.getDate() === dia &&
    d <= new Date()
  );
}

function normalizarNumero(valor: string): number {
  return parseFloat(valor.replace(",", "."));
}

function confirmarExclusao(mensagem: string, onConfirmar: () => void) {
  Alert.alert("Confirmar exclusão", mensagem, [
    { text: "Cancelar", style: "cancel" },
    { text: "Excluir", style: "destructive", onPress: onConfirmar },
  ]);
}

function ordenarDecrescente<T extends { criadoEm?: string; data?: string }>(
  lista: T[]
): T[] {
  return [...lista].sort((a, b) => {
    const fa = a.criadoEm ?? a.data ?? "";
    const fb = b.criadoEm ?? b.data ?? "";
    return fb.localeCompare(fa);
  });
}

// Referências Firestore
function refFilhos(uid: string) {
  return collection(firestore, "usuarios", uid, "filhos");
}
function refSubcol(uid: string, filhoId: string, sub: string) {
  return collection(firestore, "usuarios", uid, "filhos", filhoId, sub);
}
function refDocSub(uid: string, filhoId: string, sub: string, id: string) {
  return doc(firestore, "usuarios", uid, "filhos", filhoId, sub, id);
}

const MASK_DATA = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Desenvolvimento() {
  const router = useRouter();
  const userId = auth.currentUser?.uid ?? null;

  const [abaAtiva, setAbaAtiva] = useState<AbaDesenvolvimento>("marcos");

  const [filhos, setFilhos] = useState<Filho[]>([]);
  const [filhoSelecionado, setFilhoSelecionado] = useState<Filho | null>(null);
  const [carregandoFilhos, setCarregandoFilhos] = useState(true);
  const [abrirPicker, setAbrirPicker] = useState(false);

  // Marcos
  const [marcos, setMarcos] = useState<Marco[]>([]);
  const [carregandoMarcos, setCarregandoMarcos] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [dataMarco, setDataMarco] = useState("");
  const [editandoMarcoId, setEditandoMarcoId] = useState<string | null>(null);
  const [salvandoMarco, setSalvandoMarco] = useState(false);

  // Crescimento
  const [historico, setHistorico] = useState<Crescimento[]>([]);
  const [carregandoCrescimento, setCarregandoCrescimento] = useState(false);
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [dataCrescimento, setDataCrescimento] = useState("");
  const [salvandoCrescimento, setSalvandoCrescimento] = useState(false);

  // Diário
  const [diario, setDiario] = useState<DiarioItem[]>([]);
  const [carregandoDiario, setCarregandoDiario] = useState(false);
  const [textoDiario, setTextoDiario] = useState("");
  const [dataDiario, setDataDiario] = useState("");
  const [salvandoDiario, setSalvandoDiario] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // ── Filhos ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(refFilhos(userId), (snap) => {
      const lista: Filho[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Filho, "id">),
      }));
      setFilhos(lista);
      setCarregandoFilhos(false);

      if (lista.length === 1) {
        setFilhoSelecionado((prev) =>
          prev?.id === lista[0].id ? prev : lista[0]
        );
      }

      // Limpar seleção se filho foi removido
      setFilhoSelecionado((prev) => {
        if (!prev) return prev;
        return lista.find((f) => f.id === prev.id) ?? null;
      });
    });

    return () => unsub();
  }, [userId]);

  // ── Marcos ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId || !filhoSelecionado?.id) {
      setMarcos([]);
      return;
    }
    setCarregandoMarcos(true);

    const unsub = onSnapshot(
      refSubcol(userId, filhoSelecionado.id, "marcos"),
      (snap) => {
        const lista: Marco[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Marco, "id">),
        }));
        setMarcos(ordenarDecrescente(lista));
        setCarregandoMarcos(false);
      }
    );

    return () => unsub();
  }, [userId, filhoSelecionado?.id]);

  // ── Crescimento ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId || !filhoSelecionado?.id) {
      setHistorico([]);
      return;
    }
    setCarregandoCrescimento(true);

    const unsub = onSnapshot(
      refSubcol(userId, filhoSelecionado.id, "crescimento"),
      (snap) => {
        const lista: Crescimento[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            peso: typeof raw.peso === "number" ? raw.peso : parseFloat(raw.peso) || 0,
            altura: typeof raw.altura === "number" ? raw.altura : parseFloat(raw.altura) || 0,
            data: raw.data ?? "",
            criadoEm: raw.criadoEm ?? "",
          };
        });
        setHistorico(lista);
        setCarregandoCrescimento(false);
      }
    );

    return () => unsub();
  }, [userId, filhoSelecionado?.id]);

  // ── Diário ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId || !filhoSelecionado?.id) {
      setDiario([]);
      return;
    }
    setCarregandoDiario(true);

    const unsub = onSnapshot(
      refSubcol(userId, filhoSelecionado.id, "diario"),
      (snap) => {
        const lista: DiarioItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<DiarioItem, "id">),
        }));
        setDiario(ordenarDecrescente(lista));
        setCarregandoDiario(false);
      }
    );

    return () => unsub();
  }, [userId, filhoSelecionado?.id]);

  // ── Marcos: salvar ────────────────────────────────────────────────────────

  async function salvarMarco() {
    if (salvandoMarco) return;

    if (!titulo.trim()) {
      Alert.alert("Atenção", "Informe o título do marco.");
      return;
    }
    if (!validarDataBR(dataMarco)) {
      Alert.alert("Data inválida", "Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }
    if (!filhoSelecionado?.id || !userId) return;

    setSalvandoMarco(true);
    try {
      if (editandoMarcoId) {
        await updateDoc(
          refDocSub(userId, filhoSelecionado.id, "marcos", editandoMarcoId),
          { titulo: titulo.trim(), data: dataMarco, atualizadoEm: serverTimestamp() }
        );
      } else {
        await addDoc(refSubcol(userId, filhoSelecionado.id, "marcos"), {
          titulo: titulo.trim(),
          data: dataMarco,
          criadoEm: serverTimestamp(),
        });
      }
      limparFormularioMarco();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o marco.");
    } finally {
      setSalvandoMarco(false);
    }
  }

  function editarMarco(item: Marco) {
    setTitulo(item.titulo);
    setDataMarco(item.data);
    setEditandoMarcoId(item.id);
    setMostrarForm(true);
  }

  async function deletarMarco(id: string) {
    if (!userId || !filhoSelecionado?.id) return;
    confirmarExclusao("Deseja excluir este marco?", async () => {
      try {
        await deleteDoc(refDocSub(userId, filhoSelecionado!.id, "marcos", id));
      } catch {
        Alert.alert("Erro", "Não foi possível excluir o marco.");
      }
    });
  }

  function limparFormularioMarco() {
    setTitulo("");
    setDataMarco("");
    setEditandoMarcoId(null);
    setMostrarForm(false);
  }

  function cancelarMarco() {
    limparFormularioMarco();
  }

  // ── Crescimento: salvar ───────────────────────────────────────────────────

  async function salvarCrescimento() {
    if (salvandoCrescimento) return;

    if (!filhoSelecionado?.id || !userId) return;

    const pesoNum = normalizarNumero(peso);
    const alturaNum = normalizarNumero(altura);

    if (!peso.trim() || isNaN(pesoNum) || pesoNum <= 0) {
      Alert.alert("Peso inválido", "Informe um peso válido maior que zero.");
      return;
    }
    if (!altura.trim() || isNaN(alturaNum) || alturaNum <= 0) {
      Alert.alert("Altura inválida", "Informe uma altura válida maior que zero.");
      return;
    }
    if (!validarDataBR(dataCrescimento)) {
      Alert.alert("Data inválida", "Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }

    setSalvandoCrescimento(true);
    try {
      // Salva na subcoleção crescimento
      await addDoc(refSubcol(userId, filhoSelecionado.id, "crescimento"), {
        peso: pesoNum,
        altura: alturaNum,
        data: dataCrescimento,
        criadoEm: serverTimestamp(),
      });

      // Atualiza peso e altura diretamente no doc do filho
      await updateDoc(
        doc(firestore, "usuarios", userId, "filhos", filhoSelecionado.id),
        {
          peso: pesoNum,
          altura: alturaNum,
        }
      );

      limparFormularioCrescimento();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o crescimento.");
    } finally {
      setSalvandoCrescimento(false);
    }
  }

  async function deletarCrescimento(id: string) {
    if (!userId || !filhoSelecionado?.id) return;
    confirmarExclusao("Deseja excluir este registro?", async () => {
      try {
        await deleteDoc(refDocSub(userId, filhoSelecionado!.id, "crescimento", id));
      } catch {
        Alert.alert("Erro", "Não foi possível excluir o registro.");
      }
    });
  }

  function limparFormularioCrescimento() {
    setPeso("");
    setAltura("");
    setDataCrescimento("");
  }

  // ── Diário: salvar ────────────────────────────────────────────────────────

  async function salvarDiario() {
    if (salvandoDiario) return;

    if (!textoDiario.trim()) {
      Alert.alert("Atenção", "Escreva algo no diário.");
      return;
    }
    if (!validarDataBR(dataDiario)) {
      Alert.alert("Data inválida", "Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }
    if (!filhoSelecionado?.id || !userId) return;

    setSalvandoDiario(true);
    try {
      await addDoc(refSubcol(userId, filhoSelecionado.id, "diario"), {
        texto: textoDiario.trim(),
        data: dataDiario,
        criadoEm: serverTimestamp(),
      });
      limparFormularioDiario();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o diário.");
    } finally {
      setSalvandoDiario(false);
    }
  }

  async function deletarDiario(id: string) {
    if (!userId || !filhoSelecionado?.id) return;
    confirmarExclusao("Deseja excluir esta entrada do diário?", async () => {
      try {
        await deleteDoc(refDocSub(userId, filhoSelecionado!.id, "diario", id));
      } catch {
        Alert.alert("Erro", "Não foi possível excluir a entrada.");
      }
    });
  }

  function limparFormularioDiario() {
    setTextoDiario("");
    setDataDiario("");
  }

  // ── Dados do gráfico ──────────────────────────────────────────────────────

  const historicoValido = historico.filter(
    (i) => !isNaN(i.peso) && i.peso > 0 && !isNaN(i.altura) && i.altura > 0
  );

  const pesos = historicoValido.length > 0 ? historicoValido.map((i) => i.peso) : [0];
  const alturas = historicoValido.length > 0 ? historicoValido.map((i) => i.altura) : [0];
  const datas = historicoValido.map((i) => String(i.data ?? ""));

  // ── Trocar filho ──────────────────────────────────────────────────────────

  function selecionarFilho(f: Filho) {
    setFilhoSelecionado(f);
    setAbrirPicker(false);
    // Limpar formulários ao trocar de filho
    limparFormularioMarco();
    limparFormularioCrescimento();
    limparFormularioDiario();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/menu")}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Desenvolvimento</Text>
        </View>

        {/* Abas */}
        <View style={styles.tabs}>
          {(["marcos", "crescimento", "diario"] as AbaDesenvolvimento[]).map((a) => (
            <TouchableOpacity key={a} onPress={() => setAbaAtiva(a)}>
              <Text style={abaAtiva === a ? styles.tabActive : styles.tab}>
                {a === "marcos" ? "Marcos" : a === "crescimento" ? "Crescimento" : "Diário"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seleção de filho */}
        <View style={styles.card}>
          <Text style={styles.label}>Acompanhando</Text>

          {carregandoFilhos ? (
            <Text style={{ color: "#888" }}>Carregando...</Text>
          ) : filhos.length === 0 ? (
            <Text style={{ color: "#888" }}>Nenhuma criança cadastrada.</Text>
          ) : (
            <>
              <TouchableOpacity
                style={styles.select}
                onPress={() => setAbrirPicker(!abrirPicker)}
              >
                <Text>
                  {filhoSelecionado ? filhoSelecionado.nome ?? "Sem nome" : "Selecione um filho"}
                </Text>
                <Ionicons name="chevron-down" size={18} />
              </TouchableOpacity>

              {abrirPicker &&
                filhos.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.pickerItem}
                    onPress={() => selecionarFilho(f)}
                  >
                    <Text>{f.nome ?? "Sem nome"}</Text>
                  </TouchableOpacity>
                ))}
            </>
          )}
        </View>

        {/* ── Aba Marcos ─────────────────────────────────────────────────── */}
        {abaAtiva === "marcos" && (
          <View style={styles.card}>
            <View style={styles.headerCard}>
              <Text style={styles.cardTitulo}>Marcos</Text>
              <TouchableOpacity
                style={styles.botaoAdd}
                onPress={() => setMostrarForm(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {mostrarForm && (
              <View style={styles.form}>
                <TextInput
                  placeholder="Título"
                  style={styles.input}
                  value={titulo}
                  onChangeText={setTitulo}
                  returnKeyType="next"
                />

                <MaskInput
                  value={dataMarco}
                  onChangeText={(masked) => setDataMarco(masked)}
                  mask={MASK_DATA}
                  placeholder="DD/MM/AAAA"
                  style={styles.input}
                  keyboardType="numeric"
                />

                <View style={styles.botoes}>
                  <TouchableOpacity
                    style={[styles.botaoSalvar, salvandoMarco && { opacity: 0.6 }]}
                    onPress={salvarMarco}
                    disabled={salvandoMarco}
                  >
                    <Text style={{ color: "#fff" }}>
                      {salvandoMarco ? "Salvando..." : "Salvar"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={cancelarMarco}>
                    <Text>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {carregandoMarcos ? (
              <Text style={{ color: "#888", marginTop: 10 }}>Carregando marcos...</Text>
            ) : marcos.length === 0 ? (
              <Text style={{ color: "#888", marginTop: 10 }}>Nenhum marco registrado.</Text>
            ) : (
              marcos.map((item) => (
                <View key={item.id} style={styles.marco}>
                  <Text>{item.titulo}</Text>
                  <Text>{item.data}</Text>
                  <View style={styles.acoes}>
                    <TouchableOpacity onPress={() => editarMarco(item)}>
                      <Ionicons name="create-outline" size={20} color="#C642A6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deletarMarco(item.id)}>
                      <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── Aba Crescimento ────────────────────────────────────────────── */}
        {abaAtiva === "crescimento" && (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Crescimento</Text>

            <TextInput
              placeholder="Peso (kg)"
              style={styles.input}
              value={peso}
              onChangeText={setPeso}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Altura (cm)"
              style={styles.input}
              value={altura}
              onChangeText={setAltura}
              keyboardType="numeric"
            />

            <MaskInput
              value={dataCrescimento}
              onChangeText={(masked) => setDataCrescimento(masked)}
              mask={MASK_DATA}
              placeholder="DD/MM/AAAA"
              style={styles.input}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.botaoSalvar, salvandoCrescimento && { opacity: 0.6 }]}
              onPress={salvarCrescimento}
              disabled={salvandoCrescimento}
            >
              <Text style={{ color: "#fff" }}>
                {salvandoCrescimento ? "Salvando..." : "Adicionar"}
              </Text>
            </TouchableOpacity>

            {carregandoCrescimento ? (
              <Text style={{ color: "#888", marginTop: 10 }}>Carregando...</Text>
            ) : (
              <>
                {historicoValido.length > 0 && (
                  <LineChart
                    data={{
                      labels: datas,
                      datasets: [{ data: pesos }, { data: alturas }],
                      legend: ["Peso", "Altura"],
                    }}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: "#ece3ff",
                      backgroundGradientTo: "#ece3ff",
                      color: () => "#6a4bcf",
                      labelColor: () => "#555",
                    }}
                    style={styles.grafico}
                  />
                )}

                {historico.map((item) => (
                  <View key={item.id} style={styles.marco}>
                    <Text>Peso: {item.peso}</Text>
                    <Text>Altura: {item.altura}</Text>
                    <Text>{item.data}</Text>
                    <TouchableOpacity onPress={() => deletarCrescimento(item.id)}>
                      <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* ── Aba Diário ─────────────────────────────────────────────────── */}
        {abaAtiva === "diario" && (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Diário</Text>

            <TextInput
              placeholder="Escreva algo sobre o dia..."
              style={[styles.input, { height: 80 }]}
              multiline
              textAlignVertical="top"
              value={textoDiario}
              onChangeText={setTextoDiario}
            />

            <MaskInput
              value={dataDiario}
              onChangeText={(masked) => setDataDiario(masked)}
              mask={MASK_DATA}
              placeholder="DD/MM/AAAA"
              style={styles.input}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.botaoSalvar, salvandoDiario && { opacity: 0.6 }]}
              onPress={salvarDiario}
              disabled={salvandoDiario}
            >
              <Text style={{ color: "#fff" }}>
                {salvandoDiario ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>

            {carregandoDiario ? (
              <Text style={{ color: "#888", marginTop: 10 }}>Carregando diário...</Text>
            ) : diario.length === 0 ? (
              <Text style={{ color: "#888", marginTop: 10 }}>Nenhuma entrada no diário.</Text>
            ) : (
              diario.map((item) => (
                <View key={item.id} style={styles.marco}>
                  <Text style={{ fontWeight: "bold" }}>{item.data}</Text>
                  <Text>{item.texto}</Text>
                  <TouchableOpacity onPress={() => deletarDiario(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos (sem alteração) ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7050b8",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },
  subTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    gap: 11,
    marginBottom: 15,
  },
  tab: {
    color: "#fff",
    backgroundColor: "#ffffff22",
    padding: 8,
    borderRadius: 10,
    paddingHorizontal: 30,
  },
  tabActive: {
    color: "#C642A6",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    paddingHorizontal: 30,
  },
  card: {
    overflow: "hidden",
    backgroundColor: "#ece3ff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  label: {
    color: "#777",
    marginBottom: 5,
  },
  select: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 10,
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitulo: {
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoAdd: {
    backgroundColor: "#b44a8b",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    marginTop: 15,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  botoes: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    marginTop: 5,
  },
  botaoSalvar: {
    backgroundColor: "#C642A6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  marco: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
  },
  acoes: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  pickerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  grafico: {
    marginTop: 15,
    borderRadius: 10,
    alignSelf: "center",
  },
});