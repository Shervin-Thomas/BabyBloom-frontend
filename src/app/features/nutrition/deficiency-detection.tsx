import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';
import { supabase } from 'lib/supabase';
import GradientHeader from '@/components/GradientHeader';

interface DeficiencyResult {
  name: string;
  confidence: number;
  recommendations: string[];
}

interface FoodItem {
  name: string;
  nutrients: { [key: string]: number }; // e.g., { 'Iron': 10, 'Vitamin C': 50 }
}

// Dummy data for RDA and food nutrients
const RDA = {
  Iron: 18, // mg
  'Vitamin D': 15, // mcg
  'Vitamin B12': 2.4, // mcg
  Calcium: 1000, // mg
  Folate: 400, // mcg
};

const FOOD_DATABASE: FoodItem[] = [
  { name: 'Spinach', nutrients: { Iron: 3, 'Vitamin C': 28, Folate: 194 } },
  { name: 'Red Meat', nutrients: { Iron: 2, 'Vitamin B12': 2.5 } },
  { name: 'Milk', nutrients: { Calcium: 300, 'Vitamin D': 2.5 } },
  { name: 'Salmon', nutrients: { 'Vitamin D': 10, 'Vitamin B12': 3 } },
  { name: 'Orange', nutrients: { 'Vitamin C': 70, Folate: 30 } },
  { name: 'Lentils', nutrients: { Iron: 3.3, Folate: 181 } },
  { name: 'Eggs', nutrients: { 'Vitamin D': 1.1, 'Vitamin B12': 0.5 } },
  { name: 'Yogurt', nutrients: { Calcium: 150 } },
];

const symptomsList = [
  { id: 'hair_fall', label: 'Hair Fall' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'pale_skin', label: 'Pale Skin' },
  { id: 'brittle_nails', label: 'Brittle Nails' },
  { id: 'muscle_weakness', label: 'Muscle Weakness' },
  { id: 'poor_concentration', label: 'Poor Concentration' },
  { id: 'frequent_infections', label: 'Frequent Infections' },
  { id: 'bone_pain', label: 'Bone Pain' },
  { id: 'mouth_ulcers', label: 'Mouth Ulcers' },
  { id: 'tingling_limbs', label: 'Tingling Limbs' },
  { id: 'other', label: 'Other (specify)' },
];

