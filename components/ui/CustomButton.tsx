import { Colors } from "@/constants/Colors";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { IconSymbol, type IconSymbolName } from "./IconSymbol";

export type CustomButtonType = "default" | "primary" | "auth";

interface CustomButtonProps {
  title?: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  backgroundColor?: string;
  textColor?: string;
  children?: React.ReactNode;
  icon?: IconSymbolName;
  type?: CustomButtonType;
  disabled?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  style,
  textStyle,
  backgroundColor,
  textColor,
  children,
  icon,
  type = "default",
  disabled = false,
}: CustomButtonProps) {
  // Style presets
  let presetStyles = {};
  let presetTextStyles = {};
  let presetBg = backgroundColor;
  let presetTextColor = textColor;
  if (type === "auth") {
    presetBg = backgroundColor || "#5b7fff";
    presetTextColor = textColor || "white";
    presetStyles = styles.authButton;
    presetTextStyles = styles.authText;
  } else if (type === "primary") {
    presetBg = backgroundColor || "black";
    presetTextColor = textColor || "white";
    presetStyles = styles.primaryButton;
    presetTextStyles = styles.primaryText;
  } else {
    presetBg = backgroundColor || Colors.light.defaultButtonBg;
    presetTextColor = textColor || Colors.light.defaultButtonText;
    presetStyles = styles.defaultButton;
    presetTextStyles = styles.defaultText;
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        presetStyles,
        { backgroundColor: presetBg },
        pressed && styles.pressed,
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon ? (
        <IconSymbol name={icon} size={24} color={presetTextColor} />
      ) : (
        children
      )}
      {title ? (
        <Text
          style={[
            styles.text,
            presetTextStyles,
            { color: presetTextColor },
            textStyle,
          ]}
        >
          {title}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  authButton: {
    backgroundColor: "#5b7fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  authText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  primaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  defaultButton: {
    flex: 1,
    backgroundColor: Colors.light.defaultButtonBg,
    borderWidth: 1,
    borderColor: Colors.light.defaultButtonBorder,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  defaultText: {
    color: Colors.light.defaultButtonText,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
