import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Share } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useRouter } from 'expo-router';

export default function ReportsScreen() {
  const [loaded] = useFonts({ 'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf') });
  const router = useRouter();
  if (!loaded) return null;

  const exportReport = async () => {
    const message = `Baby Growth Report\n\nThis is a placeholder report. We will include logs, percentiles, and trends here.`;
    await Share.share({ title: 'Baby Growth Report', message });
  };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.container} resizeMode="cover">
      <GradientHeader title="Alerts & Reports" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.row}>No alerts right now. You’re doing great!</Text>
          <Text style={styles.note}>We’ll flag potential delays based on percentiles and velocity once real data is connected.</Text>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.title}>Export</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={exportReport}><Text style={styles.primaryBtnText}>Export Report</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 10 },
  row: { fontSize: 16, color: '#374151', marginBottom: 8 },
  note: { marginTop: 8, color: '#6B7280', fontSize: 12 },
  primaryBtn: { marginTop: 8, backgroundColor: '#8B5CF6', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: 'bold' },
});


