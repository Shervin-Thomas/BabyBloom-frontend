import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { analyzeSentiment } from '@/services/sentimentService';
import GradientHeader from '@/components/GradientHeader';

export default function MoodTracker() {
  const [entry, setEntry] = useState('');
  const [result, setResult] = useState<{ score: number; label: string } | null>(null);
  const router = useRouter();

  const submit = () => {
    const res = analyzeSentiment(entry);
    setResult(res);
  };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="Daily Mood Check-in" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>How are you feeling today?</Text>
          <Text style={styles.helper}>Write a short note and tap Analyze — this is a friendly check-in, not a diagnosis.</Text>
          <TextInput style={styles.input} multiline value={entry} onChangeText={setEntry} placeholder="I'm feeling..." placeholderTextColor="#9CA3AF" />
          <TouchableOpacity style={styles.button} onPress={submit}><Text style={styles.buttonText}>Analyze Mood</Text></TouchableOpacity>
          {result && (
            <View style={styles.result}>
              <Text style={styles.resultText}>Sentiment: {result.label} ({(result.score*100).toFixed(0)}%)</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  helper: { color: '#6B7280', marginBottom: 12 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, minHeight: 100, textAlignVertical: 'top', marginBottom: 12 },
  button: { backgroundColor: '#FC7596', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  result: { marginTop: 12, padding: 10, backgroundColor: '#fff', borderRadius: 8 },
  resultText: { color: '#111827' },
});

