import { Text, View, ScrollView, Image } from 'react-native';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';

export default function TabOneScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GradientHeader 
        title="BabyBloom" 
        subtitle="Your pregnancy journey companion"
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome to BabyBloom</Text>
          <Text style={styles.welcomeSubtext}>
            Track your beautiful journey to motherhood
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>✨ App Features</Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Community</Text>
            <Text style={styles.featureDescription}>
              Connect with other expecting mothers, share experiences, and get support from our caring community.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureTitle}>Profile Dashboard</Text>
            <Text style={styles.featureDescription}>
              Track your pregnancy journey, manage your profile, and view your posts and interactions.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛍️</Text>
            <Text style={styles.featureTitle}>Shop</Text>
            <Text style={styles.featureDescription}>
              Discover pregnancy and baby products curated specifically for your journey.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>AI Assistant</Text>
            <Text style={styles.featureDescription}>
              Get personalized advice and answers to your pregnancy questions from our AI companion.
            </Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Daily Tips</Text>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Stay Hydrated</Text>
            <Text style={styles.tipDescription}>
              Drink plenty of water throughout the day. Aim for 8-10 glasses to support your baby's development.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Gentle Exercise</Text>
            <Text style={styles.tipDescription}>
              Light walking and prenatal yoga can help maintain your health and prepare for delivery.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Healthy Nutrition</Text>
            <Text style={styles.tipDescription}>
              Focus on folate-rich foods, lean proteins, and calcium sources for optimal baby development.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Rest Well</Text>
            <Text style={styles.tipDescription}>
              Get adequate sleep and rest when needed. Your body is working hard to grow your baby.
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 100, // Extra padding at bottom for tab bar
    flexGrow: 1,
  },
  welcomeCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FC7596',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Pacifico-Regular',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 30,
  },
  tipsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FC7596',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});







