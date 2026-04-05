import { supabase, isSupabaseConfigured } from './supabase';

export type UserRole = 'user' | 'admin' | 'subadmin' | 'game_manager' | 'finance_manager';

export interface UserProfile {
  id: string;
  username: string;
  balance: number;
  role: UserRole;
  email: string;
  full_name?: string;
  phone?: string;
}

export const getSession = async () => {
  if (!isSupabaseConfigured) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const getActiveSession = async () => {
  if (isSupabaseConfigured) {
    try {
      // Use a timeout to prevent hanging if Supabase URL is invalid
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase session timeout')), 3000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      if (result?.data?.session) return result.data.session;
    } catch (e) {
      console.warn('Supabase session check failed or timed out:', e);
    }
  }
  
  const mockSessionStr = typeof window !== 'undefined' ? localStorage.getItem('mock_session') : null;
  if (mockSessionStr) {
    try {
      return JSON.parse(mockSessionStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
  return data as UserProfile;
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Supabase signOut error:', err);
  }
  
  // Clear all auth-related storage
  localStorage.removeItem('mock_session');
  
  // Clear all Supabase-related keys from localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
      localStorage.removeItem(key);
    }
  });
  
  sessionStorage.clear();
  
  // Force a full reload to clear any in-memory state
  window.location.href = '/login';
};
