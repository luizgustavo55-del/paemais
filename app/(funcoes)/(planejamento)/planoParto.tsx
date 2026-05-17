import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { theme } from "@/src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { useAuth } from "@/src/context/AuthContext";
import { firestore } from "@/src/services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const OPCOES_PARTO = [
  "Parto Normal",
  "Cesárea",
  "Parto na Água",
  "Parto Humanizado",
  "Ainda não decidi",
];

export default function PlanoPartoScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [tipoParto, setTipoParto] = useState("Parto Normal");
  const [acompanhantes, setAcompanhantes] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [modalSeletorVisivel, setModalSeletorVisivel] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarPlano();
    }, [user]),
  );

  const carregarPlano = async () => {
    if (!user?.uid) return;

    try {
      const docRef = doc(firestore, "plano_parto", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        setTipoParto(dados.tipoParto || "Parto Normal");
        setAcompanhantes(dados.acompanhantes || "");
        setObservacoes(dados.observacoes || "");
        setSelecionados(dados.selecionados || []);
      }
    } catch (e) {
      console.log("Erro ao carregar plano", e);
    }
  };

  const toggleItem = (item: string) => {
    if (selecionados.includes(item)) {
      setSelecionados(selecionados.filter((i) => i !== item));
    } else {
      setSelecionados([...selecionados, item]);
    }
  };

  const salvarPlano = async () => {
    if (!user?.uid) return;

    const planoParto = {
      tipoParto,
      acompanhantes: acompanhantes.trim(),
      observacoes: observacoes.trim(),
      selecionados,
      updatedAt: Date.now(),
    };

    try {
      const docRef = doc(firestore, "plano_parto", user.uid);
      await setDoc(docRef, planoParto, { merge: true });

      if (Platform.OS === "web") {
        window.alert("Plano salvo com sucesso!");
      } else {
        Alert.alert("Sucesso", "Plano salvo!");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar plano.");
    }
  };

  const gerarPDF = async () => {
    const itensMarcados = selecionados
      .map((item) => `<li style="margin-bottom:8px;">${item}</li>`)
      .join("");

    const html = `
      <html>
      <body style="font-family: Arial; padding:40px;">
      
      <h1 style="color:#8B5CF6;">
      Plano de Parto
      </h1>

      <h2>Tipo de Parto</h2>
      <p>${tipoParto}</p>

      <h2>Acompanhantes</h2>
      <p>${acompanhantes}</p>

      <h2>Observações</h2>
      <p>${observacoes}</p>

      <h2>Preferências Selecionadas</h2>
      <ul>
        ${itensMarcados}
      </ul>

      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === "web") {
        window.open(uri);
      } else {
        const available = await Sharing.isAvailableAsync();
        if (available) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao gerar PDF.");
    }
  };

  const acompanhantesItens = [
    "Marido ou companheiro",
    "Doula",
    "Familiar ou acompanhante de confiança",
  ];

  const ambienteItens = [
    "Ambiente calmo e silencioso",
    "Luz baixa",
    "Poucas pessoas na sala",
    "Temperatura confortável",
    "Música relaxante",
  ];

  const liberdadeItens = [
    "Caminhar",
    "Sentar",
    "Ficar em pé",
    "Usar bola de pilates",
    "Ficar de cócoras",
    "Escolher posições confortáveis",
    "Banho morno ou banheira",
  ];

  const alivioDorItens = [
    "Respiração guiada",
    "Banho morno",
    "Massagem",
    "Aromaterapia",
    "Exercícios",
    "Música relaxante",
  ];

  const analgesiaItens = [
    "Ser consultada antes da anestesia",
    "Solicitar analgesia quando necessário",
    "Evitar medicações desnecessárias",
  ];

  const contatoBebeItens = [
    "Contato pele a pele",
    "Amamentar logo após o parto",
    "Permanecer com o bebê",
  ];

  const cordaoItens = [
    "Cordão cortado após parar de pulsar",
    "Escolher quem corta o cordão",
  ];

  const bebeItens = [
    "Amamentação em livre demanda",
    "Não oferecer chupeta",
    "Alojamento conjunto",
    "Participar dos cuidados do bebê",
  ];

  const cesareaItens = [
    "Presença do acompanhante",
    "Ambiente silencioso",
    "Permanecer acordada",
    "Ver o bebê nascer",
    "Contato pele a pele rápido",
  ];

  const emergenciaItens = [
    "Sofrimento fetal",
    "Falta de oxigênio",
    "Hemorragias",
    "Pressão alta grave",
    "Risco para mãe ou bebê",
  ];

  const procedimentosItens = [
    "Ocitocina",
    "Monitoramento fetal",
    "Analgesia",
    "Rompimento da bolsa",
    "Episiotomia",
  ];

  const cuidadosEspeciaisItens = [
    "Reanimação",
    "Oxigênio",
    "UTI neonatal",
    "Avaliação médica urgente",
  ];

  const renderChecklist = (titulo: string, itens: string[], icon: string) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialCommunityIcons
            name={icon as any}
            size={22}
            color={theme.colors.cards}
          />
        </View>

        <Text style={styles.sectionTitle}>{titulo}</Text>
      </View>

      {itens.map((item, index) => {
        const marcado = selecionados.includes(item);

        return (
          <TouchableOpacity
            key={index}
            style={styles.itemLinha}
            activeOpacity={0.8}
            onPress={() => toggleItem(item)}
          >
            <MaterialCommunityIcons
              name={marcado ? "checkbox-marked" : "checkbox-blank-outline"}
              size={26}
              color={marcado ? theme.colors.cards : "#94A3B8"}
            />

            <Text style={styles.itemTexto}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.push("/(drawer)/(gestantes)/(tabs)/gestacao" as any)
          }
          style={styles.headerLeft}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.tituloHeader}>Plano de Parto</Text>

        <TouchableOpacity onPress={gerarPDF} style={styles.headerRight}>
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={30}
            color={theme.colors.cards}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoTop}>
              <MaterialCommunityIcons
                name="heart-pulse"
                size={30}
                color={theme.colors.cards}
              />
              <Text style={styles.infoTitulo}>O que é o Plano de Parto?</Text>
            </View>
            <Text style={styles.infoTexto}>
              O Plano de Parto é um documento onde a gestante registra seus
              desejos, preferências e escolhas para o nascimento do bebê.
            </Text>
            <Text style={styles.infoTexto}>
              Algumas decisões podem ser escolhidas pela mãe, enquanto outras
              dependem da segurança da mãe, do bebê e da avaliação médica.
            </Text>
          </View>

          <View style={styles.cardFormulario}>
            <Text style={styles.tituloSecao}>Preencha suas preferências</Text>
            <Text style={styles.label}>Tipo de Parto</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              activeOpacity={0.7}
              onPress={() => setModalSeletorVisivel(true)}
            >
              <Text style={styles.dropdownText}>{tipoParto}</Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
                color="#64748B"
              />
            </TouchableOpacity>

            <Text style={styles.label}>Acompanhantes</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Parceiro, mãe, doula..."
              placeholderTextColor="#94A3B8"
              value={acompanhantes}
              onChangeText={setAcompanhantes}
            />

            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Digite suas preferências..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={observacoes}
              onChangeText={setObservacoes}
            />

            <Text style={styles.guiaTitulo}>
              Minhas Escolhas e Preferências
            </Text>

            {renderChecklist(
              "👨‍👩‍👧 Acompanhantes",
              acompanhantesItens,
              "account-group",
            )}
            {renderChecklist(
              "🌙 Ambiente do Parto",
              ambienteItens,
              "weather-night",
            )}
            {renderChecklist(
              "🚶‍♀️ Liberdade de Movimento",
              liberdadeItens,
              "walk",
            )}
            {renderChecklist("🌸 Métodos Naturais", alivioDorItens, "flower")}
            {renderChecklist(
              "💉 Analgesia e Anestesia",
              analgesiaItens,
              "needle",
            )}
            {renderChecklist(
              "🤱 Contato com o Bebê",
              contatoBebeItens,
              "baby-face-outline",
            )}
            {renderChecklist("✂️ Cordão Umbilical", cordaoItens, "content-cut")}
            {renderChecklist(
              "👶 Cuidados com o Bebê",
              bebeItens,
              "baby-bottle-outline",
            )}

            {(tipoParto === "Cesárea" || tipoParto === "Ainda não decidi") &&
              renderChecklist(
                "🏥 Caso seja necessária cesárea",
                cesareaItens,
                "hospital",
              )}

            <Text style={styles.alertaTitulo}>O que pode precisar mudar</Text>

            {renderChecklist(
              "⚠️ Situações de Emergência",
              emergenciaItens,
              "alert",
            )}
            {renderChecklist(
              "🩺 Procedimentos Médicos",
              procedimentosItens,
              "medical-bag",
            )}
            {renderChecklist(
              "👶 Cuidados Especiais",
              cuidadosEspeciaisItens,
              "hospital-box",
            )}

            <View style={styles.importanteCard}>
              <Text style={styles.importanteTitulo}>Importante</Text>
              <Text style={styles.importanteTexto}>
                Este plano de parto não é uma ordem médica e pode sofrer
                alterações caso existam riscos para mãe ou bebê.
              </Text>
              <Text style={styles.importanteTexto}>
                O objetivo é garantir respeito, diálogo e participação nas
                decisões.
              </Text>
            </View>

            <TouchableOpacity
              onPress={salvarPlano}
              activeOpacity={0.8}
              style={{ marginTop: 10 }}
            >
              <View
                style={[
                  styles.saveButton,
                  { backgroundColor: theme.colors.cards },
                ]}
              >
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>Guardar Plano</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={gerarPDF}
              activeOpacity={0.8}
              style={styles.pdfButton}
            >
              <MaterialCommunityIcons
                name="export-variant"
                size={20}
                color={theme.colors.cards}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[styles.pdfButtonText, { color: theme.colors.cards }]}
              >
                Exportar PDF
              </Text>
            </TouchableOpacity>

            <View style={styles.cardsContainer}>
              <Text style={styles.cardsTitle}>Conheça os tipos de parto</Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.partoCard}
                onPress={() =>
                  router.push("/dicasPage/(partos)/Partonormal" as any)
                }
              >
                <View
                  style={[styles.iconParto, { backgroundColor: "#F3E8FF" }]}
                >
                  <MaterialCommunityIcons
                    name="human-pregnant"
                    size={28}
                    color="#9333EA"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partoTitle}>Parto Normal</Text>
                  <Text style={styles.partoDesc}>
                    Conheça o parto vaginal e seus benefícios.
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color="#9333EA"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.partoCard}
                onPress={() =>
                  router.push("/dicasPage/(partos)/Cesarea" as any)
                }
              >
                <View
                  style={[styles.iconParto, { backgroundColor: "#FCE7F3" }]}
                >
                  <MaterialCommunityIcons
                    name="hospital-box-outline"
                    size={28}
                    color="#DB2777"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partoTitle}>Cesárea</Text>
                  <Text style={styles.partoDesc}>
                    Saiba como funciona a cirurgia cesariana.
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color="#DB2777"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.partoCard}
                onPress={() =>
                  router.push("/dicasPage/(partos)/PartoHumanizado" as any)
                }
              >
                <View
                  style={[styles.iconParto, { backgroundColor: "#E0F2FE" }]}
                >
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={28}
                    color="#0284C7"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partoTitle}>Parto Humanizado</Text>
                  <Text style={styles.partoDesc}>
                    Entenda o parto com acolhimento e respeito.
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color="#0284C7"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.partoCard}
                onPress={() =>
                  router.push("/dicasPage/(partos)/PartoNaAgua" as any)
                }
              >
                <View
                  style={[styles.iconParto, { backgroundColor: "#DCFCE7" }]}
                >
                  <MaterialCommunityIcons
                    name="waves"
                    size={28}
                    color="#16A34A"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partoTitle}>Parto na Água</Text>
                  <Text style={styles.partoDesc}>
                    Descubra os benefícios do parto na água.
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color="#16A34A"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalSeletorVisivel} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalSeletorVisivel(false)}
        >
          <View style={styles.modalSeletorContent}>
            <Text style={styles.modalSeletorTitulo}>
              Escolha o tipo de parto
            </Text>

            {OPCOES_PARTO.map((opcao, index) => (
              <TouchableOpacity
                key={index}
                style={styles.opcaoBotao}
                onPress={() => {
                  setTipoParto(opcao);
                  setModalSeletorVisivel(false);
                }}
              >
                <Text
                  style={[
                    styles.opcaoTexto,
                    tipoParto === opcao && styles.opcaoTextoAtiva,
                  ]}
                >
                  {opcao}
                </Text>
                {tipoParto === opcao && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={theme.colors.cards}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F3E8FF",
  },
  infoTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  infoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginLeft: 12,
  },
  infoTexto: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 24,
    marginBottom: 10,
  },
  cardFormulario: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#1E293B",
    marginBottom: 20,
  },
  textArea: {
    height: 120,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1E293B",
  },
  guiaTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 20,
    marginTop: 10,
  },
  alertaTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#DC2626",
    marginTop: 10,
    marginBottom: 18,
  },
  sectionCard: {
    backgroundColor: "#FAF5FF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: "#4C1D95",
  },
  itemLinha: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  itemTexto: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  importanteCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    padding: 18,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  importanteTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 10,
  },
  importanteTexto: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 22,
    marginBottom: 8,
  },
  saveButton: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  pdfButton: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    backgroundColor: "#FDF2F8",
    borderWidth: 1,
    borderColor: "#FBCFE8",
  },
  pdfButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cardsContainer: {
    marginTop: 28,
  },
  cardsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 16,
  },
  partoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconParto: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  partoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  partoDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    paddingRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSeletorContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
  },
  modalSeletorTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  opcaoBotao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  opcaoTexto: {
    fontSize: 16,
    color: "#475569",
  },
  opcaoTextoAtiva: {
    fontWeight: "bold",
    color: theme.colors.cards,
  },
});
