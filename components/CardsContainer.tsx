import { useTrucks } from "@/hooks/useTrucks";
import { ScrollView, StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import CardItem from "./ui/CardItem";

export default function CardsContainer() {
  const { trucks } = useTrucks();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      overScrollMode="never"
    >
      <ThemedView style={styles.container}>
        <CardItem label="Total Trucks" value={trucks.length.toString()} />
        <CardItem label="Total Trucks" value="2" />
        <CardItem label="Total Trucks" value="3" />
        <CardItem label="Total Trucks" value="4" />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
    padding: 8,
  },
});
