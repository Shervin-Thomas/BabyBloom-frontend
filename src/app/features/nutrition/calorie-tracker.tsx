import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';

export default function CalorieTrackerScreen() {
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
        title="Calorie Tracker"
        showBackButton
        onBackPress={() => router.back()}
      />
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
