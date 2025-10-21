import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Complete the authentication flow in the browser
WebBrowser.maybeCompleteAuthSession();

export const googleAuthService = {
  async signInWithGoogle() {
    try {
      console.log('🚀 Starting Google sign-in...');

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'babybloomfrontend',
    path: 'auth/callback',
    // Provide explicit native callback for reliability on Android/iOS
    native: 'babybloomfrontend://auth/callback',
  });
      console.log('📍 Redirect URI:', redirectUri);

      // Use Supabase's built-in OAuth with Expo AuthSession
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: false,
        },
      });

      console.log('📊 Supabase OAuth response:', { data, error });

      if (error) {
        console.error('❌ Supabase OAuth error:', error);
        throw error;
      }

      // If we have a URL, try to open it in the browser
      if (data?.url) {
        console.log('🌐 Opening OAuth URL in browser:', data.url);
        try {
          if (Platform.OS === 'web') {
            // On web, navigate directly so the provider can complete the flow
            window.location.href = data.url as unknown as string;
            return { data, error: null };
          }

          // Native: Warm up and open the auth session
          try { await WebBrowser.warmUpAsync(); } catch {}
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri, {
            showInRecents: true,
            preferEphemeralSession: Platform.OS === 'ios',
          });
          console.log('🔄 Browser session result:', result);
          console.log('🔄 Browser session result type:', result.type);
          if (result.type === 'success') {
            console.log('✅ OAuth completed successfully with URL:', result.url);
            // The redirect will be handled by Supabase automatically
          } else if (result.type === 'cancel' || result.type === 'dismiss') {
            console.log('❌ OAuth cancelled/dismissed by user.');
            return { data: null, error: new Error('Google sign-in dismissed by user.') };
          } else {
            console.log('⚠️ Unexpected browser session result type:', (result as any)?.type);
            throw new Error('Unexpected error during Google sign-in.');
          }
        } catch (browserError: any) {
          console.error('❌ Browser error:', browserError);
          // More specific error for failing to open the browser
          throw new Error(`Failed to open browser for authentication: ${browserError?.message || browserError}`);
        } finally {
          try { await WebBrowser.coolDownAsync(); } catch {}
        }
      } else {
        console.error('❌ Supabase did not return a URL for OAuth.');
        throw new Error('Failed to get OAuth URL from Supabase.');
      }

      console.log('✅ Google sign-in initiated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('💥 Google sign-in error:', error);
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
};
