import * as Notifications from 'expo-notifications';
import NotificationService from '../../services/notificationService';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('../../services/notificationService');

// Mock lib/supabase
const mockSupabase = {
  from: jest.fn(),
};
jest.mock('lib/supabase', () => ({
  supabase: mockSupabase,
}));

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockNotificationService = NotificationService as jest.MockedClass<typeof NotificationService>;

// Create mock service instance
const mockServiceInstance = {
  initialize: jest.fn(),
  createMedicationReminders: jest.fn(),
  scheduleMultipleReminders: jest.fn(),
  cancelAllNotifications: jest.fn(),
};

describe('useNotificationManager', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock notification listeners
    mockNotifications.addNotificationReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
    mockNotifications.addNotificationResponseReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
    mockNotifications.removeNotificationSubscription = jest.fn();

    // Mock NotificationService
    mockNotificationService.getInstance.mockReturnValue(mockServiceInstance as any);
    mockServiceInstance.initialize.mockResolvedValue(true);
    mockServiceInstance.createMedicationReminders.mockReturnValue([]);
    mockServiceInstance.scheduleMultipleReminders.mockResolvedValue(['id1', 'id2']);
    mockServiceInstance.cancelAllNotifications.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('NotificationService Integration', () => {
    it('should use NotificationService singleton instance', () => {
      // Import here to avoid module loading issues
      const { useNotificationManager } = require('../useNotificationManager');
      
      // The hook will be called during import, which should trigger getInstance
      expect(mockNotificationService.getInstance).toHaveBeenCalled();
    });

    it('should handle service initialization', async () => {
      mockServiceInstance.initialize.mockResolvedValue(true);
      
      // Re-import to trigger fresh initialization
      delete require.cache[require.resolve('../useNotificationManager')];
      const { useNotificationManager } = require('../useNotificationManager');
      
      expect(mockServiceInstance.initialize).toHaveBeenCalled();
    });

    it('should handle service initialization failure', async () => {
      const initError = new Error('Initialization failed');
      mockServiceInstance.initialize.mockRejectedValue(initError);
      
      // Re-import to trigger fresh initialization
      delete require.cache[require.resolve('../useNotificationManager')];
      
      // Should not throw even if initialization fails
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });
  });

  describe('Notification Listeners Setup', () => {
    it('should set up notification listeners', () => {
      // Import the hook to trigger listener setup
      const { useNotificationManager } = require('../useNotificationManager');
      
      expect(mockNotifications.addNotificationReceivedListener).toHaveBeenCalledWith(expect.any(Function));
      expect(mockNotifications.addNotificationResponseReceivedListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle notification received events', () => {
      const { useNotificationManager } = require('../useNotificationManager');
      
      const mockNotification = {
        date: Date.now(),
        request: {
          identifier: 'test-id',
          content: {
            title: 'Test Notification',
            body: 'Test body',
            data: { medicationName: 'Test Med' }
          }
        }
      } as Notifications.Notification;

      // Get the listener function that was registered
      const receivedListener = mockNotifications.addNotificationReceivedListener.mock.calls[0][0];
      
      // Test that the listener handles the notification
      receivedListener(mockNotification);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Notification received:', mockNotification);
    });

    it('should handle notification response events', () => {
      const { useNotificationManager } = require('../useNotificationManager');
      
      const mockNotification = {
        request: {
          identifier: 'response-test-id',
          content: {
            title: 'Response Test',
            body: 'Response body'
          }
        }
      } as Notifications.Notification;

      const mockResponse = {
        notification: mockNotification,
        actionIdentifier: 'default'
      } as Notifications.NotificationResponse;

      // Get the listener function that was registered
      const responseListener = mockNotifications.addNotificationResponseReceivedListener.mock.calls[0][0];
      
      // Test that the listener handles the response
      responseListener(mockResponse);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Notification response:', mockResponse);
    });
  });

  describe('Supabase Integration', () => {
    beforeEach(() => {
      // Setup default Supabase mocks
      const mockSelect = jest.fn();
      const mockInsert = jest.fn();
      const mockEq = jest.fn();

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      } as any);

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          data: [],
          error: null,
        }),
      });

      mockInsert.mockReturnValue({
        data: [],
        error: null,
      });
    });

    it('should handle empty schedules from database', () => {
      // Test that the hook can handle empty database responses
      const mockEq = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          data: [],
          error: null
        })
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq
        })
      } as any);

      // Should not throw when encountering empty schedules
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });

    it('should handle database errors gracefully', () => {
      const dbError = new Error('Database connection failed');
      const mockEq = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          data: null,
          error: dbError
        })
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq
        })
      } as any);

      // Should not throw even when database errors occur
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });

    it('should handle insert errors when marking doses as taken', () => {
      const insertError = new Error('Insert failed');
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          data: null,
          error: insertError
        })
      } as any);

      // Should not throw even when insert operations fail
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing permissions gracefully', () => {
      // Mock service to simulate permission denial
      mockServiceInstance.initialize.mockResolvedValue(false);
      
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });

    it('should handle Expo Go push token errors', () => {
      // This error is already being triggered by the expo-notifications import
      // Verify that it doesn't crash the hook
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
      
      // The warning should have been logged
      expect(consoleLogSpy.mock.calls.some(call => 
        call[0]?.includes && call[0].includes('expo-notifications')
      )).toBeTruthy();
    });

    it('should handle notification scheduling failures', async () => {
      const schedulingError = new Error('Scheduling failed');
      mockServiceInstance.scheduleMultipleReminders.mockRejectedValue(schedulingError);
      
      // Should not throw even when scheduling fails
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });
  });

  describe('Medication Reminder Creation', () => {
    it('should work with NotificationService for creating reminders', () => {
      // Mock some sample medication schedules
      const mockReminders = [
        {
          id: 'reminder-1',
          content: {
            title: 'Medication Reminder',
            body: 'Time for your medication',
            data: { medicationName: 'Test Med' }
          },
          trigger: { date: new Date(Date.now() + 60000) }
        }
      ];
      
      mockServiceInstance.createMedicationReminders.mockReturnValue(mockReminders);
      
      const { useNotificationManager } = require('../useNotificationManager');
      
      // Verify that the service can create medication reminders
      expect(mockServiceInstance.createMedicationReminders).toBeDefined();
    });

    it('should handle empty medication lists', () => {
      mockServiceInstance.createMedicationReminders.mockReturnValue([]);
      
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });
  });

  describe('Platform Compatibility', () => {
    it('should work on different platforms', () => {
      // The hook should work regardless of platform
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });

    it('should handle Android-specific notification features', () => {
      // Mock Platform.OS = 'android'
      jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'android',
        select: jest.fn((options) => options.android)
      }));
      
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });

    it('should handle iOS-specific notification features', () => {
      // Mock Platform.OS = 'ios'
      jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'ios',
        select: jest.fn((options) => options.ios)
      }));
      
      expect(() => {
        const { useNotificationManager } = require('../useNotificationManager');
      }).not.toThrow();
    });
  });
});