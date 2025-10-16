import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

interface MedicationNotificationPopupProps {
  visible: boolean;
  notification: Notifications.Notification | null;
  onDismiss: () => void;
  onMarkAsTaken: () => void;
}

const { width, height } = Dimensions.get('window');

export default function MedicationNotificationPopup({
  visible,
  notification,
  onDismiss,
  onMarkAsTaken,
}: MedicationNotificationPopupProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 10 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    onDismiss();
  };

  const handleMarkAsTaken = () => {
    onMarkAsTaken();
    handleDismiss();
  };

  if (!notification) return null;

  const medicationName = notification.request.content.data?.medicationName || 'Medication';
  const dosage = notification.request.content.data?.dosage || '';
  const personType = notification.request.content.data?.personType || '';
  const timeOfDay = notification.request.content.data?.timeOfDay || '';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleDismiss}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={24} color="#FC7596" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>💊 Medication Reminder</Text>
              <Text style={styles.subtitle}>Time for your {timeOfDay} dose</Text>
            </View>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.medicationName}>{medicationName}</Text>
            <Text style={styles.dosage}>{dosage}</Text>
            <Text style={styles.personType}>For: {personType}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.takenButton}
              onPress={handleMarkAsTaken}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.takenButtonText}>Mark as Taken</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.snoozeButton}
              onPress={handleDismiss}
            >
              <Ionicons name="time" size={20} color="#6B7280" />
              <Text style={styles.snoozeButtonText}>Snooze</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: '100%',
                  opacity: fadeAnim 
                }
              ]} 
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60, // Account for status bar
  },
  popup: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  medicationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  dosage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  personType: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  takenButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FC7596',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  takenButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  snoozeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  snoozeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FC7596',
  },
});
