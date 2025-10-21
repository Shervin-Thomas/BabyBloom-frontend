import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';

// Simple PND screener using EPDS (Edinburgh Postnatal Depression Scale) short form (10 items)
const QUESTIONS = [
  'I have been able to laugh and see the funny side of things',
  'I have looked forward with enjoyment to things',
  'I have blamed myself unnecessarily when things went wrong',
  'I have been anxious or worried for no good reason',
  'I have felt scared or panicky for no very good reason',
  'Things have been getting on top of me',
  'I have been so unhappy that I have had difficulty sleeping',
  'I have felt sad or miserable',
  'I have been so unhappy that I have been crying',
  'The thought of harming myself has occurred to me'
];

export default function PNDScreen() {
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(-1));
  const [score, setScore] = useState<number | null>(null);
  const router = useRouter();

  const setAnswer = (idx: number, val: number) => {
    const copy = [...answers]; copy[idx] = val; setAnswers(copy);
  };

  const calculate = () => {
    if (answers.some(a => a === -1)) { alert('Please answer all questions'); return; }
    const s = answers.reduce((a, b) => a + b, 0);
    setScore(s);
  };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="PND Screener" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Postnatal Depression (PND) Screener</Text>
          <Text style={styles.helper}>Answer the questions based on the last 7 days. This is a screening tool, not a diagnosis.</Text>
          {QUESTIONS.map((q, i) => (
            <View key={i} style={styles.qRow}>
              <Text style={styles.qText}>{i+1}. {q}</Text>
              <View style={styles.options}>
                {[0,1,2,3].map(opt => (
                  <TouchableOpacity key={opt} onPress={() => setAnswer(i, opt)} style={[styles.optBtn, answers[i] === opt ? styles.optSelected : null]}>
                    <Text style={answers[i] === opt ? styles.optTextSelected : styles.optText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={calculate}><Text style={styles.buttonText}>Calculate Score</Text></TouchableOpacity>
          {score !== null && (
            <View style={styles.result}><Text style={styles.resultText}>EPDS Score: {score} (Higher score indicates higher risk)</Text></View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 16, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FC7596', marginBottom: 8 },
  helper: { color: '#6B7280', marginBottom: 12 },
  qRow: { marginBottom: 12 },
  qText: { marginBottom: 6, color: '#374151' },
  options: { flexDirection: 'row', gap: 8 },
  optBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8, minWidth: 40, alignItems: 'center' },
  optSelected: { backgroundColor: '#FC7596' },
  optText: { color: '#374151' },
  optTextSelected: { color: 'white' },
  button: { backgroundColor: '#FC7596', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: 'white', fontWeight: '600' },
  result: { marginTop: 12, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8 },
  resultText: { color: '#374151' }
});
