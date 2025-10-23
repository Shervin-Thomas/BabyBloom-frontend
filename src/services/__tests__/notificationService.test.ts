import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import NotificationService, { MedicationReminder } from '../notificationService';
import { setupAndroidNotificationChannels, requestAndroidNotificationPermissions } from '../androidNotificationSetup';

// Mock the dependencies
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));
jest.mock('../androidNotificationSetup', () => ({
  setupAndroidNotificationChannels: jest.fn(),
  requestAndroidNotificationPermissions: jest.fn(),
}));

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockDevice = Device as jest.Mocked<typeof Device>;
const mockSetupAndroidNotificationChannels = setupAndroidNotificationChannels as jest.MockedFunction<typeof setupAndroidNotificationChannels>;
const mockRequestAndroidNotificationPermissions = requestAndroidNotificationPermissions as jest.MockedFunction<typeof requestAndroidNotificationPermissions>;

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset singleton instance
    (NotificationService as any).instance = undefined;
    notificationService = NotificationService.getInstance();
    
    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockSetupAndroidNotificationChannels.mockResolvedValue(undefined);
    mockRequestAndroidNotificationPermissions.mockResolvedValue(true);
    mockDevice.isDevice = true;
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'mock-token' } as any);
    mockNotifications.scheduleNotificationAsync.mockResolvedValue('mock-notification-id');
    mockNotifications.cancelScheduledNotificationAsync.mockResolvedValue();
    mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue();
    mockNotifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton pattern)', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  // Happy Path Tests
  describe('Initialize notification service successfully', () => {
    it('should initialize successfully with all permissions', async () => {
      const result = await notificationService.initialize();

      expect(result).toBe(true);
      expect(mockSetupAndroidNotificationChannels).toHaveBeenCalledTimes(1);
      expect(mockRequestAndroidNotificationPermissions).toHaveBeenCalledTimes(1);
      expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Push token:', 'mock-token');
    });

    it('should not reinitialize if already initialized', async () => {
      // First initialization
      await notificationService.initialize();
      jest.clearAllMocks();

      // Second initialization
      const result = await notificationService.initialize();

      expect(result).toBe(true);
      expect(mockSetupAndroidNotificationChannels).not.toHaveBeenCalled();
      expect(mockRequestAndroidNotificationPermissions).not.toHaveBeenCalled();
    });

    it('should initialize on simulator without push token', async () => {
      mockDevice.isDevice = false;

      const result = await notificationService.initialize();

      expect(result).toBe(true);
      expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Must use physical device for Push Notifications');
    });
  });

  describe('Schedule single medication reminder', () => {
    it('should schedule a medication reminder successfully', async () => {
      const reminder: MedicationReminder = {
        id: 'test-reminder-1',
        title: '💊 Medication Reminder',
        body: 'Time for Vitamin D (1 tablet) - Baby',
        scheduledTime: new Date('2024-12-25T08:00:00Z'),
        data: { medicationName: 'Vitamin D', dosage: '1 tablet' }
      };

      mockRequestAndroidNotificationPermissions.mockResolvedValue(true);

      const notificationId = await notificationService.scheduleMedicationReminder(reminder);

      expect(notificationId).toBe('mock-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: reminder.data,
          sound: 'default',
          channelId: 'medication-reminders',
        },
        trigger: {
          channelId: 'medication-reminders',
          date: reminder.scheduledTime,
        },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Scheduled notification mock-notification-id for ${reminder.scheduledTime}`
      );
    });

    it('should handle iOS platform correctly', async () => {
      (Platform as any).OS = 'ios';
      const reminder: MedicationReminder = {
        id: 'test-reminder-ios',
        title: 'iOS Reminder',
        body: 'Test body',
        scheduledTime: new Date('2024-12-25T08:00:00Z')
      };

      await notificationService.scheduleMedicationReminder(reminder);

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: reminder.data,
          sound: 'default',
        },
        trigger: {
          channelId: 'medication-reminders',
          date: reminder.scheduledTime,
        },
      });
    });
  });

  describe('Schedule multiple medication reminders', () => {
    it('should schedule multiple reminders successfully', async () => {
      const reminders: MedicationReminder[] = [
        {
          id: 'reminder-1',
          title: 'Morning Medication',
          body: 'Take vitamin A',
          scheduledTime: new Date('2024-12-25T08:00:00Z')
        },
        {
          id: 'reminder-2',
          title: 'Evening Medication',
          body: 'Take vitamin B',
          scheduledTime: new Date('2024-12-25T20:00:00Z')
        }
      ];

      mockNotifications.scheduleNotificationAsync
        .mockResolvedValueOnce('id-1')
        .mockResolvedValueOnce('id-2');

      const notificationIds = await notificationService.scheduleMultipleReminders(reminders);

      expect(notificationIds).toEqual(['id-1', 'id-2']);
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in multiple reminders', async () => {
      const reminders: MedicationReminder[] = [
        {
          id: 'reminder-success',
          title: 'Success',
          body: 'Will succeed',
          scheduledTime: new Date('2024-12-25T08:00:00Z')
        },
        {
          id: 'reminder-fail',
          title: 'Failure',
          body: 'Will fail',
          scheduledTime: new Date('2024-12-25T20:00:00Z')
        }
      ];

      mockNotifications.scheduleNotificationAsync
        .mockResolvedValueOnce('success-id')
        .mockRejectedValueOnce(new Error('Scheduling failed'));

      const notificationIds = await notificationService.scheduleMultipleReminders(reminders);

      expect(notificationIds).toEqual(['success-id']);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error scheduling notification:', expect.any(Error));
    });
  });

  describe('Create medication reminder objects', () => {
    it('should create reminders for morning and evening schedule', () => {
      const schedule = {
        id: 'sched-1',
        user_id: 'user-123',
        timesOfDay: ['morning', 'evening']
      };

      const reminders = notificationService.createMedicationReminders(
        'Vitamin D',
        '1 tablet',
        schedule,
        '2024-12-25',
        '2024-12-27',
        'Baby',
        10 // 10 minutes before
      );

      expect(reminders.length).toBeGreaterThan(0);
      expect(reminders[0]).toMatchObject({
        id: expect.stringContaining('Vitamin D'),
        title: '💊 Medication Reminder',
        body: 'Time for Vitamin D (1 tablet) - Baby',
        data: expect.objectContaining({
          medicationName: 'Vitamin D',
          dosage: '1 tablet',
          personType: 'Baby',
          userId: 'user-123',
          scheduleId: 'sched-1'
        })
      });
    });

    it('should skip past scheduled times', () => {
      // Create a schedule with times in the past
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5); // 5 days ago

      const schedule = {
        id: 'sched-past',
        user_id: 'user-123',
        timesOfDay: ['morning']
      };

      const reminders = notificationService.createMedicationReminders(
        'Past Medication',
        '1 tablet',
        schedule,
        pastDate.toISOString().split('T')[0],
        pastDate.toISOString().split('T')[0],
        'Adult'
      );

      expect(reminders).toHaveLength(0);
    });

    it('should handle empty or invalid schedule gracefully', () => {
      const emptySchedule = {
        id: 'empty-sched',
        user_id: 'user-123',
        timesOfDay: []
      };

      const reminders = notificationService.createMedicationReminders(
        'Test Med',
        '1 tablet',
        emptySchedule,
        '2024-12-25',
        '2024-12-27',
        'Baby'
      );

      expect(reminders).toHaveLength(0);
    });
  });

  // Input Verification Tests
  describe('Handle missing notification permissions', () => {
    it('should return false when permissions are denied', async () => {
      mockRequestAndroidNotificationPermissions.mockResolvedValue(false);

      const result = await notificationService.initialize();

      expect(result).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith('Failed to get notification permissions!');
    });

    it('should return null when scheduling without initialization', async () => {
      mockRequestAndroidNotificationPermissions.mockResolvedValue(false);
      
      const reminder: MedicationReminder = {
        id: 'test-reminder',
        title: 'Test',
        body: 'Test body',
        scheduledTime: new Date('2024-12-25T08:00:00Z')
      };

      const result = await notificationService.scheduleMedicationReminder(reminder);

      expect(result).toBeNull();
    });
  });

  describe('Handle invalid reminder data', () => {
    it('should handle reminder with missing required fields', async () => {
      const invalidReminder = {
        id: 'invalid',
        title: '',
        body: '',
        scheduledTime: new Date('2024-12-25T08:00:00Z')
      } as MedicationReminder;

      const result = await notificationService.scheduleMedicationReminder(invalidReminder);

      expect(result).toBe('mock-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '',
          body: '',
          data: invalidReminder.data,
          sound: 'default',
          channelId: 'medication-reminders',
        },
        trigger: {
          channelId: 'medication-reminders',
          date: invalidReminder.scheduledTime,
        },
      });
    });

    it('should handle null schedule in createMedicationReminders', () => {
      const reminders = notificationService.createMedicationReminders(
        'Test Med',
        '1 tablet',
        null as any,
        '2024-12-25',
        '2024-12-27',
        'Baby'
      );

      expect(reminders).toHaveLength(0);
    });
  });

  // Exception Handling Tests
  describe('Handle Expo Go push token errors', () => {
    it('should handle Expo Go SDK 53+ push token error gracefully', async () => {
      const expoGoError = new Error('Push notifications not available in Expo Go');
      mockNotifications.getExpoPushTokenAsync.mockRejectedValue(expoGoError);

      const result = await notificationService.initialize();

      expect(result).toBe(true); // Should still initialize successfully
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Push notifications not available in Expo Go. Use development build for push notifications.'
      );
    });

    it('should handle generic push token errors', async () => {
      const tokenError = new Error('Network error getting token');
      mockNotifications.getExpoPushTokenAsync.mockRejectedValue(tokenError);

      const result = await notificationService.initialize();

      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Push notifications not available in Expo Go. Use development build for push notifications.'
      );
    });
  });

  describe('Handle notification scheduling failures', () => {
    it('should handle scheduling errors gracefully', async () => {
      const schedulingError = new Error('Failed to schedule notification');
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(schedulingError);

      const reminder: MedicationReminder = {
        id: 'failing-reminder',
        title: 'Test',
        body: 'Test body',
        scheduledTime: new Date('2024-12-25T08:00:00Z')
      };

      const result = await notificationService.scheduleMedicationReminder(reminder);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error scheduling notification:', schedulingError);
    });

    it('should handle Android notification channel setup failure', async () => {
      const channelError = new Error('Channel setup failed');
      mockSetupAndroidNotificationChannels.mockRejectedValue(channelError);

      const result = await notificationService.initialize();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing notifications:', channelError);
    });

    it('should handle cancellation errors gracefully', async () => {
      const cancelError = new Error('Cancel failed');
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValue(cancelError);

      await notificationService.cancelNotification('test-id');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error cancelling notification:', cancelError);
    });

    it('should handle cancel all notifications errors', async () => {
      const cancelAllError = new Error('Cancel all failed');
      mockNotifications.cancelAllScheduledNotificationsAsync.mockRejectedValue(cancelAllError);

      await notificationService.cancelAllNotifications();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error cancelling all notifications:', cancelAllError);
    });

    it('should handle get scheduled notifications errors', async () => {
      const getError = new Error('Get scheduled failed');
      mockNotifications.getAllScheduledNotificationsAsync.mockRejectedValue(getError);

      const result = await notificationService.getScheduledNotifications();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting scheduled notifications:', getError);
    });
  });

  describe('Utility methods', () => {
    it('should cancel notification successfully', async () => {
      await notificationService.cancelNotification('test-notification-id');

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('test-notification-id');
      expect(consoleLogSpy).toHaveBeenCalledWith('Cancelled notification test-notification-id');
    });

    it('should cancel all notifications successfully', async () => {
      await notificationService.cancelAllNotifications();

      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Cancelled all notifications');
    });

    it('should get scheduled notifications successfully', async () => {
      const mockScheduled = [
        { identifier: 'id-1', content: { title: 'Test 1' } },
        { identifier: 'id-2', content: { title: 'Test 2' } }
      ] as any[];
      
      mockNotifications.getAllScheduledNotificationsAsync.mockResolvedValue(mockScheduled);

      const result = await notificationService.getScheduledNotifications();

      expect(result).toEqual(mockScheduled);
    });
  });
});