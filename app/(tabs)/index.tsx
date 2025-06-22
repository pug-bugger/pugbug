import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TruckModal } from "@/components/TruckModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
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
      } else if (modalMode === "edit" && editingTruck) {
        await updateTruck(editingTruck.id, data as UpdateTruckData);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save truck");
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTruck(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const headerContent = (
    <ThemedView style={styles.headerContent}>
      <ThemedText style={styles.headerContentText} type="title">
        My Trucks
      </ThemedText>
      <ThemedView
        style={{
          position: "absolute",
          right: 24,
          bottom: 12,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          borderRadius: 10,
          padding: 4,
        }}
      >
        <Pressable onPress={handleAddTruck}>
          <IconSymbol size={28} name="plus" color="white" />
        </Pressable>
      </ThemedView>
    </ThemedView>
  );

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/Grey_Icons.png")}
            style={styles.reactLogo}
          />
        }
        headerContent={headerContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshTrucks}
            colors={["#A1CEDC"]}
            tintColor="#A1CEDC"
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Total Trucks: {trucks.length}</ThemedText>
        </ThemedView>

        {error && (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        )}

        {loading && trucks.length === 0 ? (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText>Loading trucks...</ThemedText>
          </ThemedView>
        ) : trucks.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No trucks found. Add your first truck!</ThemedText>
          </ThemedView>
        ) : (
          trucks.map((truck) => (
            <ThemedView key={truck.id} style={styles.truckContainer}>
              <ThemedView style={styles.truckHeader}>
                <ThemedText type="subtitle">Truck {truck.name}</ThemedText>
                <ThemedView style={styles.truckActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleEditTruck(truck)}
                  >
                    <IconSymbol size={20} name="pencil" color="#007bff" />
                  </Pressable>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleDeleteTruck(truck)}
                  >
                    <IconSymbol size={20} name="trash" color="#dc3545" />
                  </Pressable>
                </ThemedView>
              </ThemedView>

              <ThemedText style={styles.truckNote}>{truck.note}</ThemedText>

              <ThemedView style={styles.truckMeta}>
                <ThemedText style={styles.metaText}>
                  Created: {formatDate(truck.createdAt)}
                </ThemedText>
                {truck.updatedAt !== truck.createdAt && (
                  <ThemedText style={styles.metaText}>
                    Updated: {formatDate(truck.updatedAt)}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          ))
        )}
      </ParallaxScrollView>

      <TruckModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveTruck}
        truck={editingTruck}
        mode={modalMode}
      />
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 8,
    marginBottom: 16,
  },
  truckContainer: {
    gap: 8,
    borderColor: "#ecf0f1",
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    shadowOpacity: 0.2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  truckHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  truckActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  truckNote: {
    fontStyle: "italic",
    color: "#666",
  },
  truckMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#999",
  },
  errorContainer: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#721c24",
    textAlign: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  reactLogo: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  headerContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "transparent",
    width: "100%",
  },
  headerContentText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 32,
  },
});
