import { supabase } from './supabase';

export interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  user_role: 'user' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  async getOrCreateProfile(userId: string): Promise<Profile | null> {
    // First try to get existing profile
    let profile = await this.getProfile(userId);
    
    if (profile) {
      return profile;
    }

    // If no profile exists, get user info from auth and create profile
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    const user = userData.user;
    const userRole = user.user_metadata?.user_role || 'user';
    
    // Create new profile
    const newProfile = {
      id: userId,
      full_name: user.user_metadata?.full_name || null,
      phone: user.user_metadata?.phone || null,
      date_of_birth: user.user_metadata?.date_of_birth || null,
      user_role: userRole as 'user' | 'admin',
      is_active: true
    };

    const created = await this.createProfile(newProfile);
    if (created) {
      return await this.getProfile(userId);
    }

    return null;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  },

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating profile:', error);
      return false;
    }

    return true;
  }
};
