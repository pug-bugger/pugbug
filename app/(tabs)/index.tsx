import React, { useState } from "react";
import { Alert, Animated, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CardsContainer from "@/components/CardsContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import TruckList from "@/components/TruckList";
import { TruckModal } from "@/components/TruckModal";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useNotificationIntegration } from "@/hooks/useNotificationIntegration";
import { useTrucks } from "@/hooks/useTrucks";
import {
  BooleanCustomField,
  CreateTruckData,
  CustomField,
  CustomFieldType,
  DateCustomField,
  NumberCustomField,
  TextCustomField,
  Truck,
  UpdateTruckData,
} from "@/types/Truck";

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

  const formatFieldValue = (field: CustomField) => {
    switch (field.type) {
      case CustomFieldType.DATE:
        const dateField = field as DateCustomField;
        if (!dateField.value) return "Not set";
        return formatDate(dateField.value);
      case CustomFieldType.TEXT:
        const textField = field as TextCustomField;
        return textField.value || "Not set";
      case CustomFieldType.NUMBER:
        const numberField = field as NumberCustomField;
        return numberField.value?.toString() || "Not set";
      case CustomFieldType.BOOLEAN:
        const booleanField = field as BooleanCustomField;
        return booleanField.value ? "Yes" : "No";
      default:
        return "Not set";
    }
  };

  const formatDate = (
    date: Date | string | { seconds: number; nanoseconds: number } | null
  ) => {
    if (!date) {
      return "-";
    }
    // Firestore Timestamp object check
    if (typeof date === "object" && date !== null && "seconds" in date) {
      const dateObject = date as { seconds: number; nanoseconds: number };
      // Convert Firestore timestamp to JS Date
      const jsDate = new Date(
        dateObject.seconds * 1000 + Math.floor(dateObject.nanoseconds / 1e6)
      );
      return jsDate.toLocaleDateString("lt-LT");
    }
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString("lt-LT");
    } else if (date instanceof Date) {
      return date.toLocaleDateString("lt-LT");
    } else {
      return "Wrong type";
    }
  };

  const getFieldStyle = (field: CustomField, truckId: string) => {
    if (field.type !== CustomFieldType.DATE || !field.value)
      return styles.fieldValue;

    const status = getTruckDeadlineStatus(truckId);
    if (!status) return styles.fieldValue;

    // Check if this field matches any of the custom fields status
    const customFieldStatus = status.customFields.find(
      (cf) => cf.id === field.id
    );
    if (customFieldStatus) {
      switch (customFieldStatus.status) {
        case "overdue":
          return styles.overdueText;
        case "warning":
          return styles.upcomingText;
        default:
          return styles.fieldValue;
      }
    }

    return styles.fieldValue;
  };

  const getFieldIcon = (field: CustomField, truckId: string) => {
    if (field.type !== CustomFieldType.DATE || !field.value) return null;

    const status = getTruckDeadlineStatus(truckId);
    if (!status) return null;

    // Check if this field matches any of the custom fields status
    const customFieldStatus = status.customFields.find(
      (cf) => cf.id === field.id
    );
    if (customFieldStatus) {
      switch (customFieldStatus.status) {
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
            <IconSymbol
              name="checkmark.circle.fill"
              size={16}
              color="#28a745"
            />
          );
      }
    }

    return null;
  };

  const getFieldTypeIcon = (fieldType: CustomFieldType) => {
    switch (fieldType) {
      case CustomFieldType.DATE:
        return "📅";
      case CustomFieldType.TEXT:
        return "📝";
      case CustomFieldType.NUMBER:
        return "🔢";
      case CustomFieldType.BOOLEAN:
        return "✅";
      default:
        return "📋";
    }
  };

  // Get notification summary for header
  const notificationSummary = getNotificationSummary();
  const trucksWithUpcomingDeadlines = getTrucksWithUpcomingDeadlines();
  const trucksWithOverdueDeadlines = getTrucksWithOverdueDeadlines();

  const headerContent = (
    <ThemedView style={styles.headerContent}>
      {/* {(trucksWithUpcomingDeadlines.length > 0 ||
        trucksWithOverdueDeadlines.length > 0 ||
        !isNotificationSetupComplete()) && (
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
          {!isNotificationSetupComplete() && (
            <ThemedView style={styles.notificationWarning}>
              <IconSymbol name="bell.slash" size={16} color="#ffc107" />
              <ThemedText style={styles.notificationWarningText}>
                Notifications disabled
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )} */}

      <ThemedText style={styles.headerContentText} type="title">
        My Trucks
      </ThemedText>

      <ThemedView style={styles.headerAddButton}>
        <Pressable onPress={handleAddTruck}>
          <IconSymbol size={28} name="plus" color="white" />
        </Pressable>
      </ThemedView>
    </ThemedView>
  );

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
        >
          <ThemedView style={styles.contentContainer}>
            {headerContent}
            <CardsContainer />

            <TruckList
              trucks={trucks}
              loading={loading}
              error={error}
              onEdit={handleEditTruck}
              onDelete={handleDeleteTruck}
              getTruckDeadlineStatus={getTruckDeadlineStatus}
            />

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
          </ThemedView>
        </Animated.ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
    backgroundColor: "transparent",
  },
  tipCotnainer: {
    flexDirection: "row",
    gap: 8,
  },
  tipItem: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    marginBottom: 16,
    shadowOpacity: 0.2,
    shadowColor: "rgba(202, 202, 202, 0.5)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  truckContainer: {
    gap: 8,
    borderColor: "#ecf0f1",
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    shadowOpacity: 0.2,
    shadowColor: "rgba(202, 202, 202, 1)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 8,
  },
  trucksContainer: {
    gap: 8,
    marginTop: 24,
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
  customFieldsContainer: {
    gap: 6,
    marginTop: 8,
  },
  fieldItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  fieldHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    flex: 1,
    backgroundColor: "transparent",
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
  noFieldsContainer: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginTop: 8,
  },
  noFieldsText: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    textAlign: "center",
  },
  // Legacy styles for deadline display (keeping for backward compatibility)
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
    padding: 24,
    marginBottom: 16,
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContentText: {
    color: Colors.light.text,
    fontSize: 28,
    fontWeight: "bold",
    bottom: 0,
  },
  headerAddButton: {
    backgroundColor: Colors.light.text,
    borderRadius: 20,
    padding: 2,
    bottom: 0,
  },
  notificationWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    backgroundColor: "rgba(255, 228, 145, 0.2)",
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
    backgroundColor: "transparent",
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
