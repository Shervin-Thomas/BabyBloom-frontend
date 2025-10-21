import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';
import { Ionicons } from '@expo/vector-icons';

interface NoiseOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  volume: number;
}

export default function WhiteNoiseGenerator() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const router = useRouter();

  const noiseOptions: NoiseOption[] = [
    {
      id: 'white',
      name: 'White Noise',
      description: 'Classic consistent static sound',
      icon: 'radio-outline',
      volume: 50,
    },
    {
      id: 'pink',
      name: 'Pink Noise',
      description: 'Deeper, more soothing than white noise',
      icon: 'cloud-outline',
      volume: 45,
    },
    {
      id: 'rain',
      name: 'Gentle Rain',
      description: 'Soft rainfall sounds for calm atmosphere',
      icon: 'water-outline',
      volume: 40,
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      description: 'Rhythmic waves crashing on shore',
      icon: 'home-outline',
      volume: 45,
    },
    {
      id: 'forest',
      name: 'Forest Ambience',
      description: 'Birds and rustling leaves',
      icon: 'leaf-outline',
      volume: 35,
    },
    {
      id: 'fan',
      name: 'Fan Noise',
      description: 'Steady fan drone for sleep',
      icon: 'swap-outline',
      volume: 55,
    },
  ];

  const togglePlay = (id: string) => {
    setPlaying(playing === id ? null : id);
  };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="White Noise Generator" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Custom White Noise</Text>
          <Text style={styles.helper}>Soothing sounds to help your baby sleep better.</Text>

          <View style={styles.grid}>
            {noiseOptions.map(noise => (
              <TouchableOpacity 
                key={noise.id}
                style={[styles.noiseBox, playing === noise.id && styles.noiseBoxActive]}
                onPress={() => togglePlay(noise.id)}
              >
                <Ionicons 
                  name={noise.icon as any} 
                  size={32} 
                  color={playing === noise.id ? '#fff' : '#FC7596'} 
                />
                <Text style={[styles.noiseName, playing === noise.id && styles.noiseNameActive]}>
                  {noise.name}
                </Text>
                <Text style={[styles.noiseDesc, playing === noise.id && styles.noiseDescActive]}>
                  {noise.description}
                </Text>
                {playing === noise.id && (
                  <View style={styles.playIndicator}>
                    <Text style={styles.playIndicatorText}>▶ Playing</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {playing && (
            <View style={styles.playerControls}>
              <Text style={styles.volumeLabel}>Volume: {volume}%</Text>
              <View style={styles.volumeBar}>
                <View style={[styles.volumeFill, { width: `${volume}%` }]} />
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.volumeButton}
                  onPress={() => setVolume(Math.max(0, volume - 10))}
                >
                  <Text style={styles.volumeButtonText}>- 10%</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.volumeButton}
                  onPress={() => setVolume(Math.min(100, volume + 10))}
                >
                  <Text style={styles.volumeButtonText}>+ 10%</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.stopButton}
                onPress={() => setPlaying(null)}
              >
                <Text style={styles.stopButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>💡 Tips for Best Results</Text>
            <Text style={styles.tipItem}>• Start 10-15 minutes before bedtime</Text>
            <Text style={styles.tipItem}>• Keep volume at 50-70 dB (similar to normal conversation)</Text>
            <Text style={styles.tipItem}>• Place speaker at least 1-2 feet away from baby</Text>
            <Text style={styles.tipItem}>• Experiment with different sounds to find favorites</Text>
            <Text style={styles.tipItem}>• Use consistently as part of bedtime routine</Text>
          </View>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  noiseBox: {
    width: '48%',
    backgroundColor: '#FCE7F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  noiseBoxActive: {
    backgroundColor: '#FC7596',
    borderColor: '#BE185D',
  },
  noiseName: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 8 },
  noiseNameActive: { color: '#fff' },
  noiseDesc: { fontSize: 11, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  noiseDescActive: { color: '#E8F5F0' },
  playIndicator: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  playIndicatorText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  playerControls: {
    backgroundColor: '#FCE7F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  volumeLabel: { fontWeight: '600', color: '#FC7596', marginBottom: 8, fontSize: 13 },
  volumeBar: { height: 6, backgroundColor: '#FBCFE8', borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  volumeFill: { height: '100%', backgroundColor: '#FC7596', borderRadius: 3 },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  volumeButton: { flex: 1, backgroundColor: '#FC7596', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  volumeButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  stopButton: { backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  stopButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  tipsBox: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8 },
  tipsTitle: { fontWeight: '600', color: '#D97706', marginBottom: 8, fontSize: 13 },
  tipItem: { color: '#374151', fontSize: 13, marginBottom: 4 },
});