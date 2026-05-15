import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="gestacao"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="baby" size={24} color={color} />
          ),
        }}
      />


      <Tabs.Screen
        name="dicas"
        options={{
          title: "Dicas",
          tabBarIcon: ({ color }) => (
           <Ionicons name="bulb-outline" size={24 } color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="comunidades"
        options={{
          title: "Comunidade",
          tabBarIcon: ({ color }) => (
             <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
