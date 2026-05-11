import { Tabs } from "expo-router";

export default function GestanteTabs() {
  return (
    <Tabs>
      <Tabs.Screen name="gestacao" options={{ title: "Gestação" }} />
      <Tabs.Screen name="comunidade" options={{ title: "Comunidade" }} />
      <Tabs.Screen name="dicas" options={{ title: "Dicas" }} />
    </Tabs>
  );
}