import { Text, View, ScrollView, Image, StyleSheet, Pressable } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useState } from 'react';
import FeatureButton from '@/components/FeatureButton';
import { useRouter } from 'expo-router';

export default function TabOneScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();

  const features = [
    { id: '1', icon: require('../../../assets/images/nutrition_icon.png'), title: 'Nutrition', color: '#FC7596', action: () => router.push('/features/nutrition'), size: 'large' },
    // Add more features here following the theme and style of the app
  ];

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GradientHeader 
        title="BabyBloom" 
        subtitle="Your pregnancy journey companion"
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.featureGrid}>
          {features.map(feature => (
            <FeatureButton
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              onPress={feature.action}
              color={feature.color}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  scrollViewContent: {
    padding: 10,
    alignItems: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 20,
  },
});







