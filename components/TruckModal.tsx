import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CreateTruckData, Truck, UpdateTruckData } from "../types/Truck";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface TruckModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateTruckData | UpdateTruckData) => Promise<void>;
  truck?: Truck | null;
  mode: "add" | "edit";
}

export const TruckModal: React.FC<TruckModalProps> = ({
  visible,
  onClose,
  onSave,
  truck,
  mode,
}) => {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [insuranceDeadline, setInsuranceDeadline] = useState<Date | null>(null);
  const [techInspectionDeadline, setTechInspectionDeadline] =
    useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInsurancePicker, setShowInsurancePicker] = useState(false);
  const [showTechInspectionPicker, setShowTechInspectionPicker] =
    useState(false);

  useEffect(() => {
    if (visible && truck && mode === "edit") {
      setName(truck.name);
      setNote(truck.note);
      setInsuranceDeadline(
        truck.insuranceDeadline ? new Date(truck.insuranceDeadline) : null
      );
      setTechInspectionDeadline(
        truck.techInspectionDeadline
          ? new Date(truck.techInspectionDeadline)
          : null
      );
    } else if (visible && mode === "add") {
      setName("");
      setNote("");
      setInsuranceDeadline(null);
      setTechInspectionDeadline(null);
    }
  }, [visible, truck, mode]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Truck name is required");
      return;
    }

    try {
      setLoading(true);
      const truckData = {
        name: name.trim(),
        note: note.trim(),
        insuranceDeadline: insuranceDeadline?.toISOString() || null,
        techInspectionDeadline: techInspectionDeadline?.toISOString() || null,
      };

      await onSave(truckData);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save truck");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    onClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return date.toLocaleDateString();
  };

  const handleInsuranceDateChange = (event: any, selectedDate?: Date) => {
    setShowInsurancePicker(false);
    if (selectedDate) {
      setInsuranceDeadline(selectedDate);
    }
  };

  const handleTechInspectionDateChange = (event: any, selectedDate?: Date) => {
    setShowTechInspectionPicker(false);
    if (selectedDate) {
      setTechInspectionDeadline(selectedDate);
    }
  };

  const clearInsuranceDate = () => {
    setInsuranceDeadline(null);
  };

  const clearTechInspectionDate = () => {
    setTechInspectionDeadline(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>
            {mode === "add" ? "Add New Truck" : "Edit Truck"}
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Truck Name *</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter truck name"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Note</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder="Enter truck note (optional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Insurance Deadline</ThemedText>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowInsurancePicker(true)}
                disabled={loading}
              >
                <ThemedText style={styles.dateButtonText}>
                  {formatDate(insuranceDeadline)}
                </ThemedText>
              </TouchableOpacity>
              {insuranceDeadline && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearInsuranceDate}
                  disabled={loading}
                >
                  <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              Tech Inspection Deadline
            </ThemedText>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTechInspectionPicker(true)}
                disabled={loading}
              >
                <ThemedText style={styles.dateButtonText}>
                  {formatDate(techInspectionDeadline)}
                </ThemedText>
              </TouchableOpacity>
              {techInspectionDeadline && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearTechInspectionDate}
                  disabled={loading}
                >
                  <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? "Saving..." : "Save"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>

      {showInsurancePicker && (
        <DateTimePicker
          value={insuranceDeadline || new Date()}
          mode="date"
          display="default"
          onChange={handleInsuranceDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTechInspectionPicker && (
        <DateTimePicker
          value={techInspectionDeadline || new Date()}
          mode="date"
          display="default"
          onChange={handleTechInspectionDateChange}
          minimumDate={new Date()}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 15,
    shadowOpacity: 0.3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#dc3545",
    borderRadius: 6,
  },
  clearButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  saveButton: {
    backgroundColor: "#007bff",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
