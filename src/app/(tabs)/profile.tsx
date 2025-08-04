import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { supabase } from 'lib/supabase';
import { Session } from '@supabase/supabase-js';
import LoginForm from '@components/login';
import RegisterForm from '@components/register';

export default function ProfileTab() {
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (session) {
    return (
      <View style={styles.container}>
        {/* Profile content */}
      </View>
    );
  }

  // If not logged in, show login or register form
  return (
    <View style={styles.container}>
      {authMode === 'login' ? (
        <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});