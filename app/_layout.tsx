import CustomDrawer from "@/src/components/CustomDrawer";
import { AuthProvider } from "@/src/context/AuthContext";
import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...(props as any)} />}
        screenOptions={{
          headerShown: false,
          drawerType: "slide",
          drawerStyle: {
            width: 280,
          },
        }}
      >
        <Drawer.Screen name="(pai)" />
        <Drawer.Screen name="(gestacao)" />
      </Drawer>
    </AuthProvider>
  );
}
