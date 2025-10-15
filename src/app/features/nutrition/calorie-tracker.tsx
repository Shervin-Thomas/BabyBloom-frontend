import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import GradientHeader from '@/components/GradientHeader';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from 'lib/supabase';

export default function CalorieTrackerScreen() {
  const [loaded] = useFonts({
    'Pacifico-Regular': require('../../../../assets/fonts/Pacifico-Regular.ttf'),
  });

  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<{ id?: string; name: string; calories: number; created_at?: string }[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemCalories, setItemCalories] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [goal, setGoal] = useState<'diet' | 'normal' | 'bulk'>('normal');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activity, setActivity] = useState<'none' | 'moderate' | 'high'>('none');
  const [metabolism, setMetabolism] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodList, setFoodList] = useState<{ name: string; calories: number }[]>([]);
  const [results, setResults] = useState<null | { bmr: number; tdee: number; targetCalories: number; loggedIntake: number; net: number }>(null);

  if (!loaded) {
    return null;
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        await fetchToday(session.user.id);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setItems([]);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        fetchToday(session.user.id);
      } else {
        setCurrentUserId(null);
        setIsAuthenticated(false);
        setItems([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadAgeFromProfile = async () => {
      if (!currentUserId) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('date_of_birth')
        .eq('id', currentUserId)
        .single();
      if (!error && data?.date_of_birth) {
        const dob = new Date(data.date_of_birth);
        if (!isNaN(dob.getTime())) {
          const now = new Date();
          let years = now.getFullYear() - dob.getFullYear();
          const m = now.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
          setAge(years);
        }
      }
    };
    loadAgeFromProfile();
  }, [currentUserId]);

  const todayBounds = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const fetchToday = async (userId: string) => {
    try {
      setLoading(true);
      const { start, end } = todayBounds();
      // Store entries in user_nutrition_logs with meal_input and daily_nutrient_intake
      const { data, error } = await supabase
        .from('user_nutrition_logs')
        .select('id, log_date, meal_input, daily_nutrient_intake, created_at')
        .eq('user_id', userId)
        .gte('log_date', start)
        .lte('log_date', end)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const parsed = (data || []).flatMap((row: any) => {
        // We encode single food item per log via meal_input (name) and daily_nutrient_intake.calories (number)
        const calories = Number(row?.daily_nutrient_intake?.calories ?? 0);
        const name = row?.meal_input || 'Food item';
        return [{ id: row.id, name, calories, created_at: row.created_at }];
      });
      setItems(parsed);
    } catch (e: any) {
      console.warn('Failed fetching today calories:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = useMemo(() => items.reduce((sum, it) => sum + (Number.isFinite(it.calories) ? it.calories : 0), 0), [items]);

  const intakeCalories = useMemo(() => foodList.reduce((sum, f) => sum + (Number.isFinite(f.calories) ? f.calories : 0), 0), [foodList]);

  const addFoodItem = () => {
    const cal = parseFloat(foodCalories);
    if (!foodName.trim() || isNaN(cal) || cal <= 0) {
      Alert.alert('Invalid Input', 'Enter a food name and a positive calorie value.');
      return;
    }
    setFoodList(prev => [{ name: foodName.trim(), calories: cal }, ...prev]);
    setFoodName('');
    setFoodCalories('');
  };

  const removeFoodItem = (idx: number) => {
    setFoodList(prev => prev.filter((_, i) => i !== idx));
  };

  const computeResults = () => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!age || isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      Alert.alert('Missing data', 'Please enter height, weight, and ensure your profile has a valid date of birth.');
      return null;
    }
    // Mifflin-St Jeor (female default): BMR = 10*w + 6.25*h - 5*age - 161
    let bmr = 10 * w + 6.25 * h - 5 * age - 161;
    const activityFactor = activity === 'none' ? 1.2 : activity === 'moderate' ? 1.55 : 1.725;
    let tdee = bmr * activityFactor;
    const goalAdj = goal === 'diet' ? 0.85 : goal === 'bulk' ? 1.15 : 1.0;
    const metaAdj = metabolism === 'slow' ? 0.9 : metabolism === 'fast' ? 1.1 : 1.0;
    const targetCalories = Math.round(tdee * goalAdj * metaAdj);
    const loggedIntake = Math.round(intakeCalories);
    const net = loggedIntake - targetCalories;
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories, loggedIntake, net };
  };

  const generateAndLog = async () => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert('Login Required', 'Please log in to generate your plan.');
      return;
    }
    const res = computeResults();
    if (!res) return;
    setResults(res);
    try {
      setLoading(true);
      const summary = `Goal: ${goal}, Activity: ${activity}, Metabolism: ${metabolism}, H: ${heightCm} cm, W: ${weightKg} kg, Intake: ${res.loggedIntake} kcal, Target: ${res.targetCalories} kcal`;
      const { error } = await supabase
        .from('user_nutrition_logs')
        .insert([{
          user_id: currentUserId,
          log_date: new Date().toISOString(),
          meal_input: summary,
          daily_nutrient_intake: {
            type: 'calorie_assessment',
            age,
            goal,
            height_cm: parseFloat(heightCm),
            weight_kg: parseFloat(weightKg),
            activity,
            metabolism,
            foods: foodList,
            bmr: res.bmr,
            tdee: res.tdee,
            target_calories: res.targetCalories,
            logged_intake: res.loggedIntake,
            net: res.net,
          },
        }]);
      if (error) throw error;
      Alert.alert('Saved', 'Calorie assessment has been logged to your profile.');
    } catch (e: any) {
      console.error('Failed to log assessment:', e?.message || e);
      Alert.alert('Error', 'Failed to save assessment.');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!isAuthenticated || !currentUserId) {
      Alert.alert('Login Required', 'Please log in to add calorie entries.');
      return;
    }
    const cal = parseFloat(itemCalories);
    if (!itemName.trim() || isNaN(cal) || cal <= 0) {
      Alert.alert('Invalid Input', 'Enter a food name and a positive calorie value.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_nutrition_logs')
        .insert([{
          user_id: currentUserId,
          log_date: new Date().toISOString(),
          meal_input: itemName.trim(),
          daily_nutrient_intake: { calories: cal },
        }])
        .select('id, log_date, meal_input, daily_nutrient_intake, created_at')
        .single();
      if (error) throw error;
      setItems(prev => [{ id: data.id, name: data.meal_input, calories: Number(data.daily_nutrient_intake?.calories ?? 0), created_at: data.created_at }, ...prev]);
      setItemName('');
      setItemCalories('');
    } catch (e: any) {
      console.error('Failed to add calorie entry:', e?.message || e);
      Alert.alert('Error', 'Failed to add entry.');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id?: string) => {
    if (!id || !isAuthenticated || !currentUserId) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_nutrition_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId);
      if (error) throw error;
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (e: any) {
      console.error('Failed to delete entry:', e?.message || e);
      Alert.alert('Error', 'Failed to delete entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../../../assets/images/bg8.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <GradientHeader 
        title="Calorie Tracker"
        showBackButton
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today’s Calories</Text>
          {!isAuthenticated && (
            <Text style={styles.muted}>Log in to track your calories.</Text>
          )}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Food name"
              value={itemName}
              onChangeText={setItemName}
              editable={isAuthenticated}
            />
            <TextInput
              style={[styles.input, { width: 110, marginLeft: 8 }]}
              placeholder="Calories"
              keyboardType="numeric"
              value={itemCalories}
              onChangeText={setItemCalories}
              editable={isAuthenticated}
            />
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={addItem} disabled={!isAuthenticated || loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Add</Text>}
          </TouchableOpacity>
          <View style={styles.totalsBox}>
            <Text style={styles.totalText}>Total today: <Text style={{ color: '#FC7596', fontWeight: 'bold' }}>{totalCalories}</Text> kcal</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Details</Text>
          <Text style={styles.muted}>Age: {age ?? 'Unknown (set DOB in Profile)'}</Text>
          <View style={[styles.row, { marginTop: 8 }]}>
            <TouchableOpacity style={[styles.pill, goal === 'diet' && styles.pillActive]} onPress={() => setGoal('diet')}><Text style={[styles.pillText, goal === 'diet' && styles.pillTextActive]}>Diet</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.pill, goal === 'normal' && styles.pillActive]} onPress={() => setGoal('normal')}><Text style={[styles.pillText, goal === 'normal' && styles.pillTextActive]}>Maintain</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.pill, goal === 'bulk' && styles.pillActive]} onPress={() => setGoal('bulk')}><Text style={[styles.pillText, goal === 'bulk' && styles.pillTextActive]}>Bulk</Text></TouchableOpacity>
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Height (cm)" keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="Weight (kg)" keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} />
          </View>
          <View style={[styles.row, { marginTop: 8, flexWrap: 'wrap' }]}>
            <Text style={[styles.muted, { marginRight: 8 }]}>Activity:</Text>
            <TouchableOpacity style={[styles.pill, activity === 'none' && styles.pillActive]} onPress={() => setActivity('none')}><Text style={[styles.pillText, activity === 'none' && styles.pillTextActive]}>No exercise</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.pill, activity === 'moderate' && styles.pillActive]} onPress={() => setActivity('moderate')}><Text style={[styles.pillText, activity === 'moderate' && styles.pillTextActive]}>Moderate</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.pill, activity === 'high' && styles.pillActive]} onPress={() => setActivity('high')}><Text style={[styles.pillText, activity === 'high' && styles.pillTextActive]}>High</Text></TouchableOpacity>
          </View>
          <View style={[styles.row, { marginTop: 8, flexWrap: 'wrap' }]}>
            <Text style={[styles.muted, { marginRight: 8 }]}>Metabolism:</Text>
            <TouchableOpacity style={[styles.pill, metabolism === 'slow' && styles.pillActive]} onPress={() => setMetabolism('slow')}><Text style={[styles.pillText, metabolism === 'slow' && styles.pillTextActive]}>Slow</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.pill, metabolism === 'normal' && styles.pillActive]} onPress={() => setMetabolism('normal')}><Text style={[styles.pillText, metabolism === 'normal' && styles.pillTextActive]}>Normal</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.pill, metabolism === 'fast' && styles.pillActive]} onPress={() => setMetabolism('fast')}><Text style={[styles.pillText, metabolism === 'fast' && styles.pillTextActive]}>Fast</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Intake (accurate)</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Food name" value={foodName} onChangeText={setFoodName} />
            <TextInput style={[styles.input, { width: 110, marginLeft: 8 }]} placeholder="Calories" keyboardType="numeric" value={foodCalories} onChangeText={setFoodCalories} />
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={addFoodItem} disabled={!isAuthenticated}><Text style={styles.primaryBtnText}>Add Food</Text></TouchableOpacity>
          <Text style={[styles.totalText, { marginTop: 8 }]}>Logged intake: <Text style={{ color: '#FC7596', fontWeight: 'bold' }}>{intakeCalories}</Text> kcal</Text>
          {foodList.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {foodList.map((f, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{f.name}</Text>
                    <Text style={styles.itemMeta}>{f.calories} kcal</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFoodItem(idx)}>
                    <Ionicons name="close-circle-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={generateAndLog} disabled={!isAuthenticated || loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Generate & Save</Text>}
          </TouchableOpacity>
          {results && (
            <View style={styles.totalsBox}>
              <Text style={styles.resultLine}>BMR: {results.bmr} kcal</Text>
              <Text style={styles.resultLine}>TDEE: {results.tdee} kcal</Text>
              <Text style={styles.resultLine}>Target Calories: {results.targetCalories} kcal</Text>
              <Text style={styles.resultLine}>Logged Intake: {results.loggedIntake} kcal</Text>
              <Text style={styles.resultLine}>Net: {results.net > 0 ? '+' : ''}{results.net} kcal ({results.net > 0 ? 'surplus' : results.net < 0 ? 'deficit' : 'even'})</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entries</Text>
          {loading ? (
            <ActivityIndicator color="#FC7596" />
          ) : items.length === 0 ? (
            <Text style={styles.muted}>No entries yet today.</Text>
          ) : (
            items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{it.name}</Text>
                  <Text style={styles.itemMeta}>{it.calories} kcal • {new Date(it.created_at || '').toLocaleTimeString()}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteItem(it.id)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // For tab bar space
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FC7596',
    marginBottom: 10,
  },
  muted: { color: '#6B7280' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB' },
  primaryBtn: { marginTop: 12, backgroundColor: '#FC7596', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: 'bold' },
  totalsBox: { marginTop: 12, padding: 12, backgroundColor: '#FFF8F8', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#FC7596' },
  totalText: { color: '#374151', fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE' },
  itemName: { fontWeight: '600', color: '#374151' },
  itemMeta: { color: '#6B7280', marginTop: 2 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  pillActive: { backgroundColor: '#FC7596' },
  pillText: { color: '#374151', fontWeight: '600', fontSize: 12 },
  pillTextActive: { color: 'white' },
  resultLine: { color: '#374151', marginBottom: 4 },
});
