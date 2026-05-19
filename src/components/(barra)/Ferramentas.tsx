import { theme } from "@/src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ferramentas = [
  {
    id: "1",
    title: "Contador de Chutes",
    icon: "pulse",
    color: theme.colors.quaternary,
    iconColor: "#E91E63",
    route: "/(ferramentas)/contador",
  },
  {
    id: "2",
    title: "Cronômetro de Contrações",
    icon: "timer-outline",
    color: theme.colors.quaternary,
    iconColor: "#9C27B0",
    route: "/(ferramentas)/contracoes",
  },
  {
    id: "3",
    title: "Registro de Peso",
    icon: "weight",
    color: theme.colors.quaternary,
    iconColor: "#2196F3",
    route: "/(ferramentas)/peso",
  },
  {
    id: "4",
    title: "Lembretes",
    icon: "bell-outline",
    color: theme.colors.quaternary,
    iconColor: "#fcff41",
    route: "/(ferramentas)/lembretes",
  },
];

export default function Ferramentas() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={ferramentas}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(item.route as any)}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: item.color }]}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={32}
                color={item.iconColor}
              />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  card: {
    flex: 1,
    backgroundColor: theme.colors.terceary,
    margin: 8,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    height: 160,
  },
  iconContainer: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
  },
});
