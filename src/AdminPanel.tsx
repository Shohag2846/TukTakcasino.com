import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/admin/Layout';
import { Dashboard } from './Dashboard';
import { Users } from './Users';
import { Deposits } from './Deposits';
import { Withdraws } from './Withdraws';
import { Transactions } from './Transactions';
import { Games } from './Games';
import { SettingsPage } from './Settings';
import { AdminLogin } from './Login';
import { AdminView } from '../../types/admin';
import { supabase } from '../../lib/supabase';
import { apiFetch } from '../../lib/api';

interface AdminPanelProps {
  user: any;
  onLogout: () => void;
}

export function AdminPanel({ user: initialUser, onLogout }: AdminPanelProps) {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [user, setUser] = useState(initialUser);
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialUser && (initialUser.role === 'admin' || initialUser.role === 'subadmin'));
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync user state with prop
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setIsLoggedIn(initialUser.role === 'admin' || initialUser.role === 'subadmin');
    }
  }, [initialUser]);

  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: email, password: pass }),
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.user.role === 'admin' || data.user.role === 'subadmin') {
          setUser(data.user);
          setIsLoggedIn(true);
          // Save mock session if token is provided
          if (data.session?.access_token === 'mock_token') {
            localStorage.setItem('mock_session', JSON.stringify(data.session));
          }
        } else {
          setLoginError('Access denied. Admin privileges required.');
        }
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('mock_session');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    onLogout();
    window.location.href = '/login';
  };

  if (!isLoggedIn) {
    return (
      <AdminLogin 
        onLogin={handleLogin} 
        error={loginError} 
        isLoading={isLoading} 
      />
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <Users />;
      case 'deposits': return <Deposits />;
      case 'withdraws': return <Withdraws />;
      case 'transactions': return <Transactions />;
      case 'games': return <Games />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      onLogout={handleLogout}
      adminName={user?.username || 'Admin'}
    >
      {renderView()}
    </Layout>
  );
}
