import { Text, View, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import GradientHeader from '@/components/GradientHeader';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <GradientHeader 
        title="🌸 BabyBloom" 
        subtitle="Your pregnancy journey companion"
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome to BabyBloom</Text>
          <Text style={styles.welcomeSubtext}>
            Track your beautiful journey to motherhood
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Space for floating tab bar
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FC7596',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});


