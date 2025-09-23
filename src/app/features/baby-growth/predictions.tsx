import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useRouter } from 'expo-router';

export default function PredictionsScreen() {
  const [loaded] = useFonts({ 'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf') });
  const router = useRouter();
  if (!loaded) return null;

  // Placeholder trend (would be calculated from logs)
  const last = { weightKg: 7.8, heightCm: 69, headCm: 43.2 };
  const projection30 = { weightKg: 8.2, heightCm: 70.5, headCm: 43.7 };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.container} resizeMode="cover">
      <GradientHeader title="Growth Predictions" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>30-day projection</Text>
          <Text style={styles.row}>Current: {last.weightKg} kg, {last.heightCm} cm, {last.headCm} cm</Text>
          <Text style={styles.row}>In 30 days: {projection30.weightKg} kg, {projection30.heightCm} cm, {projection30.headCm} cm</Text>
          <Text style={styles.note}>Note: Simple linear trend for now. We can replace with ML later.</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#10B981', marginBottom: 10 },
  row: { fontSize: 16, color: '#374151', marginBottom: 8 },
  note: { marginTop: 8, color: '#6B7280', fontSize: 12 },
});


