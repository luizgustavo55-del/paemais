import { auth, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    SectionList,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { AlterarEmail } from "@/src/components/(menu)/(config)/altEmail";
import { AlterarSenha } from "@/src/components/(menu)/(config)/altSenha";
import { EnviarFeedback } from "@/src/components/(menu)/(config)/enviarFeedback";
import { ExcluirConta } from "@/src/components/(menu)/(config)/excluirConta";
import { TamanhoFonte } from "@/src/components/(menu)/(config)/fonte";
import { HoraDescanso } from "@/src/components/(menu)/(config)/horaDescanso";
import { SonsVibracao } from "@/src/components/(menu)/(config)/sons&vibra";
import { TrocarConta } from "@/src/components/(menu)/(config)/trocarConta";
import { EscolhaUnidades } from "@/src/components/(menu)/(config)/unidades";
import { useTheme } from "@/src/context/ThemeContext";

type ItemProps = {
  id: string;
  title: string;
  subtitle?: string;
  type: "link" | "switch" | "info";
  icon?: keyof typeof Feather.glyphMap;
};

export function Configuracoes() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const version = Constants.expoConfig?.version || "1.0.0";

  const [visivel, setVisivel] = useState(false);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [modalSonsVisivel, setModalSonsVisivel] = useState(false);
  const [modalDescansoVisivel, setModalDescansoVisivel] = useState(false);
  const [modalSenhaVisivel, setModalSenhaVisivel] = useState(false);
  const [modalEmailVisivel, setModalEmailVisivel] = useState(false);
  const [modalContasVisivel, setModalContasVisivel] = useState(false);
  const [modalExcluirVisivel, setModalExcluirVisivel] = useState(false);
  const [modalFonteVisivel, setModalFonteVisivel] = useState(false);
  const [modalUnidadesVisivel, setModalUnidadesVisivel] = useState(false);
  const [modalFeedbackVisivel, setModalFeedbackVisivel] = useState(false);

  useEffect(() => {
    const carregarPreferencias = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userDocRef = doc(firestore, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const dados = userDoc.data();
          if (dados?.configuracoes?.notificacoesAtivas !== undefined) {
            setNotificacoesAtivas(dados.configuracoes.notificacoesAtivas);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (visivel) {
      carregarPreferencias();
    }
  }, [visivel]);

  const handleToggleNotificacoes = async (value: boolean) => {
    setNotificacoesAtivas(value);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userDocRef = doc(firestore, "usuarios", user.uid);

      await updateDoc(userDocRef, {
        "configuracoes.notificacoesAtivas": value,
      });

      if (!value) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      setNotificacoesAtivas(!value);
    }
  };

  const handlePressItem = (id: string) => {
    if ((id === "sons_vib" || id === "descanso") && !notificacoesAtivas) {
      Alert.alert(
        "Aviso",
        "Ative as notificações para poder configurar esta opção.",
      );
      return;
    }

    if (id === "sons_vib") setModalSonsVisivel(true);
    if (id === "descanso") setModalDescansoVisivel(true);
    if (id === "senha") setModalSenhaVisivel(true);
    if (id === "email") setModalEmailVisivel(true);
    if (id === "trocar_conta") setModalContasVisivel(true);
    if (id === "excluir") setModalExcluirVisivel(true);
    if (id === "fonte") setModalFonteVisivel(true);
    if (id === "unidades") setModalUnidadesVisivel(true);
    if (id === "feedback") setModalFeedbackVisivel(true);
  };

  const SECTIONS = [
    {
      title: "Notificações",
      data: [
        { id: "notificacoes", title: "Ativar Notificações", type: "switch" },
        {
          id: "sons_vib",
          title: "Configurar sons e vibração",
          type: "link",
          icon: "bell",
        },
        {
          id: "descanso",
          title: "Hora de descanso",
          subtitle: "Pausar alertas",
          type: "link",
          icon: "moon",
        },
      ] as ItemProps[],
    },
    {
      title: "Privacidade e Segurança",
      data: [
        { id: "senha", title: "Alterar Senha", type: "link", icon: "lock" },
        { id: "email", title: "Alterar Email", type: "link", icon: "mail" },
        {
          id: "trocar_conta",
          title: "Trocar de conta",
          type: "link",
          icon: "refresh-cw",
        },
        {
          id: "excluir",
          title: "Excluir conta",
          type: "link",
          icon: "trash-2",
        },
      ] as ItemProps[],
    },
    {
      title: "Acessibilidade",
      data: [
        { id: "fonte", title: "Tamanho da fonte", type: "link", icon: "type" },
        {
          id: "unidades",
          title: "Escolha de unidades",
          type: "link",
          icon: "sliders",
        },
      ] as ItemProps[],
    },
    {
      title: "Informações do App",
      data: [
        {
          id: "ajuda",
          title: "Central de ajuda",
          type: "link",
          icon: "help-circle",
        },
        {
          id: "feedback",
          title: "Enviar feedback",
          type: "link",
          icon: "message-square",
        },
        { id: "sobre", title: "Sobre o App", type: "link", icon: "smartphone" },
      ] as ItemProps[],
    },
  ];

  const renderItem = ({ item }: { item: ItemProps }) => {
    const dependenteDeNotificacao =
      item.id === "sons_vib" || item.id === "descanso";
    const itemDesativado = dependenteDeNotificacao && !notificacoesAtivas;

    if (item.type === "switch") {
      return (
        <View style={styles.settingItemRow}>
          <View style={styles.textColumn}>
            <Text style={styles.settingItemMain}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingItemSub}>{item.subtitle}</Text>
            )}
          </View>
          <Switch
            value={notificacoesAtivas}
            onValueChange={handleToggleNotificacoes}
            trackColor={{
              true: theme.colors.paisPrimary,
              false: theme.colors.subtitle,
            }}
            thumbColor={
              notificacoesAtivas ? theme.colors.primary : theme.colors.text
            }
          />
        </View>
      );
    }

    if (item.type === "info") {
      return (
        <View style={styles.settingItemRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {item.icon && (
              <Feather
                name={item.icon}
                size={20}
                color={theme.colors.textMenu}
              />
            )}
            <View style={[styles.textColumn, { marginLeft: 15 }]}>
              <Text style={styles.settingItemMain}>{item.title}</Text>
            </View>
          </View>
          {item.subtitle && (
            <Text style={styles.settingItemSubInfo}>{item.subtitle}</Text>
          )}
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.settingLinkItem, itemDesativado && { opacity: 0.4 }]}
        onPress={() => handlePressItem(item.id)}
        disabled={itemDesativado}
      >
        {item.icon && (
          <Feather
            name={item.icon}
            size={20}
            color={
              item.id === "excluir"
                ? theme.colors.paisBackground
                : itemDesativado
                  ? theme.colors.subtitle
                  : theme.colors.textMenu
            }
          />
        )}
        <View style={[styles.textColumn, { marginLeft: 15 }]}>
          <Text
            style={[
              styles.settingItemMain,
              item.id === "excluir" && {
                color: theme.colors.paisBackground,
              },
              itemDesativado && { color: theme.colors.subtitle },
            ]}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={[
                styles.settingItemSub,
                itemDesativado && { color: theme.colors.subtitle },
              ]}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
        <Feather name="chevron-right" size={18} color={theme.colors.subtitle} />
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => setVisivel(true)}
      >
        <Feather name="settings" size={22} color="#333" />
        <Text style={styles.menuItemText}>Configurações</Text>
      </TouchableOpacity>

      <Modal visible={visivel} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurações</Text>
              <TouchableOpacity onPress={() => setVisivel(false)}>
                <Feather name="x" size={24} color={theme.colors.textMenu} />
              </TouchableOpacity>
            </View>
            <SectionList
              sections={SECTIONS}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeaderContainer}>
                  <Text style={styles.sectionTitle}>{title}</Text>
                </View>
              )}
              SectionSeparatorComponent={() => (
                <View style={styles.separator} />
              )}
            />
            <View style={styles.footerVersao}>
              <Text style={styles.textoVersao}>Versão {version}</Text>
            </View>
          </View>
        </View>
      </Modal>

      <SonsVibracao
        visivel={modalSonsVisivel}
        fechar={() => setModalSonsVisivel(false)}
        notificacoesAtivas={notificacoesAtivas}
      />
      <HoraDescanso
        visivel={modalDescansoVisivel}
        fechar={() => setModalDescansoVisivel(false)}
        notificacoesAtivas={notificacoesAtivas}
      />
      <AlterarSenha
        visivel={modalSenhaVisivel}
        fechar={() => setModalSenhaVisivel(false)}
      />
      <AlterarEmail
        visivel={modalEmailVisivel}
        fechar={() => setModalEmailVisivel(false)}
      />
      <TrocarConta
        visivel={modalContasVisivel}
        fechar={() => setModalContasVisivel(false)}
      />
      <ExcluirConta
        visivel={modalExcluirVisivel}
        fechar={() => setModalExcluirVisivel(false)}
      />
      <TamanhoFonte
        visivel={modalFonteVisivel}
        fechar={() => setModalFonteVisivel(false)}
      />
      <EscolhaUnidades
        visivel={modalUnidadesVisivel}
        fechar={() => setModalUnidadesVisivel(false)}
      />
      <EnviarFeedback
        visivel={modalFeedbackVisivel}
        fechar={() => setModalFeedbackVisivel(false)}
      />
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.subtitle,
    },
    menuItemText: {
      marginLeft: 15,
      fontSize: theme.texts.subtitle,
      color: "#333",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.text,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      height: "85%",
      padding: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.subtitle,
    },
    modalTitle: {
      fontSize: theme.texts.title,
      fontWeight: "bold",
      color: theme.colors.textMenu,
    },
    sectionHeaderContainer: {
      marginTop: 20,
      marginBottom: 10,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.subtitle,
    },
    sectionTitle: {
      fontSize: theme.texts.text,
      fontWeight: "700",
      color: theme.colors.paisPrimary, // <-- Alterado para paisPrimary
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    settingItemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    settingLinkItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    textColumn: { flex: 1 },
    settingItemMain: {
      fontSize: theme.texts.text,
      color: theme.colors.title,
      fontWeight: "500",
    },
    settingItemSub: {
      fontSize: theme.texts.text,
      color: theme.colors.subtitle,
      marginTop: 2,
    },
    settingItemSubInfo: {
      fontSize: theme.texts.text,
      color: theme.colors.subtitle,
      fontWeight: "bold",
    },
    separator: {
      height: 5,
    },
    footerVersao: {
      marginTop: 15,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },
    textoVersao: {
      fontSize: theme.texts.text - 4,
      color: theme.colors.subtitle,
    },
  });
