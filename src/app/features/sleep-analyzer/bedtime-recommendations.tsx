import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';

export default function BedtimeRecommendations() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  const recommendations = [
    {
      id: 'bedtime',
      title: 'Optimal Bedtime',
      time: '8:00 PM',
      reason: 'Based on wake windows (15-18 hours) and activity level',
      tips: ['Consistent bedtime within 15-30 min window', 'Helps establish circadian rhythm', 'Aim for same time daily'],
    },
    {
      id: 'nap1',
      title: 'First Nap Window',
      time: '10:00 AM - 10:30 AM',
      reason: 'After 2-3 hours of morning wake time',
      tips: ['30-45 min power nap', 'Helps avoid overtiredness', 'Best in dark, quiet environment'],
    },
    {
      id: 'nap2',
      title: 'Second Nap Window',
      time: '2:00 PM - 2:30 PM',
      reason: 'Mid-day consolidation window',
      tips: ['45-60 min nap recommended', 'Prevents evening crankiness', 'Keep environment cool (68-72°F)'],
    },
  ];

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="Bedtime & Nap Tips" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Optimal Sleep Schedule</Text>
          <Text style={styles.helper}>Personalized bedtime and nap window recommendations.</Text>

          {recommendations.map(rec => (
            <TouchableOpacity 
              key={rec.id} 
              style={styles.recommendationBox}
              onPress={() => toggleExpand(rec.id)}
            >
              <View style={styles.recommendationHeader}>
                <View>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recTime}>{rec.time}</Text>
                </View>
                <Text style={styles.expandIcon}>{expanded === rec.id ? '−' : '+'}</Text>
              </View>

              {expanded === rec.id && (
                <View style={styles.expandedContent}>
                  <Text style={styles.reason}>{rec.reason}</Text>
                  <Text style={styles.tipsLabel}>Tips:</Text>
                  {rec.tips.map((tip, idx) => (
                    <Text key={idx} style={styles.tipItem}>• {tip}</Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Watch Out For</Text>
            <Text style={styles.warningText}>• Overtired baby: 3+ hours without sleep</Text>
            <Text style={styles.warningText}>• Underscheduled: Too much time between sleep periods</Text>
            <Text style={styles.warningText}>• Late naps: Avoid naps after 4 PM (may delay bedtime)</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📋 Sleep Readiness Signs</Text>
            <Text style={styles.infoText}>Yawning, rubbing eyes, decreased activity, quietness</Text>
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
  recommendationBox: {
    backgroundColor: '#FCE7F3',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FC7596',
    overflow: 'hidden',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  recTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  recTime: { fontSize: 13, color: '#FC7596', fontWeight: '600', marginTop: 4 },
  expandIcon: { fontSize: 24, color: '#FC7596', fontWeight: 'bold' },
  expandedContent: { paddingHorizontal: 12, paddingBottom: 12 },
  reason: { color: '#6B7280', marginBottom: 10, fontSize: 13 },
  tipsLabel: { fontWeight: '600', color: '#111827', marginBottom: 6, fontSize: 13 },
  tipItem: { color: '#374151', marginBottom: 4, fontSize: 13 },
  warningBox: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginTop: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  warningTitle: { fontWeight: '600', color: '#D97706', marginBottom: 6, fontSize: 13 },
  warningText: { color: '#374151', marginBottom: 4, fontSize: 12 },
  infoBox: { backgroundColor: '#E8F5F0', padding: 12, borderRadius: 8, marginTop: 12 },
  infoTitle: { fontWeight: '600', color: '#10B981', marginBottom: 6, fontSize: 13 },
  infoText: { color: '#374151', fontSize: 13 },
});