import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';

// Simple offline breathing game: tap to hold breath and release for count
export default function MoodGames() {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let t: any;
    if (active) {
      t = setInterval(() => setCount(c => c + 1), 1000);
    }
    return () => clearInterval(t);
  }, [active]);

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="Relaxing Games" showBackButton onBackPress={() => router.back()} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Mind Relaxing Games</Text>
          <Text style={styles.helper}>Try the simple breathing timer — tap Start, breathe in, hold, and release with the prompts.</Text>
          <TouchableOpacity style={[styles.button, active ? styles.buttonActive : null]} onPress={() => setActive(a => !a)}>
            <Text style={styles.buttonText}>{active ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 12 }}>Seconds: {count}</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.92)', padding: 16, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FC7596', marginBottom: 8 },
  helper: { color: '#6B7280', marginBottom: 12 },
  button: { backgroundColor: '#E5E7EB', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonActive: { backgroundColor: '#FC7596' },
  buttonText: { color: '#374151' }
});
