import NotificationSettings from "@/components/NotificationSettings";
import { ThemedView } from "@/components/ThemedView";
import LogoutButton from "@/components/ui/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { Animated, SafeAreaView, StyleSheet } from "react-native";

export default function NotificationsScreen() {
  const { logout } = useAuth();
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Animated.ScrollView
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.contentContainer}>
          <NotificationSettings />
        </ThemedView>

        <ThemedView style={styles.logoutContainer}>
          <LogoutButton onPress={logout} />
        </ThemedView>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  logoutContainer: {
    padding: 16,
    paddingBottom: 80,
  },
});
