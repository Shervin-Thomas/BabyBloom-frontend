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
import { ShopProvider } from '../../contexts/ShopContext';
import { adminService } from '../services/adminService';

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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Show splash for at least 5 seconds for better UX
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 5000));
      
      const { data } = await supabase.auth.getSession();
      const sessionExists = !!data.session;
      setIsLoggedIn(sessionExists);
      setCurrentUserId(data.session?.user?.id || null);

      // Check if user is admin
      if (sessionExists) {
        const adminStatus = await adminService.isCurrentUserAdmin();
        setIsAdmin(adminStatus);
      }

      await minSplashTime;
      setCheckingSession(false);

      supabase.auth.onAuthStateChange(async (_event, session) => {
        const sessionExists = !!session;
        setIsLoggedIn(sessionExists);
        setCurrentUserId(session?.user?.id || null);
        
        if (sessionExists) {
          const adminStatus = await adminService.isCurrentUserAdmin();
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      });
    };

    checkSession();
  }, []);

  if (checkingSession) return <CustomSplashScreen />;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ShopProvider>
        <NotificationWrapper userId={currentUserId || undefined}>
          <Stack screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <Stack.Screen name="admin" />
                ) : (
                  <>
                    <Stack.Screen name="(tabs)" />
                    {/* Feature screens opened from Home buttons (hidden from tab bar) */}
                    <Stack.Screen name="features/baby-growth/index" />
                    <Stack.Screen name="features/mood-companion/index" />
                    <Stack.Screen name="features/sleep-analyzer/index" />
                  </>
                )}
              </>
            ) : (
              <>
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
              </>
            )}
          </Stack>
        </NotificationWrapper>
      </ShopProvider>
    </ThemeProvider>
  );
}


