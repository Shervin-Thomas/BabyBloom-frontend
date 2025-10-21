import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ImageBackground, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';
import { addSleepLog, getSleepLogs, deleteSleepLog } from '@/services/sleepLogService';
import { supabase } from 'lib/supabase';

interface SleepLog {
  id?: string;
  log_date: string;
  sleep_time: string;
  wake_time: string;
  duration_hours: number;
}

// Helper functions for 12-hour time format conversion
const convert24to12 = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const convert12to24 = (time12: string): string => {
  if (!time12) return '';
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12; // Return as-is if format doesn't match
  
  let [, hours, minutes, period] = match;
  let hour24 = parseInt(hours);
  
  if (period.toUpperCase() === 'AM' && hour24 === 12) {
    hour24 = 0;
  } else if (period.toUpperCase() === 'PM' && hour24 !== 12) {
    hour24 += 12;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

// Helper function to construct 12-hour time string from components
const constructTimeString = (hour: string, minute: string, period: string): string => {
  if (!hour || !minute) return '';
  const paddedMinute = minute.padStart(2, '0');
  return `${hour}:${paddedMinute} ${period}`;
};

// Helper function to validate time inputs
const validateTimeInput = (hour: string, minute: string): boolean => {
  const h = parseInt(hour);
  const m = parseInt(minute);
  return h >= 1 && h <= 12 && m >= 0 && m <= 59;
};

export default function SleepWakeLogging() {
  // Sleep time states
  const [sleepHour, setSleepHour] = useState('');
  const [sleepMinute, setSleepMinute] = useState('');
  const [sleepPeriod, setSleepPeriod] = useState('PM');
  
  // Wake time states
  const [wakeHour, setWakeHour] = useState('');
  const [wakeMinute, setWakeMinute] = useState('');
  const [wakePeriod, setWakePeriod] = useState('AM');

  // Helper functions for input formatting
  const formatMinute = (value: string): string => {
    const num = parseInt(value);
    if (isNaN(num)) return '';
    if (num > 59) return '59';
    return num.toString();
  };

  const formatHour = (value: string): string => {
    const num = parseInt(value);
    if (isNaN(num)) return '';
    if (num > 12) return '12';
    if (num < 1 && value !== '') return '1';
    return num.toString();
  };
  
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Load sleep logs on component mount and check authentication
  useEffect(() => {
    checkAuthAndLoadLogs();
  }, []);

  const checkAuthAndLoadLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.back();
        return;
      }

      loadLogs();
    } catch (err) {
      console.error('Auth check error:', err);
      router.back();
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getSleepLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
      Alert.alert('Error', 'Failed to load sleep logs');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (sleepStr: string, wakeStr: string): number => {
    const [sleepHour, sleepMin] = sleepStr.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeStr.split(':').map(Number);

    let sleepMins = sleepHour * 60 + sleepMin;
    let wakeMins = wakeHour * 60 + wakeMin;

    // If wake time is earlier than sleep time, assume next day
    if (wakeMins <= sleepMins) {
      wakeMins += 24 * 60;
    }

    // Convert minutes to hours and round to nearest 0.1
    const durationHours = (wakeMins - sleepMins) / 60;
    return Math.round(durationHours * 10) / 10;
  };

  const addLog = async () => {
    if (!sleepHour || !sleepMinute || !wakeHour || !wakeMinute) {
      Alert.alert('Error', 'Please enter both baby sleep and wake times');
      return;
    }

    // Validate time inputs
    if (!validateTimeInput(sleepHour, sleepMinute) || !validateTimeInput(wakeHour, wakeMinute)) {
      Alert.alert('Error', 'Please enter valid times (Hour: 1-12, Minutes: 00-59)');
      return;
    }

    try {
      setSubmitting(true);
      
      // Construct 12-hour time strings
      const sleepTime12 = constructTimeString(sleepHour, sleepMinute, sleepPeriod);
      const wakeTime12 = constructTimeString(wakeHour, wakeMinute, wakePeriod);
      
      // Convert 12-hour format to 24-hour format for storage
      const sleepTime24 = convert12to24(sleepTime12);
      const wakeTime24 = convert12to24(wakeTime12);

      const duration = calculateDuration(sleepTime24, wakeTime24);

      const newLog: SleepLog = {
        log_date: new Date().toISOString().split('T')[0],
        sleep_time: sleepTime24,
        wake_time: wakeTime24,
        duration_hours: duration,
      };

      const savedLog = await addSleepLog(newLog);

      if (savedLog) {
        setLogs([savedLog, ...logs]);
        // Clear form
        setSleepHour('');
        setSleepMinute('');
        setWakeHour('');
        setWakeMinute('');
        Alert.alert('Success', "Baby's sleep log saved successfully");
      } else {
        Alert.alert('Error', 'Failed to save sleep log');
      }
    } catch (error) {
      console.error('Error adding log:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: string | undefined) => {
    if (!logId) return;

    Alert.alert(
      'Delete Sleep Log',
      "Are you sure you want to delete this baby's sleep record?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteSleepLog(logId);
              if (success) {
                setLogs(logs.filter(log => log.id !== logId));
                Alert.alert('Success', "Baby's sleep record deleted");
              } else {
                Alert.alert('Error', 'Failed to delete sleep record');
              }
            } catch (error) {
              console.error('Error deleting log:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const renderLog = ({ item }: { item: SleepLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <Text style={styles.logDate}>{item.log_date}</Text>
        <TouchableOpacity onPress={() => handleDeleteLog(item.id)}>
          <Text style={styles.deleteButton}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logRow}>
        <View style={styles.logColumn}>
          <Text style={styles.logLabel}>Baby fell asleep: {convert24to12(item.sleep_time)}</Text>
          <Text style={styles.logLabel}>Baby woke up: {convert24to12(item.wake_time)}</Text>
        </View>
        <View style={styles.logColumn}>
          <Text style={styles.logDuration}>{item.duration_hours}h total sleep</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="Baby's Sleep Log" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Track Baby's Sleep</Text>
          <Text style={styles.helper}>Log when your baby falls asleep and wakes up to identify sleep patterns.</Text>
          
          {/* Sleep Time Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Baby fell asleep at</Text>
            <View style={styles.timeContainer}>
              <View style={styles.timeInputRow}>
                <TextInput 
                  style={[styles.timeInput, styles.hourInput]} 
                  placeholder="8" 
                  value={sleepHour} 
                  onChangeText={(value) => setSleepHour(formatHour(value))}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput 
                  style={[styles.timeInput, styles.minuteInput]} 
                  placeholder="30" 
                  value={sleepMinute} 
                  onChangeText={(value) => setSleepMinute(formatMinute(value))}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.periodContainer}>
                  <TouchableOpacity 
                    style={[styles.periodBtn, sleepPeriod === 'AM' ? styles.periodBtnActive : null]}
                    onPress={() => setSleepPeriod('AM')}
                  >
                    <Text style={[styles.periodText, sleepPeriod === 'AM' ? styles.periodTextActive : null]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodBtn, sleepPeriod === 'PM' ? styles.periodBtnActive : null]}
                    onPress={() => setSleepPeriod('PM')}
                  >
                    <Text style={[styles.periodText, sleepPeriod === 'PM' ? styles.periodTextActive : null]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Wake Time Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Baby woke up at</Text>
            <View style={styles.timeContainer}>
              <View style={styles.timeInputRow}>
                <TextInput 
                  style={[styles.timeInput, styles.hourInput]} 
                  placeholder="6" 
                  value={wakeHour} 
                  onChangeText={(value) => setWakeHour(formatHour(value))}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput 
                  style={[styles.timeInput, styles.minuteInput]} 
                  placeholder="00" 
                  value={wakeMinute} 
                  onChangeText={(value) => setWakeMinute(formatMinute(value))}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.periodContainer}>
                  <TouchableOpacity 
                    style={[styles.periodBtn, wakePeriod === 'AM' ? styles.periodBtnActive : null]}
                    onPress={() => setWakePeriod('AM')}
                  >
                    <Text style={[styles.periodText, wakePeriod === 'AM' ? styles.periodTextActive : null]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodBtn, wakePeriod === 'PM' ? styles.periodBtnActive : null]}
                    onPress={() => setWakePeriod('PM')}
                  >
                    <Text style={[styles.periodText, wakePeriod === 'PM' ? styles.periodTextActive : null]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, submitting && styles.buttonDisabled]} 
            onPress={addLog}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>+ Log Baby's Sleep</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.title, { marginTop: 20 }]}>Baby's Recent Sleep History</Text>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#FC7596" />
            </View>
          ) : logs.length === 0 ? (
            <Text style={styles.emptyText}>No sleep logs yet. Start tracking when your baby sleeps and wakes!</Text>
          ) : (
            <FlatList 
              data={logs}
              renderItem={renderLog}
              keyExtractor={item => item.id || ''}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FC7596', marginBottom: 8 },
  helper: { color: '#6B7280', marginBottom: 16, fontSize: 14, lineHeight: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 8, fontSize: 14 },
  
  // Time input styles
  timeContainer: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  timeInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  timeInput: { backgroundColor: '#FFF', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: '#D1D5DB', fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#111827' },
  hourInput: { width: 50, marginRight: 8 },
  minuteInput: { width: 50, marginLeft: 8 },
  timeSeparator: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginHorizontal: 4 },
  periodContainer: { flexDirection: 'row', marginLeft: 16, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  periodBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#E5E7EB' },
  periodBtnActive: { backgroundColor: '#FC7596' },
  periodText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  periodTextActive: { color: '#FFF' },
  
  // Original styles
  button: { backgroundColor: '#FC7596', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  logCard: { backgroundColor: '#FCE7F3', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#FC7596' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logDate: { fontWeight: '600', color: '#FC7596', fontSize: 13 },
  deleteButton: { color: '#DC2626', fontSize: 18, fontWeight: 'bold' },
  logRow: { flexDirection: 'row', justifyContent: 'space-between' },
  logColumn: { flex: 1 },
  logLabel: { color: '#374151', marginBottom: 4, fontSize: 13 },
  logDuration: { color: '#FC7596', fontWeight: '600', fontSize: 13 },
  centerContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 20, fontSize: 14 },
});