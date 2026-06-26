import MeuMapa from "@/src/components/(mapa)/meuMapa";
import { auth, firestore } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
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

type IoniconName = keyof typeof Ionicons.glyphMap;

type Aba = "vacinas" | "locais" | "anotacoes";

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

type AnotacaoTipo = "vacinacao" | "saude" | "geral";

type Anotacao = {
  id: string;
  titulo: string;
  texto: string;
  tipo: AnotacaoTipo;
  criadoEm?: any;
};

type TipoAnotacaoConfig = {
  valor: AnotacaoTipo;
  label: string;
  cor: string;
  icone: IoniconName;
};

const VACINAS_INICIAIS: Record<string, Vacina> = {
  v1: { nome: "BCG", idade: "Ao nascer", data: "" },
  v2: { nome: "Hepatite B", idade: "Ao nascer", data: "" },
  v3: { nome: "Pentavalente 1ª dose", idade: "2 meses", data: "" },
  v4: { nome: "VIP 1ª dose", idade: "2 meses", data: "" },
  v5: { nome: "Rotavírus 1ª dose", idade: "2 meses", data: "" },
  v6: { nome: "Pneumocócica 1ª dose", idade: "2 meses", data: "" },
  v7: { nome: "Meningocócica C 1ª dose", idade: "3 meses", data: "" },
  v8: { nome: "Pentavalente 2ª dose", idade: "4 meses", data: "" },
  v9: { nome: "VIP 2ª dose", idade: "4 meses", data: "" },
  v10: { nome: "Rotavírus 2ª dose", idade: "4 meses", data: "" },
  v11: { nome: "Pneumocócica 2ª dose", idade: "4 meses", data: "" },
  v12: { nome: "Meningocócica C 2ª dose", idade: "5 meses", data: "" },
  v13: { nome: "Pentavalente 3ª dose", idade: "6 meses", data: "" },
  v14: { nome: "VIP 3ª dose", idade: "6 meses", data: "" },
  v15: { nome: "Febre Amarela", idade: "9 meses", data: "" },
  v16: { nome: "Tríplice Viral", idade: "12 meses", data: "" },
  v17: { nome: "Pneumocócica reforço", idade: "12 meses", data: "" },
  v18: { nome: "Meningocócica reforço", idade: "12 meses", data: "" },
  v19: { nome: "DTP reforço", idade: "15 meses", data: "" },
  v20: { nome: "VOP reforço", idade: "15 meses", data: "" },
  v21: { nome: "Hepatite A", idade: "15 meses", data: "" },
  v22: { nome: "Tetraviral", idade: "15 meses", data: "" },
};

const TIPOS_ANOTACAO: TipoAnotacaoConfig[] = [
  {
    valor: "vacinacao",
    label: "Vacinação",
    cor: "#16a34a",
    icone: "shield-checkmark-outline",
  },
  {
    valor: "saude",
    label: "Saúde",
    cor: "#0891b2",
    icone: "heart-outline",
  },
  {
    valor: "geral",
    label: "Geral",
    cor: "#7050b3",
    icone: "document-text-outline",
  },
];

function ordenarVacinas(raw: Record<string, Vacina>): Vacina[] {
  return Object.keys(raw)
    .sort((a, b) => {
      const numA = Number(a.replace("v", ""));
      const numB = Number(b.replace("v", ""));
      return numA - numB;
    })
    .map((key) => raw[key]);
}

function aplicarMascara(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

function validarData(valor: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    return false;
  }

  const [dia, mes, ano] = valor.split("/").map(Number);
  const data = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  hoje.setHours(23, 59, 59, 999);

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= hoje
  );
}

function calcularProgresso(vacinas: Vacina[]): number {
  if (vacinas.length === 0) {
    return 0;
  }

  const tomadas = vacinas.filter((vacina) => vacina.data && vacina.data !== "").length;

  return (tomadas / vacinas.length) * 100;
}

