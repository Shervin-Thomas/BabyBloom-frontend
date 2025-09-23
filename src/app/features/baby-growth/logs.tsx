import { View, Text, StyleSheet, ScrollView, ImageBackground, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from 'lib/supabase';

export default function GrowthLogsScreen() {
  const [loaded] = useFonts({ 'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf') });
  const router = useRouter();
  const [logs, setLogs] = useState<{ id?: string; date: string; weightKg: number; heightCm: number; headCm: number }[]>([]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  if (!loaded) return null;

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        await fetchLogs(session.user.id);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        fetchLogs(session.user.id);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setLogs([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchLogs = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('baby_growth_logs')
        .select('id, created_at, weight_kg, height_cm, head_cm')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        date: row.created_at,
        weightKg: row.weight_kg,
        heightCm: row.height_cm,
        headCm: row.head_cm,
      }));
      setLogs(mapped);
    } catch (e: any) {
      console.warn('Failed fetching baby_growth_logs:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async () => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert('Login Required', 'Please log in to save growth logs.');
      return;
    }
    const w = parseFloat(weight), h = parseFloat(height), hd = parseFloat(head);
    if (isNaN(w) || isNaN(h) || isNaN(hd)) {
      Alert.alert('Invalid Input', 'Please enter numeric values for all fields.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('baby_growth_logs')
        .insert([{ user_id: currentUserId, weight_kg: w, height_cm: h, head_cm: hd }])
        .select('id, created_at, weight_kg, height_cm, head_cm')
        .single();
      if (error) throw error;
      setLogs(prev => [{
        id: data.id,
        date: data.created_at,
        weightKg: data.weight_kg,
        heightCm: data.height_cm,
        headCm: data.head_cm,
      }, ...prev]);
      setWeight(''); setHeight(''); setHead('');
    } catch (e: any) {
      console.error('Failed to add growth log:', e?.message || e);
      Alert.alert('Error', 'Failed to save log. Ensure the table baby_growth_logs exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.container} resizeMode="cover">
      <GradientHeader title="Growth Logs" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Add a growth log</Text>
          <View style={styles.row}>
            <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
            <TextInput style={styles.input} placeholder="Height (cm)" keyboardType="decimal-pad" value={height} onChangeText={setHeight} />
            <TextInput style={styles.input} placeholder="Head (cm)" keyboardType="decimal-pad" value={head} onChangeText={setHead} />
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={addLog}><Text style={styles.primaryBtnText}>Save Log</Text></TouchableOpacity>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.title}>Recent logs</Text>
          {loading ? (
            <ActivityIndicator color="#FC7596" />
          ) : logs.length === 0 ? (
            <Text style={{ color: '#6B7280' }}>No logs yet.</Text>
          ) : (
            logs.map((l, i) => (
              <View key={i} style={styles.logRow}>
                <Text style={styles.logDate}>{new Date(l.date).toLocaleDateString()}</Text>
                <Text style={styles.logVal}>{l.weightKg} kg</Text>
                <Text style={styles.logVal}>{l.heightCm} cm</Text>
                <Text style={styles.logVal}>{l.headCm} cm</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FC7596', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB' },
  primaryBtn: { marginTop: 12, backgroundColor: '#FC7596', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: 'bold' },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE' },
  logDate: { color: '#6B7280' },
  logVal: { fontWeight: '600', color: '#374151' },
});


