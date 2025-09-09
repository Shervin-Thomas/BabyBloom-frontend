import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from 'lib/supabase';

export default function NutritionScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
      }
      setLoadingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const nutritionFeatures = [
    { id: '1', title: 'Diet Planner', icon: 'nutrition-outline', route: '/features/nutrition/diet-planner' },
    { id: '2', title: 'Nutrient Deficiency Detection', icon: 'search-outline', route: '/features/nutrition/deficiency-detection' },
    { id: '3', title: 'Calorie Tracker', icon: 'pie-chart-outline', route: '/features/nutrition/calorie-tracker' },
    { id: '4', title: 'Dose Reminder', icon: 'timer-outline', route: '/features/nutrition/dose-reminder' },
  ];

  if (!loaded || loadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC7596" />
        <Text style={styles.loadingText}>Loading Nutrition Features...</Text>
      </View>
    );
  }

  const renderFeatureButton = ({ item }: { item: typeof nutritionFeatures[0] }) => (
    <TouchableOpacity
      style={styles.featureButton}
      onPress={() => router.push(item.route as any)}
      disabled={!isAuthenticated} // Disable button if not authenticated
    >
      <Ionicons name={item.icon as any} size={30} color="#FC7596" />
      <Text style={[styles.featureButtonText, !isAuthenticated && styles.disabledText]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <Text style={styles.headerSubtitle}>Your AI-Powered Health Advisor</Text>
      </View>
      {!isAuthenticated && (
        <View style={styles.loginPromptContainer}>
          <Ionicons name="lock-closed" size={50} color="#FC7596" style={styles.lockIcon} />
          <Text style={styles.loginPromptTitle}>Access Restricted</Text>
          <Text style={styles.loginPromptText}>
            Please log in to access your personalized nutrition features.
          </Text>
        </View>
      )}
      <View style={[styles.featureGridWrapper, !isAuthenticated && styles.disabledFeatureGrid]}>
        <FlatList
          data={nutritionFeatures}
          renderItem={renderFeatureButton}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.featureGrid}
          numColumns={2}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  customHeader: {
    backgroundColor: '#FC7596', // Or any gradient color matching your app's theme
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Pacifico-Regular', // Use your custom font
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  featureGridWrapper: {
    flex: 1,
    position: 'relative',
  },
  disabledFeatureGrid: {
    opacity: 0.5,
  },
  featureGrid: {
    padding: 20,
    justifyContent: 'space-between',
  },
  featureButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 8,
    height: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureButtonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  disabledText: {
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
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
});
