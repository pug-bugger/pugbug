import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  BooleanCustomField,
  CreateTruckData,
  CustomField,
  CustomFieldType,
  DateCustomField,
  FIELD_TEMPLATES,
  NumberCustomField,
  TextCustomField,
  Truck,
  UpdateTruckData,
} from "../types/Truck";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import CustomButton from "./ui/CustomButton";
import { IconSymbol } from "./ui/IconSymbol";
import { formatDate } from "./utils";

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
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [datePickerState, setDatePickerState] = useState<{
    visible: boolean;
    fieldId: string | null;
    currentDate: Date | null;
  }>({
    visible: false,
    fieldId: null,
    currentDate: null,
  });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && truck && mode === "edit") {
      setName(truck.name);
      setNote(truck.note);
      setCustomFields(truck.customFields || []);
    } else if (visible && mode === "add") {
      setName("");
      setNote("");
      setCustomFields([]);
    }
  }, [visible, truck, mode]);

  const generateFieldId = () => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addCustomField = (template?: {
    label: string;
    type: CustomFieldType;
    icon: string;
  }) => {
    const newField: CustomField = {
      id: generateFieldId(),
      label: template?.label || "New Field",
      type: template?.type || CustomFieldType.TEXT,
      value: getDefaultValue(template?.type || CustomFieldType.TEXT),
    } as CustomField;

    setCustomFields((prevFields) => {
      const updatedFields = [...prevFields, newField];
      // Scroll to end after state update
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return updatedFields;
    });
    setShowTemplates(false);
  };

  const getDefaultValue = (type: CustomFieldType) => {
    switch (type) {
      case CustomFieldType.DATE:
        return null;
      case CustomFieldType.TEXT:
        return "";
      case CustomFieldType.NUMBER:
        return null;
      case CustomFieldType.BOOLEAN:
        return false;
      default:
        return "";
    }
  };

  const updateCustomField = (
    fieldId: string,
    updates: { label?: string; value?: any }
  ) => {
    setCustomFields((fields) =>
      fields.map((field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            ...(updates.label !== undefined && { label: updates.label }),
            ...(updates.value !== undefined && { value: updates.value }),
          };
        }
        return field;
      })
    );
  };

  const removeCustomField = (fieldId: string) => {
    setCustomFields((fields) => fields.filter((field) => field.id !== fieldId));
  };

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
        customFields: customFields,
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

  const showDatePicker = (fieldId: string, currentDate: Date | null) => {
    setDatePickerState({
      visible: true,
      fieldId,
      currentDate: currentDate ? new Date(currentDate) : new Date(),
    });
  };

  const hideDatePicker = () => {
    setDatePickerState({
      visible: false,
      fieldId: null,
      currentDate: null,
    });
  };

  const handleDateConfirm = (date: Date) => {
    if (datePickerState.fieldId) {
      updateCustomField(datePickerState.fieldId, { value: date });
    }
    hideDatePicker();
  };

  const removeButton = ({ fieldId }: { fieldId: string }) => {
    return (
      <TouchableOpacity
        onPress={() => removeCustomField(fieldId)}
        disabled={loading}
      >
        <IconSymbol name="delete" size={20} color="black" />
      </TouchableOpacity>
    );
  };

  const clearButton = ({ fieldId }: { fieldId: string }) => {
    return (
      <TouchableOpacity
        onPress={() => updateCustomField(fieldId, { value: null })}
        disabled={loading}
      >
        <IconSymbol name="close" size={20} color="black" />
      </TouchableOpacity>
    );
  };

  const renderCustomField = (field: CustomField) => {
    switch (field.type) {
      case CustomFieldType.DATE:
        const dateField = field as DateCustomField;
        return (
          <ThemedView key={field.id} style={styles.fieldContainer}>
            <ThemedView style={styles.fieldHeader}>
              <TextInput
                style={styles.fieldLabel}
                value={field.label}
                onChangeText={(text) =>
                  updateCustomField(field.id, { label: text })
                }
                placeholder="Field name"
                editable={!loading}
              />
              {removeButton({ fieldId: field.id })}
            </ThemedView>
            <ThemedView style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => showDatePicker(field.id, dateField.value)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <IconSymbol name="calendar" size={20} color="black" />
                <ThemedText style={styles.dateButtonText}>
                  {formatDate(dateField.value)}
                </ThemedText>
              </TouchableOpacity>
              {dateField.value && clearButton({ fieldId: field.id })}
            </ThemedView>
          </ThemedView>
        );

      case CustomFieldType.TEXT:
        const textField = field as TextCustomField;
        return (
          <ThemedView key={field.id} style={styles.fieldContainer}>
            <ThemedView style={styles.fieldHeader}>
              <TextInput
                style={styles.fieldLabel}
                value={field.label}
                onChangeText={(text) =>
                  updateCustomField(field.id, { label: text })
                }
                placeholder="Field name"
                editable={!loading}
              />
              {removeButton({ fieldId: field.id })}
            </ThemedView>
            <TextInput
              style={styles.input}
              value={textField.value}
              onChangeText={(text) =>
                updateCustomField(field.id, { value: text })
              }
              placeholder="Enter text"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </ThemedView>
        );

      case CustomFieldType.NUMBER:
        const numberField = field as NumberCustomField;
        return (
          <ThemedView key={field.id} style={styles.fieldContainer}>
            <ThemedView style={styles.fieldHeader}>
              <TextInput
                style={styles.fieldLabel}
                value={field.label}
                onChangeText={(text) =>
                  updateCustomField(field.id, { label: text })
                }
                placeholder="Field name"
                editable={!loading}
              />
              {removeButton({ fieldId: field.id })}
            </ThemedView>
            <TextInput
              style={styles.input}
              value={numberField.value?.toString() || ""}
              onChangeText={(text) => {
                const numValue = parseFloat(text);
                updateCustomField(field.id, {
                  value: isNaN(numValue) ? null : numValue,
                });
              }}
              placeholder="Enter number"
              placeholderTextColor="#999"
              keyboardType="numeric"
              editable={!loading}
            />
          </ThemedView>
        );

      case CustomFieldType.BOOLEAN:
        const booleanField = field as BooleanCustomField;
        return (
          <ThemedView key={field.id} style={styles.fieldContainer}>
            <ThemedView style={styles.fieldHeader}>
              <TextInput
                style={styles.fieldLabel}
                value={field.label}
                onChangeText={(text) =>
                  updateCustomField(field.id, { label: text })
                }
                placeholder="Field name"
                editable={!loading}
              />
              {removeButton({ fieldId: field.id })}
            </ThemedView>
            <ThemedView style={styles.switchContainer}>
              <Switch
                value={booleanField.value}
                onValueChange={(value) =>
                  updateCustomField(field.id, { value })
                }
                disabled={loading}
                trackColor={{
                  true: "grey",
                  false: "grey",
                }}
                thumbColor="black"
              />
              <ThemedText style={styles.switchLabel}>
                {booleanField.value ? "Yes" : "No"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        );

      default:
        return null;
    }
  };

  const colorScheme = useColorScheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>
            {mode === "add" ? "Add New Truck" : "Edit Truck"}
          </ThemedText>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
          >
            <ThemedView style={styles.inputContainer}>
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
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
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
            </ThemedView>

            {/* Custom Fields Section */}
            <ThemedView style={styles.customFieldsSection}>
              <ThemedView style={styles.customFieldsHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Custom Fields
                </ThemedText>
                <TouchableOpacity
                  style={styles.addFieldButton}
                  onPress={() => setShowTemplates(!showTemplates)}
                  disabled={loading}
                >
                  <IconSymbol
                    name={showTemplates ? "close" : "plus"}
                    size={20}
                    color="black"
                  />
                  <ThemedText style={styles.addFieldButtonText}>
                    {showTemplates ? "Hide Templates" : "Add Field"}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>

              {showTemplates && (
                <ThemedView
                  style={[
                    styles.templatesContainer,
                    {
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 8,
                    },
                  ]}
                >
                  <ThemedText style={styles.templatesTitle}>
                    Field Templates:
                  </ThemedText>
                  <ThemedView style={styles.templatesGrid}>
                    {FIELD_TEMPLATES.map((template, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.templateButton}
                        onPress={() => addCustomField(template)}
                        disabled={loading}
                      >
                        <IconSymbol
                          name={template.icon as IconSymbolName}
                          size={20}
                          color="black"
                        />
                        <ThemedText style={styles.templateLabel}>
                          {template.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ThemedView>
                  <TouchableOpacity
                    style={styles.customFieldButton}
                    onPress={() => addCustomField()}
                    disabled={loading}
                  >
                    <IconSymbol name="edit" size={20} color="black" />
                    <ThemedText style={styles.customFieldButtonText}>
                      Custom Field
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              )}

              {customFields.map(renderCustomField)}
            </ThemedView>
          </ScrollView>

          <ThemedView style={styles.buttonContainer}>
            <CustomButton
              title="Cancel"
              onPress={handleCancel}
              disabled={loading}
            />

            <CustomButton
              disabled={loading}
              type="primary"
              title={loading ? "Saving..." : "Save"}
              onPress={handleSave}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <DateTimePickerModal
        isVisible={datePickerState.visible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        date={datePickerState.currentDate || new Date()}
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
    maxHeight: "90%",
    minHeight: "40%",
    borderRadius: 15,
    shadowOpacity: 0.3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
    padding: 16,
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
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    minHeight: Platform.OS === "android" ? 50 : 44,
  },
  textArea: {
    height: Platform.OS === "android" ? 100 : 80,
    textAlignVertical: "top",
  },
  customFieldsSection: {
    marginBottom: 20,
  },
  customFieldsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addFieldButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    // backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addFieldButtonText: {
    // color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  templatesContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  templatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  templateButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 100,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  templateIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  templateLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  customFieldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  customFieldButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
    marginBottom: 10,
  },
  fieldLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    // borderWidth: 1,
    // borderColor: "#ddd",
    // borderRadius: 6,
    padding: 8,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    minHeight: Platform.OS === "android" ? 50 : 44,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  switchContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
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
    flex: 1,
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
