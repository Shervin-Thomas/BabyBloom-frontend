import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import GradientHeader from '@/components/GradientHeader';
import { useRouter } from 'expo-router';
import FeatureButton from '@/components/FeatureButton';
import { useEffect, useState } from 'react';
import { supabase } from 'lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function BabyGrowthScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();

  if (!loaded) return null;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      setLoadingAuth(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const features = [
    { id: '1', title: 'Growth Logs', route: '/features/baby-growth/logs', iconName: 'create-outline' },
    { id: '2', title: 'Percentile\nComparisons', route: '/features/baby-growth/percentiles', iconName: 'stats-chart-outline' },
    { id: '3', title: 'Growth\nPredictions', route: '/features/baby-growth/predictions', iconName: 'trending-up-outline' },
    // Alerts & Reports removed per request
  ];

  const renderFeatureButton = ({ item }: { item: typeof features[0] }) => (
    <TouchableOpacity
      style={styles.featureButton}
      onPress={() => router.push(item.route as any)}
      disabled={!isAuthenticated}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={item.iconName as any} size={30} color="#FC7596" />
      </View>
      <Text style={[styles.featureButtonText, !isAuthenticated && styles.disabledText]} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={require('../../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Baby Growth"
        showBackButton
        onBackPress={() => router.back()}
      />
      <View style={[styles.featureGridWrapper, !isAuthenticated && styles.disabledFeatureGrid]}>
          <FlatList
            data={features}
            renderItem={(props) => {
              const index = props.index;
              const item = props.item;
              const isLastOdd = index === features.length - 1 && features.length % 2 === 1;
              return (
                <TouchableOpacity
                  style={[styles.featureButton, isLastOdd ? styles.centerLast : null]}
                  onPress={() => router.push(item.route as any)}
                  disabled={!isAuthenticated}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={item.iconName as any} size={30} color="#FC7596" />
                  </View>
                  <Text style={[styles.featureButtonText, !isAuthenticated && styles.disabledText]} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.featureGrid}
            numColumns={2}
            columnWrapperStyle={styles.featureRow}
          />
        </View>
        {!isAuthenticated && (
          <View style={styles.loginPromptContainer}>
            <Text style={styles.loginPromptTitle}>Login Required</Text>
            <Text style={styles.loginPromptText}>Login to continue with Baby Growth</Text>
            <TouchableOpacity style={styles.backToHomeButton} onPress={() => router.push('/')}> 
              <Text style={styles.backToHomeButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 18,
    textAlign: 'center',
    color: '#FC7596',
    fontSize: 18,
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  featureGridWrapper: {
    flex: 1,
    position: 'relative',
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
    width: '48%',
    margin: 8,
    height: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureRow: {
    justifyContent: 'space-between'
  },
  centerLast: {
    alignSelf: 'center'
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
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
  disabledFeatureGrid: {
    opacity: 0.5,
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
    alignSelf: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 15,
  },
  backToHomeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


