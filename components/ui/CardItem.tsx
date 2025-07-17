import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

export default function CardItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
    backgroundColor: "white",
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
    color: "rgb(100, 100, 100)",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgb(50, 50, 50)",
  },
});
