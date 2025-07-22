import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { IconSymbol, IconSymbolName } from "./IconSymbol";

export type NotificationType = "error" | "success" | "warning" | "info";

interface NotificationBannerProps {
  message: string;
  type?: NotificationType;
  visible: boolean;
  onClose?: () => void;
  duration?: number; // ms
  style?: any;
}

const ICONS: Record<NotificationType, IconSymbolName> = {
  error: "error",
  success: "success",
  warning: "warning",
  info: "info",
};

const COLORS: Record<
  NotificationType,
  { bg: string; text: string; icon: string }
> = {
  error: { bg: "#f8d7da", text: "#721c24", icon: "#dc3545" },
  success: { bg: "#d1ecf1", text: "#0c5460", icon: "#17a2b8" },
  warning: { bg: "#fff3cd", text: "#856404", icon: "#ffc107" },
  info: { bg: "#f1f3f4", text: "#343a40", icon: "#6c757d" },
};

export default function NotificationBanner({
  message,
  type = "info",
  visible,
  onClose,
  duration = 5000,
  style,
}: NotificationBannerProps) {
  const [show, setShow] = useState(visible);
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShow(false));
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShow(false);
      onClose?.();
    });
  };

  if (!show) return null;

  const color = COLORS[type];

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: color.bg, transform: [{ translateY }] },
        style,
      ]}
    >
      <IconSymbol name={ICONS[type]} size={24} color={color.icon} />
      <Text style={[styles.text, { color: color.text }]}>{message}</Text>
      <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
        <IconSymbol name="close" size={20} color={color.text} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  closeBtn: {
    marginLeft: 8,
    padding: 4,
  },
});
