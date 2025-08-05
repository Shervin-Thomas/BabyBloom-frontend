import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
}

export default function GradientHeader({ title, subtitle }: GradientHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#FC7596', '#FF9A9E', '#FECFEF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top }]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FC7596" />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
});