import { AuthProvider } from "@/src/context/AuthContext";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { UnitProvider } from "@/src/context/UnitContext";
import { Stack } from "expo-router";

export default function Layout() {
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
          </Stack>
        </UnitProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
