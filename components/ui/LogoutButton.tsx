import { Colors } from "@/constants/Colors";
import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

interface LogoutButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export default function LogoutButton({ onPress, style }: LogoutButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      onPress={onPress}
    >
      <Text style={styles.text}>Logout</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.logoutButton,
    color: Colors.light.logoutButtonText,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
