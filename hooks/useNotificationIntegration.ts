import { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useTrucks } from './useTrucks';

/**
 * Hook that integrates notifications with truck management
 * Automatically schedules notifications when trucks are added/updated
 */
export const useNotificationIntegration = () => {
  const { notificationService, settings, permissionStatus } = useNotifications();
  const { trucks } = useTrucks();

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
        const deadlines = [];
        
        if (truck.insuranceDeadline) {
          const insuranceDate = new Date(truck.insuranceDeadline);
          const timeDiff = insuranceDate.getTime() - now.getTime();
          if (timeDiff > 0 && timeDiff <= warningThreshold) {
            deadlines.push('insurance');
          }
        }

        if (truck.techInspectionDeadline) {
          const techDate = new Date(truck.techInspectionDeadline);
          const timeDiff = techDate.getTime() - now.getTime();
          if (timeDiff > 0 && timeDiff <= warningThreshold) {
            deadlines.push('techInspection');
          }
        }

        return deadlines.length > 0;
      });
    },

    // Get trucks with overdue deadlines
    getTrucksWithOverdueDeadlines: () => {
      const now = new Date();

      return trucks.filter(truck => {
        const overdueDeadlines = [];
        
        if (truck.insuranceDeadline) {
          const insuranceDate = new Date(truck.insuranceDeadline);
          if (insuranceDate.getTime() < now.getTime()) {
            overdueDeadlines.push('insurance');
          }
        }

        if (truck.techInspectionDeadline) {
          const techDate = new Date(truck.techInspectionDeadline);
          if (techDate.getTime() < now.getTime()) {
            overdueDeadlines.push('techInspection');
          }
        }

        return overdueDeadlines.length > 0;
      });
    },

    // Get deadline status for a specific truck
    getTruckDeadlineStatus: (truckId: string) => {
      const truck = trucks.find(t => t.id === truckId);
      if (!truck) return null;

      const now = new Date();
      const warningThreshold = settings.warningDays * 24 * 60 * 60 * 1000;

      const status = {
        insurance: {
          date: truck.insuranceDeadline,
          status: 'ok' as 'ok' | 'warning' | 'overdue',
          daysUntil: 0,
        },
        techInspection: {
          date: truck.techInspectionDeadline,
          status: 'ok' as 'ok' | 'warning' | 'overdue',
          daysUntil: 0,
        },
      };

      // Check insurance deadline
      if (truck.insuranceDeadline) {
        const insuranceDate = new Date(truck.insuranceDeadline);
        const timeDiff = insuranceDate.getTime() - now.getTime();
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        status.insurance.daysUntil = daysUntil;
        
        if (timeDiff < 0) {
          status.insurance.status = 'overdue';
        } else if (timeDiff <= warningThreshold) {
          status.insurance.status = 'warning';
        }
      }

      // Check tech inspection deadline
      if (truck.techInspectionDeadline) {
        const techDate = new Date(truck.techInspectionDeadline);
        const timeDiff = techDate.getTime() - now.getTime();
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
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

        const hasUpcomingDeadline = [truck.insuranceDeadline, truck.techInspectionDeadline]
          .some(deadline => {
            if (!deadline) return false;
            const deadlineDate = new Date(deadline);
            const timeDiff = deadlineDate.getTime() - now.getTime();
            return timeDiff > 0 && timeDiff <= warningThreshold;
          });

        return hasUpcomingDeadline;
      });

      const overdueTrucks = trucks.filter(truck => {
        const now = new Date();

        const hasOverdueDeadline = [truck.insuranceDeadline, truck.techInspectionDeadline]
          .some(deadline => {
            if (!deadline) return false;
            const deadlineDate = new Date(deadline);
            return deadlineDate.getTime() < now.getTime();
          });

        return hasOverdueDeadline;
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