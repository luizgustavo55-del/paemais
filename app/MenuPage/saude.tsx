import MeuMapa from "@/src/components/(mapa)/meuMapa";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import { auth, firestore } from "@/src/services/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Aba = "vacinas" | "locais" | "historico";

type Vacina = {
  nome: string;
  idade: string;
  data: string;
};

type Filho = {
  id: string;
  nome?: string;
  dataNascimento?: string;
  sexo?: string;
  relacao?: string;
  vacinas?: Record<string, Vacina>;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const VACINAS_INICIAIS: Record<string, Vacina> = {
  v1:  { nome: "BCG",                      idade: "Ao nascer",  data: "" },
  v2:  { nome: "Hepatite B",               idade: "Ao nascer",  data: "" },
  v3:  { nome: "Pentavalente 1ª dose",     idade: "2 meses",    data: "" },
  v4:  { nome: "VIP 1ª dose",              idade: "2 meses",    data: "" },
  v5:  { nome: "Rotavírus 1ª dose",        idade: "2 meses",    data: "" },
  v6:  { nome: "Pneumocócica 1ª dose",     idade: "2 meses",    data: "" },
  v7:  { nome: "Meningocócica C 1ª dose",  idade: "3 meses",    data: "" },
  v8:  { nome: "Pentavalente 2ª dose",     idade: "4 meses",    data: "" },
  v9:  { nome: "VIP 2ª dose",              idade: "4 meses",    data: "" },
  v10: { nome: "Rotavírus 2ª dose",        idade: "4 meses",    data: "" },
  v11: { nome: "Pneumocócica 2ª dose",     idade: "4 meses",    data: "" },
  v12: { nome: "Meningocócica C 2ª dose",  idade: "5 meses",    data: "" },
  v13: { nome: "Pentavalente 3ª dose",     idade: "6 meses",    data: "" },
  v14: { nome: "VIP 3ª dose",              idade: "6 meses",    data: "" },
  v15: { nome: "Febre Amarela",            idade: "9 meses",    data: "" },
  v16: { nome: "Tríplice Viral",           idade: "12 meses",   data: "" },
  v17: { nome: "Pneumocócica reforço",     idade: "12 meses",   data: "" },
  v18: { nome: "Meningocócica reforço",    idade: "12 meses",   data: "" },
  v19: { nome: "DTP reforço",              idade: "15 meses",   data: "" },
  v20: { nome: "VOP reforço",              idade: "15 meses",   data: "" },
  v21: { nome: "Hepatite A",               idade: "15 meses",   data: "" },
  v22: { nome: "Tetraviral",               idade: "15 meses",   data: "" },
};

// ─── Funções utilitárias ──────────────────────────────────────────────────────

function ordenarVacinas(raw: Record<string, Vacina>): Vacina[] {
  return Object.keys(raw)
    .sort((a, b) => parseInt(a.replace("v", "")) - parseInt(b.replace("v", "")))
    .map((k) => raw[k]);
}

/** Aplica máscara DD/MM/AAAA conforme o usuário digita */
function aplicarMascara(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

/** Valida DD/MM/AAAA: formato, existência do dia e não aceita datas futuras */
function validarData(valor: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return false;

  const [dia, mes, ano] = valor.split("/").map(Number);
  const data = new Date(ano, mes - 1, dia);

  const dataValida =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia;

  if (!dataValida) return false;
  if (data > new Date()) return false;

  return true;
}

function calcularProgresso(vacinas: Vacina[]): number {
  if (vacinas.length === 0) return 0;
  const tomadas = vacinas.filter((v) => v.data && v.data !== "").length;
  return (tomadas / vacinas.length) * 100;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Saude() {
  const [aba, setAba] = useState<Aba>("vacinas");

  const [filhos, setFilhos] = useState<Filho[]>([]);
  const [filhoSelecionado, setFilhoSelecionado] = useState<Filho | null>(null);
  const [carregandoFilhos, setCarregandoFilhos] = useState(true);

  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [carregandoVacinas, setCarregandoVacinas] = useState(false);

  const [editando, setEditando] = useState<number | null>(null);
  const [dataTemp, setDataTemp] = useState("");

  const scrollRef = useRef<ScrollView>(null);

  const router = useRouter();
  const userId = auth.currentUser?.uid;

  // ── Snapshot: Filhos ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;

    const ref = collection(firestore, "usuarios", userId, "filhos");

    const unsub = onSnapshot(ref, (snapshot) => {
      const lista: Filho[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Filho, "id">),
      }));

      setFilhos(lista);
      setCarregandoFilhos(false);

      // Auto-selecionar filho único
      if (lista.length === 1) {
        setFilhoSelecionado((prev) =>
          prev?.id === lista[0].id ? prev : lista[0]
        );
      }

      // Limpar seleção se o filho foi removido
      setFilhoSelecionado((prev) => {
        if (!prev) return prev;
        return lista.find((f) => f.id === prev.id) ?? null;
      });
    });

    return () => unsub();
  }, [userId]);

  // ── Snapshot: Vacinas ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!filhoSelecionado || !userId) {
      setVacinas([]);
      return;
    }

    setCarregandoVacinas(true);

    const docRef = doc(
      firestore,
      "usuarios",
      userId,
      "filhos",
      filhoSelecionado.id
    );

    const unsub = onSnapshot(docRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setCarregandoVacinas(false);
        return;
      }

      const data = snapshot.data() as Filho;

      if (data.vacinas && typeof data.vacinas === "object") {
        setVacinas(ordenarVacinas(data.vacinas));
      } else {
        // Criar vacinas iniciais
        try {
          await updateDoc(docRef, { vacinas: VACINAS_INICIAIS });
        } catch (e) {
          console.error("Erro ao criar vacinas iniciais:", e);
        }
      }

      setCarregandoVacinas(false);
    });

    return () => unsub();
  }, [filhoSelecionado, userId]);

  // ── Salvar data da vacina ─────────────────────────────────────────────────

  async function salvarData(index: number) {
    if (!dataTemp) return;

    if (!validarData(dataTemp)) {
      Alert.alert(
        "Data inválida",
        "Informe uma data válida no formato DD/MM/AAAA que não seja no futuro."
      );
      return;
    }

    if (!filhoSelecionado || !userId) return;

    // Cópia segura do array e do objeto da vacina
    const novas = vacinas.map((v, i) =>
      i === index ? { ...v, data: dataTemp } : { ...v }
    );

    const atualizacao: Record<string, Vacina> = {};
    novas.forEach((v, i) => {
      atualizacao[`vacinas.v${i + 1}`] = v;
    });

    const docRef = doc(
      firestore,
      "usuarios",
      userId,
      "filhos",
      filhoSelecionado.id
    );

    try {
      await updateDoc(docRef, atualizacao);
      setVacinas(novas);
      setEditando(null);
      setDataTemp("");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível salvar a data. Tente novamente.");
    }
  }

  function cancelar() {
    setEditando(null);
    setDataTemp("");
  }

  function abrirEdicao(index: number) {
    setEditando(index);
    setDataTemp(vacinas[index].data || "");
    // Rolar levemente para garantir visibilidade
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: index * 80, animated: true });
    }, 300);
  }

  const vacinasTomadas = vacinas.filter((v) => v.data && v.data !== "").length;
  const progresso = calcularProgresso(vacinas);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/menu")}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Saúde</Text>
        </View>

        {/* Seleção de filhos */}
        {carregandoFilhos ? (
          <Text style={styles.infoText}>Carregando...</Text>
        ) : filhos.length === 0 ? (
          <Text style={styles.infoText}>Nenhuma criança cadastrada.</Text>
        ) : (
          <View style={styles.filhoBox}>
            {filhos.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filhoItem,
                  filhoSelecionado?.id === f.id && styles.filhoAtivo,
                ]}
                onPress={() => setFilhoSelecionado(f)}
              >
                <Text style={styles.filhoText}>{f.nome ?? "Sem nome"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Abas */}
        <View style={styles.tabs}>
          {(["vacinas", "locais", "historico"] as Aba[]).map((a) => (
            <TouchableOpacity
              key={a}
              style={aba === a ? styles.tabActive : styles.tab}
              onPress={() => setAba(a)}
            >
              <Text style={styles.tabText}>
                {a === "vacinas" ? "Vacinação" : a === "locais" ? "Locais" : "Histórico"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteúdo */}
        {aba === "locais" ? (
          <View style={styles.mapa}>
            <MeuMapa />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {aba === "vacinas" && (
              <>
                {!filhoSelecionado ? (
                  <View style={styles.card}>
                    <Text style={styles.infoCard}>
                      Selecione uma criança para ver as vacinas.
                    </Text>
                  </View>
                ) : carregandoVacinas ? (
                  <View style={styles.card}>
                    <Text style={styles.infoCard}>Carregando vacinas...</Text>
                  </View>
                ) : (
                  <>
                    {/* Progresso */}
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Progresso</Text>
                      <Text style={styles.progressText}>
                        {vacinasTomadas} de {vacinas.length}
                      </Text>
                      <View style={styles.slider}>
                        <View
                          style={{
                            height: 6,
                            width: `${progresso}%`,
                            backgroundColor: "#C642A6",
                            borderRadius: 10,
                          }}
                        />
                      </View>
                    </View>

                    {/* Lista de vacinas */}
                    <View style={styles.card}>
                      {vacinas.map((v, i) => (
                        <View key={i} style={styles.item}>
                          <TouchableOpacity onPress={() => abrirEdicao(i)}>
                            <Ionicons
                              name={
                                v.data
                                  ? "checkmark-circle"
                                  : "ellipse-outline"
                              }
                              size={22}
                              color={v.data ? "green" : "#999"}
                            />
                          </TouchableOpacity>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.nomeVacina}>{v.nome}</Text>
                            <Text style={styles.itemText}>
                              {v.idade} • {v.data || "Pendente"}
                            </Text>

                            {editando === i && (
                              <View style={styles.inputContainer}>
                                <TextInput
                                  placeholder="DD/MM/AAAA"
                                  value={dataTemp}
                                  onChangeText={(t) =>
                                    setDataTemp(aplicarMascara(t))
                                  }
                                  style={styles.input}
                                  keyboardType="numeric"
                                  maxLength={10}
                                  autoFocus
                                />
                                <View style={styles.botoes}>
                                  <TouchableOpacity
                                    onPress={() => salvarData(i)}
                                  >
                                    <Text style={styles.salvar}>Salvar</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={cancelar}>
                                    <Text style={styles.cancelar}>
                                      Cancelar
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}

            {aba === "historico" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Histórico</Text>
                <Text style={styles.itemText}>
                  Aqui estarão os relatórios de consultas adicionados pelos
                  profissionais, com resultados de exames e os documentos
                  necessários (atestados, exames como raio X, hemograma etc).
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#7050B3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  infoText: {
    color: "#fff",
    marginVertical: 8,
    fontSize: 14,
  },
  filhoBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },
  filhoItem: {
    backgroundColor: "#ffffff22",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filhoAtivo: {
    backgroundColor: "#28174cca",
  },
  filhoText: {
    color: "#fff",
    fontWeight: "500",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabActive: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: {
    color: "#36265a",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  infoCard: {
    color: "#888",
    textAlign: "center",
    paddingVertical: 8,
  },
  mapa: {
    flex: 1,
    borderRadius: 16,
    width: "100%",
    marginBottom: 20,
    elevation: 3,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444",
  },
  progressText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  slider: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },
  nomeVacina: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  itemText: {
    color: "#555",
    fontSize: 13,
    lineHeight: 20,
  },
  inputContainer: {
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
    fontSize: 13,
  },
  botoes: {
    flexDirection: "row",
    gap: 15,
    marginTop: 6,
  },
  salvar: {
    color: "#C642A6",
    fontWeight: "bold",
  },
  cancelar: {
    color: "red",
    fontWeight: "bold",
  },
});