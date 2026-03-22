import { Tabs } from "expo-router";

export default function PaiTabs() {
  return (
    <Tabs
     // screenOptions={{
     //   headerShown: false, 
      //}}
    >
      <Tabs.Screen name="menu" options={{ title: "Menu" }} />
      <Tabs.Screen name="comunidade" options={{ title: "Comunidade" }} />
      <Tabs.Screen name="dicas" options={{ title: "Dicas" }} />
    </Tabs>
  );
}