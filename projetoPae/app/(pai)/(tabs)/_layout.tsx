import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PaiTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,

        tabBarStyle: {
          height: 60,
          backgroundColor: "#ece3ff",
          borderTopWidth: 0.5,
          borderTopColor: "#ddd",
        },

        tabBarActiveTintColor: "#16004f",
        tabBarInactiveTintColor: "#6f50b397",
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