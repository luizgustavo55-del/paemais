import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const colors = {
  background: "#D46B9D",

  primary: "#C54C86",
  primaryDark: "#9A3E6D",
  primarySoft: "#D982AF",

  cardWhite: "#FFF8FB",
  cardSoft: "#FFF0F6",

  border: "#EDB5CF",

  textSoft: "#92677E",
  textActive: "#8E3564",

  shadow: "#7C3158",
};

function IconBox({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        width: 42,
        height: 32,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.cardSoft : "transparent",
      }}
    >
      {children}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const bottomSpace =
    Platform.OS === "android" ? Math.max(insets.bottom, 14) : insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textSoft,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          backgroundColor: colors.cardWhite,

          height: 64 + bottomSpace,

          paddingTop: 7,
          paddingBottom: bottomSpace,

          borderTopWidth: 1,
          borderTopColor: colors.border,

          shadowColor: colors.shadow,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: -4,
          },

          elevation: 12,
        },

        tabBarLabelStyle: {
          fontSize: 11.5,
          fontWeight: "600",
          marginTop: 1,
          marginBottom: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 3,
        },
      }}
    >
      <Tabs.Screen
        name="gestacao"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <IconBox focused={focused}>
              <FontAwesome5
                name="baby"
                size={focused ? 21 : 19}
                color={color}
              />
            </IconBox>
          ),
        }}
      />

      <Tabs.Screen
        name="dicas"
        options={{
          title: "Dicas",
          tabBarIcon: ({ color, focused }) => (
            <IconBox focused={focused}>
              <Ionicons
                name={focused ? "bulb" : "bulb-outline"}
                size={focused ? 23 : 21}
                color={color}
              />
            </IconBox>
          ),
        }}
      />

      <Tabs.Screen
        name="comunidades"
        options={{
          title: "Comunidade",
          tabBarIcon: ({ color, focused }) => (
            <IconBox focused={focused}>
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={focused ? 23 : 21}
                color={color}
              />
            </IconBox>
          ),
        }}
      />

      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, focused }) => (
            <IconBox focused={focused}>
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={focused ? 23 : 21}
                color={color}
              />
            </IconBox>
          ),
        }}
      />
    </Tabs>
  );
}