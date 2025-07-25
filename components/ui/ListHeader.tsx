import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Pressable, StyleSheet, ViewProps } from "react-native";

interface ListHeaderProps extends ViewProps {
  onAddTruck?: () => void;
  title: string;
}

export function ListHeader(props: ListHeaderProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title} type="title">
        {props.title}
      </ThemedText>

      <ThemedView style={styles.addButton} lightColor="#000" darkColor="#fff">
        <Pressable onPress={() => props.onAddTruck?.()}>
          <IconSymbol
            size={28}
            name="plus"
            color={useThemeColor({}, "background")}
          />
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    bottom: 0,
  },
  addButton: {
    borderRadius: 20,
    padding: 2,
    bottom: 0,
  },
});
