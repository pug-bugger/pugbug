import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIconStyle: {
          height: "100%",
        },
        tabBarItemStyle: {
          backgroundColor: "rgba(202, 202, 202, 0.2)",
          margin: 5,
          borderRadius: 50,
          height: 60,
          width: 60,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            marginLeft: "20%",
            marginRight: "20%",
            bottom: 15,
            borderRadius: 50,
            height: 70,
            backgroundColor: "rgba(255,255,255,1)",
            borderWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
          },
          android: {
            position: "absolute",
            marginLeft: "20%",
            marginRight: "20%",
            bottom: 15,
            borderRadius: 50,
            height: 70,
            backgroundColor: "rgba(255,255,255,1)",
            borderWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trucks",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="chevron.left.forwardslash.chevron.right"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
