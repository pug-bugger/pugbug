import CustomButton from "@/components/ui/CustomButton";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
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

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const { showNotification } = useNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      showNotification("Login successful!", "success");
    } catch (e) {
      showNotification("Invalid email or password", "error");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerBg} />
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={8}
          >
            <IconSymbol
              name={showPassword ? "eye" : "eye-off"}
              size={22}
              color="#888"
            />
          </Pressable>
        </View>
        <CustomButton type="auth" onPress={handleLogin} title="Sign In" />
        <Pressable onPress={() => {}} style={styles.linkContainer}>
          <Text style={styles.link}>Forgot your password?</Text>
        </Pressable>
        <View style={styles.socialRow}>
          <CustomButton type="default" onPress={() => {}} title="Google" />
          <CustomButton type="default" onPress={() => {}} title="Facebook" />
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push("./register")}>
            <Text style={styles.link}>Sign up</Text>
          </Pressable>
        </View>
      </View>
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
  linkContainer: {
    alignSelf: "flex-end",
    marginBottom: 12,
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
  socialButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
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
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 4,
    zIndex: 2,
  },
});
