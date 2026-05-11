import React from "react";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { theme } from "@/src/constants/theme";

export default function Menulateral(
  props: DrawerContentComponentProps
) {
  const router = useRouter();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://i.pravatar.cc/300",
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.nome}>Usuário</Text>

        <Text style={styles.email}>
          usuario@email.com
        </Text>
      </View>

      {/* MENU */}
      <View style={styles.menuContainer}>
        {props.state ? (
          <DrawerItemList {...props} />
        ) : null}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => router.replace("/")}
        >
          <Feather
            name="log-out"
            size={20}
            color="#FFF"
          />

          <Text style={styles.logoutText}>
            Sair
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: theme.colors.cards,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  avatarContainer: {
    marginBottom: 12,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  nome: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },

  email: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  menuContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },

  footer: {
    padding: 20,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 14,
  },

  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});