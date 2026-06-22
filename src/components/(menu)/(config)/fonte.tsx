import { TamanhoOpcao, useTheme } from "@/src/context/ThemeContext";
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
    View
} from "react-native";

interface TamanhoFonteProps {
  visivel: boolean;
  fechar: () => void;
}

export function TamanhoFonte({ visivel, fechar }: TamanhoFonteProps) {
  const { theme, mudarTamanhoFonte, tamanhoAtual } = useTheme();
  const [loading, setLoading] = useState(false);
  const styles = getStyles(theme);

  const handleSalvar = async (tamanho: TamanhoOpcao) => {
    try {
      setLoading(true);

      mudarTamanhoFonte(tamanho);

      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(firestore, "usuarios", user.uid);
      await updateDoc(userDocRef, {
        "configuracoes.tamanhoFonte": tamanho,
      });
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar sua preferência no servidor.",
      );
    } finally {
      setLoading(false);
      fechar();
    }
  };

  const OpcaoFonte = ({
    titulo,
    valor,
    tamanhoExemplo,
  }: {
    titulo: string;
    valor: TamanhoOpcao;
    tamanhoExemplo: number;
  }) => {
    const isSelecionado = tamanhoAtual === valor;

    return (
      <TouchableOpacity
        style={[
          styles.opcaoContainer,
          isSelecionado && styles.opcaoSelecionada,
        ]}
        onPress={() => handleSalvar(valor)}
        disabled={loading}
      >
        <Text style={[styles.textoExemplo, { fontSize: tamanhoExemplo }]}>
          Aa
        </Text>
        <Text
          style={[
            styles.textoOpcao,
            isSelecionado && styles.textoOpcaoSelecionada,
          ]}
        >
          {titulo}
        </Text>
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
            <Text style={styles.title}>Tamanho da Fonte</Text>
            <TouchableOpacity onPress={fechar} disabled={loading}>
              <Feather name="x" size={24} color={theme.colors.textMenu} />
            </TouchableOpacity>
          </View>

          <View style={styles.opcoesWrapper}>
            <OpcaoFonte titulo="Pequeno" valor="pequeno" tamanhoExemplo={14} />
            <OpcaoFonte titulo="Padrão" valor="padrao" tamanhoExemplo={18} />
            <OpcaoFonte titulo="Grande" valor="grande" tamanhoExemplo={24} />
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
    textoExemplo: {
      color: theme.colors.title,
      fontWeight: "500",
      marginRight: 15,
      width: 30,
      textAlign: "center",
    },
    textoOpcao: {
      flex: 1,
      fontSize: theme.texts.text,
      color: theme.colors.textMenu,
    },
    textoOpcaoSelecionada: {
      color: theme.colors.gestantesPrimary,
      fontWeight: "bold",
    },
  });
