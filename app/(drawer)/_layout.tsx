import Menulateral from "@/src/components/(menu)/Menulateral";
import { AuthProvider } from "@/src/context/AuthContext";
import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Drawer
        drawerContent={(props) => <Menulateral {...(props as any)} />}
        screenOptions={{
          headerShown: false,
          drawerType: "slide",
          drawerStyle: {
            width: "80%",
          },
        }}
      >
        <Drawer.Screen name="(pai)" />
        <Drawer.Screen name="(gestacao)" />
      </Drawer>
    </AuthProvider>
  );
}
