import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  useNotificationActions,
  useNotificationPermissions,
  useNotificationSettings,
} from "../contexts/NotificationContext";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const NotificationSettings: React.FC = () => {
  const { settings, updateSettings, isLoading, error } =
    useNotificationSettings();
  const { permissionStatus, requestPermissions } = useNotificationPermissions();
  const {
    sendTestNotification,
    triggerManualCheck,
    enableNotifications,
    disableNotifications,
  } = useNotificationActions();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  // Initialize temp time when component mounts
  React.useEffect(() => {
    const [hours, minutes] = settings.dailyTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    setTempTime(date);
  }, [settings.dailyTime]);

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        if (!permissionStatus.granted) {
          const status = await requestPermissions();
          if (!status.granted) {
            Alert.alert(
              "Permission Required",
              "Notifications require permission to work. Please enable them in your device settings.",
              [{ text: "OK" }]
            );
            return;
          }
        }
        await enableNotifications();
      } else {
        await disableNotifications();
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to toggle notifications",
        [{ text: "OK" }]
      );
    }
  };

  const handleWarningDaysChange = (days: number) => {
    updateSettings({ warningDays: days });
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      updateSettings({ dailyTime: `${hours}:${minutes}` });
    }
  };

  const handleTestNotification = async () => {
    try {
      if (!permissionStatus.granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications first to test them.",
          [{ text: "OK" }]
        );
        return;
      }

      await sendTestNotification();
      Alert.alert("Test Sent", "A test notification has been sent!", [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification", [
        { text: "OK" },
      ]);
    }
  };

  const handleManualCheck = async () => {
    try {
      await triggerManualCheck();
      Alert.alert(
        "Check Complete",
        "Manual deadline check has been performed. You will receive a notification if any deadlines are approaching.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to perform manual check", [{ text: "OK" }]);
    }
  };

  const handleRequestPermissions = async () => {
    try {
      const status = await requestPermissions();
      if (status.granted) {
        Alert.alert("Success", "Notification permissions granted!", [
          { text: "OK" },
        ]);
      } else {
        Alert.alert(
          "Permission Denied",
          "Notification permissions were denied. You can enable them in your device settings.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to request permissions", [{ text: "OK" }]);
    }
  };

  const getPermissionStatusText = () => {
    if (permissionStatus.granted) {
      return "Granted";
    } else if (permissionStatus.canAskAgain) {
      return "Not Requested";
    } else {
      return "Denied";
    }
  };

  const getPermissionStatusColor = () => {
    if (permissionStatus.granted) {
      return "#28a745";
    } else if (permissionStatus.canAskAgain) {
      return "#ffc107";
    } else {
      return "#dc3545";
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A1CEDC" />
        <ThemedText style={styles.loadingText}>
          Loading notification settings...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Notification Settings
        </ThemedText>

        {error && (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        )}

        {/* Permission Status */}
        <ThemedView style={styles.settingItem}>
          <ThemedText type="subtitle">Permission Status</ThemedText>
          <ThemedView style={styles.permissionStatus}>
            <Text
              style={[
                styles.permissionText,
                { color: getPermissionStatusColor() },
              ]}
            >
              {getPermissionStatusText()}
            </Text>
            {!permissionStatus.granted && permissionStatus.canAskAgain && (
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={handleRequestPermissions}
              >
                <Text style={styles.permissionButtonText}>Request</Text>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>

        {/* Enable/Disable Notifications */}
        <ThemedView style={styles.settingItem}>
          <ThemedText type="subtitle">Enable Notifications</ThemedText>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: "#767577", true: "#A1CEDC" }}
            thumbColor={settings.enabled ? "#ffffff" : "#f4f3f4"}
            disabled={isLoading}
          />
        </ThemedView>

        {/* Daily Check Time */}
        <ThemedView style={styles.settingItem}>
          <ThemedText type="subtitle">Daily Check Time</ThemedText>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
            disabled={!settings.enabled}
          >
            <Text
              style={[
                styles.timeButtonText,
                !settings.enabled && styles.disabledText,
              ]}
            >
              {settings.dailyTime}
            </Text>
          </TouchableOpacity>
        </ThemedView>

        {showTimePicker && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Warning Days */}
        <ThemedView style={styles.settingItem}>
          <ThemedText type="subtitle">Warning Days</ThemedText>
          <ThemedText style={styles.settingDescription}>
            Get notified this many days before deadlines
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            overScrollMode="never"
          >
            <ThemedView style={styles.warningDaysContainer}>
              {[3, 7, 14, 30].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.warningDayButton,
                    settings.warningDays === days &&
                      styles.warningDayButtonActive,
                    !settings.enabled && styles.disabledButton,
                  ]}
                  onPress={() => handleWarningDaysChange(days)}
                  disabled={!settings.enabled}
                >
                  <Text
                    style={[
                      styles.warningDayButtonText,
                      settings.warningDays === days &&
                        styles.warningDayButtonTextActive,
                      !settings.enabled && styles.disabledText,
                    ]}
                  >
                    {days} days
                  </Text>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ScrollView>
        </ThemedView>

        {/* Test Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Test & Actions
          </ThemedText>

          <TouchableOpacity
            style={[styles.actionButton, styles.testButton]}
            onPress={handleTestNotification}
            disabled={!permissionStatus.granted || isLoading}
          >
            <Text
              style={[
                styles.actionButtonText,
                (!permissionStatus.granted || isLoading) && styles.disabledText,
              ]}
            >
              Send Test Notification
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.checkButton]}
            onPress={handleManualCheck}
            disabled={!settings.enabled || isLoading}
          >
            <Text
              style={[
                styles.actionButtonText,
                (!settings.enabled || isLoading) && styles.disabledText,
              ]}
            >
              Check Deadlines Now
            </Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Information */}
        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">How it works</ThemedText>
          <ThemedText style={styles.infoText}>
            • Daily notifications are sent at your chosen time
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • You'll only receive notifications when trucks have upcoming
            deadlines
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Notifications work even when the app is closed
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Check your device settings if notifications aren't working
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    gap: 16,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666",
    position: "absolute",
    bottom: -8,
    left: 0,
  },
  permissionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  permissionButton: {
    backgroundColor: "#A1CEDC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  timeButton: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  warningDaysContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  warningDayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
  },
  warningDayButtonActive: {
    backgroundColor: "#A1CEDC",
    borderColor: "#A1CEDC",
  },
  warningDayButtonText: {
    fontSize: 14,
    color: "#333",
  },
  warningDayButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  testButton: {
    backgroundColor: "#28a745",
  },
  checkButton: {
    backgroundColor: "#007bff",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: "#999",
  },
  disabledButton: {
    opacity: 0.5,
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
  infoContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
});

export default NotificationSettings;
