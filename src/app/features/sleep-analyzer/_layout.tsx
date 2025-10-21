import { Stack } from 'expo-router';

export default function SleepAnalyzerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sleep-wake-logging" />
      <Stack.Screen name="forecasting" />
      <Stack.Screen name="bedtime-recommendations" />
      <Stack.Screen name="white-noise" />
      <Stack.Screen name="sleep-training" />
    </Stack>
  );
}