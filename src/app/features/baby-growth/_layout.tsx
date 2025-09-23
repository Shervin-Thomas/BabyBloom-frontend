import { Stack } from 'expo-router';

export default function BabyGrowthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="logs" />
      <Stack.Screen name="percentiles" />
      <Stack.Screen name="predictions" />
      <Stack.Screen name="reports" />
    </Stack>
  );
}


