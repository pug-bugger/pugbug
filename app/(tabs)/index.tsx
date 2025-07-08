import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TruckModal } from "@/components/TruckModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Menu } from "@/components/ui/Menu";
import { useNotificationIntegration } from "@/hooks/useNotificationIntegration";
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

  const {
    getTrucksWithUpcomingDeadlines,
    getTrucksWithOverdueDeadlines,
    getTruckDeadlineStatus,
    isNotificationSetupComplete,
    getNotificationSummary,
  } = useNotificationIntegration();

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

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "Not set";
    const date = new Date(deadline);
    return date.toLocaleDateString("lt-LT");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("lt-LT");
  };

  const getDeadlineStyle = (deadline: string | null, truckId: string) => {
    if (!deadline) return styles.deadlineText;

    const status = getTruckDeadlineStatus(truckId);
    if (!status) return styles.deadlineText;

    const insuranceStatus =
      status.insurance.date === deadline ? status.insurance.status : null;
    const techStatus =
      status.techInspection.date === deadline
        ? status.techInspection.status
        : null;
    const currentStatus = insuranceStatus || techStatus;

    switch (currentStatus) {
      case "overdue":
        return styles.overdueText;
      case "warning":
        return styles.upcomingText;
      default:
        return styles.deadlineText;
    }
  };

  const getDeadlineIcon = (deadline: string | null, truckId: string) => {
    if (!deadline) return null;

    const status = getTruckDeadlineStatus(truckId);
    if (!status) return null;

    const insuranceStatus =
      status.insurance.date === deadline ? status.insurance.status : null;
    const techStatus =
      status.techInspection.date === deadline
        ? status.techInspection.status
        : null;
    const currentStatus = insuranceStatus || techStatus;

    switch (currentStatus) {
      case "overdue":
        return (
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={16}
            color="#dc3545"
          />
        );
      case "warning":
        return <IconSymbol name="clock.fill" size={16} color="#ffc107" />;
      default:
        return (
          <IconSymbol name="checkmark.circle.fill" size={16} color="#28a745" />
        );
    }
  };

  // Get notification summary for header
  const notificationSummary = getNotificationSummary();
  const trucksWithUpcomingDeadlines = getTrucksWithUpcomingDeadlines();
  const trucksWithOverdueDeadlines = getTrucksWithOverdueDeadlines();

  const headerContent = (
    <ThemedView style={styles.headerContent}>
      <ThemedText style={styles.headerContentText} type="title">
        My Trucks
      </ThemedText>

      {/* Notification Status */}
      {!isNotificationSetupComplete() && (
        <ThemedView style={styles.notificationWarning}>
          <IconSymbol name="bell.slash" size={16} color="#ffc107" />
          <ThemedText style={styles.notificationWarningText}>
            Notifications disabled
          </ThemedText>
        </ThemedView>
      )}

      {/* Deadline Summary */}
      {(trucksWithUpcomingDeadlines.length > 0 ||
        trucksWithOverdueDeadlines.length > 0) && (
        <ThemedView style={styles.deadlineSummary}>
          {trucksWithOverdueDeadlines.length > 0 && (
            <ThemedView style={styles.deadlineBadge}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={14}
                color="#dc3545"
              />
              <ThemedText style={styles.deadlineBadgeText}>
                {trucksWithOverdueDeadlines.length} overdue
              </ThemedText>
            </ThemedView>
          )}
          {trucksWithUpcomingDeadlines.length > 0 && (
            <ThemedView style={styles.deadlineBadge}>
              <IconSymbol name="clock.fill" size={14} color="#ffc107" />
              <ThemedText style={styles.deadlineBadgeText}>
                {trucksWithUpcomingDeadlines.length} upcoming
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}

      <ThemedView
        style={{
          position: "absolute",
          right: 24,
          bottom: 12,
          backgroundColor: "rgba(209, 208, 208, 0.8)",
          borderRadius: 20,
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
                <ThemedText type="subtitle">{truck.name}</ThemedText>
                <ThemedView style={styles.truckActions}>
                  <Menu
                    onEdit={() => handleEditTruck(truck)}
                    onDelete={() => handleDeleteTruck(truck)}
                  />
                </ThemedView>
              </ThemedView>

              <ThemedText style={styles.truckNote}>{truck.note}</ThemedText>

              <ThemedView style={styles.deadlinesContainer}>
                <ThemedView style={styles.deadlineItem}>
                  <ThemedText style={styles.deadlineLabel}>
                    Insurance:
                  </ThemedText>
                  <View style={styles.deadlineValueContainer}>
                    {getDeadlineIcon(truck.insuranceDeadline, truck.id)}
                    <ThemedText
                      style={getDeadlineStyle(
                        truck.insuranceDeadline,
                        truck.id
                      )}
                    >
                      {formatDeadline(truck.insuranceDeadline)}
                    </ThemedText>
                  </View>
                </ThemedView>

                <ThemedView style={styles.deadlineItem}>
                  <ThemedText style={styles.deadlineLabel}>
                    Tech Inspection:
                  </ThemedText>
                  <View style={styles.deadlineValueContainer}>
                    {getDeadlineIcon(truck.techInspectionDeadline, truck.id)}
                    <ThemedText
                      style={getDeadlineStyle(
                        truck.techInspectionDeadline,
                        truck.id
                      )}
                    >
                      {formatDeadline(truck.techInspectionDeadline)}
                    </ThemedText>
                  </View>
                </ThemedView>
              </ThemedView>

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
      </ParallaxScrollView>
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
  deadlinesContainer: {
    gap: 4,
    marginTop: 8,
  },
  deadlineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deadlineLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  deadlineValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deadlineText: {
    fontSize: 14,
    color: "#28a745",
  },
  overdueText: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "600",
  },
  upcomingText: {
    fontSize: 14,
    color: "#ffc107",
    fontWeight: "600",
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
    right: 0,
    padding: 24,
  },
  headerContentText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  notificationWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  notificationWarningText: {
    color: "#ffc107",
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineSummary: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  deadlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deadlineBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
