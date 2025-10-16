import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from 'lib/supabase';
import CustomSplashScreen from '../components/SplashScreen';
import NotificationWrapper from '../components/NotificationWrapper';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    'Quicksand-Bold': require('../../assets/fonts/Quicksand-Bold.ttf'),
    'Quicksand-SemiBold': require('../../assets/fonts/Quicksand-SemiBold.ttf'),
    'Pacifico-Regular': require('../../assets/fonts/Pacifico-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      // Show splash for at least 5 seconds for better UX
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 5000));
      
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setCurrentUserId(data.session?.user?.id || null);

      await minSplashTime;
      setCheckingSession(false);

      supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
        setCurrentUserId(session?.user?.id || null);
      });
    };

    checkSession();
  }, []);

  if (checkingSession) return <CustomSplashScreen />;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotificationWrapper userId={currentUserId || undefined}>
        <Stack screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="(tabs)" />
              {/* Feature screens opened from Home buttons (hidden from tab bar) */}
              <Stack.Screen name="features/baby-growth/index" />
              <Stack.Screen name="features/mood-companion/index" />
              <Stack.Screen name="features/sleep-analyzer/index" />
            </>
          ) : (
            <>
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
            </>
          )}
        </Stack>
      </NotificationWrapper>
    </ThemeProvider>
  );
}


