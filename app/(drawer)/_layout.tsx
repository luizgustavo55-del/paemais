import CustomDrawer from "@/src/components/(menu)/CustomDrawer";
import Menulateral from "@/src/components/(menu)/Menulateral";
import { useAuth } from "@/src/context/AuthContext";
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  const { user } = useAuth();

  return (
    <Drawer
      drawerContent={(props) => {
        if (user?.tipo === "pai") {
          return <CustomDrawer {...(props as any)} />;
        } else {
          return <Menulateral {...(props as any)} />;
        }
      }}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerStyle: {
          width: user?.tipo === "pai" ? "60%" : "90%",
        },
      }}
    >
      <Drawer.Screen name="(pais)" />
      <Drawer.Screen name="(gestantes)" />
    </Drawer>
  );
}
