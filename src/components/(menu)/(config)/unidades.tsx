import { useTheme } from "@/src/context/ThemeContext";
import { SistemaUnidade, useUnit } from "@/src/context/UnitContext";
import { auth, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface UnidadesProps {
  visivel: boolean;
  fechar: () => void;
}

export function EscolhaUnidades({ visivel, fechar }: UnidadesProps) {
  const { theme } = useTheme();
  const { unidadeAtual, mudarUnidade } = useUnit();
  const [loading, setLoading] = useState(false);
  const styles = getStyles(theme);

  const handleSalvar = async (unidade: SistemaUnidade) => {
    try {
      setLoading(true);
      mudarUnidade(unidade);

      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(firestore, "usuarios", user.uid);
      await updateDoc(userDocRef, {
        "configuracoes.sistemaUnidade": unidade,
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar sua preferência.");
    } finally {
      setLoading(false);
      fechar();
    }
  };

  const OpcaoUnidade = ({
    titulo,
    subtitulo,
    valor,
  }: {
    titulo: string;
    subtitulo: string;
    valor: SistemaUnidade;
  }) => {
    const isSelecionado = unidadeAtual === valor;

    return (
      <TouchableOpacity
        style={[
          styles.opcaoContainer,
          isSelecionado && styles.opcaoSelecionada,
        ]}
        onPress={() => handleSalvar(valor)}
        disabled={loading}
      >
        <View style={styles.textosWrapper}>
          <Text
            style={[
              styles.textoOpcao,
              isSelecionado && styles.textoOpcaoSelecionada,
            ]}
          >
            {titulo}
          </Text>
          <Text style={styles.textoSub}>{subtitulo}</Text>
        </View>
        {isSelecionado && (
          <Feather
            name="check"
            size={20}
            color={theme.colors.gestantesPrimary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visivel} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Sistema de Unidades</Text>
            <TouchableOpacity onPress={fechar} disabled={loading}>
              <Feather name="x" size={24} color={theme.colors.textMenu} />
            </TouchableOpacity>
          </View>

          <View style={styles.opcoesWrapper}>
            <OpcaoUnidade
              titulo="Métrico (Padrão)"
              subtitulo="Quilogramas (kg), Centímetros (cm)"
              valor="metrico"
            />
            <OpcaoUnidade
              titulo="Imperial"
              subtitulo="Libras (lb), Polegadas (in)"
              valor="imperial"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.text,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.subtitle,
    },
    title: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.textMenu,
    },
    opcoesWrapper: {
      gap: 15,
    },
    opcaoContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.subtitle,
    },
    opcaoSelecionada: {
      borderColor: theme.colors.gestantesPrimary,
      backgroundColor: "rgba(139, 47, 97, 0.05)",
    },
    textosWrapper: {
      flex: 1,
    },
    textoOpcao: {
      fontSize: theme.texts.text,
      color: theme.colors.textMenu,
    },
    textoOpcaoSelecionada: {
      color: theme.colors.gestantesPrimary,
      fontWeight: "bold",
    },
    textoSub: {
      fontSize: theme.texts.text - 4,
      color: theme.colors.subtitle,
      marginTop: 4,
    },
  });
