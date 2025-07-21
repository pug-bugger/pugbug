import CustomButton from "@/components/ui/CustomButton";
import NotificationBanner from "@/components/ui/NotificationBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterScreen() {
  const { register, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<
    "error" | "success" | "warning" | "info"
  >("error");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register(email, password);
      setNotificationText("Registration successful! Redirecting to login...");
      setNotificationType("success");
      setShowNotification(true);
      setTimeout(() => {
        router.replace("./login");
      }, 1000);
    } catch (e) {
      setNotificationText(
        `${e.message || "Registration failed"} | ${e.code || "Unknown error"}`
      );
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerBg} />
      <View style={styles.card}>
        <Text style={styles.title}>Sign up</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Phone (optional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <CustomButton type="auth" onPress={handleRegister} title="Sign Up" />
        <Text style={styles.terms}>
          By clicking this button, you agree with our{" "}
          <Text style={styles.link}>Terms and Conditions</Text>
        </Text>
        <View style={styles.socialRow}>
          <CustomButton type="default" onPress={() => {}} title="Google" />
          <CustomButton type="default" onPress={() => {}} title="Facebook" />
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("./login")}>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </View>
      </View>
      <NotificationBanner
        message={notificationText}
        type={notificationType}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf6f0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: "#5b7fff",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  card: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
    alignItems: "stretch",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  terms: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  link: {
    color: "#5b7fff",
    fontWeight: "600",
    fontSize: 14,
  },
  error: {
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 8,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    gap: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  bottomText: {
    color: "#888",
    fontSize: 14,
  },
});
