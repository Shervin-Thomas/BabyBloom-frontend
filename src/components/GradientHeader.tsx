import { View, Text, StyleSheet, Platform, StatusBar, Animated, ImageSourcePropType, Pressable } from 'react-native';
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
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function GradientHeader({ title, logoSource, iconName = 'heart', backgroundColor = '#FC7596', showBackButton = false, onBackPress }: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../assets/fonts/Pacifico-Regular.ttf'),
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

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

  }, [fadeAnim, slideAnim, scaleAnim, iconName, logoSource]);

  if (!loaded) {
    return null;
  }

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 6, backgroundColor },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />

      {showBackButton && (
        <Pressable
          onPress={onBackPress}
          accessibilityRole="button"
          style={[styles.backButton, { top: insets.top + 6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>
      )}

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
            paddingHorizontal: showBackButton ? 56 : 16,
          }
        ]}
      >
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 14,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    paddingTop: 10,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    lineHeight: 26,
    flexShrink: 1,
    maxWidth: '80%',
  },
});

