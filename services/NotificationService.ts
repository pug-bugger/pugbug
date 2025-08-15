import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { CustomFieldType, DateCustomField, Truck } from '../types/Truck';
import AsyncStorageService from './AsyncStorageService';

// Background task identifier
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
const DAILY_CHECK_TASK = 'DAILY-CHECK-TASK';

// Storage keys
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const LAST_CHECK_KEY = 'last_notification_check';

export interface NotificationSettings {
  enabled: boolean;
  dailyTime: string; // HH:MM format (24-hour)
  warningDays: number; // Days before deadline to warn
  timezone: string;
}

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

class NotificationService {
  private storageService = new AsyncStorageService<NotificationSettings>();
  private lastCheckStorage = new AsyncStorageService<string>();
  private isInitialized = false;

  // Default settings
  private defaultSettings: NotificationSettings = {
    enabled: true,
    dailyTime: '07:00', // 7 AM
    warningDays: 7, // 7 days before deadline
    timezone: 'Europe/Vilnius',
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;

    try {
      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Define background task
      this.defineBackgroundTask();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  private defineBackgroundTask() {
    // Define the background notification task
    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
      if (error) {
        console.error('Background notification task error:', error);
        return;
      }

      // console.log('Background notification task triggered');
      
      // Check if it's time for daily notification
      await this.performDailyCheck();
    });

    // Define daily check task
    TaskManager.defineTask(DAILY_CHECK_TASK, async ({ data, error }) => {
      if (error) {
        console.error('Daily check task error:', error);
        return;
      }

      // console.log('Daily check task triggered');
      await this.performDailyCheck();
    });
  }

  // Permission management
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      if (!Device.isDevice) {
        return {
          granted: false,
          canAskAgain: false,
          status: 'Device not supported',
        };
      }

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('truck-deadlines', {
          name: 'Truck Deadlines',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 0, 250],
          lightColor: '#FF231F7C',
          description: 'Notifications for vehicle deadlines',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }
      
      const granted = finalStatus === 'granted';
      
      if (granted) {
        // Register background task
        await this.registerBackgroundTask(true);
      }

