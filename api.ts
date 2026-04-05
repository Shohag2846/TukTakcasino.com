import { supabase } from './supabase';
import { getActiveSession } from './auth';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const activeSession = await getActiveSession();
  const token = activeSession?.access_token;
  
  console.log(`apiFetch: ${url}`, token ? (token === 'mock_token' ? 'MOCK TOKEN' : 'REAL TOKEN') : 'NO TOKEN');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { 
      ...options, 
      headers,
      signal: controller.signal
    });
    
    if (res.status === 401) {
      console.warn(`apiFetch: 401 Unauthorized for ${url}`);
      // Only dispatch if it's not the /me endpoint, which is handled separately in fetchUser
      if (!url.includes('/api/auth/me')) {
        window.dispatchEvent(new CustomEvent('auth-unauthorized', { detail: { url } }));
      }
    }
    
    return res;
  } catch (err) {
    console.error(`apiFetch error for ${url}:`, err);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
