import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

export default function CalorieTrackerScreen() {
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
        <Text style={styles.headerTitle}>Calorie Tracker</Text>
        <Text style={styles.headerSubtitle}>Monitor Your Intake</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track Your Daily Calories</Text>
          <Text style={styles.sectionContent}>
            Easily log your meals and snacks to keep a comprehensive record of your daily calorie intake. Our intuitive interface makes tracking quick and simple.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Calorie Goals</Text>
          <Text style={styles.sectionContent}>
            Receive recommended daily calorie goals tailored to your individual needs, pregnancy stage, and activity level. Stay on track to ensure optimal nutrition for you and your baby.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Nutritional Breakdown</Text>
          <Text style={styles.sectionContent}>
            Beyond just calories, get a breakdown of macronutrients (proteins, carbs, fats) and key micronutrients for each meal. Understand the nutritional value of your food choices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Reports and Insights</Text>
          <Text style={styles.sectionContent}>
            Visualize your eating habits and progress over time with easy-to-understand charts and reports. Identify trends, make informed adjustments, and celebrate your achievements.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
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
