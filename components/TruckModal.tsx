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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && truck && mode === "edit") {
      setName(truck.name);
      setNote(truck.note);
    } else if (visible && mode === "add") {
      setName("");
      setNote("");
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
