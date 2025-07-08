import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
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
  const [isInsuranceDatePickerVisible, setInsuranceDatePickerVisibility] =
    useState(false);
  const [isTechDatePickerVisible, setTechDatePickerVisibility] =
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
    return date.toLocaleDateString("lt-LT");
  };

  const showInsuranceDatePicker = () => setInsuranceDatePickerVisibility(true);
  const hideInsuranceDatePicker = () => setInsuranceDatePickerVisibility(false);
  const showTechDatePicker = () => setTechDatePickerVisibility(true);
  const hideTechDatePicker = () => setTechDatePickerVisibility(false);

  const handleInsuranceConfirm = (date: Date) => {
    setInsuranceDeadline(date);
    hideInsuranceDatePicker();
  };

  const handleTechConfirm = (date: Date) => {
    setTechInspectionDeadline(date);
    hideTechDatePicker();
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
          <ScrollView
            // style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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
                autoCapitalize="words"
                returnKeyType="next"
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
                numberOfLines={Platform.OS === "android" ? 4 : 3}
                editable={!loading}
                textAlignVertical="top"
                returnKeyType="done"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Insurance Deadline</ThemedText>
              <View style={styles.dateContainer}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={showInsuranceDatePicker}
                  disabled={loading}
                  activeOpacity={0.7}
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
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.clearButtonText}>
                      Clear
                    </ThemedText>
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
                  onPress={showTechDatePicker}
                  disabled={loading}
                  activeOpacity={0.7}
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
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.clearButtonText}>
                      Clear
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
                activeOpacity={0.7}
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
                activeOpacity={0.7}
              >
                <ThemedText style={styles.buttonText}>
                  {loading ? "Saving..." : "Save"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
      </View>

      <DateTimePickerModal
        isVisible={isInsuranceDatePickerVisible}
        mode="date"
        onConfirm={handleInsuranceConfirm}
        onCancel={hideInsuranceDatePicker}
        date={insuranceDeadline || new Date()}
        minimumDate={new Date()}
      />
      <DateTimePickerModal
        isVisible={isTechDatePickerVisible}
        mode="date"
        onConfirm={handleTechConfirm}
        onCancel={hideTechDatePicker}
        date={techInspectionDeadline || new Date()}
        minimumDate={new Date()}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    minHeight: "50%",
    borderRadius: 15,
    shadowOpacity: 0.3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    padding: 20,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: Platform.OS === "android" ? 50 : 44,
  },
  textArea: {
    height: Platform.OS === "android" ? 100 : 80,
    textAlignVertical: "top",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fff",
    minHeight: Platform.OS === "android" ? 50 : 44,
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#dc3545",
    borderRadius: 6,
    minHeight: Platform.OS === "android" ? 40 : 36,
    justifyContent: "center",
  },
  clearButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: Platform.OS === "android" ? 50 : 44,
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
