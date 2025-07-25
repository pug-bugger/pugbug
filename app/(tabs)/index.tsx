import React, { useState } from "react";
import { Alert, Animated, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CardsContainer from "@/components/CardsContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import TruckList from "@/components/TruckList";
import { TruckModal } from "@/components/TruckModal";
import { ListHeader } from "@/components/ui/ListHeader";
import { useTrucks } from "@/hooks/useTrucks";
import { CreateTruckData, Truck, UpdateTruckData } from "@/types/Truck";

export default function HomeScreen() {
  const {
    trucks,
    loading,
    error,
    addTruck,
    updateTruck,
    deleteTruck,
    refreshTrucks,
  } = useTrucks();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const handleAddTruck = () => {
    setModalMode("add");
    setEditingTruck(null);
    setModalVisible(true);
  };

  const handleEditTruck = (truck: Truck) => {
    setModalMode("edit");
    setEditingTruck(truck);
    setModalVisible(true);
  };

  const handleDeleteTruck = (truck: Truck) => {
    Alert.alert(
      "Delete Truck",
      `Are you sure you want to delete "${truck.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTruck(truck.id);
            } catch (error) {
              Alert.alert("Error", "Failed to delete truck");
            }
          },
        },
      ]
    );
  };

  const handleSaveTruck = async (data: CreateTruckData | UpdateTruckData) => {
    try {
      if (modalMode === "add") {
        await addTruck(data as CreateTruckData);
      } else if (editingTruck) {
        await updateTruck(editingTruck.id, data as UpdateTruckData);
      }
      setModalVisible(false);
      setEditingTruck(null);
    } catch (error) {
      Alert.alert("Error", "Failed to save truck");
    }
  };

  const noTrucksFound = (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText>No trucks found. Add your first truck!</ThemedText>
    </ThemedView>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshTrucks} />
          }
        >
          <ThemedView style={styles.contentContainer}>
            <ListHeader onAddTruck={handleAddTruck} title="My Records" />
            <CardsContainer />

            {trucks.length > 0 ? (
              <TruckList
                trucks={trucks}
                loading={loading}
                error={error}
                onEdit={handleEditTruck}
                onDelete={handleDeleteTruck}
              />
            ) : (
              noTrucksFound
            )}
          </ThemedView>
        </Animated.ScrollView>
      </SafeAreaView>
      <TruckModal
        visible={modalVisible}
        mode={modalMode}
        truck={editingTruck}
        onClose={() => {
          setModalVisible(false);
          setEditingTruck(null);
        }}
        onSave={handleSaveTruck}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  fieldTypeIcon: {
    fontSize: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  fieldValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: "#28a745",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
});
