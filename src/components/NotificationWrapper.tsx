import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useNotificationManager } from '../hooks/useNotificationManager';
import MedicationNotificationPopup from './MedicationNotificationPopup';
import { supabase } from 'lib/supabase';

interface NotificationWrapperProps {
  children: React.ReactNode;
  userId?: string;
  onNotificationSettingsChange?: (enabled: boolean, timeBefore: number) => void;
}

export default function NotificationWrapper({ children, userId, onNotificationSettingsChange }: NotificationWrapperProps) {
  const {
    isInitialized,
    hasPermission,
    currentNotification,
    showPopup,
    scheduleMedicationReminders,
    dismissPopup,
    handleMarkAsTaken,
    updateNotificationSettings,
  } = useNotificationManager();

  useEffect(() => {
    if (userId && isInitialized && hasPermission) {
      // Schedule notifications when user is logged in and notifications are ready
      scheduleMedicationReminders(userId);
    }
  }, [userId, isInitialized, hasPermission]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      
      {/* Medication Notification Popup */}
      <MedicationNotificationPopup
        visible={showPopup}
        notification={currentNotification}
        onDismiss={dismissPopup}
        onMarkAsTaken={handleMarkAsTaken}
      />
    </View>
  );
}
