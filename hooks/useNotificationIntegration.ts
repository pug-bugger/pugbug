import { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { CustomFieldType, DateCustomField } from '../types/Truck';
import { useTrucks } from './useTrucks';

/**
 * Hook that integrates notifications with truck management
 * Automatically schedules notifications when trucks are added/updated
 */
export const useNotificationIntegration = () => {
  const { notificationService, settings, permissionStatus } = useNotifications();
  const { trucks } = useTrucks();

  // Helper function to get date custom fields from a truck
  const getDateFields = (truck: any) => {
    if (!truck.customFields) return [];
    return truck.customFields.filter((field: any) => field.type === CustomFieldType.DATE) as DateCustomField[];
  };

  // Helper function to check if a date field is for insurance
  const isInsuranceField = (field: DateCustomField) => {
    return field.label.toLowerCase().includes('insurance');
  };

  // Helper function to check if a date field is for tech inspection
  const isTechInspectionField = (field: DateCustomField) => {
    return field.label.toLowerCase().includes('tech') || field.label.toLowerCase().includes('inspection');
  };

  // Schedule notifications whenever trucks change
  useEffect(() => {
    const scheduleNotifications = async () => {
      if (!settings.enabled || !permissionStatus.granted) {
        return;
      }

      try {
        // Reschedule notifications with updated truck data
        await notificationService.scheduleNextNotification();
      } catch (error) {
        console.error('Error scheduling notifications after truck update:', error);
      }
    };

    scheduleNotifications();
  }, [trucks, settings.enabled, permissionStatus.granted, notificationService]);

  // Initialize notifications when the app starts
  useEffect(() => {
    const initializeNotifications = async () => {
      if (settings.enabled && permissionStatus.granted) {
        try {
          await notificationService.scheduleNextNotification();
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      }
    };

    initializeNotifications();
  }, [settings.enabled, permissionStatus.granted, notificationService]);

  return {
    // Utility functions for checking truck deadlines
    getTrucksWithUpcomingDeadlines: () => {
      const now = new Date();
      const warningThreshold = settings.warningDays * 24 * 60 * 60 * 1000;

      return trucks.filter(truck => {
        const dateFields = getDateFields(truck);
        
        return dateFields.some(field => {
          if (!field.value) return false;
          const fieldDate = new Date(field.value);
          const timeDiff = fieldDate.getTime() - now.getTime();
          return timeDiff > 0 && timeDiff <= warningThreshold;
        });
      });
    },

    // Get trucks with overdue deadlines
    getTrucksWithOverdueDeadlines: () => {
      const now = new Date();

      return trucks.filter(truck => {
        const dateFields = getDateFields(truck);
        
        return dateFields.some(field => {
          if (!field.value) return false;
          const fieldDate = new Date(field.value);
          return fieldDate.getTime() < now.getTime();
        });
      });
    },

    // Get deadline status for a specific truck
    getTruckDeadlineStatus: (truckId: string) => {
      const truck = trucks.find(t => t.id === truckId);
      if (!truck) return null;

      const now = new Date();
      const warningThreshold = settings.warningDays * 24 * 60 * 60 * 1000;
      const dateFields = getDateFields(truck);

      const status = {
        insurance: {
          date: null as Date | null,
          status: 'ok' as 'ok' | 'warning' | 'overdue',
          daysUntil: 0,
        },
        techInspection: {
          date: null as Date | null,
          status: 'ok' as 'ok' | 'warning' | 'overdue',
          daysUntil: 0,
        },
        customFields: dateFields.map(field => {
          const fieldDate = field.value ? new Date(field.value) : null;
          let fieldStatus: 'ok' | 'warning' | 'overdue' = 'ok';
          let daysUntil = 0;

          if (fieldDate) {
            const timeDiff = fieldDate.getTime() - now.getTime();
            daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            if (timeDiff < 0) {
              fieldStatus = 'overdue';
            } else if (timeDiff <= warningThreshold) {
              fieldStatus = 'warning';
            }
          }

          return {
            id: field.id,
            label: field.label,
            date: fieldDate,
            status: fieldStatus,
            daysUntil,
          };
        }),
      };

      // Check for insurance deadline (backward compatibility)
      const insuranceField = dateFields.find(isInsuranceField);
      if (insuranceField && insuranceField.value) {
        const insuranceDate = new Date(insuranceField.value);
        const timeDiff = insuranceDate.getTime() - now.getTime();
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        status.insurance.date = insuranceDate;
        status.insurance.daysUntil = daysUntil;
        
        if (timeDiff < 0) {
          status.insurance.status = 'overdue';
        } else if (timeDiff <= warningThreshold) {
          status.insurance.status = 'warning';
        }
      }

      // Check for tech inspection deadline (backward compatibility)
      const techField = dateFields.find(isTechInspectionField);
      if (techField && techField.value) {
        const techDate = new Date(techField.value);
        const timeDiff = techDate.getTime() - now.getTime();
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        status.techInspection.date = techDate;
        status.techInspection.daysUntil = daysUntil;
        
        if (timeDiff < 0) {
          status.techInspection.status = 'overdue';
        } else if (timeDiff <= warningThreshold) {
          status.techInspection.status = 'warning';
        }
      }

      return status;
    },

    // Check if notifications are properly set up
    isNotificationSetupComplete: () => {
      return settings.enabled && permissionStatus.granted;
    },

    // Get notification summary
    getNotificationSummary: () => {
      const upcomingTrucks = trucks.filter(truck => {
        const now = new Date();
        const warningThreshold = settings.warningDays * 24 * 60 * 60 * 1000;
        const dateFields = getDateFields(truck);

        return dateFields.some(field => {
          if (!field.value) return false;
          const fieldDate = new Date(field.value);
          const timeDiff = fieldDate.getTime() - now.getTime();
          return timeDiff > 0 && timeDiff <= warningThreshold;
        });
      });

      const overdueTrucks = trucks.filter(truck => {
        const now = new Date();
        const dateFields = getDateFields(truck);

        return dateFields.some(field => {
          if (!field.value) return false;
          const fieldDate = new Date(field.value);
          return fieldDate.getTime() < now.getTime();
        });
      });

      return {
        totalTrucks: trucks.length,
        upcomingDeadlines: upcomingTrucks.length,
        overdueDeadlines: overdueTrucks.length,
        notificationsEnabled: settings.enabled,
        permissionsGranted: permissionStatus.granted,
        nextCheckTime: settings.dailyTime,
        warningDays: settings.warningDays,
      };
    },
  };
};

export default useNotificationIntegration; 