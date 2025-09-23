import { View, Text, StyleSheet, ScrollView, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

function normalCdf(z: number) {
  // Abramowitz and Stegun approximation for the standard normal CDF
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const absZ = Math.abs(z);
  const t = 1 / (1 + p * absZ);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const phi = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * absZ * absZ);
  const cdf = 1 - phi * poly;
  return z >= 0 ? cdf : 1 - cdf;
}

function approxPercentile(value: number, mean: number, sd: number) {
  const z = (value - mean) / sd;
  return Math.round(normalCdf(z) * 100);
}

export default function PercentilesScreen() {
  const [loaded] = useFonts({ 'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf') });
  const router = useRouter();
  if (!loaded) return null;

  // Inputs
  const [ageMonths, setAgeMonths] = useState('');
  const [sex, setSex] = useState<'female' | 'male'>('female');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');

  // Very rough mean/sd by age for demo (not clinical!).
  const age = Math.max(0, parseFloat(ageMonths) || 0);
  const curves = useMemo(() => {
    const isMale = sex === 'male';
    // Simple linear approximations for 0-12 months
    const meanW = isMale ? 3.4 + age * 0.48 : 3.2 + age * 0.46; // kg
    const sdW = 0.9 + age * 0.03;
    const meanH = isMale ? 50 + age * 2.7 : 49 + age * 2.6; // cm
    const sdH = 2.2 + age * 0.05;
    const meanHead = isMale ? 34 + age * 0.7 : 33.5 + age * 0.65; // cm
    const sdHead = 1.6 + age * 0.04;
    return { meanW, sdW, meanH, sdH, meanHead, sdHead };
  }, [age, sex]);

  const w = parseFloat(weight);
  const h = parseFloat(height);
  const hd = parseFloat(head);

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.container} resizeMode="cover">
      <GradientHeader title="Percentile Comparisons" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Enter details</Text>
          <View style={styles.rowInputs}>
            <TextInput style={styles.input} placeholder="Age (months)" keyboardType="number-pad" value={ageMonths} onChangeText={setAgeMonths} />
            <TouchableOpacity onPress={() => setSex(sex === 'female' ? 'male' : 'female')} style={[styles.toggle, sex === 'female' ? styles.togglePink : styles.toggleBlue]}>
              <Text style={styles.toggleText}>{sex === 'female' ? 'Female' : 'Male'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowInputs}>
            <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
            <TextInput style={styles.input} placeholder="Height (cm)" keyboardType="decimal-pad" value={height} onChangeText={setHeight} />
            <TextInput style={styles.input} placeholder="Head (cm)" keyboardType="decimal-pad" value={head} onChangeText={setHead} />
          </View>
          <Text style={styles.note}>Tip: Values are approximate and only for demo. Consult clinical charts for decisions.</Text>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.title}>Approximate percentiles</Text>
          {Number.isFinite(w) && Number.isFinite(h) && Number.isFinite(hd) && ageMonths !== '' && weight !== '' && height !== '' && head !== '' ? (
            <>
              <PercentileBar label="Weight" value={approxPercentile(w as number, curves.meanW, curves.sdW)} color="#FC7596" />
              <PercentileBar label="Height" value={approxPercentile(h as number, curves.meanH, curves.sdH)} color="#3B82F6" />
              <PercentileBar label="Head" value={approxPercentile(hd as number, curves.meanHead, curves.sdHead)} color="#10B981" />
              <Text style={styles.note}>Low ({'<'} 5th) or very high ({'>'} 95th) percentiles may warrant a pediatric consultation.</Text>
            </>
          ) : (
            <Text style={styles.note}>Enter age and all three measurements to see percentiles.</Text>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#3B82F6', marginBottom: 10 },
  row: { fontSize: 16, color: '#374151', marginBottom: 8 },
  note: { marginTop: 8, color: '#6B7280', fontSize: 12 },
  rowInputs: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB' },
  toggle: { borderRadius: 8, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  togglePink: { backgroundColor: '#FDE2E7' },
  toggleBlue: { backgroundColor: '#DBEAFE' },
  toggleText: { color: '#374151', fontWeight: '600' },
});

function PercentileBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontWeight: '600', color: '#374151' }}>{label}</Text>
        <Text style={{ color: '#6B7280' }}>{pct}%</Text>
      </View>
      <View style={{ height: 10, backgroundColor: '#F3F4F6', borderRadius: 999 }}>
        <View style={{ width: `${pct}%`, height: 10, backgroundColor: color, borderRadius: 999 }} />
      </View>
      {pct < 5 && (
        <Text style={{ color: '#DC2626', marginTop: 4, fontWeight: '600' }}>Below 5th percentile – consider consulting your pediatrician.</Text>
      )}
    </View>
  );
}


