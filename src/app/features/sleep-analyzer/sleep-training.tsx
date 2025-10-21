import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';

interface SleepMethod {
  id: string;
  name: string;
  duration: string;
  difficulty: string;
  description: string;
  steps: string[];
  best_for: string;
}

export default function SleepTrainingMethods() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  const methods: SleepMethod[] = [
    {
      id: 'ferber',
      name: 'Ferber Method (Graduated Extinction)',
      duration: '1-2 weeks',
      difficulty: 'Moderate',
      description: 'Gradually increase time before responding to baby\'s cries.',
      steps: [
        'Put baby down drowsy but awake',
        'Wait 3 minutes before responding',
        'Respond with minimal interaction',
        'Gradually increase waiting intervals: 5, 10, 15 minutes',
        'Repeat pattern consistently',
      ],
      best_for: 'Babies 6+ months, parents who prefer gradual approach',
    },
    {
      id: 'cry_it_out',
      name: 'Cry It Out (Extinction)',
      duration: '3-7 days',
      difficulty: 'Hard',
      description: 'Let baby self-soothe without parent intervention.',
      steps: [
        'Establish consistent bedtime routine',
        'Place baby in crib awake',
        'Leave the room without responding to cries',
        'Allow baby to fall asleep independently',
        'Be patient - may take several nights',
      ],
      best_for: 'Babies 6+ months, parents seeking quick results',
    },
    {
      id: 'gentl_extinction',
      name: 'Gentle Extinction (Pick Up/Put Down)',
      duration: '2-4 weeks',
      difficulty: 'Easy to Moderate',
      description: 'Provide comfort through presence and touch without picking up.',
      steps: [
        'Place baby in crib at bedtime',
        'Sit beside crib if baby cries',
        'Provide verbal reassurance and gentle touch',
        'Gradually move further away each night',
        'Eventually leave room while baby is awake',
      ],
      best_for: 'Younger babies, sensitive temperament',
    },
    {
      id: 'chair_method',
      name: 'Chair Method (Camping Out)',
      duration: '2-6 weeks',
      difficulty: 'Easy to Moderate',
      description: 'Slowly reduce parental presence in the room.',
      steps: [
        'Sit in chair next to crib while baby falls asleep',
        'Each week, move chair progressively toward door',
        'Eventually sit outside the room',
        'Finally, leave before baby falls asleep',
        'Maintain consistency throughout',
      ],
      best_for: 'Transitioning co-sleepers, anxious babies',
    },
    {
      id: 'wake_window',
      name: 'Wake Windows Adjustment',
      duration: '1-2 weeks',
      difficulty: 'Easy',
      description: 'Optimize sleep by adjusting time between wake periods.',
      steps: [
        'Track baby\'s natural wake windows',
        'Adjust nap timing based on age-appropriate windows',
        'Increase wake time gradually (15 min increments)',
        'Ensure bedtime aligns with optimal tiredness',
        'Monitor and adjust as baby grows',
      ],
      best_for: 'Irregular sleepers, overtired babies',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <ImageBackground source={require('../../../../assets/images/bg8.jpg')} style={styles.bg} resizeMode="cover">
      <GradientHeader title="Sleep Training Methods" showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Popular Sleep Training Approaches</Text>
          <Text style={styles.helper}>Choose a method that fits your parenting style and baby's temperament.</Text>

          {methods.map(method => (
            <TouchableOpacity 
              key={method.id}
              style={styles.methodBox}
              onPress={() => toggleExpand(method.id)}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{method.duration}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.badgeText, { color: '#DC2626' }]}>{method.difficulty}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.expandIcon}>{expanded === method.id ? '−' : '+'}</Text>
              </View>

              {expanded === method.id && (
                <View style={styles.expandedContent}>
                  <Text style={styles.description}>{method.description}</Text>
                  
                  <Text style={styles.stepsLabel}>Steps:</Text>
                  {method.steps.map((step, idx) => (
                    <Text key={idx} style={styles.step}>{idx + 1}. {step}</Text>
                  ))}

                  <View style={styles.bestForBox}>
                    <Text style={styles.bestForLabel}>Best For:</Text>
                    <Text style={styles.bestForText}>{method.best_for}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Important Notes</Text>
            <Text style={styles.warningText}>• Consult your pediatrician before starting sleep training</Text>
            <Text style={styles.warningText}>• Most methods work best for babies 6+ months</Text>
            <Text style={styles.warningText}>• Consistency is key - pick a method and stick with it</Text>
            <Text style={styles.warningText}>• Results typically take 3-7 days to 2 weeks</Text>
            <Text style={styles.warningText}>• Avoid training during illness, teething, or major transitions</Text>
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
  methodBox: {
    backgroundColor: '#FCE7F3',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FC7596',
    overflow: 'hidden',
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#FBCFE8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#EC0A5E', fontSize: 11, fontWeight: '600' },
  expandIcon: { fontSize: 24, color: '#FC7596', fontWeight: 'bold', marginLeft: 8 },
  expandedContent: { paddingHorizontal: 12, paddingBottom: 12, backgroundColor: 'rgba(252, 231, 243, 0.5)' },
  description: { color: '#6B7280', marginBottom: 12, fontSize: 13, lineHeight: 20 },
  stepsLabel: { fontWeight: '600', color: '#111827', marginBottom: 8, fontSize: 13 },
  step: { color: '#374151', marginBottom: 6, fontSize: 13, lineHeight: 18 },
  bestForBox: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: 10, borderRadius: 6, marginTop: 12 },
  bestForLabel: { fontWeight: '600', color: '#FC7596', marginBottom: 4, fontSize: 12 },
  bestForText: { color: '#374151', fontSize: 12 },
  warningBox: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginTop: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  warningTitle: { fontWeight: '600', color: '#D97706', marginBottom: 8, fontSize: 13 },
  warningText: { color: '#374151', marginBottom: 4, fontSize: 12 },
});