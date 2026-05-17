import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

function InitialLayout() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const primeiraRota = segments[0];

    if (!user) {
      if (primeiraRota !== "(login)") {
        router.replace("/(login)/login");
      }
    } else {
      if (!primeiraRota) {
        if (user.tipo === "pai") {
          router.replace("/(drawer)/(pais)/(tabs)/menu");
        } else {
          router.replace("/(drawer)/(gestantes)/(tabs)/gestacao");
        }
      }
    }
  }, [user, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="(funcoes)" />
      <Stack.Screen name="(login)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
