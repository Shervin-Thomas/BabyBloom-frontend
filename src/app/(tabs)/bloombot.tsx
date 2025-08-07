import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '@/components/GradientHeader';

export default function BloomBotTab() {
  return (
    <View style={styles.container}>
      <GradientHeader title="Bloom Bot" />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Placeholder content */}
        <View style={styles.placeholderContainer}>
          <Ionicons name="chatbubble-ellipses" size={80} color="#FC7596" />
          <Text style={styles.placeholderTitle}>Bloom Bot</Text>
          <Text style={styles.placeholderSubtitle}>Your AI pregnancy companion</Text>
          <Text style={styles.placeholderDescription}>
            Coming soon! Bloom Bot will be your personal AI assistant to help answer questions about pregnancy, 
            baby care, and provide personalized guidance throughout your journey.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 120, // Extra padding at bottom for tab bar
  },
  placeholderContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  placeholderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 18,
    color: '#FC7596',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  placeholderDescription: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
});
