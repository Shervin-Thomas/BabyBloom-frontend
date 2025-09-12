import { Text, View, ScrollView, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useState } from 'react';
import FeatureButton from '@/components/FeatureButton';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

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

  const carouselRef = useRef<ScrollView>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const images = [
    require('../../../assets/images/bg6.png'),
    require('../../../assets/images/bg5.png'),
    require('../../../assets/images/bg7.png'),
  ];
  const carouselDisplayItems = [...images, images[0]]; // Duplicate first image for seamless loop

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prevIndex => {
        const nextIndex = (prevIndex + 1);
        if (nextIndex === carouselDisplayItems.length) {
          carouselRef.current?.scrollTo({ x: 0, animated: false });
          return 0;
        } else {
          carouselRef.current?.scrollTo({ x: nextIndex * (Dimensions.get('window').width), animated: true });
          return nextIndex;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselDisplayItems.length]);

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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            style={styles.carouselContainer}
            pagingEnabled
            ref={carouselRef}
          >
            {carouselDisplayItems.map((image, index) => (
              <Image key={index} source={image} style={styles.carouselImage} />
            ))}
          </ScrollView>

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
  carouselContainer: {
    marginTop: 20,
    height: 150, // Adjust height as needed
  },
  carouselContent: {
    // Removed paddingHorizontal to ensure images fit full screen width
  },
  carouselImage: {
    width: Dimensions.get('window').width,
    height: 140, 
    borderRadius: 10,
    marginHorizontal: 0, // Removed margin to ensure full width fit
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});







