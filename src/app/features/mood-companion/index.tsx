import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MoodCompanionScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();

  if (!loaded) return null;

  return (
    <ImageBackground 
      source={require('../../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Mood Companion"
        showBackButton
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/mood-companion/mood-tracker')}>
            <View style={styles.iconWrap}><Ionicons name="happy-outline" size={28} color="#FC7596" /></View>
            <Text style={styles.tileTitle}>Mood Tracker</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/mood-companion/pnd-screen')}>
            <View style={styles.iconWrap}><Ionicons name="help-buoy-outline" size={28} color="#FC7596" /></View>
            <Text style={styles.tileTitle}>PND Screener</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/mood-companion/guided-exercises')}>
            <View style={styles.iconWrap}><Ionicons name="leaf-outline" size={28} color="#FC7596" /></View>
            <Text style={styles.tileTitle}>Guided Exercises</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/mood-companion/games')}>
            <View style={styles.iconWrap}><Ionicons name="game-controller-outline" size={28} color="#FC7596" /></View>
            <Text style={styles.tileTitle}>Relaxing Games</Text>
          </TouchableOpacity>
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
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A78BFA',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 20 },
  tile: { width: '48%', backgroundColor: 'white', borderRadius: 16, padding: 18, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 },
  tileFull: { width: '100%', backgroundColor: 'white', borderRadius: 16, padding: 18, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 },
  tileTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  iconWrap: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  iconWrapLarge: { width: 70, height: 70, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
});


