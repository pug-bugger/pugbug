import NotificationBanner, {
  NotificationType,
} from "@/components/ui/NotificationBanner";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import NotificationService, {
  NotificationPermissionStatus,
  NotificationSettings,
} from "../services/NotificationService";

interface NotificationContextType {
  // Service instance
  notificationService: NotificationService;

  // State
  settings: NotificationSettings;
  permissionStatus: NotificationPermissionStatus;
  isLoading: boolean;
  error: string | null;

  // Actions
  requestPermissions: () => Promise<NotificationPermissionStatus>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  triggerManualCheck: () => Promise<void>;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  showNotification: (
    message: string,
    type?: NotificationType,
    duration?: number
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

interface NotificationStackItem {
  id: string;
  message: string;
  type: NotificationType;
  visible: boolean;
  duration?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notificationService] = useState(() => new NotificationService());
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    dailyTime: "07:00",
    warningDays: 7,
    timezone: "Europe/Vilnius",
  });
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>({
      granted: false,
      canAskAgain: true,
      status: "undetermined",
    });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationStack, setNotificationStack] = useState<
    NotificationStackItem[]
  >([]);

  const showNotification = (
    message: string,
    type: NotificationType = "info",
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotificationStack((prev) => [
      { id, message, type, visible: true, duration },
      ...prev,
    ]);
  };

  const handleBannerClose = (id: string) => {
    setNotificationStack((prev) =>
      prev.map((n) => (n.id === id ? { ...n, visible: false } : n))
    );
  };

  // Remove notifications from stack when not visible
  useEffect(() => {
    if (notificationStack.length === 0) return;
    const timers = notificationStack.map((n) => {
      if (n.visible && n.duration) {
        return setTimeout(() => handleBannerClose(n.id), n.duration);
      }
      return null;
    });
    return () => {
      timers.forEach((t) => t && clearTimeout(t));
    };
  }, [notificationStack]);

  // Initialize the context
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load settings and permission status
        const [loadedSettings, loadedPermissions] = await Promise.all([
          notificationService.getSettings(),
          notificationService.getPermissionStatus(),
        ]);

        setSettings(loadedSettings);
        setPermissionStatus(loadedPermissions);
      } catch (err) {
        console.error("Error initializing notification context:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize notifications"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [notificationService]);

  // Request permissions
  const requestPermissions =
    async (): Promise<NotificationPermissionStatus> => {
      try {
        setIsLoading(true);
        setError(null);

        const status = await notificationService.requestPermissions();
        setPermissionStatus(status);

        return status;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to request permissions";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

  // Update settings
  const updateSettings = async (
    newSettings: Partial<NotificationSettings>
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await notificationService.updateSettings(newSettings);
      const updatedSettings = await notificationService.getSettings();
      setSettings(updatedSettings);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update settings";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Send test notification
  const sendTestNotification = async (): Promise<void> => {
    try {
      setError(null);
      await notificationService.sendTestNotification();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send test notification";
      setError(errorMessage);
      throw err;
    }
  };

  // Trigger manual check
  const triggerManualCheck = async (): Promise<void> => {
    try {
      setError(null);
      await notificationService.triggerManualCheck();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to trigger manual check";
      setError(errorMessage);
      throw err;
    }
  };

  // Enable notifications
  const enableNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await notificationService.enable();

      // Refresh status
      const [updatedSettings, updatedPermissions] = await Promise.all([
        notificationService.getSettings(),
        notificationService.getPermissionStatus(),
      ]);

      setSettings(updatedSettings);
      setPermissionStatus(updatedPermissions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to enable notifications";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Disable notifications
  const disableNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await notificationService.disable();

      // Refresh status
      const updatedSettings = await notificationService.getSettings();
      setSettings(updatedSettings);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to disable notifications";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh status
  const refreshStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const [updatedSettings, updatedPermissions] = await Promise.all([
        notificationService.getSettings(),
        notificationService.getPermissionStatus(),
      ]);

      setSettings(updatedSettings);
      setPermissionStatus(updatedPermissions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh status";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: NotificationContextType = {
    notificationService,
    settings,
    permissionStatus,
    isLoading,
    error,
    requestPermissions,
    updateSettings,
    sendTestNotification,
    triggerManualCheck,
    enableNotifications,
    disableNotifications,
    refreshStatus,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <>
        {notificationStack.map((n, idx) => (
          <NotificationBanner
            key={n.id}
            message={n.message}
            type={n.type}
            visible={n.visible}
            onClose={() => handleBannerClose(n.id)}
            duration={n.duration}
            style={{ top: 40 + idx * 64 }}
          />
        ))}
      </>
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Custom hook for notification settings
export const useNotificationSettings = () => {
  const { settings, updateSettings, isLoading, error } = useNotifications();

  return {
    settings,
    updateSettings,
    isLoading,
    error,
  };
};

// Custom hook for notification permissions
export const useNotificationPermissions = () => {
  const {
    permissionStatus,
    requestPermissions,
    refreshStatus,
    isLoading,
    error,
  } = useNotifications();

  return {
    permissionStatus,
    requestPermissions,
    refreshStatus,
    isLoading,
    error,
  };
};

// Custom hook for notification actions
export const useNotificationActions = () => {
  const {
    sendTestNotification,
    triggerManualCheck,
    enableNotifications,
    disableNotifications,
    error,
  } = useNotifications();

  return {
    sendTestNotification,
    triggerManualCheck,
    enableNotifications,
    disableNotifications,
    error,
  };
};

export default NotificationContext;
