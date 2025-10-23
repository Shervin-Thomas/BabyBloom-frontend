import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { setupAndroidNotificationChannels, requestAndroidNotificationPermissions } from '../androidNotificationSetup';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe('androidNotificationSetup', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Default successful mocks
    mockNotifications.setNotificationChannelAsync.mockResolvedValue();
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('setupAndroidNotificationChannels', () => {
    // Happy Path Tests
    describe('Setup notification channels successfully', () => {
      it('should create medication-reminders channel on Android', async () => {
        await setupAndroidNotificationChannels();

        expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith(
          'medication-reminders',
          {
            name: 'Medication Reminders',
            description: 'Notifications for medication reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FC7596',
            sound: 'default',
            enableVibrate: true,
            enableLights: true,
            showBadge: true,
          }
        );
      });

      it('should create general notifications channel on Android', async () => {
        await setupAndroidNotificationChannels();

        expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith(
          'general',
          {
            name: 'General Notifications',
            description: 'General app notifications',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FC7596',
            sound: 'default',
            enableVibrate: true,
            enableLights: true,
            showBadge: true,
          }
        );
      });

      it('should create both channels in correct order', async () => {
        await setupAndroidNotificationChannels();

        expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledTimes(2);
        expect(mockNotifications.setNotificationChannelAsync).toHaveBeenNthCalledWith(
          1,
          'medication-reminders',
          expect.any(Object)
        );
        expect(mockNotifications.setNotificationChannelAsync).toHaveBeenNthCalledWith(
          2,
          'general',
          expect.any(Object)
        );
      });
    });

    // Branching Tests
    describe('Handle different platforms correctly', () => {
      it('should skip channel setup on iOS', async () => {
        (Platform as any).OS = 'ios';

        await setupAndroidNotificationChannels();

        expect(mockNotifications.setNotificationChannelAsync).not.toHaveBeenCalled();
      });

      it('should skip channel setup on web', async () => {
        (Platform as any).OS = 'web';

        await setupAndroidNotificationChannels();

        expect(mockNotifications.setNotificationChannelAsync).not.toHaveBeenCalled();
      });
    });

    // Exception Handling Tests
    describe('Handle channel creation failures', () => {
      it('should handle first channel creation error', async () => {
        const channelError = new Error('Failed to create medication channel');
        mockNotifications.setNotificationChannelAsync
          .mockRejectedValueOnce(channelError)
          .mockResolvedValueOnce();

        await expect(setupAndroidNotificationChannels()).rejects.toThrow(channelError);
        
        expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledTimes(1);
      });

      it('should handle second channel creation error', async () => {
        const channelError = new Error('Failed to create general channel');
        mockNotifications.setNotificationChannelAsync
          .mockResolvedValueOnce()
          .mockRejectedValueOnce(channelError);

        await expect(setupAndroidNotificationChannels()).rejects.toThrow(channelError);
        
        expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('requestAndroidNotificationPermissions', () => {
    // Happy Path Tests
    describe('Permission already granted scenario', () => {
      it('should return true when permissions already granted', async () => {
        mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(true);
        expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
        expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
      });
    });

    describe('Permission request granted scenario', () => {
      it('should request and grant permissions successfully', async () => {
        mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as any);
        mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(true);
        expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
        expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledWith({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowVibrate: true,
          },
        });
      });

      it('should handle denied status and request permissions', async () => {
        mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
        mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(true);
        expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });

    // Input Verification Tests
    describe('Permission request denied scenario', () => {
      it('should return false when existing permissions denied and request fails', async () => {
        mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
        mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith('Failed to get push token for push notification!');
      });

      it('should return false when permissions initially undetermined but request denied', async () => {
        mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as any);
        mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith('Failed to get push token for push notification!');
      });
    });

    // Branching Tests
    describe('Handle different platforms correctly', () => {
      it('should return true on iOS without checking permissions', async () => {
        (Platform as any).OS = 'ios';

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(true);
        expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
        expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
      });

      it('should return true on web without checking permissions', async () => {
        (Platform as any).OS = 'web';

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(true);
        expect(mockNotifications.getPermissionsAsync).not.toHaveBeenCalled();
        expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
      });
    });

    // Exception Handling Tests
    describe('Handle permission API errors', () => {
      it('should handle getPermissionsAsync error', async () => {
        const permissionError = new Error('Failed to get permissions');
        mockNotifications.getPermissionsAsync.mockRejectedValue(permissionError);

        await expect(requestAndroidNotificationPermissions()).rejects.toThrow(permissionError);
      });

      it('should handle requestPermissionsAsync error', async () => {
        const requestError = new Error('Failed to request permissions');
        mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
        mockNotifications.requestPermissionsAsync.mockRejectedValue(requestError);

        await expect(requestAndroidNotificationPermissions()).rejects.toThrow(requestError);
      });

      it('should handle malformed permission response', async () => {
        mockNotifications.getPermissionsAsync.mockResolvedValue({} as any); // Missing status
        mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(true);
        expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
      });

      it('should handle malformed request response', async () => {
        mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
        mockNotifications.requestPermissionsAsync.mockResolvedValue({} as any); // Missing status

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith('Failed to get push token for push notification!');
      });
    });

    describe('Handle various permission status values', () => {
      it('should handle unknown status values', async () => {
        mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'unknown' } as any);
        mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

        const result = await requestAndroidNotificationPermissions();

        expect(result).toBe(true);
        expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work correctly when both functions are called together', async () => {
      await setupAndroidNotificationChannels();
      const hasPermissions = await requestAndroidNotificationPermissions();

      expect(hasPermissions).toBe(true);
      expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledTimes(2);
      expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
    });

    it('should handle mixed success/failure scenarios', async () => {
      // Channel setup succeeds
      mockNotifications.setNotificationChannelAsync.mockResolvedValue();
      
      // Permission request fails
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

      await setupAndroidNotificationChannels();
      const hasPermissions = await requestAndroidNotificationPermissions();

      expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledTimes(2);
      expect(hasPermissions).toBe(false);
    });
  });
});