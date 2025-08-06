import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from 'lib/supabase';
import { profileService, Profile } from 'lib/profile';
import { Session } from '@supabase/supabase-js';
import LoginForm from '@components/login';
import RegisterForm from '@components/register';

export default function ProfileTab() {
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      }
    };
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', !!session);
      setSession(session);
      if (session?.user && session.user.email_confirmed_at) {
        // Only load profile if email is confirmed
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        // If no session or email not confirmed, default to login
        setAuthMode('login');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    setLoading(true);
    try {
      const profileData = await profileService.getProfile(userId);
      if (!profileData) {
        // Profile doesn't exist, create it
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          await createMissingProfile(user);
        }
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const createMissingProfile = async (user: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          date_of_birth: user.user_metadata?.date_of_birth || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!error) {
        const profileData = await profileService.getProfile(user.id);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error creating missing profile:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

  if (session && profile) {
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Text style={styles.title}>Profile</Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{profile.full_name}</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>

          {profile.phone && (
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{profile.phone}</Text>
            </View>
          )}

          {profile.date_of_birth && (
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Date of Birth:</Text>
              <Text style={styles.value}>{new Date(profile.date_of_birth).toLocaleDateString()}</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
  profileContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FC7596',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  value: {
    color: 'white',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  signOutText: {
    color: '#FC7596',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});




