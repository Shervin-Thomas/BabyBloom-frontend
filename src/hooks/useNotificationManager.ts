import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/notificationService';
import { supabase } from 'lib/supabase';

interface NotificationManagerState {
  isInitialized: boolean;
  hasPermission: boolean;
  currentNotification: Notifications.Notification | null;
  showPopup: boolean;
  notificationsEnabled: boolean;
  notificationTimeBefore: number;
}

export const useNotificationManager = () => {
  const [state, setState] = useState<NotificationManagerState>({
    isInitialized: false,
    hasPermission: false,
    currentNotification: null,
    showPopup: false,
    notificationsEnabled: true,
    notificationTimeBefore: 5,
  });

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const notificationService = useRef(NotificationService.getInstance());

  useEffect(() => {
    initializeNotifications();

    // Listen for notifications received while app is running
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        setState(prev => ({
          ...prev,
          currentNotification: notification,
          showPopup: true,
        }));
      }
    );

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        const notification = response.notification;
        setState(prev => ({
          ...prev,
          currentNotification: notification,
          showPopup: true,
        }));
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      const initialized = await notificationService.current.initialize();
      setState(prev => ({
        ...prev,
        isInitialized: initialized,
        hasPermission: initialized,
      }));
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const scheduleMedicationReminders = async (userId: string) => {
    try {
      if (!state.isInitialized) {
        await initializeNotifications();
      }

      // Don't schedule if notifications are disabled
      if (!state.notificationsEnabled) {
        console.log('Notifications are disabled, skipping scheduling');
        return;
      }

      // Get all active medical schedules
      const { data: schedules, error } = await supabase
        .from('medical_schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching schedules:', error);
        return;
      }

      if (!schedules || schedules.length === 0) {
        console.log('No active schedules found');
        return;
      }

      // Cancel existing notifications
      await notificationService.current.cancelAllNotifications();

      // Schedule new notifications for each medication
      for (const schedule of schedules) {
        const reminders = notificationService.current.createMedicationReminders(
          schedule.custom_item_name,
          schedule.dosage,
          schedule.schedule,
          schedule.start_date,
          schedule.end_date,
          schedule.person_type,
          state.notificationTimeBefore
        );

        if (reminders.length > 0) {
          await notificationService.current.scheduleMultipleReminders(reminders);
          console.log(`Scheduled ${reminders.length} reminders for ${schedule.custom_item_name}`);
        }
      }
    } catch (error) {
      console.error('Error scheduling medication reminders:', error);
    }
  };

  const updateNotificationSettings = (enabled: boolean, timeBefore: number) => {
    setState(prev => ({
      ...prev,
      notificationsEnabled: enabled,
      notificationTimeBefore: timeBefore,
    }));
  };

  const markMedicationAsTaken = async (notification: Notifications.Notification) => {
    try {
      const data = notification.request.content.data;
      if (!data) return;

      // Log the dose as taken
      const { error } = await supabase
        .from('medical_intake_logs')
        .insert([{
          user_id: data.userId || 'unknown', // You might need to pass userId
          person_type: data.personType,
          schedule_id: data.scheduleId,
          item_name: data.medicationName,
          category: data.category || 'medicine',
          dosage: data.dosage,
          taken_time: new Date().toISOString(),
          status: 'taken',
          notes: `Taken via notification reminder`,
          extra: { via: 'notification' },
        }]);

      if (error) {
        console.error('Error logging dose as taken:', error);
      } else {
        console.log('Dose marked as taken successfully');
      }
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

  const dismissPopup = () => {
    setState(prev => ({
      ...prev,
      showPopup: false,
      currentNotification: null,
    }));
  };

  const handleMarkAsTaken = async () => {
    if (state.currentNotification) {
      await markMedicationAsTaken(state.currentNotification);
    }
  };

  return {
    ...state,
    scheduleMedicationReminders,
    dismissPopup,
    handleMarkAsTaken,
    updateNotificationSettings,
  };
};
