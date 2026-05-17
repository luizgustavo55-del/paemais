import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function PaiTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,

        tabBarStyle: {
          height: 60,
          backgroundColor: "#a183e2",
          borderTopWidth: 0.5,
          borderTopColor: "#987fce",
        },

        tabBarActiveTintColor: "#281f49",
        tabBarInactiveTintColor: "#583d91e0",
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="comunidade"
        options={{
          title: "Comunidade",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="dicas"
        options={{
          title: "Dicas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
