import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

export default function DoseReminderScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dose Reminder</Text>
        <Text style={styles.headerSubtitle}>Never Miss a Dose</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Supplement Schedules</Text>
          <Text style={styles.sectionContent}>
            Set up custom reminders for your prenatal vitamins, iron supplements, DHA, and any other medications or supplements your doctor has prescribed. Tailor the schedule to fit your daily routine.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hydration Reminders</Text>
          <Text style={styles.sectionContent}>
            Stay adequately hydrated throughout your pregnancy with personalized water intake reminders. You can set your daily water goal and receive gentle nudges to drink up.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flexible Notification Options</Text>
          <Text style={styles.sectionContent}>
            Choose how you want to be reminded – whether it's through push notifications, in-app alerts, or gentle sounds. Customize the timing and frequency to avoid missing important doses.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track Your Adherence</Text>
          <Text style={styles.sectionContent}>
            Monitor your adherence to your supplement and hydration schedules with clear tracking. See your progress and maintain consistency for a healthy pregnancy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  customHeader: {
    backgroundColor: '#FC7596', // Or any gradient color matching your app's theme
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Pacifico-Regular', // Use your custom font
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // For tab bar space
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});
