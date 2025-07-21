import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <ProtectedRoute>
            <Slot />
          </ProtectedRoute>
          <StatusBar style="auto" />
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup =
      segments[0] === undefined ||
      ["login", "register"].includes(segments[0] as string);
    if (!loading && !user && !inAuthGroup) {
      router.replace("/login");
    }
    if (!loading && user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, router]);

  return <>{children}</>;
}
