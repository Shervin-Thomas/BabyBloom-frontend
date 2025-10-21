import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';

const EXERCISES = [
  { id: 'breathe', title: '4-4-8 Breathing', steps: ['Inhale for 4 seconds', 'Hold for 4 seconds', 'Exhale for 8 seconds'], durationMin: 3 },
  { id: 'body', title: 'Body Scan', steps: ['Close your eyes', 'Scan from toes to head noticing sensations', 'Breathe gently'], durationMin: 5 },
  { id: 'cbt1', title: 'Thought Record (CBT)', steps: ['Describe situation', 'Identify automatic thoughts', 'Challenge them with evidence'], durationMin: 8 }
];

export default function GuidedExercises() {
  const [selected, setSelected] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();

  useEffect(() => { setStepIndex(0); }, [selected]);

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="Guided Exercises" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cardWrap}>
          <Text style={styles.title}>Guided Meditation & CBT</Text>
          <Text style={styles.helper}>Short guided exercises to help with relaxation and reframing thoughts.</Text>
          {EXERCISES.map(e => (
            <View key={e.id} style={styles.card}>
              <Text style={styles.name}>{e.title}</Text>
              <Text style={styles.spec}>{e.durationMin} min</Text>
              <TouchableOpacity style={styles.button} onPress={() => setSelected(e.id)}><Text style={styles.buttonText}>Start</Text></TouchableOpacity>
              {selected === e.id && (
                <View style={styles.steps}>
                  <Text style={styles.stepText}>{e.steps[stepIndex]}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => setStepIndex(Math.max(0, stepIndex - 1))}><Text>Prev</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => setStepIndex(Math.min(e.steps.length - 1, stepIndex + 1))}><Text>Next</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20 },
  cardWrap: { paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FC7596', marginBottom: 8 },
  helper: { color: '#6B7280', marginBottom: 12 },
  card: { backgroundColor: 'rgba(255,255,255,0.92)', padding: 12, borderRadius: 8, marginBottom: 12 },
  name: { fontWeight: 'bold', color: '#374151' },
  spec: { color: '#6B7280', marginBottom: 8 },
  button: { backgroundColor: '#FC7596', padding: 8, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white' },
  steps: { marginTop: 8, backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 },
  stepText: { color: '#374151' },
  smallBtn: { backgroundColor: '#E5E7EB', padding: 8, borderRadius: 6 }
});
