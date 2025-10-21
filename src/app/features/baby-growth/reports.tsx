import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ReportsRemoved() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts & Reports Removed</Text>
      <Text style={styles.message}>The Alerts & Reports feature has been removed from Baby Growth.</Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.button}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FC7596', marginBottom: 12 },
  message: { color: '#374151', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#FC7596', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600' }
});


