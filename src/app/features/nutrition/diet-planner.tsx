import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { supabase } from 'lib/supabase';
import GradientHeader from '@/components/GradientHeader';

interface MealItem {
  day: string;
  meal: string;
  item: string;
}

interface DietPlanContent {
  [key: string]: MealItem[];
}

interface UserDietPlan {
  id: string;
  user_id: string;
  trimester: number;
  preferences: string[];
  allergies: string[];
  diet_plan_content: DietPlanContent;
  created_at: string;
}

export default function DietPlannerScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();
  const [selectedTrimester, setSelectedTrimester] = useState<string>('1');
  const [preferencesInput, setPreferencesInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [generatedDietPlan, setGeneratedDietPlan] = useState<DietPlanContent | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [historicalNutritionLogs, setHistoricalNutritionLogs] = useState<any[]>([]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        await fetchUserSpecificData(session.user.id, selectedTrimester);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setGeneratedDietPlan(null);
        setHistoricalNutritionLogs([]);
      }
      setLoading(false);
    };

    checkAuthAndLoadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        fetchUserSpecificData(session.user.id, selectedTrimester);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setGeneratedDietPlan(null);
        setHistoricalNutritionLogs([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [selectedTrimester]); // Re-fetch when trimester changes

  const fetchUserSpecificData = async (userId: string, trimester: string) => {
    setLoading(true);
    // Fetch historical nutrition logs
    const { data: nutritionLogs, error: nutritionLogsError } = await supabase
      .from('user_nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    if (nutritionLogsError) {
      console.error('Error fetching nutrition logs:', nutritionLogsError);
    } else {
      setHistoricalNutritionLogs(nutritionLogs || []);
    }

    // Fetch existing diet plan for the selected trimester
    const { data: dietPlans, error: dietPlansError } = await supabase
      .from('user_diet_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('trimester', parseInt(trimester))
      .single();

    if (dietPlansError && dietPlansError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching diet plan:', dietPlansError);
      setGeneratedDietPlan(null);
    } else if (dietPlans) {
      setGeneratedDietPlan(dietPlans.diet_plan_content);
      setPreferencesInput(dietPlans.preferences ? dietPlans.preferences.join(', ') : '');
      setAllergiesInput(dietPlans.allergies ? dietPlans.allergies.join(', ') : '');
    } else {
      setGeneratedDietPlan(null);
      setPreferencesInput('');
      setAllergiesInput('');
    }
    setLoading(false);
  };

  if (!loaded) {
    return null;
  }

  const handleGenerateDietPlan = async () => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert('Login Required', 'Please log in to generate a diet plan.');
      return;
    }
    setLoading(true);

    const preferences = preferencesInput.split(',').map(p => p.trim()).filter(p => p !== '');
    const allergies = allergiesInput.split(',').map(a => a.trim()).filter(a => a !== '');

    // Dummy AI logic for diet plan generation
    // In a real app, this would involve a call to an AI service
    const newDietPlan: DietPlanContent = {
      Monday: [
        { day: 'Monday', meal: 'Breakfast', item: `Oatmeal with berries and nuts (considering preferences: ${preferences.join(', ')})` },
        { day: 'Monday', meal: 'Lunch', item: `Quinoa salad with roasted vegetables (avoiding: ${allergies.join(', ')})` },
        { day: 'Monday', meal: 'Dinner', item: `Baked salmon with sweet potato and green beans (based on logs: ${historicalNutritionLogs.length} entries)` },
      ],
      Tuesday: [
        { day: 'Tuesday', meal: 'Breakfast', item: 'Scrambled eggs with whole-wheat toast' },
        { day: 'Tuesday', meal: 'Lunch', item: 'Lentil soup with a side of whole-grain bread' },
        { day: 'Tuesday', meal: 'Dinner', item: 'Chicken stir-fry with brown rice' },
      ],
    };

    // Save or update the diet plan to Supabase
    const { error: upsertError } = await supabase
      .from('user_diet_plans')
      .upsert({
        user_id: currentUserId,
        trimester: parseInt(selectedTrimester),
        preferences: preferences,
        allergies: allergies,
        diet_plan_content: newDietPlan,
      }, { onConflict: 'user_id, trimester' });

    if (upsertError) {
      console.error('Error saving diet plan:', upsertError);
      Alert.alert('Error', 'Failed to save diet plan. Please try again.');
    } else {
      setGeneratedDietPlan(newDietPlan);
      Alert.alert('Success', 'Your personalized diet plan has been generated!');
    }
    setLoading(false);
  };

  return (
    <ImageBackground 
      source={require('../../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Diet Planner"
        iconName="nutrition"
        showBackButton
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Personalized Diet Plan</Text>
          {!isAuthenticated && (
            <View style={styles.overlay}><Text style={styles.overlayText}>Log in to use this feature</Text></View>
          )}
          <Text style={styles.sectionContent}>Select your current trimester and provide your dietary information to generate a personalized meal plan.</Text>

          <Text style={styles.label}>Select Trimester:</Text>
          <Picker
            selectedValue={selectedTrimester}
            onValueChange={(itemValue: string) => setSelectedTrimester(itemValue)}
            style={styles.picker}
            enabled={isAuthenticated}
          >
            <Picker.Item label="First Trimester" value="1" />
            <Picker.Item label="Second Trimester" value="2" />
            <Picker.Item label="Third Trimester" value="3" />
          </Picker>

          <Text style={styles.label}>Dietary Preferences (e.g., Vegetarian, Vegan, Halal):</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter preferences separated by commas"
            value={preferencesInput}
            onChangeText={setPreferencesInput}
            editable={isAuthenticated}
          />

          <Text style={styles.label}>Allergies (e.g., Nuts, Dairy, Gluten):</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter allergies separated by commas"
            value={allergiesInput}
            onChangeText={setAllergiesInput}
            editable={isAuthenticated}
          />

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateDietPlan}
            disabled={!isAuthenticated || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Diet Plan</Text>
            )}
          </TouchableOpacity>

          {generatedDietPlan && Object.keys(generatedDietPlan).length > 0 ? (
            <View style={styles.dietPlanContainer}>
              <Text style={styles.dietPlanTitle}>Generated Plan for Trimester {selectedTrimester}</Text>
              {Object.entries(generatedDietPlan).map(([day, meals]: [string, MealItem[]]) => (
                <View key={day} style={styles.dayPlan}>
                  <Text style={styles.dayTitle}>{day}</Text>
                  {meals.map((meal, index) => (
                    <View key={index} style={styles.mealItem}>
                      <Text style={styles.mealTime}>{meal.meal}:</Text>
                      <Text style={styles.mealDescription}>{meal.item}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : !loading && isAuthenticated && (
            <View style={styles.noPlanContainer}>
              <Text style={styles.noPlanText}>No diet plan generated yet. Fill in your details and click "Generate Diet Plan"!</Text>
              {historicalNutritionLogs.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.noPlanSubText}>Based on your {historicalNutritionLogs.length} past nutrition logs:</Text>
                  {historicalNutritionLogs.slice(0, 3).map((log, index) => (
                    <Text key={index} style={styles.noPlanLogText}>• Log on {new Date(log.log_date).toLocaleDateString()}: {log.meal_input || 'No meals logged'}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {loading && isAuthenticated && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#FC7596" />}

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
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
    marginTop: 15,
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
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    marginBottom: 15,
  },
  generateButton: {
    backgroundColor: '#FC7596',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dietPlanContainer: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  dietPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  dayPlan: {
    marginBottom: 20,
    backgroundColor: '#FFF8F8',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FC7596',
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 10,
  },
  mealItem: {
    marginBottom: 8,
  },
  mealTime: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
  },
  mealDescription: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  noPlanContainer: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  noPlanText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  noPlanSubText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  noPlanLogText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 10,
  },
  overlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FC7596',
    textAlign: 'center',
  },
});
