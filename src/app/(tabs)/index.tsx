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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
});







