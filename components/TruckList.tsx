import useNotificationIntegration from "@/hooks/useNotificationIntegration";
import {
  BooleanCustomField,
  CustomField,
  CustomFieldType,
  DateCustomField,
  NumberCustomField,
  TextCustomField,
  Truck,
} from "@/types/Truck";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";
import { Menu } from "./ui/Menu";
import { formatDate } from "./utils";

interface TruckListProps {
  trucks: Truck[];
  loading: boolean;
  error?: string | null;
  onEdit: (truck: Truck) => void;
  onDelete: (truck: Truck) => void;
}

const TruckList: React.FC<TruckListProps> = ({
  trucks,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const { getTruckDeadlineStatus } = useNotificationIntegration();

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

  const getFieldStyle = (field: CustomField, truckId: string) => {
    if (field.type !== CustomFieldType.DATE || !field.value)
      return styles.fieldValue;
    const status = getTruckDeadlineStatus(truckId);
    if (!status) return styles.fieldValue;
    const customFieldStatus = status.customFields.find(
      (cf: any) => cf.id === field.id
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
    const customFieldStatus = status.customFields.find(
      (cf: any) => cf.id === field.id
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

  const getFieldTypeIcon = (fieldType?: CustomFieldType) => {
    if (!fieldType) return "dot.fill";
    switch (fieldType) {
      case CustomFieldType.DATE:
        return "calendar";
      case CustomFieldType.TEXT:
        return "text";
      case CustomFieldType.NUMBER:
        return "number";
      case CustomFieldType.BOOLEAN:
        return "check-box";
      default:
        return "dot.fill";
    }
  };

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (loading && trucks.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading trucks...</ThemedText>
      </ThemedView>
    );
  }

  if (trucks.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText>No trucks found. Add your first truck!</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.trucksContainer}>
      {trucks.map((truck) => (
        <ThemedView key={truck.id} style={styles.truckContainer}>
          <ThemedView style={styles.truckHeader}>
            <ThemedText type="subtitle">{truck.name}</ThemedText>
            <ThemedView style={styles.truckActions}>
              <Menu
                onEdit={() => onEdit(truck)}
                onDelete={() => onDelete(truck)}
              />
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.truckNote}>{truck.note}</ThemedText>

          {/* Custom Fields Display */}
          {truck.customFields && truck.customFields.length > 0 && (
            <ThemedView style={styles.customFieldsContainer}>
              {truck.customFields.map((field) => (
                <ThemedView key={field.id} style={styles.fieldItem}>
                  <ThemedView style={styles.fieldHeader}>
                    <IconSymbol
                      name={getFieldTypeIcon(field.type)}
                      size={16}
                      color="black"
                    />
                    <ThemedText style={styles.fieldLabel}>
                      {field.label}:
                    </ThemedText>
                  </ThemedView>
                  <View style={styles.fieldValueContainer}>
                    {getFieldIcon(field, truck.id)}
                    <ThemedText style={getFieldStyle(field, truck.id)}>
                      {formatFieldValue(field)}
                    </ThemedText>
                  </View>
                </ThemedView>
              ))}
            </ThemedView>
          )}

          {/* Show message if no custom fields */}
          {(!truck.customFields || truck.customFields.length === 0) && (
            <ThemedView style={styles.noFieldsContainer}>
              <ThemedText style={styles.noFieldsText}>
                No custom fields added. Edit truck to add fields.
              </ThemedText>
            </ThemedView>
          )}

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
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
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
});

export default TruckList;
