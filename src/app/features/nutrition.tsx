import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GradientHeader from '@/components/GradientHeader';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

interface MealItem {
  day: string;
  meal: string;
  item: string;
}

interface DietPlans {
  [key: string]: MealItem[];
}

export default function NutritionScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const [selectedTrimester, setSelectedTrimester] = useState<string>('1');

  const dietPlans: DietPlans = {
    '1': [
      { day: 'Monday', meal: 'Breakfast', item: 'Oatmeal with berries and nuts' },
      { day: 'Monday', meal: 'Lunch', item: 'Quinoa salad with roasted vegetables' },
      { day: 'Monday', meal: 'Dinner', item: 'Baked salmon with sweet potato and green beans' },
    ],
    '2': [
      { day: 'Monday', meal: 'Breakfast', item: 'Scrambled eggs with whole-wheat toast' },
      { day: 'Monday', meal: 'Lunch', item: 'Lentil soup with a side of whole-grain bread' },
      { day: 'Monday', meal: 'Dinner', item: 'Chicken stir-fry with brown rice' },
    ],
    '3': [
      { day: 'Monday', meal: 'Breakfast', item: 'Greek yogurt with fruit and granola' },
      { day: 'Monday', meal: 'Lunch', item: 'Turkey and avocado sandwich on whole-grain bread' },
      { day: 'Monday', meal: 'Dinner', item: 'Beef and vegetable stew' },
    ],
  };

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GradientHeader 
        title="Nutrition" 
        subtitle="Your AI-Powered Health Advisor"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Diet Plans</Text>
          <Picker
            selectedValue={selectedTrimester}
            onValueChange={(itemValue: string) => setSelectedTrimester(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="First Trimester" value="1" />
            <Picker.Item label="Second Trimester" value="2" />
            <Picker.Item label="Third Trimester" value="3" />
          </Picker>
          <View style={styles.dietPlanContainer}>
            {dietPlans[selectedTrimester].map((plan: MealItem, index: number) => (
              <View key={index} style={styles.mealItem}>
                <Text style={styles.mealTime}>{plan.day} - {plan.meal}:</Text>
                <Text style={styles.mealDescription}>{plan.item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ML-based Nutrient Deficiency Detection</Text>
          <Text style={styles.sectionContent}>
            Our machine learning model analyzes your dietary intake to detect potential nutrient deficiencies and suggests food-based solutions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Recommendations & Calorie Tracking</Text>
          <Text style={styles.sectionContent}>
            Get daily meal recommendations with estimated calorie counts to help you meet your nutritional goals. Track your intake easily within the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hydration & Supplement Reminders</Text>
          <Text style={styles.sectionContent}>
            Stay on track with personalized reminders for water intake and essential prenatal supplements. Never miss a dose or a sip!
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
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dietPlanContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  mealItem: {
    marginBottom: 10,
  },
  mealTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  mealDescription: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
});
