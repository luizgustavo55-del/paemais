import { Drawer } from "expo-router/drawer";
import CustomDrawer from "@/src/components/CustomDrawer";
import { AuthProvider } from "@/src/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
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