export default function DeficiencyDetectionScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mealInput, setMealInput] = useState('');
  const [symptomResults, setSymptomResults] = useState<DeficiencyResult[]>([]);
  const [dietResults, setDietResults] = useState<DeficiencyResult[]>([]);
  const [dailyNutrientIntake, setDailyNutrientIntake] = useState<{ [key: string]: number }>({});
  const [customSymptom, setCustomSymptom] = useState('');
  const [showCustomSymptomInput, setShowCustomSymptomInput] = useState(false);
  const [historicalLogs, setHistoricalLogs] = useState<any[]>([]); // To store historical data
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthAndLoadLogs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        await fetchHistoricalLogs(session.user.id);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setHistoricalLogs([]);
        setLoadingHistory(false);
      }
    };

    checkAuthAndLoadLogs();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        fetchHistoricalLogs(session.user.id);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setHistoricalLogs([]);
        setLoadingHistory(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHistoricalLogs = async (userId: string) => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('user_nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Error fetching historical logs:', error);
    } else {
      setHistoricalLogs(data);
    }
    setLoadingHistory(false);
  };

  if (!loaded) {
    return null;
  }

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const runDetection = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to use this feature.');
      return;
    }

    // Symptom-based detection logic
    const newSymptomResults: DeficiencyResult[] = [];
    let currentSymptoms = [...selectedSymptoms];
    if (showCustomSymptomInput && customSymptom.trim() !== '') {
      currentSymptoms.push(customSymptom.trim().toLowerCase().replace(/\s/g, '_'));
    }

    if (currentSymptoms.includes('hair_fall') && currentSymptoms.includes('fatigue')) {
      newSymptomResults.push({
        name: 'Iron Deficiency',
        confidence: 0.85,
        recommendations: ['Eat more red meat, spinach, lentils.', 'Consult a doctor for iron supplements.'],
      });
    }
    if (currentSymptoms.includes('bone_pain') || currentSymptoms.includes('muscle_weakness')) {
      newSymptomResults.push({
        name: 'Vitamin D Deficiency',
        confidence: 0.70,
        recommendations: ['Get more sunlight, consume fatty fish (salmon), fortified milk.'],
      });
    }
    if (currentSymptoms.includes('pale_skin') && currentSymptoms.includes('tingling_limbs')) {
      newSymptomResults.push({
        name: 'Vitamin B12 Deficiency',
        confidence: 0.75,
        recommendations: ['Eat more meat, eggs, dairy. Consider B12 supplements.'],
      });
    }
    if (currentSymptoms.includes('other') && customSymptom.toLowerCase().includes('headache')) {
      newSymptomResults.push({
        name: 'Potential Dehydration',
        confidence: 0.60,
        recommendations: ['Increase water intake.', 'Consume hydrating fruits and vegetables.'],
      });
    }
    setSymptomResults(newSymptomResults.length > 0 ? newSymptomResults : [{ name: 'No significant deficiencies detected from symptoms.', confidence: 0.99, recommendations: [] }]);

    // Dietary intake analysis logic
    const intake: { [key: string]: number } = {};
    const mealItems = mealInput.split(',').map(item => item.trim().toLowerCase()).filter(item => item !== '');

    mealItems.forEach(meal => {
      const foundFood = FOOD_DATABASE.find(food => meal.includes(food.name.toLowerCase()));
      if (foundFood) {
        for (const nutrient in foundFood.nutrients) {
          intake[nutrient] = (intake[nutrient] || 0) + foundFood.nutrients[nutrient];
        }
      }
    });
    setDailyNutrientIntake(intake);

    const newDeficiencies: DeficiencyResult[] = [];
    for (const nutrient in RDA) {
      if ((intake[nutrient] || 0) < RDA[nutrient]) {
        const recommendations: string[] = [];
        FOOD_DATABASE.forEach(food => {
          if (food.nutrients[nutrient]) {
            recommendations.push(`Include ${food.name} for ${nutrient}.`);
          }
        });

        newDeficiencies.push({
          name: `${nutrient} Deficiency`,
          confidence: 1 - ((intake[nutrient] || 0) / RDA[nutrient]),
          recommendations: recommendations.length > 0 ? recommendations : [`Consider foods rich in ${nutrient}.`],
        });
      }
    }
    setDietResults(newDeficiencies.length > 0 ? newDeficiencies : [{ name: 'No significant deficiencies detected from dietary intake.', confidence: 0.99, recommendations: [] }]);

    // The inputs are not reset here anymore.
  };

  const resetInputs = () => {
    setSelectedSymptoms([]);
    setCustomSymptom('');
    setMealInput('');
    setShowCustomSymptomInput(false);
    setSymptomResults([]); // Also clear displayed results
    setDietResults([]);   // Also clear displayed results
    setDailyNutrientIntake({}); // Clear daily intake
  };

  const logTodayResults = async () => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert('Login Required', 'Please log in to log your results.');
      return;
    }

    const newLog = {
      user_id: currentUserId,
      log_date: new Date().toISOString(),
      symptoms: selectedSymptoms,
      custom_symptom: customSymptom,
      meal_input: mealInput,
      symptom_results: symptomResults, // Ensure this holds the detected details
      diet_results: dietResults, // Ensure this holds the detected details
      daily_nutrient_intake: dailyNutrientIntake,
    };

    const { error } = await supabase.from('user_nutrition_logs').insert([newLog]);

    if (error) {
      console.error('Error logging results:', error);
      Alert.alert('Error', 'Failed to log results. Please try again.');
    } else {
      Alert.alert('Logged!', `Your nutrition data for ${new Date().toLocaleString()} has been logged.`);
      fetchHistoricalLogs(currentUserId); // Refresh logs after saving
    }
  };

  return (
    <ImageBackground 
      source={require('../../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Nutrient Deficiency Detection"
        iconName="search"
        showBackButton
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Symptom-based Detection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detect from Symptoms</Text>
          <Text style={styles.sectionContent}>Select any symptoms you are currently experiencing:</Text>
          {!isAuthenticated && (
            <View style={styles.overlay}><Text style={styles.overlayText}>Log in to use this feature</Text></View>
          )}
          <View style={styles.symptomGrid}>
            {symptomsList.map(symptom => (
              <TouchableOpacity
                key={symptom.id}
                style={styles.checkboxContainer}
                onPress={() => {
                  toggleSymptom(symptom.id);
                  if (symptom.id === 'other') {
                    setShowCustomSymptomInput(!showCustomSymptomInput);
                    if (showCustomSymptomInput) setCustomSymptom('');
                  }
                }}
              >
                <Checkbox
                  value={selectedSymptoms.includes(symptom.id)}
                  onValueChange={() => {
                    toggleSymptom(symptom.id);
                    if (symptom.id === 'other') {
                      setShowCustomSymptomInput(!showCustomSymptomInput);
                      if (showCustomSymptomInput) setCustomSymptom('');
                    }
                  }}
                  color={selectedSymptoms.includes(symptom.id) ? '#FC7596' : undefined}
                />
                <Text style={styles.checkboxLabel}>{symptom.label}</Text>
              </TouchableOpacity>
            ))}
            {showCustomSymptomInput && (
              <TextInput
                style={styles.customSymptomInput}
                placeholder="Type your symptom here..."
                value={customSymptom}
                onChangeText={setCustomSymptom}
              />
            )}
          </View>
        </View>

        {/* Dietary Intake Detection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detect from Dietary Intake</Text>
          <Text style={styles.sectionContent}>
            Log your meals for the day (e.g., "oatmeal, spinach, salmon, milk"): 
          </Text>
          {!isAuthenticated && (
            <View style={styles.overlay}><Text style={styles.overlayText}>Log in to use this feature</Text></View>
          )}
          <TextInput
            style={styles.mealInput}
            placeholder="Enter meals separated by commas (e.g., 'spinach, milk, salmon')"
            value={mealInput}
            onChangeText={setMealInput}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
            editable={isAuthenticated} // Disable if not authenticated
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.detectButton} onPress={runDetection} disabled={!isAuthenticated}>
            <Text style={styles.detectButtonText}>Run Detection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={resetInputs} disabled={!isAuthenticated}>
            <Text style={styles.clearButtonText}>Clear Inputs</Text>
          </TouchableOpacity>
        </View>

        {symptomResults.length > 0 || dietResults.length > 0 ? (
          <View>
            {symptomResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Symptom-Based Detection Results:</Text>
                {symptomResults.map((result, index) => (
                  <View key={index} style={styles.resultItem}>
                    <Text style={styles.resultName}>{result.name} ({(result.confidence * 100).toFixed(0)}% confidence)</Text>
                    {result.recommendations.length > 0 && (
                      <View>
                        <Text style={styles.recommendationTitle}>Recommendations:</Text>
                        {result.recommendations.map((rec, i) => (
                          <Text key={i} style={styles.recommendationText}>• {rec}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {dietResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Dietary Intake Detection Results:</Text>
                <Text style={styles.subResultTitle}>Daily Nutrient Intake:</Text>
                {Object.keys(dailyNutrientIntake).length > 0 ? (
                  Object.entries(dailyNutrientIntake).map(([nutrient, amount], index) => (
                    <Text key={index} style={styles.nutrientText}>
                      • {nutrient}: {amount.toFixed(1)} {nutrient === 'Iron' || nutrient === 'Calcium' ? 'mg' : 'mcg'} (RDA: {RDA[nutrient as keyof typeof RDA]}{nutrient === 'Iron' || nutrient === 'Calcium' ? 'mg' : 'mcg'})
                    </Text>
                  ))
                ) : (
                  <Text style={styles.nutrientText}>No nutrient data available from logged meals.</Text>
                )}
                {dietResults.map((result, index) => (
                  <View key={index} style={styles.resultItem}>
                    <Text style={styles.resultName}>{result.name} ({(result.confidence * 100).toFixed(0)}% confidence)</Text>
                    {result.recommendations.length > 0 && (
                      <View>
                        <Text style={styles.recommendationTitle}>Recommendations:</Text>
                        {result.recommendations.map((rec, i) => (
                          <Text key={i} style={styles.recommendationText}>• {rec}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null} 

        {/* Track over time - This remains a separate action */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track Your Nutrient Levels Over Time</Text>
          <Text style={styles.sectionContent}>
            Log today's detection results to track your progress and see trends over time.
          </Text>
          {!isAuthenticated && (
            <View style={styles.overlay}><Text style={styles.overlayText}>Log in to use this feature</Text></View>
          )}
          <TouchableOpacity style={styles.logButton} onPress={logTodayResults} disabled={!isAuthenticated}>
            <Text style={styles.logButtonText}>Log Today's Results</Text>
          </TouchableOpacity>

          {loadingHistory ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#FC7596" />
          ) : (
            historicalLogs.length > 0 ? (
              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Your History:</Text>
                {historicalLogs.map((log, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyDate}>{new Date(log.log_date).toLocaleString()}</Text>
                    {log.symptom_results.length > 0 && (
                      <View>
                        <Text style={styles.historySubTitle}>Symptoms-Based Deficiencies:</Text>
                        {log.symptom_results.map((res: DeficiencyResult, i: number) => (
                          <Text key={i} style={styles.historyText}>• {res.name} ({(res.confidence * 100).toFixed(0)}%)</Text>
                        ))}
                      </View>
                    )}
                    {log.diet_results.length > 0 && (
                      <View style={{ marginTop: 5 }}>
                        <Text style={styles.historySubTitle}>Dietary Intake Deficiencies:</Text>
                        {log.diet_results.map((res: DeficiencyResult, i: number) => (
                          <Text key={i} style={styles.historyText}>• {res.name} ({(res.confidence * 100).toFixed(0)}%)</Text>
                        ))}
                      </View>
                    )}
                    {Object.keys(log.daily_nutrient_intake).length > 0 && (
                      <View style={{ marginTop: 5 }}>
                        <Text style={styles.historySubTitle}>Daily Nutrient Intake Summary:</Text>
                        {Object.entries(log.daily_nutrient_intake).map(([nutrient, amount], i) => (
                          <Text key={i} style={styles.historyText}>
                            • {nutrient}: {amount.toFixed(1)} {nutrient === 'Iron' || nutrient === 'Calcium' ? 'mg' : 'mcg'}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>No history logged yet.</Text>
              </View>
            )
          )}
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
    marginBottom: 15,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // Approximately two columns
    marginBottom: 10,
  },
  customSymptomInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#374151',
    marginTop: 10,
    width: '100%',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  detectButton: {
    backgroundColor: '#FC7596',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  detectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  clearButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 5,
  },
  historySubTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 5,
    marginBottom: 3,
  },
  historyText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
    lineHeight: 18,
  },
  resultsContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  resultItem: {
    backgroundColor: '#FFF8F8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FC7596',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 5,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 8,
    marginBottom: 3,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    lineHeight: 20,
  },
  mealInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
    marginBottom: 15,
    minHeight: 100,
  },
  nutrientText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    marginBottom: 3,
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
