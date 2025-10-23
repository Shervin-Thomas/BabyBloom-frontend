import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { DateTriggerInput } from 'expo-notifications';
import { setupAndroidNotificationChannels, requestAndroidNotificationPermissions } from './androidNotificationSetup';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface MedicationReminder {
  id: string;
  title: string;
  body: string;
  data?: any;
  scheduledTime: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Setup Android notification channels first
      await setupAndroidNotificationChannels();

      // Request permissions with Android-specific settings
      const hasPermission = await requestAndroidNotificationPermissions();
      
      if (!hasPermission) {
        console.log('Failed to get notification permissions!');
        return false;
      }

      // Get push token (for future use with push notifications)
      // Note: Push notifications are not available in Expo Go SDK 53+
      if (Device.isDevice) {
        try {
          const token = await Notifications.getExpoPushTokenAsync();
          console.log('Push token:', token.data);
        } catch (error) {
          console.log('Push notifications not available in Expo Go. Use development build for push notifications.');
          // This is expected in Expo Go SDK 53+, continue with local notifications only
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleMedicationReminder(reminder: MedicationReminder): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: reminder.data,
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'medication-reminders',
          }),
        },
        trigger: {
          channelId: 'medication-reminders',
          date: reminder.scheduledTime
        } as DateTriggerInput,
      });

      console.log(`Scheduled notification ${notificationId} for ${reminder.scheduledTime}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async scheduleMultipleReminders(reminders: MedicationReminder[]): Promise<string[]> {
    const notificationIds: string[] = [];
    
    for (const reminder of reminders) {
      const id = await this.scheduleMedicationReminder(reminder);
      if (id) {
        notificationIds.push(id);
      }
    }

    return notificationIds;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled notification ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Create medication reminder notifications based on schedule
  createMedicationReminders(
    medicationName: string,
    dosage: string,
    schedule: any,
    startDate: string,
    endDate: string,
    personType: string,
    notificationTimeBefore: number = 5
  ): MedicationReminder[] {
    const reminders: MedicationReminder[] = [];
    const timesOfDay = schedule?.timesOfDay || [];
    
    if (timesOfDay.length === 0) return reminders;

    // Convert times of day to actual times
    const timeMap: { [key: string]: string } = {
      morning: '08:00',
      noon: '12:00',
      evening: '18:00',
      night: '22:00'
    };

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate reminders for each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      for (const timeOfDay of timesOfDay) {
        const timeString = timeMap[timeOfDay];
        if (!timeString) continue;

        const [hours, minutes] = timeString.split(':').map(Number);
        const reminderTime = new Date(date);
        reminderTime.setHours(hours, minutes, 0, 0);

        // Only schedule future reminders
        if (reminderTime > new Date()) {
          // Schedule X minutes before the actual time (based on user preference)
          const notificationTime = new Date(reminderTime.getTime() - notificationTimeBefore * 60 * 1000);

          reminders.push({
            id: `${medicationName}-${date.toISOString().split('T')[0]}-${timeOfDay}`,
            title: `💊 Medication Reminder`,
            body: `Time for ${medicationName} (${dosage}) - ${personType}`,
            data: {
              medicationName,
              dosage,
              personType,
              scheduledTime: reminderTime.toISOString(),
              timeOfDay,
              userId: schedule.user_id,
              scheduleId: schedule.id
            },
            scheduledTime: notificationTime
          });
        }
      }
    }

    return reminders;
  }
}

export default NotificationService;
