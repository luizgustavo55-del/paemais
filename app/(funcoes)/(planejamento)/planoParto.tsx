import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { firestore } from "@/src/services/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  useWindowDimensions,
} from "react-native";

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
  const { theme } = useTheme();

  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;

  const styles = getStyles(theme, isModoCompacto);

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
        Alert.alert("Sucesso", "Plano salvo com sucesso!");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar plano.");
    }
  };

  const gerarPDF = async () => {
    const itensMarcados = selecionados
      .map(
        (item) => `<li style="margin-bottom:8px; color: #793459;">${item}</li>`,
      )
      .join("");

    const html = `
      <html>
      <body style="font-family: Arial; padding:40px; background-color: #FFF7FB;">
      
      <h1 style="color:#C85C90; border-bottom: 2px solid #F5D3E3; padding-bottom: 10px;">
      Meu Plano de Parto
      </h1>

      <h2 style="color:#8D3E67;">Tipo de Parto</h2>
      <p style="color:#4A4A4A; font-size: 16px;">${tipoParto}</p>

      <h2 style="color:#8D3E67;">Acompanhantes</h2>
      <p style="color:#4A4A4A; font-size: 16px;">${acompanhantes || "Não especificado"}</p>

      <h2 style="color:#8D3E67;">Observações Gerais</h2>
      <p style="color:#4A4A4A; font-size: 16px;">${observacoes || "Nenhuma observação adicional"}</p>

      <h2 style="color:#8D3E67;">Minhas Preferências</h2>
      <ul style="font-size: 16px;">
        ${itensMarcados || "<li style='color: #793459;'>Nenhuma preferência marcada</li>"}
      </ul>

      <p style="margin-top: 50px; font-size: 12px; color: #9C7388; text-align: center;">
        Este documento expressa os desejos da gestante e deve ser alinhado com a equipe médica.
      </p>
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
    "Contato pele a pele logo ao nascer",
    "Amamentar na primeira hora de vida",
    "Permanecer com o bebê o tempo todo",
  ];

  const cordaoItens = [
    "Aguardar o cordão parar de pulsar para cortar",
    "Escolher quem irá cortar o cordão",
  ];

  const bebeItens = [
    "Amamentação em livre demanda",
    "Não oferecer chupeta ou fórmulas sem autorização",
    "Alojamento conjunto integral",
    "Participar dos primeiros cuidados (banho, etc)",
  ];

  const cesareaItens = [
    "Presença garantida do acompanhante",
    "Ambiente silencioso e respeitoso",
    "Permanecer acordada durante o procedimento",
    "Campo cirúrgico rebaixado para ver o bebê nascer",
    "Contato pele a pele imediato na sala de cirurgia",
  ];

  const emergenciaItens = [
    "Ser informada claramente sobre os riscos",
    "Ter as opções explicadas antes de qualquer intervenção",
  ];

  const procedimentosItens = [
    "Evitar Ocitocina sintética de rotina",
    "Monitoramento fetal intermitente (não contínuo)",
    "Evitar rompimento artificial da bolsa",
    "Evitar Episiotomia (corte vaginal) de rotina",
  ];

  const cuidadosEspeciaisItens = [
    "Permitir acompanhante caso o bebê vá para UTI",
    "Facilitar a extração de leite caso o bebê não possa sugar",
  ];

  const renderChecklist = (titulo: string, itens: string[], icon: string) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialCommunityIcons
            name={icon as any}
            size={isModoCompacto ? 20 : 22}
            color={theme.colors.gestantesPrimary}
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
              size={isModoCompacto ? 24 : 26}
              color={marcado ? theme.colors.gestantesPrimary : "#D48CAE"}
            />

            <Text
              style={[styles.itemTexto, marcado && styles.itemTextoMarcado]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerLeft}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={isModoCompacto ? 24 : 28}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <Text style={styles.tituloHeader}>Plano de Parto</Text>

        <TouchableOpacity onPress={gerarPDF} style={styles.headerRight}>
          <MaterialCommunityIcons
            name="printer"
            size={isModoCompacto ? 22 : 24}
            color={theme.colors.text}
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
                size={isModoCompacto ? 26 : 30}
                color={theme.colors.gestantesPrimary}
              />
              <Text style={styles.infoTitulo}>O que é o Plano de Parto?</Text>
            </View>
            <Text style={styles.infoTexto}>
              O Plano de Parto é um documento onde a gestante registra seus
              desejos, preferências e escolhas para o nascimento do bebê.
            </Text>
            <Text style={styles.infoTexto}>
              Lembre-se: o objetivo é garantir respeito e diálogo, mas algumas
              decisões podem mudar para a segurança da mãe e do bebê.
            </Text>
          </View>

          <View style={styles.cardFormulario}>
            <Text style={styles.tituloSecao}>Preencha suas preferências</Text>

            <Text style={styles.label}>Tipo de Parto Desejado</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              activeOpacity={0.7}
              onPress={() => setModalSeletorVisivel(true)}
            >
              <Text style={styles.dropdownText}>{tipoParto}</Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={isModoCompacto ? 22 : 24}
                color="#8D3E67"
              />
            </TouchableOpacity>

            <Text style={styles.label}>Acompanhantes</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Parceiro, mãe, doula..."
              placeholderTextColor="#A2748B"
              value={acompanhantes}
              onChangeText={setAcompanhantes}
            />

            <Text style={styles.label}>Observações Extras</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Digite outras preferências ou recados para a equipe..."
              placeholderTextColor="#A2748B"
              multiline
              textAlignVertical="top"
              value={observacoes}
              onChangeText={setObservacoes}
            />

            <Text style={styles.guiaTitulo}>Checklist de Preferências</Text>

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
              "👶 Cuidados Iniciais",
              bebeItens,
              "baby-bottle-outline",
            )}

            {(tipoParto === "Cesárea" || tipoParto === "Ainda não decidi") &&
              renderChecklist(
                "🏥 Caso seja necessária Cesárea",
                cesareaItens,
                "hospital-box",
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
              "👶 Cuidados Especiais (UTI)",
              cuidadosEspeciaisItens,
              "hospital-building",
            )}

            <View style={styles.importanteCard}>
              <View style={styles.infoTop}>
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color="#D32F2F"
                />
                <Text style={styles.importanteTitulo}>Importante</Text>
              </View>
              <Text style={styles.importanteTexto}>
                Este plano de parto não é uma ordem médica e pode sofrer
                alterações em caso de emergência ou risco à saúde.
              </Text>
            </View>

            <TouchableOpacity
              onPress={salvarPlano}
              activeOpacity={0.8}
              style={styles.saveButton}
            >
              <MaterialCommunityIcons
                name="content-save"
                size={isModoCompacto ? 20 : 22}
                color={theme.colors.text}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveButtonText}>Guardar Meu Plano</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={gerarPDF}
              activeOpacity={0.8}
              style={styles.pdfButton}
            >
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={isModoCompacto ? 20 : 22}
                color={theme.colors.gestantesPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.pdfButtonText}>Exportar Plano em PDF</Text>
            </TouchableOpacity>

            <View style={styles.cardsContainer}>
              <Text style={styles.cardsTitle}>Conheça os tipos de parto</Text>

              {/* PARTO NORMAL */}
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
                    size={isModoCompacto ? 24 : 28}
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
                  size={isModoCompacto ? 24 : 28}
                  color="#9333EA"
                />
              </TouchableOpacity>

              {/* CESÁREA */}
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
                    size={isModoCompacto ? 24 : 28}
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
                  size={isModoCompacto ? 24 : 28}
                  color="#DB2777"
                />
              </TouchableOpacity>

              {/* PARTO HUMANIZADO */}
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
                    size={isModoCompacto ? 24 : 28}
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
                  size={isModoCompacto ? 24 : 28}
                  color="#0284C7"
                />
              </TouchableOpacity>

              {/* PARTO NA ÁGUA */}
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
                    size={isModoCompacto ? 24 : 28}
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
                  size={isModoCompacto ? 24 : 28}
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
                    size={isModoCompacto ? 20 : 22}
                    color={theme.colors.gestantesPrimary}
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

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFF7FB",
    },
    header: {
      height: isModoCompacto ? 70 : 92,
      paddingTop: isModoCompacto ? 20 : 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      backgroundColor: theme.colors.gestantesPrimary,
      shadowColor: "#8E3D68",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    headerLeft: {
      width: isModoCompacto ? 34 : 40,
      height: isModoCompacto ? 34 : 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.20)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerRight: {
      width: isModoCompacto ? 34 : 40,
      height: isModoCompacto ? 34 : 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.20)",
      alignItems: "center",
      justifyContent: "center",
    },
    tituloHeader: {
      fontSize: isModoCompacto ? theme.texts.subtitle : theme.texts.title,
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: 0.2,
    },
    scrollContent: {
      padding: isModoCompacto ? 16 : 22,
      paddingBottom: 40,
    },
    infoCard: {
      backgroundColor: "#FFF9FC",
      borderRadius: 22,
      padding: isModoCompacto ? 16 : 20,
      marginBottom: isModoCompacto ? 16 : 20,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowColor: "#A64D78",
      shadowOpacity: 0.04,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    infoTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isModoCompacto ? 10 : 12,
    },
    infoTitulo: {
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#8D3E67",
      marginLeft: 10,
    },
    infoTexto: {
      fontSize: theme.texts.text,
      color: "#9C7388",
      lineHeight: isModoCompacto ? 20 : 22,
      marginBottom: 8,
    },
    cardFormulario: {
      backgroundColor: "#FFF9FC",
      borderRadius: 24,
      padding: isModoCompacto ? 16 : 22,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowColor: "#A64D78",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    tituloSecao: {
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#793459",
      marginBottom: isModoCompacto ? 16 : 20,
    },
    label: {
      fontSize: theme.texts.text,
      color: "#91486F",
      marginBottom: 8,
      fontWeight: "600",
    },
    input: {
      backgroundColor: "#FDEAF2",
      borderWidth: 1,
      borderColor: "#F5D3E3",
      borderRadius: 16,
      padding: 15,
      fontSize: theme.texts.text,
      color: "#8D3E67",
      marginBottom: isModoCompacto ? 16 : 20,
    },
    textArea: {
      height: isModoCompacto ? 100 : 120,
    },
    dropdownButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#FDEAF2",
      borderWidth: 1,
      borderColor: "#F5D3E3",
      borderRadius: 16,
      padding: 15,
      marginBottom: isModoCompacto ? 16 : 20,
    },
    dropdownText: {
      fontSize: theme.texts.text,
      color: "#8D3E67",
    },
    guiaTitulo: {
      fontSize: theme.texts.title,
      fontWeight: "700",
      color: "#793459",
      marginBottom: isModoCompacto ? 16 : 20,
      marginTop: 10,
    },
    alertaTitulo: {
      fontSize: theme.texts.title,
      fontWeight: "700",
      color: "#E11D48",
      marginTop: 20,
      marginBottom: isModoCompacto ? 14 : 18,
    },
    sectionCard: {
      backgroundColor: "#FDEAF2",
      borderRadius: 20,
      padding: isModoCompacto ? 14 : 18,
      marginBottom: isModoCompacto ? 14 : 18,
      borderWidth: 1,
      borderColor: "#F5D3E3",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isModoCompacto ? 12 : 16,
    },
    sectionIcon: {
      width: isModoCompacto ? 38 : 44,
      height: isModoCompacto ? 38 : 44,
      borderRadius: 14,
      backgroundColor: "#FFF9FC",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: "#F5D3E3",
    },
    sectionTitle: {
      flex: 1,
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#8D3E67",
    },
    itemLinha: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: isModoCompacto ? 10 : 14,
    },
    itemTexto: {
      flex: 1,
      marginLeft: 12,
      fontSize: theme.texts.text,
      lineHeight: isModoCompacto ? 20 : 22,
      color: "#9C7388",
    },
    itemTextoMarcado: {
      color: "#8D3E67",
      fontWeight: "600",
    },
    importanteCard: {
      backgroundColor: "#FFF5F5",
      borderRadius: 20,
      padding: isModoCompacto ? 16 : 20,
      marginTop: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#FECDD3",
    },
    importanteTitulo: {
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#BE123C",
      marginLeft: 10,
    },
    importanteTexto: {
      fontSize: theme.texts.text,
      color: "#9F1239",
      lineHeight: isModoCompacto ? 20 : 22,
    },
    saveButton: {
      flexDirection: "row",
      backgroundColor: theme.colors.gestantesPrimary,
      padding: isModoCompacto ? 14 : 16,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#A64D78",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: theme.texts.subtitle,
      letterSpacing: 0.2,
    },
    pdfButton: {
      flexDirection: "row",
      padding: isModoCompacto ? 14 : 16,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginTop: isModoCompacto ? 12 : 15,
      backgroundColor: "#FDEAF2",
      borderWidth: 1,
      borderColor: "#F5D3E3",
    },
    pdfButtonText: {
      fontWeight: "700",
      fontSize: theme.texts.subtitle,
      color: theme.colors.gestantesPrimary,
    },
    cardsContainer: {
      marginTop: isModoCompacto ? 26 : 34,
      borderTopWidth: 1,
      borderTopColor: "#F5D3E3",
      paddingTop: 20,
    },
    cardsTitle: {
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#793459",
      marginBottom: isModoCompacto ? 14 : 18,
    },
    partoCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF9FC",
      borderRadius: 20,
      padding: isModoCompacto ? 14 : 18,
      marginBottom: isModoCompacto ? 12 : 14,
      borderWidth: 1,
      borderColor: "#F5D3E3",
    },
    iconParto: {
      width: isModoCompacto ? 48 : 56,
      height: isModoCompacto ? 48 : 56,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    partoTitle: {
      fontSize: theme.texts.subtitle,
      fontWeight: "700",
      color: "#8D3E67",
      marginBottom: 4,
    },
    partoDesc: {
      fontSize: theme.texts.text,
      color: "#9C7388",
      lineHeight: isModoCompacto ? 18 : 20,
      paddingRight: 10,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.40)",
      justifyContent: "flex-end",
    },
    modalSeletorContent: {
      backgroundColor: "#FFF9FC",
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: 26,
      paddingHorizontal: 24,
      paddingBottom: isModoCompacto ? 20 : 40,
    },
    modalSeletorTitulo: {
      fontSize: theme.texts.title,
      fontWeight: "700",
      color: "#91486F",
      marginBottom: 20,
      textAlign: "center",
    },
    opcaoBotao: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: isModoCompacto ? 14 : 16,
      borderBottomWidth: 1,
      borderBottomColor: "#F5D3E3",
    },
    opcaoTexto: {
      fontSize: theme.texts.text,
      color: "#9C7388",
    },
    opcaoTextoAtiva: {
      fontWeight: "700",
      color: theme.colors.gestantesPrimary,
    },
  });
