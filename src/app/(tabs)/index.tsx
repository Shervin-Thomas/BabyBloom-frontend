import { Text, View, ScrollView, Image, StyleSheet, Pressable, Dimensions, ImageBackground } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useState } from 'react';
import FeatureButton from '@/components/FeatureButton';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useCallback } from 'react';

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

  const intervalIdRef = useRef<number | null>(null);

  const startAutoScroll = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(() => {
      setCarouselIndex(prevIndex => {
        let nextIndex = prevIndex + 1;
        if (nextIndex >= carouselDisplayItems.length) {
          nextIndex = 0; // Reset to the first image logically
        }
        return nextIndex;
      });
    }, 3000);
  }, [carouselDisplayItems.length]); // Re-run if images array changes

  useEffect(() => {
    startAutoScroll(); // Start auto-scroll on component mount

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [startAutoScroll]); // Depend on startAutoScroll to re-run when it changes

  useEffect(() => {
    if (carouselRef.current) {
      const targetX = carouselIndex * Dimensions.get('window').width;
      // Use animated scroll for natural transitions, instant jump for loop reset
      carouselRef.current.scrollTo({ x: targetX, animated: carouselIndex !== 0 });
    }
  }, [carouselIndex]);

  const handleScroll = (event: any) => {
    // Clear auto-scroll when user manually scrolls
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / Dimensions.get('window').width);
    setCarouselIndex(newIndex);

    // Restart auto-scroll after a short delay to allow user interaction to settle
    setTimeout(() => {
      startAutoScroll(); // Restart auto-scroll
    }, 3000); // 3-second delay before auto-scroll resumes
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="BabyBloom"
        logoSource={require('../../../assets/images/logo.png')}
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
              textColor="#FFFFFF"
              iconTintColor="#FFFFFF"
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
            onMomentumScrollEnd={handleScroll} // Add this to detect manual scroll end
          >
            {carouselDisplayItems.map((image, index) => (
              <Image key={index} source={image} style={styles.carouselImage} />
            ))}
          </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {images.map((_, dotIndex) => (
            <Pressable
              key={dotIndex}
              onPress={() => {
                setCarouselIndex(dotIndex);
                // Clear and restart auto-scroll immediately on dot press
                if (intervalIdRef.current) {
                  clearInterval(intervalIdRef.current);
                }
                setTimeout(() => {
                  startAutoScroll(); // Restart auto-scroll
                }, 3000); // Small delay to allow scroll to complete
              }}
              style={[
                styles.paginationDot,
                (carouselIndex === dotIndex || (carouselIndex === carouselDisplayItems.length - 1 && dotIndex === 0))
                  ? styles.paginationDotActive
                  : {},
              ]}
            />
          ))}
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    // padding: 10, // Removed padding to allow carousel to span full width
    alignItems: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10, // Added to maintain horizontal padding after removing from scrollViewContent
    marginTop: 20,
  },
  carouselContainer: {
    marginTop: 20,
    height: 150, // Adjust height as needed
    width: Dimensions.get('window').width, // Set explicit width for correct paging
  },
  carouselContent: {
    // Removed paddingHorizontal to ensure images fit full screen width
  },
  carouselImage: {
    width: Dimensions.get('window').width,
    height: 150,
    borderRadius: 0,
    marginHorizontal: 0, // Removed margin to ensure full width fit
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#FC7596',
  },
});







