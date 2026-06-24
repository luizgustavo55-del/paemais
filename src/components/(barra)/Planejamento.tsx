import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function Planejamento() {
  const router = useRouter();
  const { theme } = useTheme();

  const { height } = useWindowDimensions();
  const isModoCompacto = height < 600;

  const styles = getStyles(theme, isModoCompacto);

  // A lista foi movida para dentro para aceder ao 'theme' dinâmico
  const itens = [
    {
      title: "Consultas & Exames",
      icon: "calendar-month",
      color: theme.colors.gestantesSecondary,
      iconColor: "#2196F3",
      route: "/(funcoes)/(planejamento)/Con&exam",
    },
    {
      title: "Checklist do Enxoval",
      icon: "shopping-outline",
      color: theme.colors.gestantesSecondary,
      iconColor: "#E91E63",
      route: "/(funcoes)/(planejamento)/enxoval",
    },
    {
      title: "Plano de Parto",
      icon: "file-document-outline",
      color: theme.colors.gestantesSecondary,
      iconColor: "#9C27B0",
      route: "/(funcoes)/(planejamento)/planoParto",
    },
  ];

  return (
    <View style={styles.container}>
      {itens.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.listItem}
          onPress={() => router.push(item.route as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBox, { backgroundColor: item.color }]}>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={isModoCompacto ? 22 : 24}
              color={item.iconColor}
            />
          </View>

          <Text style={styles.itemText}>{item.title}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#CCC" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const getStyles = (theme: any, isModoCompacto: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: isModoCompacto ? 12 : 16,
      backgroundColor: "#FFF7FB",
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.gestantesCard,
      padding: isModoCompacto ? 14 : 16,
      borderRadius: 16,
      marginBottom: isModoCompacto ? 10 : 12,
      borderWidth: 1,
      borderColor: "#F5D3E3",
      shadowColor: "#A64D78",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    iconBox: {
      padding: isModoCompacto ? 8 : 10,
      borderRadius: 12,
      marginRight: 15,
    },
    itemText: {
      flex: 1,
      fontSize: theme.texts.subtitle,
      color: theme.colors.text,
      fontWeight: "600",
    },
  });
