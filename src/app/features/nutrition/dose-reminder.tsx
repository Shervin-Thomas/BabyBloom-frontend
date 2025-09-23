import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';

export default function DoseReminderScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();

  if (!loaded) {
    return null;
  }

  return (
    <ImageBackground 
      source={require('../../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Dose Reminder"
        showBackButton
        onBackPress={() => router.back()}
      />
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
