import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "../ThemedView";

const ACTIVE_COLOR = "#111"; // solid black
const INACTIVE_COLOR = "#C7C7CC"; // light gray
const ACTIVE_COLOR_DARK = "#fff"; // solid white
const INACTIVE_COLOR_DARK = "#8E8E93"; // dark gray

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const scales = React.useRef(
    state.routes.map(() => useSharedValue(1))
  ).current;
  const colorScheme = useColorScheme();
  const activeColor = colorScheme === "dark" ? ACTIVE_COLOR_DARK : ACTIVE_COLOR;
  const inactiveColor =
    colorScheme === "dark" ? INACTIVE_COLOR_DARK : INACTIVE_COLOR;
  return (
    <ThemedView
      style={[
        styles.tabBar,
        { marginBottom: insets.bottom > 0 ? insets.bottom : 12 },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const onPress = () => {
          scales[index].value = withTiming(1.15, { duration: 120 }, () => {
            scales[index].value = withTiming(1, { duration: 120 });
          });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        const icon = options.tabBarIcon
          ? options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? activeColor : inactiveColor,
              size: 30,
            })
          : null;
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scales[index].value }],
        }));
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.tabItemContainer}
            activeOpacity={0.8}
          >
            <Animated.View style={animatedStyle}>{icon}</Animated.View>
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#F0F0F3",
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
