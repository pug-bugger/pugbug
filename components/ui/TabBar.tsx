import { Colors } from "@/constants/Colors";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  // One shared value per tab
  const scales = React.useRef(
    state.routes.map(() => useSharedValue(1))
  ).current;

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;
        const onPress = () => {
          // Animate scale up
          scales[index].value = withTiming(1.15, { duration: 120 }, () => {
            // Animate scale back
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
              color: isFocused
                ? Colors.light.tint
                : Colors.light.tabIconDefault,
              size: 24,
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
            <Animated.View
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
                animatedStyle,
              ]}
            >
              {icon}
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    left: "30%",
    right: "30%",
    bottom: 15,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabItemContainer: {
    alignItems: "center",
    bottom: -6,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "transparent",
    minWidth: 48,
    minHeight: 48,
  },
  tabItemActive: {
    backgroundColor: "#E0F3FF",
    borderRadius: 30,
  },
  tabLabel: {
    color: Colors.light.tint,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
