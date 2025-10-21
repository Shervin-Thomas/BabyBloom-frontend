import { View, Text, StyleSheet, ScrollView, ImageBackground, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from 'lib/supabase';
import { growthPredictionService } from '@/services/growthPredictionService';
import { Ionicons } from '@expo/vector-icons';

export default function PredictionsScreen() {
  const [loaded] = useFonts({ 'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf') });
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [birthDate, setBirthDate] = useState('');
  // Questionnaire fields
  const [currentWeightKg, setCurrentWeightKg] = useState<string>('');
  const [currentHeightCm, setCurrentHeightCm] = useState<string>('');
  const [currentHeadCm, setCurrentHeadCm] = useState<string>('');
  const [feedingType, setFeedingType] = useState<'breast'|'formula'|'mixed'|'solid'|'other' | ''>('');
  const [feedingFrequencyPerDay, setFeedingFrequencyPerDay] = useState<string>('');
  const [introduceSolidsAtMonths, setIntroduceSolidsAtMonths] = useState<string>('');
  const [supplements, setSupplements] = useState<string>('');
  const [avgDailyCalories, setAvgDailyCalories] = useState<string>('');
  const [status, setStatus] = useState<'normal' | 'monitor' | 'concern'>('normal');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    loadGrowthData();
  }, []);

  const loadGrowthData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert('Login Required', 'Please log in to view growth predictions.');
        return;
      }

      // Fetch growth logs
      const { data: logsData, error: logsError } = await supabase
        .from('baby_growth_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (logsError) throw logsError;

      // Format logs for prediction service
      const formattedLogs = logsData.map(log => ({
        date: log.created_at,
        weightKg: log.weight_kg,
        heightCm: log.height_cm,
        headCm: log.head_cm
      }));

      setLogs(formattedLogs);

      // Get predictions if we have logs and birth date
      if (formattedLogs.length > 0 && birthDate) {
        generatePredictions(formattedLogs, new Date(birthDate));
      }
    } catch (error: any) {
      console.error('Error loading growth data:', error);
      Alert.alert('Error', 'Failed to load growth data');
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async (growthLogs: any[], birthDateObj: Date) => {
    try {
      setLoading(true);
      
      // Get user ID for nutrition data
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert('Login Required', 'Please log in to generate predictions.');
        return;
      }

      // Get comprehensive predictions including nutrition analysis
  // Build questionnaire object
  const questionnaire: any = {};
  if (currentWeightKg) questionnaire.currentWeightKg = Number(currentWeightKg);
  if (currentHeightCm) questionnaire.currentHeightCm = Number(currentHeightCm);
  if (currentHeadCm) questionnaire.currentHeadCm = Number(currentHeadCm);
  if (feedingType) questionnaire.feedingType = feedingType;
  if (feedingFrequencyPerDay) questionnaire.feedingFrequencyPerDay = Number(feedingFrequencyPerDay);
  if (introduceSolidsAtMonths) questionnaire.introduceSolidsAtMonths = Number(introduceSolidsAtMonths);
  if (supplements) questionnaire.supplements = supplements.split(',').map(s => s.trim()).filter(Boolean);
  if (avgDailyCalories) questionnaire.avgDailyCalories = Number(avgDailyCalories);

  const predictions = await growthPredictionService.predictGrowth(growthLogs, birthDateObj, session.user.id, 3, questionnaire);
      setPredictions(predictions);

      // Get status and recommendations for the latest prediction
      if (predictions.length > 0) {
        const latestPrediction = predictions[predictions.length - 1];
        // Determine status based on confidence score and factors
        let newStatus: 'normal' | 'monitor' | 'concern' = 'normal';
        if (latestPrediction.confidenceScore < 0.7) newStatus = 'monitor';
        if (latestPrediction.confidenceScore < 0.5) newStatus = 'concern';
        if (latestPrediction.factors.nutrition.deficiencies.length > 2) newStatus = 'concern';
        if (latestPrediction.factors.consistency.growthPattern === 'concerning') newStatus = 'concern';
        
        setStatus(newStatus);
        setRecommendations(latestPrediction.recommendations);
      }
    } catch (error) {
      console.error('Error generating predictions:', error);
      Alert.alert('Error', 'Failed to generate growth predictions');
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10B981';
      case 'monitor': return '#F59E0B';
      case 'concern': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.container} resizeMode="cover">
      <GradientHeader title="Growth Predictions" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Birth Date Input */}
        <View style={styles.card}>
          <Text style={styles.title}>Enter Birth Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={birthDate}
            onChangeText={setBirthDate}
          />

          {/* Questionnaire - recommended fields */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Optional: Baby details (recommended)</Text>
            <TextInput style={styles.input} placeholder="Current weight (kg)" placeholderTextColor="#9CA3AF" value={currentWeightKg} onChangeText={setCurrentWeightKg} keyboardType="numeric" />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Current height (cm)" placeholderTextColor="#9CA3AF" value={currentHeightCm} onChangeText={setCurrentHeightCm} keyboardType="numeric" />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Head circumference (cm)" placeholderTextColor="#9CA3AF" value={currentHeadCm} onChangeText={setCurrentHeadCm} keyboardType="numeric" />

            <Text style={{ marginTop: 10, color: '#6B7280' }}>Feeding type</Text>
            <View style={{ flexDirection: 'row', marginTop: 6, gap: 8 }}>
              {['breast','formula','mixed','solid','other'].map(type => (
                <TouchableOpacity key={type} onPress={() => setFeedingType(type as any)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: feedingType === type ? '#FC7596' : '#F3F4F6', borderRadius: 8 }}>
                  <Text style={{ color: feedingType === type ? 'white' : '#374151' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Feeding frequency per day" placeholderTextColor="#9CA3AF" value={feedingFrequencyPerDay} onChangeText={setFeedingFrequencyPerDay} keyboardType="numeric" />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Introduce solids at (months)" placeholderTextColor="#9CA3AF" value={introduceSolidsAtMonths} onChangeText={setIntroduceSolidsAtMonths} keyboardType="numeric" />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Supplements (comma separated)" placeholderTextColor="#9CA3AF" value={supplements} onChangeText={setSupplements} />
            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Average daily calories (kcal)" placeholderTextColor="#9CA3AF" value={avgDailyCalories} onChangeText={setAvgDailyCalories} keyboardType="numeric" />
          </View>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => {
              if (!birthDate) {
                Alert.alert('Required', 'Please enter birth date');
                return;
              }
              if (logs.length > 0) {
                generatePredictions(logs, new Date(birthDate));
              }
            }}
          >
            <Text style={styles.generateButtonText}>Generate Predictions</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={[styles.card, styles.loadingContainer]}>
            <ActivityIndicator size="large" color="#FC7596" />
          </View>
        ) : (
          <>
            {/* Current Growth Status */}
            {status && recommendations.length > 0 && (
              <View style={styles.card}>
                <View style={styles.statusHeader}>
                  <Ionicons 
                    name={status === 'normal' ? 'checkmark-circle' : 'alert-circle'} 
                    size={24} 
                    color={getStatusColor(status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
                <View style={styles.recommendationsContainer}>
                  {recommendations.map((rec, index) => (
                    <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Growth Predictions */}
            {predictions.length > 0 && (
              <>
                <View style={styles.card}>
                  <Text style={styles.title}>Growth Analysis Factors</Text>
                  {predictions[0].factors && (
                    <>
                      {/* Nutrition Analysis */}
                      <View style={styles.factorSection}>
                        <Text style={styles.factorTitle}>Nutrition Analysis</Text>
                        <Text style={styles.factorText}>Average Calorie Intake: {predictions[0].factors.nutrition.calorieIntake.toFixed(0)} kcal</Text>
                        {predictions[0].factors.nutrition.deficiencies.length > 0 && (
                          <Text style={styles.factorText}>Deficiencies: {predictions[0].factors.nutrition.deficiencies.join(', ')}</Text>
                        )}
                        <View style={styles.scoreBar}>
                          <View style={[styles.scoreIndicator, { width: `${predictions[0].factors.nutrition.nutritionScore * 100}%` }]} />
                        </View>
                      </View>

                      {/* Growth Pattern */}
                      <View style={styles.factorSection}>
                        <Text style={styles.factorTitle}>Growth Pattern</Text>
                        <Text style={styles.factorText}>Pattern: {predictions[0].factors.consistency.growthPattern}</Text>
                        <View style={styles.scoreBar}>
                          <View style={[styles.scoreIndicator, { width: `${predictions[0].factors.consistency.trendScore * 100}%` }]} />
                        </View>
                      </View>

                      {/* Percentile Tracking */}
                      <View style={styles.factorSection}>
                        <Text style={styles.factorTitle}>Percentile Trends</Text>
                        <Text style={styles.factorText}>Weight: {predictions[0].factors.percentileTracking.weightTrend}</Text>
                        <Text style={styles.factorText}>Height: {predictions[0].factors.percentileTracking.heightTrend}</Text>
                        <Text style={styles.factorText}>Head: {predictions[0].factors.percentileTracking.headTrend}</Text>
                        <View style={styles.scoreBar}>
                          <View style={[styles.scoreIndicator, { width: `${predictions[0].factors.percentileTracking.percentileScore * 100}%` }]} />
                        </View>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.card}>
                  <View style={styles.predictionHeader}>
                    <Text style={styles.title}>3-Month Projections</Text>
                    <View style={styles.confidenceContainer}>
                      <Text style={styles.confidenceLabel}>Confidence Score:</Text>
                      <Text style={[styles.confidenceValue, { 
                        color: predictions[0].confidenceScore >= 0.7 ? '#10B981' : 
                               predictions[0].confidenceScore >= 0.5 ? '#F59E0B' : '#EF4444'
                      }]}>
                        {(predictions[0].confidenceScore * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  {predictions.map((prediction, index) => (
                    <View key={index} style={styles.predictionRow}>
                      <Text style={styles.dateText}>{formatDate(prediction.date)}</Text>
                      <View style={styles.measurementsContainer}>
                        <View style={styles.measurement}>
                          <Text style={styles.measurementValue}>{prediction.weightKg} kg</Text>
                          <Text style={styles.percentile}>{prediction.weightPercentile}%ile</Text>
                        </View>
                        <View style={styles.measurement}>
                          <Text style={styles.measurementValue}>{prediction.heightCm} cm</Text>
                          <Text style={styles.percentile}>{prediction.heightPercentile}%ile</Text>
                        </View>
                        <View style={styles.measurement}>
                          <Text style={styles.measurementValue}>{prediction.headCm} cm</Text>
                          <Text style={styles.percentile}>{prediction.headPercentile}%ile</Text>
                        </View>
                      </View>
                      {prediction.adjustedPrediction && (
                        <Text style={styles.adjustedNote}>* Adjusted based on nutritional and growth factors</Text>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* No Data Message */}
            {logs.length === 0 && (
              <View style={styles.card}>
                <Text style={styles.noDataText}>
                  No growth logs found. Add some measurements in the Growth Logs section to see predictions.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  content: { 
    padding: 20, 
    paddingBottom: 100 
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FC7596', 
    marginBottom: 16 
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F9FAFB'
  },
  generateButton: {
    backgroundColor: '#FC7596',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8
  },
  recommendationsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8
  },
  recommendationText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20
  },
  predictionRow: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 16
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  measurementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  measurement: {
    alignItems: 'center'
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FC7596'
  },
  percentile: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  // New styles for factors analysis
  factorSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8
  },
  factorText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4
  },
  scoreBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden'
  },
  scoreIndicator: {
    height: '100%',
    backgroundColor: '#FC7596',
    borderRadius: 3
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  adjustedNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4
  }
});


