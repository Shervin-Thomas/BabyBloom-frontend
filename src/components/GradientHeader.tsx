import { View, Text, StyleSheet, Platform, StatusBar, Animated, Image, ImageSourcePropType } from 'react-native';
import { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

interface GradientHeaderProps {
  title: string;
  subtitle?: string; // kept for backward compatibility (unused visually)
  logoSource?: ImageSourcePropType;
  iconName?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string; // solid background color
}

export default function GradientHeader({ title, logoSource, iconName = 'heart', backgroundColor = '#FC7596' }: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../assets/fonts/Pacifico-Regular.ttf'),
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    if (!logoSource && iconName) {
      Animated.loop(
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [fadeAnim, slideAnim, scaleAnim, iconName, logoSource, iconRotateAnim]);

  if (!loaded) {
    return null;
  }

  const iconRotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 6, backgroundColor },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {logoSource ? (
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        ) : (
          <Animated.View style={[styles.iconContainer, { transform: [{ rotate: iconRotate }] }]}>
            <Ionicons name={iconName} size={24} color="rgba(255, 255, 255, 0.95)" />
          </Animated.View>
        )}

        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 10,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    paddingTop: 6,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    marginRight: 6,
    padding: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'Pacifico-Regular',
    letterSpacing: 0.5,
  },
});

