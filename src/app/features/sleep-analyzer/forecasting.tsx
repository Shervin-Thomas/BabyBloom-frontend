import { View, Text, StyleSheet, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';
import { getSleepLogs, getAverageSleepDuration } from '@/services/sleepLogService';

interface ForecastData {
  week: string;
  predicted: string;
  trend: string;
  status: string;
}

export default function SleepForecasting() {
  const router = useRouter();
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    try {
      setLoading(true);
      const logs = await getSleepLogs();

      if (logs.length === 0) {
        setForecastData([
          { week: 'This Week', predicted: 'No data', trend: 'N/A', status: 'No Data' },
          { week: 'Next Week', predicted: 'No data', trend: 'N/A', status: 'No Data' },
        ]);
        setLoading(false);
        return;
      }

      // Calculate average sleep duration for last 7 days
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      const avgLastWeek = await getAverageSleepDuration(
        lastWeek.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      // Calculate average sleep duration for previous week (8-14 days ago)
      const prevWeekStart = new Date(today);
      prevWeekStart.setDate(today.getDate() - 14);
      const prevWeekEnd = new Date(lastWeek);
      prevWeekEnd.setDate(lastWeek.getDate() - 1);
      const avgPrevWeek = await getAverageSleepDuration(
        prevWeekStart.toISOString().split('T')[0],
        prevWeekEnd.toISOString().split('T')[0]
      );

      // Determine trend
      let trend = 'Stable';
      let trendSymbol = '→';
      if (avgPrevWeek && avgLastWeek) {
        const diff = avgLastWeek - avgPrevWeek;
        if (diff > 0.5) {
          trend = 'Improving';
          trendSymbol = '↑';
        } else if (diff < -0.5) {
          trend = 'Declining';
          trendSymbol = '↓';
        }
      }

      // Determine status based on average
      const getStatus = (avg: number | null) => {
        if (!avg) return 'No Data';
        if (avg >= 8) return 'Good';
        if (avg >= 6) return 'On Track';
        return 'Needs Attention';
      };

      const thisWeekPredicted = avgLastWeek ? `${avgLastWeek.toFixed(1)}h` : 'No data';
      const nextWeekPredicted = avgLastWeek ? `${(avgLastWeek + (avgPrevWeek ? (avgLastWeek - avgPrevWeek) : 0)).toFixed(1)}h` : 'No data';

      setForecastData([
        {
          week: 'This Week',
          predicted: thisWeekPredicted,
          trend: `${trendSymbol} ${trend}`,
          status: getStatus(avgLastWeek)
        },
        {
          week: 'Next Week',
          predicted: nextWeekPredicted,
          trend: `${trendSymbol} ${trend}`,
          status: getStatus(avgLastWeek)
        },
      ]);
    } catch (error) {
      console.error('Error loading forecast data:', error);
      setForecastData([
        { week: 'This Week', predicted: 'Error', trend: 'N/A', status: 'Error' },
        { week: 'Next Week', predicted: 'Error', trend: 'N/A', status: 'Error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const regressionInsights = [
    { factor: 'Teething', impact: '-1.5h sleep', likelihood: 'High' },
    { factor: 'Growth Spurt', impact: '+0.5h sleep', likelihood: 'Medium' },
    { factor: 'Activity Level', impact: 'Varies', likelihood: 'High' },
  ];

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="Baby's Sleep Forecast" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Baby's Sleep Forecast</Text>
          <Text style={styles.helper}>Predicted baby sleep patterns based on logged sleep data.</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Predictions</Text>
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#FC7596" />
                <Text style={styles.loadingText}>Calculating forecast...</Text>
              </View>
            ) : (
              forecastData.map((item, idx) => (
              <View key={idx} style={styles.forecastBox}>
                <View style={styles.forecastRow}>
                  <Text style={styles.forecastLabel}>{item.week}</Text>
                  <Text style={styles.forecastValue}>{item.predicted}</Text>
                </View>
                <View style={styles.forecastRow}>
                  <Text style={styles.trend}>{item.trend}</Text>
                  <Text style={[styles.status, {
                    color: item.status === 'Good' ? '#FC7596' :
                           item.status === 'On Track' ? '#F59E0B' :
                           item.status === 'Needs Attention' ? '#EF4444' :
                           '#6B7280' // For No Data or Error
                  }]}>{item.status}</Text>
                </View>
              </View>
            )))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Factors Affecting Baby's Sleep</Text>
            <Text style={styles.helper}>Common factors that may affect your baby's sleep duration:</Text>
            {regressionInsights.map((item, idx) => (
              <View key={idx} style={styles.insightBox}>
                <Text style={styles.insightTitle}>{item.factor}</Text>
                <View style={styles.insightRow}>
                  <Text style={styles.insightText}>Impact: {item.impact}</Text>
                  <Text style={[styles.likelihood, { color: item.likelihood === 'High' ? '#EF4444' : '#F59E0B' }]}>
                    {item.likelihood}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.note}>
            <Text style={styles.noteTitle}>💡 Note</Text>
            <Text style={styles.noteText}>These predictions are based on your baby's logged sleep data and common baby sleep patterns. Every baby is unique and results may vary.</Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FC7596', marginBottom: 8 },
  helper: { color: '#6B7280', marginBottom: 16, fontSize: 14, lineHeight: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  forecastBox: { backgroundColor: '#FCE7F3', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FC7596' },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  forecastLabel: { color: '#374151', fontWeight: '600', fontSize: 13 },
  forecastValue: { color: '#FC7596', fontWeight: '700', fontSize: 15 },
  trend: { color: '#6B7280', fontSize: 12 },
  status: { fontWeight: '600', fontSize: 12 },
  insightBox: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  insightTitle: { fontWeight: '600', color: '#111827', marginBottom: 6, fontSize: 13 },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between' },
  insightText: { color: '#374151', fontSize: 12 },
  likelihood: { fontWeight: '600', fontSize: 12 },
  note: { backgroundColor: '#E8F5F0', padding: 12, borderRadius: 8, marginTop: 16 },
  noteTitle: { fontWeight: '600', color: '#FC7596', marginBottom: 4, fontSize: 13 },
  noteText: { color: '#374151', fontSize: 13, lineHeight: 20 },
  centerContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { color: '#6B7280', marginTop: 10, fontSize: 14 },
});