function formatarData(timestamp: any): string {
  if (!timestamp) {
    return "";
  }

  try {
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Saude() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [aba, setAba] = useState<Aba>("vacinas");

  const [userId, setUserId] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );

  const [filhos, setFilhos] = useState<Filho[]>([]);
  const [filhoSelecionado, setFilhoSelecionado] = useState<Filho | null>(null);
  const [carregandoFilhos, setCarregandoFilhos] = useState(true);

  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [carregandoVacinas, setCarregandoVacinas] = useState(false);

  const [editando, setEditando] = useState<number | null>(null);
  const [dataTemp, setDataTemp] = useState("");

  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [carregandoAnotacoes, setCarregandoAnotacoes] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoAnotacaoId, setEditandoAnotacaoId] = useState<string | null>(
    null,
  );

  const [tituloAnotacao, setTituloAnotacao] = useState("");
  const [textoAnotacao, setTextoAnotacao] = useState("");
  const [tipoAnotacao, setTipoAnotacao] = useState<AnotacaoTipo>("geral");
  const [salvandoAnotacao, setSalvandoAnotacao] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUserId(usuario?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setFilhos([]);
      setFilhoSelecionado(null);
      setCarregandoFilhos(false);
      return;
    }

    setCarregandoFilhos(true);

    const filhosRef = collection(firestore, "usuarios", userId, "filhos");

    const unsubscribe = onSnapshot(
      filhosRef,
      (snapshot) => {
        const lista: Filho[] = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...(documento.data() as Omit<Filho, "id">),
        }));

        setFilhos(lista);

        if (lista.length === 1) {
          setFilhoSelecionado((anterior) =>
            anterior?.id === lista[0].id ? anterior : lista[0],
          );
        }

        if (lista.length === 0) {
          setFilhoSelecionado(null);
        }

        setFilhoSelecionado((anterior) => {
          if (!anterior) {
            return anterior;
          }

          return lista.find((filho) => filho.id === anterior.id) ?? null;
        });

        setCarregandoFilhos(false);
      },
      (error) => {
        console.log("Erro ao carregar filhos:", error);
        setCarregandoFilhos(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!filhoSelecionado?.id || !userId) {
      setVacinas([]);
      setCarregandoVacinas(false);
      return;
    }

    setCarregandoVacinas(true);

    const filhoRef = doc(
      firestore,
      "usuarios",
      userId,
      "filhos",
      filhoSelecionado.id,
    );

    const unsubscribe = onSnapshot(
      filhoRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          setVacinas([]);
          setCarregandoVacinas(false);
          return;
        }

        const dados = snapshot.data() as Filho;

        if (dados.vacinas && typeof dados.vacinas === "object") {
          setVacinas(ordenarVacinas(dados.vacinas));
          setCarregandoVacinas(false);
          return;
        }

        try {
          await updateDoc(filhoRef, {
            vacinas: VACINAS_INICIAIS,
          });
        } catch (error) {
          console.log("Erro ao criar vacinas iniciais:", error);
          Alert.alert("Erro", "Não foi possível carregar as vacinas.");
        } finally {
          setCarregandoVacinas(false);
        }
      },
      (error) => {
        console.log("Erro ao carregar vacinas:", error);
        setCarregandoVacinas(false);
      },
    );

    return () => unsubscribe();
  }, [filhoSelecionado?.id, userId]);

  useEffect(() => {
    if (!filhoSelecionado?.id || !userId) {
      setAnotacoes([]);
      setCarregandoAnotacoes(false);
      return;
    }

    setCarregandoAnotacoes(true);

    const anotacoesRef = collection(
      firestore,
      "usuarios",
      userId,
      "filhos",
      filhoSelecionado.id,
      "anotacoes",
    );

    const unsubscribe = onSnapshot(
      anotacoesRef,
      (snapshot) => {
        const lista: Anotacao[] = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...(documento.data() as Omit<Anotacao, "id">),
        }));

        lista.sort((a, b) => {
          const tempoA = a.criadoEm?.toMillis?.() ?? 0;
          const tempoB = b.criadoEm?.toMillis?.() ?? 0;

          return tempoB - tempoA;
        });

        setAnotacoes(lista);
        setCarregandoAnotacoes(false);
      },
      (error) => {
        console.log("Erro ao carregar anotações:", error);
        setCarregandoAnotacoes(false);
      },
    );

    return () => unsubscribe();
  }, [filhoSelecionado?.id, userId]);

  function cancelarEdicaoVacina() {
    setEditando(null);
    setDataTemp("");
  }

  function abrirEdicaoVacina(index: number) {
    setEditando(index);
    setDataTemp(vacinas[index]?.data || "");

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(index * 80, 0),
        animated: true,
      });
    }, 250);
  }

  async function salvarDataVacina(index: number) {
    if (!dataTemp.trim()) {
      Alert.alert("Atenção", "Informe a data da vacinação.");
      return;
    }

    if (!validarData(dataTemp)) {
      Alert.alert(
        "Data inválida",
        "Informe uma data válida no formato DD/MM/AAAA que não seja no futuro.",
      );
      return;
    }

    if (!filhoSelecionado?.id || !userId) {
      Alert.alert("Erro", "Selecione uma criança antes de salvar.");
      return;
    }

    const novasVacinas = vacinas.map((vacina, i) =>
      i === index ? { ...vacina, data: dataTemp } : { ...vacina },
    );

    const atualizacao: Record<string, Vacina> = {};

    novasVacinas.forEach((vacina, i) => {
      atualizacao[`vacinas.v${i + 1}`] = vacina;
    });

    const filhoRef = doc(
      firestore,
      "usuarios",
      userId,
      "filhos",
      filhoSelecionado.id,
    );

    try {
      await updateDoc(filhoRef, atualizacao);

      setVacinas(novasVacinas);
      setEditando(null);
      setDataTemp("");
    } catch (error) {
      console.log("Erro ao salvar vacina:", error);
      Alert.alert("Erro", "Não foi possível salvar a data. Tente novamente.");
    }
  }

  function limparFormAnotacao() {
    setTituloAnotacao("");
    setTextoAnotacao("");
    setTipoAnotacao("geral");
    setEditandoAnotacaoId(null);
    setMostrarForm(false);
  }

  async function salvarAnotacao() {
    if (salvandoAnotacao) {
      return;
    }

    if (!tituloAnotacao.trim()) {
      Alert.alert("Atenção", "Informe um título para a anotação.");
      return;
    }

    if (!textoAnotacao.trim()) {
      Alert.alert("Atenção", "Escreva o conteúdo da anotação.");
      return;
    }

    if (!filhoSelecionado?.id || !userId) {
      Alert.alert("Erro", "Selecione uma criança antes de salvar.");
      return;
    }

    setSalvandoAnotacao(true);

    try {
      if (editandoAnotacaoId) {
        const anotacaoRef = doc(
          firestore,
          "usuarios",
          userId,
          "filhos",
          filhoSelecionado.id,
          "anotacoes",
          editandoAnotacaoId,
        );

        await updateDoc(anotacaoRef, {
          titulo: tituloAnotacao.trim(),
          texto: textoAnotacao.trim(),
          tipo: tipoAnotacao,
        });
      } else {
        const anotacoesRef = collection(
          firestore,
          "usuarios",
          userId,
          "filhos",
          filhoSelecionado.id,
          "anotacoes",
        );

        await addDoc(anotacoesRef, {
          titulo: tituloAnotacao.trim(),
          texto: textoAnotacao.trim(),
          tipo: tipoAnotacao,
          criadoEm: serverTimestamp(),
        });
      }

      limparFormAnotacao();
    } catch (error) {
      console.log("Erro ao salvar anotação:", error);
      Alert.alert("Erro", "Não foi possível salvar a anotação.");
    } finally {
      setSalvandoAnotacao(false);
    }
  }

  function editarAnotacao(item: Anotacao) {
    setTituloAnotacao(item.titulo);
    setTextoAnotacao(item.texto);
    setTipoAnotacao(item.tipo ?? "geral");
    setEditandoAnotacaoId(item.id);
    setMostrarForm(true);
  }

  async function deletarAnotacao(id: string) {
    if (!userId || !filhoSelecionado?.id) {
      return;
    }

    Alert.alert("Excluir anotação", "Deseja excluir esta anotação?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(
              doc(
                firestore,
                "usuarios",
                userId,
                "filhos",
                filhoSelecionado.id,
                "anotacoes",
                id,
              ),
            );
          } catch (error) {
            console.log("Erro ao excluir anotação:", error);
            Alert.alert("Erro", "Não foi possível excluir a anotação.");
          }
        },
      },
    ]);
  }

  const vacinasTomadas = vacinas.filter(
    (vacina) => vacina.data && vacina.data !== "",
  ).length;

  const progresso = calcularProgresso(vacinas);

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(drawer)/(pais)/(tabs)/menu" as any)}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>Saúde</Text>
            <Text style={styles.subtitle}>Vacinas, locais e anotações</Text>
          </View>
        </View>

        {carregandoFilhos ? (
          <Text style={styles.infoText}>Carregando...</Text>
        ) : filhos.length === 0 ? (
          <View style={styles.avisoBox}>
            <Ionicons name="person-add-outline" size={20} color="#fff" />
            <Text style={styles.infoText}>Nenhuma criança cadastrada.</Text>
          </View>
        ) : (
          <View style={styles.filhoBox}>
            {filhos.map((filho) => (
              <TouchableOpacity
                key={filho.id}
                style={[
                  styles.filhoItem,
                  filhoSelecionado?.id === filho.id && styles.filhoAtivo,
                ]}
                onPress={() => {
                  setFilhoSelecionado(filho);
                  setEditando(null);
                  setMostrarForm(false);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filhoText,
                    filhoSelecionado?.id === filho.id && styles.filhoTextAtivo,
                  ]}
                >
                  {filho.nome ?? "Sem nome"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.tabs}>
          {(["vacinas", "locais", "anotacoes"] as Aba[]).map((item) => {
            const ativo = aba === item;

            return (
              <TouchableOpacity
                key={item}
                style={ativo ? styles.tabActive : styles.tab}
                onPress={() => setAba(item)}
                activeOpacity={0.85}
              >
                <Text style={ativo ? styles.tabTextActive : styles.tabText}>
                  {item === "vacinas"
                    ? "Vacinação"
                    : item === "locais"
                      ? "Locais"
                      : "Anotações"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {aba === "locais" ? (
          <View style={styles.mapa}>
            <MeuMapa />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
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
                    <View style={styles.card}>
                      <View style={styles.progressHeader}>
                        <View>
                          <Text style={styles.cardTitle}>Progresso</Text>
                          <Text style={styles.progressDescription}>
                            Vacinas aplicadas
                          </Text>
                        </View>

                        <View style={styles.progressBadge}>
                          <Text style={styles.progressBadgeText}>
                            {Math.round(progresso)}%
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.progressText}>
                        {vacinasTomadas} de {vacinas.length}
                      </Text>

                      <View style={styles.slider}>
                        <View
                          style={[
                            styles.sliderFill,
                            {
                              width: `${progresso}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Calendário de vacinação</Text>

                      {vacinas.map((vacina, index) => (
                        <View key={`${vacina.nome}-${index}`} style={styles.item}>
                          <TouchableOpacity
                            onPress={() => abrirEdicaoVacina(index)}
                            activeOpacity={0.75}
                          >
                            <Ionicons
                              name={
                                vacina.data
                                  ? "checkmark-circle"
                                  : "ellipse-outline"
                              }
                              size={23}
                              color={vacina.data ? "#16a34a" : "#999"}
                            />
                          </TouchableOpacity>

                          <View style={styles.itemContent}>
                            <Text style={styles.nomeVacina}>{vacina.nome}</Text>

                            <Text style={styles.itemText}>
                              {vacina.idade} • {vacina.data || "Pendente"}
                            </Text>

                            {editando === index && (
                              <View style={styles.inputContainer}>
                                <TextInput
                                  placeholder="DD/MM/AAAA"
                                  placeholderTextColor="#aaa"
                                  value={dataTemp}
                                  onChangeText={(texto) =>
                                    setDataTemp(aplicarMascara(texto))
                                  }
                                  style={styles.input}
                                  keyboardType="numeric"
                                  maxLength={10}
                                  autoFocus
                                />

                                <View style={styles.botoes}>
                                  <TouchableOpacity
                                    onPress={() => salvarDataVacina(index)}
                                    activeOpacity={0.75}
                                  >
                                    <Text style={styles.salvar}>Salvar</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    onPress={cancelarEdicaoVacina}
                                    activeOpacity={0.75}
                                  >
                                    <Text style={styles.cancelar}>Cancelar</Text>
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

            {aba === "anotacoes" && (
              <View style={styles.card}>
                <View style={styles.anotacoesHeader}>
                  <View style={styles.anotacoesHeaderText}>
                    <Text style={styles.cardTitle}>Anotações</Text>

                    <Text style={styles.anotacoesSubtitulo}>
                      Vacinação, saúde e observações importantes
                    </Text>
                  </View>

                  {filhoSelecionado && (
                    <TouchableOpacity
                      style={styles.btnNovaAnotacao}
                      onPress={() => {
                        limparFormAnotacao();
                        setMostrarForm(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>

                {!filhoSelecionado && (
                  <Text style={styles.infoCard}>
                    Selecione uma criança para ver as anotações.
                  </Text>
                )}

                {filhoSelecionado && mostrarForm && (
                  <View style={styles.formAnotacao}>
                    <Text style={styles.formTitulo}>
                      {editandoAnotacaoId ? "Editar anotação" : "Nova anotação"}
                    </Text>

                    <Text style={styles.formLabel}>Categoria</Text>

                    <View style={styles.tiposRow}>
                      {TIPOS_ANOTACAO.map((tipo) => {
                        const ativo = tipoAnotacao === tipo.valor;

                        return (
                          <TouchableOpacity
                            key={tipo.valor}
                            style={[
                              styles.tipoBtn,
                              ativo && {
                                backgroundColor: tipo.cor,
                                borderColor: tipo.cor,
                              },
                            ]}
                            onPress={() => setTipoAnotacao(tipo.valor)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={tipo.icone}
                              size={13}
                              color={ativo ? "#fff" : tipo.cor}
                            />

                            <Text
                              style={[
                                styles.tipoBtnText,
                                ativo && styles.tipoBtnTextAtivo,
                              ]}
                            >
                              {tipo.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={styles.formLabel}>Título</Text>

                    <TextInput
                      placeholder="Ex: Reação à BCG, consulta pediatra..."
                      placeholderTextColor="#bbb"
                      style={styles.formInput}
                      value={tituloAnotacao}
                      onChangeText={setTituloAnotacao}
                      returnKeyType="next"
                    />

                    <Text style={styles.formLabel}>Anotação</Text>

                    <TextInput
                      placeholder="Descreva o que aconteceu, como a criança reagiu ou recomendações do médico..."
                      placeholderTextColor="#bbb"
                      style={[styles.formInput, styles.textArea]}
                      value={textoAnotacao}
                      onChangeText={setTextoAnotacao}
                      multiline
                      textAlignVertical="top"
                    />

                    <View style={styles.formBotoes}>
                      <TouchableOpacity
                        style={styles.btnCancelarForm}
                        onPress={limparFormAnotacao}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnCancelarFormText}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.btnSalvarForm,
                          salvandoAnotacao && styles.btnDisabled,
                        ]}
                        onPress={salvarAnotacao}
                        disabled={salvandoAnotacao}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnSalvarFormText}>
                          {salvandoAnotacao
                            ? "Salvando..."
                            : editandoAnotacaoId
                              ? "Atualizar"
                              : "Salvar"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {filhoSelecionado && !mostrarForm && (
                  <>
                    {carregandoAnotacoes ? (
                      <Text style={styles.infoCard}>Carregando anotações...</Text>
                    ) : anotacoes.length === 0 ? (
                      <View style={styles.emptyBox}>
                        <Ionicons
                          name="document-text-outline"
                          size={34}
                          color="#ccc"
                        />

                        <Text style={styles.emptyText}>
                          Nenhuma anotação ainda.{"\n"}Toque em + para adicionar.
                        </Text>
                      </View>
                    ) : (
                      anotacoes.map((item) => {
                        const tipoInfo =
                          TIPOS_ANOTACAO.find(
                            (tipo) => tipo.valor === item.tipo,
                          ) ?? TIPOS_ANOTACAO[2];

                        return (
                          <View
                            key={item.id}
                            style={[
                              styles.anotacaoCard,
                              {
                                borderLeftColor: tipoInfo.cor,
                              },
                            ]}
                          >
                            <View style={styles.anotacaoCardHeader}>
                              <View
                                style={[
                                  styles.anotacaoIconBox,
                                  {
                                    backgroundColor: `${tipoInfo.cor}22`,
                                  },
                                ]}
                              >
                                <Ionicons
                                  name={tipoInfo.icone}
                                  size={15}
                                  color={tipoInfo.cor}
                                />
                              </View>

                              <View style={styles.anotacaoInfo}>
                                <Text style={styles.anotacaoTitulo}>
                                  {item.titulo}
                                </Text>

                                <View style={styles.anotacaoMeta}>
                                  <View
                                    style={[
                                      styles.tipoBadge,
                                      {
                                        backgroundColor: `${tipoInfo.cor}18`,
                                      },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.tipoBadgeText,
                                        {
                                          color: tipoInfo.cor,
                                        },
                                      ]}
                                    >
                                      {tipoInfo.label}
                                    </Text>
                                  </View>

                                  {item.criadoEm && (
                                    <Text style={styles.anotacaoData}>
                                      {formatarData(item.criadoEm)}
                                    </Text>
                                  )}
                                </View>
                              </View>

                              <View style={styles.anotacaoAcoes}>
                                <TouchableOpacity
                                  onPress={() => editarAnotacao(item)}
                                  style={styles.anotacaoAcaoBtn}
                                  activeOpacity={0.75}
                                >
                                  <Ionicons
                                    name="create-outline"
                                    size={17}
                                    color="#7050b3"
                                  />
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => deletarAnotacao(item.id)}
                                  style={styles.anotacaoAcaoBtn}
                                  activeOpacity={0.75}
                                >
                                  <Ionicons
                                    name="trash-outline"
                                    size={17}
                                    color="#e11d48"
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>

                            <Text style={styles.anotacaoTexto}>{item.texto}</Text>
                          </View>
                        );
                      })
                    )}
                  </>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },

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

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    marginTop: 1,
  },

  infoText: {
    color: "#fff",
    marginVertical: 8,
    fontSize: 14,
  },

  avisoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
  },

  filhoBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },

  filhoItem: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  filhoAtivo: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },

  filhoText: {
    color: "#fff",
    fontWeight: "500",
  },

  filhoTextAtivo: {
    color: "#28174c",
    fontWeight: "700",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },

  tabActive: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },

  tabText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    fontSize: 13,
  },

  tabTextActive: {
    color: "#36265a",
    fontWeight: "700",
    fontSize: 13,
  },

  scrollContent: {
    paddingBottom: 70,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  infoCard: {
    color: "#888",
    textAlign: "center",
    paddingVertical: 8,
    lineHeight: 20,
  },

  mapa: {
    flex: 1,
    borderRadius: 16,
    width: "100%",
    marginBottom: 20,
    elevation: 3,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#444",
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressDescription: {
    fontSize: 12,
    color: "#888",
  },

  progressBadge: {
    backgroundColor: "#f4e7ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  progressBadgeText: {
    color: "#7050b3",
    fontWeight: "800",
    fontSize: 12,
  },

  progressText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },

  slider: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },

  sliderFill: {
    height: 6,
    backgroundColor: "#C642A6",
    borderRadius: 10,
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1ecf8",
  },

  itemContent: {
    flex: 1,
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
    padding: 9,
    marginTop: 5,
    fontSize: 13,
    color: "#28174c",
    backgroundColor: "#fff",
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
    color: "#e11d48",
    fontWeight: "bold",
  },

  anotacoesHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  anotacoesHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  anotacoesSubtitulo: {
    fontSize: 12,
    color: "#999",
    marginTop: 1,
  },

  btnNovaAnotacao: {
    backgroundColor: "#7050b3",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  formAnotacao: {
    backgroundColor: "#f8f5ff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  formTitulo: {
    fontWeight: "700",
    fontSize: 15,
    color: "#28174c",
    marginBottom: 12,
  },

  formLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7050b3",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 5,
  },

  formInput: {
    borderWidth: 1.5,
    borderColor: "#e0d5f5",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#28174c",
    backgroundColor: "#fff",
    marginBottom: 12,
  },

  textArea: {
    height: 110,
  },

  tiposRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  tipoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e0d5f5",
    backgroundColor: "#fff",
  },

  tipoBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },

  tipoBtnTextAtivo: {
    color: "#fff",
  },

  formBotoes: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  btnCancelarForm: {
    flex: 1,
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0d5f5",
  },

  btnCancelarFormText: {
    color: "#555",
    fontWeight: "600",
  },

  btnSalvarForm: {
    flex: 2,
    backgroundColor: "#7050b3",
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
  },

  btnSalvarFormText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },

  emptyText: {
    color: "#aaa",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  anotacaoCard: {
    backgroundColor: "#faf8ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  anotacaoCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  anotacaoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  anotacaoInfo: {
    flex: 1,
  },

  anotacaoTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#28174c",
  },

  anotacaoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
    flexWrap: "wrap",
  },

  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },

  tipoBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  anotacaoData: {
    fontSize: 11,
    color: "#999",
  },

  anotacaoAcoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  anotacaoAcaoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  anotacaoTexto: {
    color: "#555",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
});