      return {
        granted,
        canAskAgain: existingStatus === 'undetermined',
        status: finalStatus,
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'Error',
      };
    }
  }

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return {
        granted: settings.granted || (settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL),
        canAskAgain: settings.canAskAgain,
        status: settings.status,
      };
    } catch (error) {
      console.error('Error getting permission status:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'Error',
      };
    }
  }

  // Settings management
  async getSettings(): Promise<NotificationSettings> {
    try {
      const settings = await this.storageService.load(NOTIFICATION_SETTINGS_KEY);
      return settings || this.defaultSettings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.defaultSettings;
    }
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await this.storageService.save(NOTIFICATION_SETTINGS_KEY, newSettings);
      
      // Reschedule notifications with new settings
      await this.scheduleNextNotification();
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Background task management
  private async registerBackgroundTask(register = true) {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
      if (!isRegistered && register) {
        await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      } else if (isRegistered && !register) {
        await Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      }
    } catch (error) {
      console.error(`Error ${register ? 'registering' : 'unregistering'} background task:`, error);
    }
  }

  // Deadline checking
  private async performDailyCheck({force = false} = {}) {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) return;

      const now = new Date();
      const lastCheck = await this.lastCheckStorage.load(LAST_CHECK_KEY);

      // Check if we've already checked today
      if (lastCheck) {
        const lastCheckDate = new Date(lastCheck);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastCheckDay = new Date(lastCheckDate.getFullYear(), lastCheckDate.getMonth(), lastCheckDate.getDate());
        
        if (today.getTime() === lastCheckDay.getTime() && !force) {
          console.warn('Daily check already performed today');
          // return;
        }
      }
      

      // Load trucks from storage
      const trucksStorage = new AsyncStorageService<Truck[]>();
      const trucks = await trucksStorage.load('trucks') || [];

      // Check for trucks with upcoming deadlines
      const trucksWithWarnings = this.getTrucksWithUpcomingDeadlines(trucks, settings.warningDays);
      console.log("trucksWithWarnings", trucksWithWarnings);

      if (trucksWithWarnings.length > 0) {
        await this.sendDeadlineNotification(trucksWithWarnings);
      }

      // Update last check time
      await this.lastCheckStorage.save(LAST_CHECK_KEY, now.toISOString());
    } catch (error) {
      console.error('Error performing daily check:', error);
    }
  }

  private getTrucksWithUpcomingDeadlines(trucks: Truck[], warningDays: number): Array<{truck: Truck, deadlines: Array<{type: string, date: string, daysUntil: number}>}> {
    const now = new Date();
    const warningThreshold = warningDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    return trucks.map(truck => {
      const deadlines: Array<{type: string, date: string, daysUntil: number}> = [];

      // Check custom date fields
      if (truck.customFields) {
        const dateFields = truck.customFields.filter((field: any) => field.type === CustomFieldType.DATE) as DateCustomField[];
        
        dateFields.forEach(field => {
          if (field.value) {
            const fieldDate = new Date(field.value.seconds * 1000);

            const timeDiff = fieldDate.getTime() - now.getTime();
            const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            if (timeDiff > 0 && timeDiff <= warningThreshold) {
              deadlines.push({
                type: field.label,
                date: fieldDate.toISOString(),
                daysUntil,
              });
            }
          }
        });
      }

      // Legacy support: Check old deadline fields if they exist and aren't already covered by custom fields
      if ('insuranceDeadline' in truck && truck.insuranceDeadline && typeof truck.insuranceDeadline === 'string') {
        const hasInsuranceField = truck.customFields?.some((field: any) => 
          field.type === CustomFieldType.DATE && field.label.toLowerCase().includes('insurance')
        );
        
        if (!hasInsuranceField) {
          const insuranceDate = new Date(truck.insuranceDeadline);
          const timeDiff = insuranceDate.getTime() - now.getTime();
          const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          
          if (timeDiff > 0 && timeDiff <= warningThreshold) {
            deadlines.push({
              type: 'Insurance',
              date: truck.insuranceDeadline,
              daysUntil,
            });
          }
        }
      }

      if ('techInspectionDeadline' in truck && truck.techInspectionDeadline && typeof truck.techInspectionDeadline === 'string') {
        const hasTechField = truck.customFields?.some((field: any) => 
          field.type === CustomFieldType.DATE && 
          (field.label.toLowerCase().includes('tech') || field.label.toLowerCase().includes('inspection'))
        );
        
        if (!hasTechField) {
          const techDate = new Date(truck.techInspectionDeadline);
          const timeDiff = techDate.getTime() - now.getTime();
          const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          
          if (timeDiff > 0 && timeDiff <= warningThreshold) {
            deadlines.push({
              type: 'Tech Inspection',
              date: truck.techInspectionDeadline,
              daysUntil,
            });
          }
        }
      }

      return { truck, deadlines };
    }).filter(item => item.deadlines.length > 0);
  }

  private async sendDeadlineNotification(trucksWithWarnings: Array<{truck: Truck, deadlines: Array<{type: string, date: string, daysUntil: number}>}>) {
    try {
      const totalDeadlines = trucksWithWarnings.reduce((sum, item) => sum + item.deadlines.length, 0);
      const truckNames = trucksWithWarnings.map(item => item.truck.name);

      let title: string;
      let body: string;

      if (trucksWithWarnings.length === 1 && totalDeadlines === 1) {
        const truck = trucksWithWarnings[0].truck;
        const deadline = trucksWithWarnings[0].deadlines[0];
        title = `${truck.name} - ${deadline.type} Due Soon`;
        body = `${deadline.type} expires in ${deadline.daysUntil} day${deadline.daysUntil !== 1 ? 's' : ''}`;
      } else if (trucksWithWarnings.length === 1) {
        const truck = trucksWithWarnings[0].truck;
        title = `${truck.name} - Multiple Deadlines`;
        body = `${totalDeadlines} deadlines approaching`;
      } else {
        title = 'Truck Deadlines Warning';
        body = `${totalDeadlines} deadlines approaching for ${trucksWithWarnings.length} trucks`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'deadline_warning',
            trucks: trucksWithWarnings,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      // console.log('Deadline notification sent:', { title, body });
    } catch (error) {
      console.error('Error sending deadline notification:', error);
    }
  }

  // Scheduling
  async scheduleNextNotification() {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) return;

      // Cancel existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule daily notification
      const [hours, minutes] = settings.dailyTime.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (scheduledTime.getTime() <= now.getTime()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Truck Check',
          body: 'Checking for upcoming deadlines...',
          data: {
            type: 'daily_check',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });

      // console.log(`Daily notification scheduled for ${settings.dailyTime}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Manual operations
  async triggerManualCheck(): Promise<void> {
    await this.performDailyCheck({force: true});
  }

  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from PugBug!',
          data: {
            type: 'test',
          },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  // Cleanup
  async disable(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await this.registerBackgroundTask(false);
      await this.updateSettings({ enabled: false });
    } catch (error) {
      console.error('Error disabling notifications:', error);
      throw error;
    }
  }

  async enable(): Promise<void> {
    try {
      const permissions = await this.requestPermissions();
      if (permissions.granted) {
        await this.updateSettings({ enabled: true });
        await this.scheduleNextNotification();
      } else {
        throw new Error('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      throw error;
    }
  }

  // Utility methods
  formatDeadlineDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("lt-LT");
  }

  getDaysUntilDeadline(dateString: string): number {
    const now = new Date();
    const deadline = new Date(dateString);
    const timeDiff = deadline.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  isDeadlineOverdue(dateString: string): boolean {
    const now = new Date();
    const deadline = new Date(dateString);
    return deadline.getTime() < now.getTime();
  }

  isDeadlineUpcoming(dateString: string, warningDays: number): boolean {
    const now = new Date();
    const deadline = new Date(dateString);
    const timeDiff = deadline.getTime() - now.getTime();
    const warningThreshold = warningDays * 24 * 60 * 60 * 1000;
    
    return timeDiff > 0 && timeDiff <= warningThreshold;
  }
}

export default NotificationService; 