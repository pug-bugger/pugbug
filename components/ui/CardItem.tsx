import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export default function CardItem({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.value}>{value}</ThemedText>
        <ThemedText style={styles.label}>{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    shadowColor: "rgb(150, 150, 150)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgb(230, 230, 230)",
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
