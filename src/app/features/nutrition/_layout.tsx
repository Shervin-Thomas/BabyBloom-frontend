import { Stack } from 'expo-router';

export default function NutritionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="diet-planner" />
      <Stack.Screen name="deficiency-detection" />
      <Stack.Screen name="calorie-tracker" />
      <Stack.Screen name="dose-reminder" />
    </Stack>
  );
}
