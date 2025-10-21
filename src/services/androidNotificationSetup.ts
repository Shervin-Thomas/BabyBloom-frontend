import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const setupAndroidNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    // Create notification channels for Android
    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name: 'Medication Reminders',
      description: 'Notifications for medication reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FC7596',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: 'General Notifications',
      description: 'General app notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FC7596',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
  }
};

export const requestAndroidNotificationPermissions = async () => {
  if (Platform.OS === 'android') {
    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
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
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true;
  }
  return true;
};
