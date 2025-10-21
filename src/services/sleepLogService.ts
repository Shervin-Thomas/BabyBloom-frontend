import { supabase } from 'lib/supabase';

export interface SleepLog {
  id?: string;
  user_id?: string;
  log_date: string;
  sleep_time: string;
  wake_time: string;
  duration_hours: number;
  notes?: string;
  created_at?: string;
}

// Add a new sleep log
export const addSleepLog = async (log: SleepLog): Promise<SleepLog | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('sleep_logs')
      .insert([
        {
          user_id: user.id,
          log_date: log.log_date,
          sleep_time: log.sleep_time,
          wake_time: log.wake_time,
          duration_hours: log.duration_hours,
          notes: log.notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding sleep log:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error adding sleep log:', err);
    return null;
  }
};

// Get all sleep logs for the current user
export const getSleepLogs = async (): Promise<SleepLog[]> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return [];
    }

    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Error fetching sleep logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching sleep logs:', err);
    return [];
  }
};

// Get sleep logs for a specific date range
export const getSleepLogsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<SleepLog[]> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return [];
    }

    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Error fetching sleep logs by date range:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching sleep logs by date range:', err);
    return [];
  }
};

// Update a sleep log
export const updateSleepLog = async (id: string, updates: Partial<SleepLog>): Promise<SleepLog | null> => {
  try {
    const { data, error } = await supabase
      .from('sleep_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sleep log:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error updating sleep log:', err);
    return null;
  }
};

// Delete a sleep log
export const deleteSleepLog = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sleep log:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting sleep log:', err);
    return false;
  }
};

// Calculate average sleep duration for a date range
export const getAverageSleepDuration = async (
  startDate: string,
  endDate: string
): Promise<number | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('sleep_logs')
      .select('duration_hours')
      .eq('user_id', user.id)
      .gte('log_date', startDate)
      .lte('log_date', endDate);

    if (error) {
      console.error('Error calculating average sleep duration:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const total = data.reduce((sum, log) => sum + log.duration_hours, 0);
    return total / data.length;
  } catch (err) {
    console.error('Unexpected error calculating average sleep duration:', err);
    return null;
  }
};