import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Complete the authentication flow in the browser
WebBrowser.maybeCompleteAuthSession();

export const googleAuthService = {
  async signInWithGoogle() {
    try {
      console.log('🚀 Starting Google sign-in...');

      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
        preferLocalhost: true,
      });
      console.log('📍 Redirect URI:', redirectUri);

      // Use Supabase's built-in OAuth with Expo AuthSession
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
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
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
          console.log('🔄 Browser session result:', result);

          if (result.type === 'success' && result.url) {
            console.log('✅ OAuth completed successfully');
            // The redirect will be handled by Supabase automatically
          }
        } catch (browserError) {
          console.error('❌ Browser error:', browserError);
          throw new Error('Failed to open browser for authentication');
        }
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
