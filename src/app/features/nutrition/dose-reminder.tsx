import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';
import { useEffect, useState } from 'react';
import { supabase } from 'lib/supabase';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import NotificationService from '../../../services/notificationService';

export default function DoseReminderScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mother' | 'child'>('mother');
  const [reminders, setReminders] = useState<{ id?: string; name: string; dosage: string; schedule: any; category: 'medicine' | 'supplement' | 'vaccination' | 'other'; notes?: string; created_at?: string }[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timesText, setTimesText] = useState(''); // e.g., 08:00, 14:00
  const [daysText, setDaysText] = useState(''); // e.g., Mon, Tue, Wed
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<'medicine' | 'supplement' | 'vaccination' | 'other'>('medicine');
  // Enhanced structured inputs
  const [dosageQty, setDosageQty] = useState('');
  const [dosageUnit, setDosageUnit] = useState<'mg' | 'ml' | 'tablet' | 'capsule' | 'drops'>('mg');
  const [numDays, setNumDays] = useState('7');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [timesOfDay, setTimesOfDay] = useState<{ morning: boolean; noon: boolean; evening: boolean; night: boolean }>({ morning: true, noon: false, evening: false, night: false });
  const [withFood, setWithFood] = useState<'before' | 'after' | 'with'>('with');
  const [foodOffset, setFoodOffset] = useState<string>('60'); // minutes

  if (!loaded) {
    return null;
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        await fetchReminders(session.user.id, activeTab);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setReminders([]);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        fetchReminders(session.user.id, activeTab);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setReminders([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUserId) fetchReminders(currentUserId, activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const parseCsv = (txt: string) =>
    txt.split(',').map(s => s.trim()).filter(Boolean);

  const fetchReminders = async (userId: string, type: 'mother' | 'child') => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_schedules')
        .select('id, custom_item_name, dosage, schedule, category, notes, created_at')
        .eq('user_id', userId)
        .eq('person_type', type)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({ id: r.id, name: r.custom_item_name, dosage: r.dosage, schedule: r.schedule, category: r.category, notes: r.notes, created_at: r.created_at }));
      setReminders(mapped);
    } catch (e: any) {
      console.warn('Failed to fetch dose_reminders:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async () => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert('Login Required', 'Please log in to create reminders.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing Data', 'Please enter an item name.');
      return;
    }
    // Compute dosage string and schedule
    const qty = parseFloat(dosageQty);
    const composedDosage = isNaN(qty) ? (dosage || '').trim() : `${qty} ${dosageUnit}`;

    // Compute dates and enforce numDays limit
    const sd = new Date(startDate);
    const sdStr = sd.toISOString().slice(0, 10);
    if (isNaN(sd.getTime())) {
      Alert.alert('Invalid date', 'Start date is invalid.');
      return;
    }
    const nd = Math.max(1, parseInt(numDays || '1', 10));
    const ed = new Date(endDate);
    if (isNaN(ed.getTime())) {
      Alert.alert('Invalid date', 'End date is invalid.');
      return;
    }
    const edStr = ed.toISOString().slice(0, 10);
    if (ed < sd) {
      Alert.alert('Invalid range', 'End date must be the same as or after the start date.');
      return;
    }

    const timesSelected: string[] = [];
    if (timesOfDay.morning) timesSelected.push('morning');
    if (timesOfDay.noon) timesSelected.push('noon');
    if (timesOfDay.evening) timesSelected.push('evening');
    if (timesOfDay.night) timesSelected.push('night');
    if (timesSelected.length === 0) timesSelected.push('morning');

    const schedule = {
      timesOfDay: timesSelected, // semantic
      times: [], // optional exact times left empty in this flow
      days: parseCsv(daysText),
      every_n_days: 0,
      interval_unit: 'days',
      withFood,
      foodOffsetMinutes: parseInt(foodOffset, 10),
      numDays: nd,
      start_date: sdStr,
      end_date: edStr,
    };
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_schedules')
        .insert([{
          user_id: currentUserId,
          person_type: activeTab,
          custom_item_name: name.trim(),
          category,
          dosage: composedDosage,
          start_date: sdStr,
          end_date: edStr,
          schedule,
          notes: notes.trim() || null,
          status: 'active',
        }])
        .select('id, custom_item_name, dosage, schedule, category, notes, created_at')
        .single();
      if (error) throw error;
      const mapped = { id: data.id, name: data.custom_item_name, dosage: data.dosage, schedule: data.schedule, category: data.category, notes: data.notes, created_at: data.created_at };
      setReminders(prev => [mapped as any, ...prev]);
      
      // Schedule notifications for the new reminder
      try {
        const notificationService = NotificationService.getInstance();
        const reminders = notificationService.createMedicationReminders(
          data.custom_item_name,
          data.dosage,
          data.schedule,
          sdStr,
          edStr,
          activeTab
        );
        
        if (reminders.length > 0) {
          await notificationService.scheduleMultipleReminders(reminders);
          console.log(`Scheduled ${reminders.length} notifications for ${data.custom_item_name}`);
        }
      } catch (notificationError) {
        console.error('Error scheduling notifications:', notificationError);
        // Don't show error to user as the reminder was created successfully
      }
      
      setName(''); setDosage(''); setDosageQty(''); setTimesText(''); setDaysText(''); setNotes('');
    } catch (e: any) {
      console.error('Failed to add reminder:', e?.message || e);
      Alert.alert('Error', 'Failed to add reminder. Ensure tables are created.');
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (id?: string) => {
    if (!id || !isAuthenticated || !currentUserId) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('medical_schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId);
      if (error) throw error;
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      console.error('Failed to delete reminder:', e?.message || e);
      Alert.alert('Error', 'Failed to delete reminder.');
    } finally {
      setLoading(false);
    }
  };

  const markTakenNow = async (rem: any) => {
    if (!isAuthenticated || !currentUserId) return;
    try {
      setLoading(true);
      const summary = `dose_taken: ${rem.name} (${rem.dosage}) for ${activeTab}`;
      const { error } = await supabase
        .from('medical_intake_logs')
        .insert([{
          user_id: currentUserId,
          person_type: activeTab,
          schedule_id: rem.id,
          item_id: null,
          item_name: rem.name,
          category: rem.category,
          dosage: rem.dosage,
          planned_time: null,
          taken_time: new Date().toISOString(),
          status: 'taken',
          notes: summary,
          extra: { via: 'app' },
        }]);
      if (error) throw error;
      Alert.alert('Logged', 'Dose has been marked as taken and logged.');
    } catch (e: any) {
      console.error('Failed to log dose taken:', e?.message || e);
      Alert.alert('Error', 'Failed to log dose taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Dose Reminder"
        showBackButton
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'mother' && styles.tabBtnActive]} onPress={() => setActiveTab('mother')}>
            <Text style={[styles.tabText, activeTab === 'mother' && styles.tabTextActive]}>Mother</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'child' && styles.tabBtnActive]} onPress={() => setActiveTab('child')}>
            <Text style={[styles.tabText, activeTab === 'child' && styles.tabTextActive]}>Child</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Reminder ({activeTab})</Text>
          {!isAuthenticated && (
            <Text style={styles.muted}>Log in to create reminders.</Text>
          )}
          <View style={styles.pickerRow}>
            <Text style={styles.label}>Type</Text>
            <Picker selectedValue={category} onValueChange={(v) => setCategory(v)} style={styles.picker}>
              <Picker.Item label="Medicine" value="medicine" />
              <Picker.Item label="Supplement" value="supplement" />
              <Picker.Item label="Vaccination" value="vaccination" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
          <Text style={styles.label}>Item name</Text>
          <TextInput style={styles.input} placeholder="Item name (medicine/supplement/vaccine)" value={name} onChangeText={setName} editable={isAuthenticated} />
          <View style={styles.pickerRow}>
            <Text style={styles.label}>Dosage unit</Text>
            <Picker selectedValue={dosageUnit} onValueChange={(v) => setDosageUnit(v)} style={styles.picker}>
              <Picker.Item label="mg" value="mg" />
              <Picker.Item label="ml" value="ml" />
              <Picker.Item label="tablet" value="tablet" />
              <Picker.Item label="capsule" value="capsule" />
              <Picker.Item label="drops" value="drops" />
            </Picker>
          </View>
          <Text style={styles.label}>Dosage quantity</Text>
          <TextInput style={styles.input} placeholder="Dosage quantity (e.g., 1)" value={dosageQty} onChangeText={setDosageQty} keyboardType="numeric" editable={isAuthenticated} />
          <Text style={styles.label}>How many days</Text>
          <TextInput style={styles.input} placeholder="How many days" value={numDays} onChangeText={(v) => setNumDays(v.replace(/[^0-9]/g, ''))} keyboardType="numeric" editable={isAuthenticated} />
          <View style={[styles.row, { gap: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start date</Text>
              <TextInput style={[styles.input]} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} editable={isAuthenticated} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End date</Text>
              <TextInput style={[styles.input]} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} editable={isAuthenticated} />
            </View>
          </View>
          <View style={styles.checkboxGroup}>
            <Text style={styles.label}>Timings</Text>
            {(['morning','noon','evening','night'] as const).map(t => (
              <View key={t} style={styles.checkboxRow}>
                <Checkbox value={(timesOfDay as any)[t]} onValueChange={(val) => setTimesOfDay(prev => ({ ...prev, [t]: val }))} color={(timesOfDay as any)[t] ? '#FC7596' : undefined} />
                <Text style={styles.checkboxLabel}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={styles.pickerRow}>
            <Text style={styles.label}>With food</Text>
            <Picker selectedValue={withFood} onValueChange={(v) => setWithFood(v)} style={styles.picker}>
              <Picker.Item label="before" value="before" />
              <Picker.Item label="with" value="with" />
              <Picker.Item label="after" value="after" />
            </Picker>
          </View>
          <Text style={styles.label}>Offset (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 60"
            value={foodOffset}
            onChangeText={(v) => setFoodOffset(v.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            editable={isAuthenticated}
          />
          <Text style={styles.label}>Extra instructions</Text>
          <TextInput style={[styles.input, { height: 80 }]} placeholder="Optional notes for how to take" value={notes} onChangeText={setNotes} editable={isAuthenticated} multiline />
          <TouchableOpacity style={styles.primaryBtn} onPress={addReminder} disabled={!isAuthenticated || loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Reminder</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders ({activeTab})</Text>
          {loading ? (
            <ActivityIndicator color="#FC7596" />
          ) : reminders.length === 0 ? (
            <Text style={styles.muted}>No reminders yet.</Text>
          ) : (
            reminders.map((r) => (
              <View key={r.id} style={styles.reminderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderName}>{r.name} <Text style={{ color: '#6B7280' }}>({r.dosage})</Text></Text>
                  <Text style={styles.reminderMeta}>Type: {r.category} • Window: {(r.schedule?.timesOfDay || []).join(', ') || '—'} • With food: {r.schedule?.withFood || '—'} {r.schedule?.foodOffsetMinutes ? `(${r.schedule.foodOffsetMinutes} min)` : ''}</Text>
                  <Text style={styles.reminderMeta}>Period: {r.schedule?.start_date || '—'} → {r.schedule?.end_date || '—'}{r.schedule?.numDays ? ` (${r.schedule.numDays} days)` : ''}</Text>
                  {!!r.notes && <Text style={styles.reminderNotes}>{r.notes}</Text>}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => markTakenNow(r)}>
                    <Ionicons name="checkmark-circle-outline" size={22} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteReminder(r.id)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // For tab bar space
  },
  tabsRow: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F3F4F6' },
  tabBtnActive: { backgroundColor: '#FC7596' },
  tabText: { color: '#374151', fontWeight: '600' },
  tabTextActive: { color: 'white' },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  pickerRow: { backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  label: { color: '#6B7280', fontSize: 12, paddingHorizontal: 12, paddingTop: 10 },
  picker: { width: '100%' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB', marginBottom: 10 },
  primaryBtn: { marginTop: 4, backgroundColor: '#FC7596', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: 'bold' },
  muted: { color: '#6B7280' },
  helperText: { color: '#6B7280', marginBottom: 8 },
  checkboxGroup: { marginBottom: 10 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  checkboxLabel: { marginLeft: 8, color: '#374151' },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE' },
  reminderName: { fontWeight: '700', color: '#374151' },
  reminderMeta: { color: '#6B7280', marginTop: 2 },
  reminderNotes: { color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
});
