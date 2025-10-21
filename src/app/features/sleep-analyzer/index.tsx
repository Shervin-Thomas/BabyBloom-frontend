import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { useState, useEffect } from 'react';
import GradientHeader from '@/components/GradientHeader';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from 'lib/supabase';

export default function SleepAnalyzerScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoadingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loaded || loadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC7596" />
        <Text style={styles.loadingText}>Loading Sleep Analyzer...</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Sleep Analyzer"
        showBackButton
        onBackPress={() => router.back()}
      />
      {!isAuthenticated && (
        <View style={styles.loginPromptContainer}>
          <Ionicons name="lock-closed" size={50} color="#FC7596" style={styles.lockIcon} />
          <Text style={styles.loginPromptTitle}>Login Required</Text>
          <Text style={styles.loginPromptText}>
            Login to continue with Sleep Analyzer
          </Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.push('/')}
          >
            <Ionicons name="arrow-back" size={18} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.backToHomeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.featureGridWrapper, !isAuthenticated && styles.disabledFeatureGrid]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/sleep-analyzer/sleep-wake-logging')} disabled={!isAuthenticated}>
              <View style={styles.iconWrap}><Ionicons name="moon-outline" size={28} color="#FC7596" /></View>
              <Text style={styles.tileTitle}>Sleep/Wake Log</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/sleep-analyzer/forecasting')} disabled={!isAuthenticated}>
              <View style={styles.iconWrap}><Ionicons name="analytics-outline" size={28} color="#FC7596" /></View>
              <Text style={styles.tileTitle}>Sleep Forecast</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/sleep-analyzer/bedtime-recommendations')} disabled={!isAuthenticated}>
              <View style={styles.iconWrap}><Ionicons name="time-outline" size={28} color="#FC7596" /></View>
              <Text style={styles.tileTitle}>Bedtime Tips</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/sleep-analyzer/white-noise')} disabled={!isAuthenticated}>
              <View style={styles.iconWrap}><Ionicons name="musical-notes-outline" size={28} color="#FC7596" /></View>
              <Text style={styles.tileTitle}>White Noise</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={() => router.push('/features/sleep-analyzer/sleep-training')} disabled={!isAuthenticated}>
              <View style={styles.iconWrap}><Ionicons name="school-outline" size={28} color="#FC7596" /></View>
              <Text style={styles.tileTitle}>Sleep Training</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  featureGridWrapper: {
    flex: 1,
    position: 'relative',
  },
  disabledFeatureGrid: {
    opacity: 0.5,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 20 },
  tile: { width: '48%', backgroundColor: 'white', borderRadius: 16, padding: 18, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 },
  tileTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 8, textAlign: 'center' },
  iconWrap: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#6B7280',
  },
  loginPromptContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  lockIcon: {
    marginBottom: 20,
  },
  loginPromptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  backToHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backToHomeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


