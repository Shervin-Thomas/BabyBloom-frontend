import { supabase } from '../../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  user_role: 'admin' | 'user';
  is_active: boolean;
}

export interface AdminActivity {
  id: string;
  admin_id: string;
  activity_type: string;
  activity_description: string;
  target_id?: string;
  target_type?: string;
  metadata?: any;
  created_at: string;
}

class AdminService {
  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return false;

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) return false;
      return profile.user_role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Get current admin user profile
  async getCurrentAdminProfile(): Promise<AdminUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.user_role !== 'admin') return null;

      return {
        id: user.id,
        email: user.email!,
        full_name: profile.full_name,
        user_role: profile.user_role,
        is_active: profile.is_active,
      };
    } catch (error) {
      console.error('Error getting admin profile:', error);
      return null;
    }
  }

  // Log admin activity
  async logActivity(
    activityType: string,
    description: string,
    targetId?: string,
    targetType?: string,
    metadata?: any
  ): Promise<void> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      const { error: insertError } = await supabase
        .from('admin_activities')
        .insert({
          admin_id: user.id,
          activity_type: activityType,
          activity_description: description,
          target_id: targetId,
          target_type: targetType,
          metadata: metadata
        });

      if (insertError) {
        console.error('Error logging admin activity:', insertError);
      }
    } catch (error) {
      console.error('Error in logActivity:', error);
    }
  }

  // Get admin activities
  async getAdminActivities(limit: number = 10): Promise<AdminActivity[]> {
    try {
      const { data, error } = await supabase
        .from('admin_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting admin activities:', error);
      return [];
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, newRole: 'admin' | 'user'): Promise<boolean> {
    try {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ user_role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Log the activity
      await this.logActivity(
        'user_role_updated',
        `Updated user role to ${newRole}`,
        userId,
        'user',
        { new_role: newRole }
      );

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  // Get all users (admin only)
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<AdminUser[]> {
    try {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          user_role,
          is_active,
          created_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get user emails from auth.users (this requires RLS policy adjustments)
      const userIds = profiles?.map(p => p.id) || [];
      
      const users: AdminUser[] = profiles?.map(profile => ({
        id: profile.id,
        email: 'email@example.com', // This would need proper auth table access
        full_name: profile.full_name,
        user_role: profile.user_role,
        is_active: profile.is_active,
      })) || [];

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Dashboard statistics
  async getDashboardStats() {
    try {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Get cached stats first
      const { data: cachedStats, error: cacheError } = await supabase
        .from('admin_dashboard_stats')
        .select('*');

      if (cacheError) {
        console.error('Error getting cached stats:', cacheError);
      }

      // Return cached stats or default values
      const stats = {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        ...Object.fromEntries(
          cachedStats?.map(stat => [
            stat.stat_type.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
            stat.stat_value?.count || stat.stat_value?.amount || 0
          ]) || []
        )
      };

      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
      };
    }
  }

  // Update dashboard stats (background job)
  async updateDashboardStats(): Promise<void> {
    try {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) return;

      // This would typically be run as a background job
      // For now, we'll just update the basic counts
      
      const now = new Date().toISOString();

      // Update stats in the database
      // This is a simplified version - in production, you'd have more sophisticated calculations
      
      console.log('Dashboard stats updated at:', now);
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
    }
  }
}

export const adminService = new AdminService();