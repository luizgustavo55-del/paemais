import { AuthProvider } from "@/src/context/AuthContext";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { UnitProvider } from "@/src/context/UnitContext";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function Layout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("canal_padrao_app", {
        name: "Notificações do Pãe+",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 400, 200, 400],
        lightColor: "#FF231F7C",
        sound: "notificacao.mp3",
      });
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <UnitProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen name="(funcoes)" />
            <Stack.Screen name="(login)" />
            <Stack.Screen name="dicasPage" />
            <Stack.Screen name="MenuPage" />
            <Stack.Screen name="comentarios" />
            <Stack.Screen name="Compartilhar" />
            <Stack.Screen
              name="chat"
              options={{
                headerShown: false,
                title: "Chat",
                animation: "slide_from_right",
              }}
            />
          </Stack>
        </UnitProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
