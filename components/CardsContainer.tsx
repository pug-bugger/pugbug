import { useNotifications } from "@/contexts/NotificationContext";
import { useTrucks } from "@/hooks/useTrucks";
import { ScrollView, StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import CardItem from "./ui/CardItem";

export default function CardsContainer() {
  const { trucks } = useTrucks();
  const { showNotification } = useNotifications();
  const onPress = (value: string) => {
    showNotification(`Card with value ${value} pressed`, "info");
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      overScrollMode="never"
    >
      <ThemedView style={styles.container}>
        <CardItem label="Total Trucks" value={trucks.length.toString()} />
        <CardItem
          label="Total Records"
          value="2"
          onPress={() => onPress("2")}
        />
        <CardItem
          label="Total Records"
          value="3"
          onPress={() => onPress("3")}
        />
        <CardItem
          label="Total Records"
          value="4"
          onPress={() => onPress("4")}
        />
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
