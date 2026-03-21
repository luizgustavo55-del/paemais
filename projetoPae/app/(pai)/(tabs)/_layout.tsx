import { Stack, Tabs } from "expo-router";

export default function PaiTabs() {
  return (
    <Tabs>
      <Tabs.Screen name="menu" options={{ title: "Menu" }} />
      <Tabs.Screen name="comunidade" options={{ title: "Comunidade" }} />
      <Tabs.Screen name="dicas" options={{ title: "Dicas" }} />
    </Tabs> 
  );
}