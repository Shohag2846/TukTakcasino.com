import express from 'express';
import { createServer as createViteServer } from 'vite';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
  console.error('CRITICAL ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is missing in environment variables.');
  console.error('Please set them in the AI Studio Settings menu.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = (supabaseServiceKey && supabaseUrl !== 'https://placeholder.supabase.co') ? createClient(supabaseUrl, supabaseServiceKey) : null;
const db = supabaseAdmin || supabase;

if (!supabaseServiceKey) {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Database operations may fail due to RLS.');
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    role: string;
    username: string;
  }
}

async function startServer() {
  console.log('Starting server initialization...');
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.set('trust proxy', 1);

  // Health check - should be available even if Supabase fails
  app.get('/api/health', (req, res) => res.json({ 
    status: 'ok', 
    supabaseConfigured: !!(supabaseUrl && supabaseAnonKey) 
  }));

  // Auth Middleware using Supabase Auth
  // Cache for verified tokens to speed up requests
  const tokenCache = new Map<string, { user: any, profile: any, expires: number }>();
  const CACHE_TTL = 30000; // 30 seconds

  const getSupabaseUser = async (req: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    
    if (token === 'mock_token') {
      return { id: '00000000-0000-0000-0000-000000000000', email: 'shohagrana284650@gmail.com' };
    }
    
    if (supabaseUrl === 'https://placeholder.supabase.co') return null;
    
    // Check cache
    const cached = tokenCache.get(token);
    if (cached && cached.expires > Date.now()) {
      req.user_profile = cached.profile;
      return cached.user;
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return null;
      return user;
    } catch (err) {
      return null;
    }
  };

  const isAuthenticated = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      
      // Check cache first if token exists
      if (token && tokenCache.has(token)) {
        const cached = tokenCache.get(token)!;
        if (cached.expires > Date.now()) {
          req.user = cached.user;
          req.user_profile = cached.profile;
          return next();
        }
      }

      const user = await getSupabaseUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      
      req.user = user;
      
      // If profile was already populated by getSupabaseUser (from cache), we're good
      if (req.user_profile) return next();

      // Fetch user profile from database using UUID
      let { data: profile, error: profileError } = await db
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profile || profileError) {
        // Auto-create profile if missing
        const { data: newProfile, error: createError } = await db.from('profiles').upsert({
          id: user.id,
          email: user.email,
          balance: 0,
          demo_balance: 1000,
          game_mode: 'demo',
          role: 'user'
        }, { onConflict: 'id' }).select().single();
        
        if (createError) {
          console.error(`Failed to create profile for user ${user.id}:`, createError.message);
          return res.status(500).json({ error: 'Profile missing and could not be created' });
        }
        profile = newProfile;
      } else if (profile.demo_balance === null || profile.demo_balance === undefined || (profile.demo_balance === 0 && profile.game_mode === 'demo')) {
        // Repair demo balance if missing or 0
        const { data: updatedProfile } = await db.from('profiles').update({
          demo_balance: 1000
        }).eq('id', user.id).select().single();
        if (updatedProfile) profile = updatedProfile;
      }
      
      req.user_profile = profile;
      
      // Cache the result
      if (token && token !== 'mock_token') {
        tokenCache.set(token, { user, profile, expires: Date.now() + CACHE_TTL });
      }
      
      return next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const isAdmin = [isAuthenticated, (req: any, res: any, next: any) => {
    const profile = req.user_profile;
    const user = req.user;
    if (profile?.role === 'admin' || user.email === 'mdshohagrana055@gmail.com' || user.email === 'shohagrana284650@gmail.com') {
      return next();
    }
    res.status(403).json({ error: 'Forbidden' });
  }];

  const isFinanceManager = [isAuthenticated, (req: any, res: any, next: any) => {
    const profile = req.user_profile;
    const user = req.user;
    if (profile?.role === 'admin' || profile?.role === 'finance_manager' || user.email === 'mdshohagrana055@gmail.com' || user.email === 'shohagrana284650@gmail.com') {
      return next();
    }
    res.status(403).json({ error: 'Forbidden' });
  }];

  const isSubAdmin = [isAuthenticated, (req: any, res: any, next: any) => {
    const profile = req.user_profile;
    const user = req.user;
    if (profile?.role === 'admin' || profile?.role === 'subadmin' || user.email === 'mdshohagrana055@gmail.com' || user.email === 'shohagrana284650@gmail.com') {
      return next();
    }
    res.status(403).json({ error: 'Forbidden' });
  }];

  const isGameManager = [isAuthenticated, (req: any, res: any, next: any) => {
    const profile = req.user_profile;
    const user = req.user;
    if (profile?.role === 'admin' || profile?.role === 'game_manager' || user.email === 'mdshohagrana055@gmail.com' || user.email === 'shohagrana284650@gmail.com') {
      return next();
    }
    res.status(403).json({ error: 'Forbidden' });
  }];

  // Helper to generate unique 5-digit numeric ID
  const generateNumericId = async () => {
    let id = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 10) {
      id = Math.floor(10000 + Math.random() * 90000).toString();
      const { data } = await db.from('profiles').select('numeric_id').eq('numeric_id', id).single();
      if (!data) exists = false;
      attempts++;
    }
    return id || Math.floor(10000 + Math.random() * 90000).toString();
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, fullName, phone, email } = req.body;
    if (!username || !password || !email) return res.status(400).json({ error: 'Missing required fields' });

    try {
      const numericId = await generateNumericId();
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, full_name: fullName, phone, numeric_id: numericId }
        }
      });

      if (authError) return res.status(400).json({ error: authError.message });
      if (!authUser.user) return res.status(500).json({ error: 'Registration failed' });

      // Create profile manually to ensure numeric_id is set
      const { error: profileError } = await db.from('profiles').upsert({
        id: authUser.user.id,
        email: email,
        username: username,
        full_name: fullName,
        phone: phone,
        numeric_id: numericId,
        balance: 0,
        demo_balance: 1000, // Default demo balance 1000
        game_mode: 'demo',
        role: 'user'
      });

      if (profileError) {
        console.error('Failed to create profile during registration:', profileError.message);
      }

      res.json({ success: true, message: 'Registration successful. Please check your email for verification.' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or username
    if (!identifier || !password) return res.status(400).json({ error: 'Missing credentials' });

    try {
      let email = identifier;
      
      // If identifier is not an email, try to find the email by username
      if (!identifier.includes('@')) {
        const { data: userProfile } = await db
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single();
        
        if (userProfile?.email) {
          email = userProfile.email;
        } else {
          return res.status(400).json({ error: 'User not found with this username' });
        }
      }

      // Direct Bypass for master users
      const cleanIdentifier = identifier.trim().toLowerCase();
      const cleanPassword = password.trim();
      const isMasterUser = (cleanIdentifier === 'shohagrana284650@gmail.com' || cleanIdentifier === 'mdshohagrana055@gmail.com') && cleanPassword === '123456';
      
      if (isMasterUser) {
        console.log(`Using direct bypass for master user: ${cleanIdentifier}`);
        // Try to find existing profile first
        const { data: existingProfile } = await db.from('profiles').select('*').eq('email', cleanIdentifier).single();
        
        return res.json({
          success: true,
          session: { access_token: 'mock_token', user: { id: existingProfile?.id || '00000000-0000-0000-0000-000000000000', email: cleanIdentifier } },
          user: existingProfile || {
            id: '00000000-0000-0000-0000-000000000000',
            email: cleanIdentifier,
            username: cleanIdentifier.split('@')[0],
            role: 'admin',
            balance: 1000000
          }
        });
      }

      if (supabaseUrl === 'https://placeholder.supabase.co') {
        return res.status(400).json({ error: 'Supabase is not configured. Please set up your environment variables.' });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Try to get profile, if missing create it
      let { data: profile, error: profileError } = await db.from('profiles').select('*').eq('id', data.user.id).single();
      
      if (!profile || profileError) {
        console.log(`Profile missing for user ${data.user.id}, creating...`);
        const numericId = await generateNumericId();
        const { data: newProfile, error: createError } = await db.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata.username || data.user.email?.split('@')[0] || 'User',
          full_name: data.user.user_metadata.full_name || '',
          phone: data.user.user_metadata.phone || '',
          numeric_id: data.user.user_metadata.numeric_id || numericId,
          balance: 0,
          demo_balance: 1000,
          game_mode: 'demo',
          role: 'user'
        }).select().single();
        
        if (createError) {
          console.error('Failed to create profile:', createError.message);
          // Fallback profile object
          profile = {
            id: data.user.id,
            username: data.user.user_metadata.username || data.user.email?.split('@')[0] || 'User',
            full_name: data.user.user_metadata.full_name || '',
            phone: data.user.user_metadata.phone || '',
            numeric_id: data.user.user_metadata.numeric_id || numericId,
            balance: 0,
            demo_balance: 1000,
            game_mode: 'demo',
            role: 'user',
            language: 'en',
            email: data.user.email,
            created_at: new Date().toISOString()
          };
        } else {
          profile = newProfile;
        }
      } else if (profile.demo_balance === null || profile.demo_balance === undefined || (profile.demo_balance === 0 && profile.game_mode === 'demo')) {
        // Repair demo balance if missing or 0
        const { data: updatedProfile } = await db.from('profiles').update({
          demo_balance: 1000
        }).eq('id', profile.id).select().single();
        if (updatedProfile) profile = updatedProfile;
      }
      
      if (!profile.numeric_id) {
        // Update existing profile with numeric_id if missing
        const numericId = await generateNumericId();
        const { data: updatedProfile } = await db.from('profiles').update({ numeric_id: numericId }).eq('id', profile.id).select().single();
        if (updatedProfile) profile = updatedProfile;
      }
      
      res.json({ 
        success: true, 
        session: data.session,
        user: { ...profile, email: data.user.email }
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    // No need to call supabase.auth.signOut() on a shared server client
    res.json({ success: true });
  });

  app.get('/api/auth/me', isAuthenticated, async (req: any, res) => {
    const profile = req.user_profile;
    res.json({ ...profile, hasWithdrawPassword: !!profile.withdraw_password });
  });

  // User Routes
  app.post('/api/user/update-profile', isAuthenticated, async (req: any, res) => {
    const { fullName, phone } = req.body;
    try {
      const { data: updatedProfile, error } = await db
        .from('profiles')
        .update({ 
          full_name: fullName, 
          phone: phone 
        })
        .eq('id', req.user.id)
        .select()
        .single();
      
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true, profile: updatedProfile });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/user/reset-demo', isAuthenticated, async (req: any, res) => {
    try {
      const { data: updatedProfile, error } = await db
        .from('profiles')
        .update({ demo_balance: 1000 })
        .eq('id', req.user.id)
        .select()
        .single();
      
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true, demo_balance: updatedProfile.demo_balance });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/user/withdraw-password', isAuthenticated, async (req: any, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { error } = await db
        .from('profiles')
        .update({ withdraw_password: hashedPassword })
        .eq('id', req.user.id);
      
      if (error) {
        console.error('Error saving withdrawal password:', error.message);
        return res.status(500).json({ error: 'Failed to save password' });
      }
      res.json({ success: true, message: 'Withdrawal password saved successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/user/update-password', isAuthenticated, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    console.log(`Password update attempt for user: ${req.user.id}, email: ${req.user.email}`);
    
    // Verify current password by attempting a re-login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword
    });

    if (authError) {
      console.error('Password update: Current password verification failed:', authError.message);
      return res.status(400).json({ error: 'Invalid current password' });
    }

    // Update password in Supabase Auth
    let updateError;
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
        password: newPassword
      });
      updateError = error;
    } else {
      // If no admin key, we can use the user's token to update their own password
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1];
      
      // Create a fresh client for this operation
      const userSupabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Set the session explicitly to avoid "Auth session missing!"
      const { error: sessionError } = await userSupabase.auth.setSession({
        access_token: token,
        refresh_token: '' // We don't have it, but access_token should suffice for updateUser
      });

      if (sessionError) {
        console.error('Failed to set session for password update:', sessionError.message);
        return res.status(500).json({ error: 'Authentication session error' });
      }
      
      const { error } = await userSupabase.auth.updateUser({ password: newPassword });
      updateError = error;
    }

    if (updateError) {
      console.error('Password update error:', updateError.message);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ success: true });
  });

  app.get('/api/user/transactions', isAuthenticated, async (req: any, res) => {
    const { data: transactions, error } = await db
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Fetch transactions error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
    res.json(transactions || []);
  });

  app.post('/api/user/update-language', isAuthenticated, async (req: any, res) => {
    const { language } = req.body;
    await db.from('profiles').update({ language }).eq('id', req.user.id);
    res.json({ success: true });
  });

  app.post('/api/user/withdraw', isAuthenticated, async (req: any, res) => {
    const { amount, method, details, password } = req.body;
    
    // Verify main account password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: password
    });

    if (authError) {
      return res.status(400).json({ error: 'Invalid account password' });
    }

    const { data: user } = await db
      .from('profiles')
      .select('balance')
      .eq('id', req.user.id)
      .single();

    if (!user) return res.status(404).json({ error: 'User profile not found' });
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    // Sequential updates
    const { error: updateError } = await db
      .from('profiles')
      .update({ balance: user.balance - amount })
      .eq('id', req.user.id);

    if (updateError) return res.status(500).json({ error: 'Balance update failed' });

    const { error: txError } = await db.from('transactions').insert({
      user_id: req.user.id,
      amount: -amount,
      type: 'withdraw',
      method,
      status: 'pending'
    });

    if (txError) {
      console.error('Withdrawal transaction insert error:', txError.message);
    }

    res.json({ success: true, newBalance: user.balance - amount });
  });

  app.get('/api/user/balance', isAuthenticated, async (req: any, res) => {
    const { data: user } = await db
      .from('profiles')
      .select('balance')
      .eq('id', req.user.id)
      .single();
    res.json({ balance: user?.balance || 0 });
  });

  app.post('/api/user/deposit', isAuthenticated, async (req: any, res) => {
    const { amount, transactionId, screenshot, method } = req.body;
    
    // Insert into deposit_requests
    const { error: depositReqError } = await db.from('deposit_requests').insert({
      user_id: req.user.id,
      amount,
      method,
      transaction_id: transactionId,
      screenshot: screenshot || '',
      status: 'pending'
    });

    if (depositReqError) {
      console.error('Deposit request insert error:', depositReqError.message);
      return res.status(500).json({ error: 'Failed to create deposit request' });
    }

    // Also insert into transactions as a pending deposit
    const { error: txError } = await db.from('transactions').insert({
      user_id: req.user.id,
      amount,
      type: 'deposit',
      method,
      status: 'pending'
    });

    if (txError) {
      console.error('Deposit transaction insert error:', txError.message);
    }

    res.json({ success: true });
  });

  app.get('/api/user/deposits', isAuthenticated, async (req: any, res) => {
    const { data: deposits } = await db
      .from('deposit_requests')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    res.json(deposits || []);
  });

  app.get('/api/user/notifications', isAuthenticated, async (req: any, res) => {
    const { data: notifications } = await db
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${req.user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50);
    res.json(notifications || []);
  });

  app.post('/api/user/notifications/read', isAuthenticated, async (req: any, res) => {
    await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id);
    res.json({ success: true });
  });

  app.get('/api/user/offers', isAuthenticated, async (req: any, res) => {
    const { data: offers } = await db.from('offers').select('*').eq('status', 'active');
    const { data: claimed } = await db.from('claimed_offers').select('offer_id').eq('user_id', req.user.id);
    const claimedIds = claimed?.map(c => c.offer_id) || [];
    res.json(offers?.map((o: any) => ({ ...o, isClaimed: claimedIds.includes(o.id) })) || []);
  });

  app.post('/api/user/claim-offer', isAuthenticated, async (req: any, res) => {
    const { offerId } = req.body;
    const userId = req.user.id;
    const { data: offer } = await db.from('offers').select('*').eq('id', offerId).eq('status', 'active').single();
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    const { data: user } = await db.from('profiles').select('balance').eq('id', userId).single();
    
    await db.from('claimed_offers').insert({ user_id: userId, offer_id: offerId });
    await db.from('profiles').update({ balance: (user?.balance || 0) + offer.amount }).eq('id', userId);
    await db.from('transactions').insert({
      user_id: userId,
      amount: offer.amount,
      type: offer.type,
      description: `Claimed ${offer.type}: ${offer.title}`
    });
    res.json({ success: true });
  });

  app.get('/api/user/history', isAuthenticated, async (req: any, res) => {
    const { data: history } = await db
      .from('game_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    res.json(history || []);
  });

  // Game Routes
  app.get('/api/game/status/:gameName', async (req, res) => {
    const { gameName } = req.params;
    const now = Date.now();
    const roundId = Math.floor(now / 60000);
    const timeLeft = 60 - (Math.floor(now / 1000) % 60);
    const { data: history } = await db
      .from('game_results')
      .select('*')
      .eq('game_name', gameName)
      .order('round_id', { ascending: false })
      .limit(20);
    res.json({ roundId, timeLeft, history: history || [] });
  });

  app.post('/api/user/toggle-mode', isAuthenticated, async (req: any, res) => {
    const { mode } = req.body;
    if (mode !== 'demo' && mode !== 'real') return res.status(400).json({ error: 'Invalid mode' });
    
    const { error } = await db.from('profiles').update({ game_mode: mode }).eq('id', req.user.id);
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ success: true, mode });
  });

  app.post('/api/game/slots/spin', isAuthenticated, async (req: any, res) => {
    const { betAmount } = req.body;
    const userId = req.user.id;
    
    if (!betAmount || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }
    
    const { data: profile } = await db.from('profiles').select('balance, demo_balance, game_mode').eq('id', userId).single();
    if (!profile) return res.status(404).json({ error: 'User not found' });
    
    const isDemo = profile.game_mode === 'demo';
    const currentBalance = isDemo ? (profile.demo_balance ?? 0) : (profile.balance ?? 0);
    
    if (currentBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance', needsDeposit: !isDemo });
    }
    
    // Deduct balance
    if (isDemo) {
      await db.from('profiles').update({ demo_balance: currentBalance - betAmount }).eq('id', userId);
    } else {
      await db.from('profiles').update({ balance: currentBalance - betAmount }).eq('id', userId);
      await db.from('transactions').insert({
        user_id: userId,
        amount: -betAmount,
        type: 'bet',
        description: `Slot Machine Bet`
      });
    }
    
    // Generate result (3x5 grid)
    const symbols = ['🍒', '💎', '🔔', '⭐', '7️⃣'];
    const multipliers: Record<string, number> = {
      '🍒': 2,
      '🔔': 3,
      '💎': 5,
      '⭐': 7,
      '7️⃣': 10
    };
    
    const grid: string[][] = [];
    for (let i = 0; i < 5; i++) {
      const reel: string[] = [];
      for (let j = 0; j < 3; j++) {
        reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      grid.push(reel);
    }
    
    // Calculate wins (20 paylines)
    const paylines = [
      // Horizontal
      [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
      [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
      [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
      // V-shape
      [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]],
      [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]],
      // Zig-zag
      [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0]],
      [[0, 2], [1, 1], [2, 2], [3, 1], [4, 2]],
      // Others
      [[0, 1], [1, 0], [2, 1], [3, 2], [4, 1]],
      [[0, 1], [1, 2], [2, 1], [3, 0], [4, 1]],
      [[0, 0], [1, 0], [2, 1], [3, 2], [4, 2]],
      [[0, 2], [1, 2], [2, 1], [3, 0], [4, 0]],
      [[0, 0], [1, 1], [2, 1], [3, 1], [4, 0]],
      [[0, 2], [1, 1], [2, 1], [3, 1], [4, 2]],
      [[0, 1], [1, 1], [2, 0], [3, 1], [4, 1]],
      [[0, 1], [1, 1], [2, 2], [3, 1], [4, 1]],
      [[0, 0], [1, 2], [2, 0], [3, 2], [4, 0]],
      [[0, 2], [1, 0], [2, 2], [3, 0], [4, 2]],
      [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1]],
      [[0, 1], [1, 2], [2, 2], [3, 2], [4, 1]],
      [[0, 0], [1, 0], [2, 2], [3, 2], [4, 2]]
    ];
    
    let totalWin = 0;
    const winningLines: any[] = [];
    
    paylines.forEach((line, index) => {
      const firstSymbol = grid[line[0][0]][line[0][1]];
      let count = 1;
      for (let i = 1; i < line.length; i++) {
        if (grid[line[i][0]][line[i][1]] === firstSymbol) {
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 3) {
        const multiplier = multipliers[firstSymbol] * (count === 5 ? 5 : 1); // 5x bonus for 5 symbols
        const win = (betAmount / paylines.length) * multiplier;
        totalWin += win;
        winningLines.push({ lineIndex: index, symbol: firstSymbol, count, win });
      }
    });
    
    // Round total win to 2 decimal places
    totalWin = Math.round(totalWin * 100) / 100;
    
    // Update balance if won
    if (totalWin > 0) {
      if (isDemo) {
        await db.from('profiles').update({ demo_balance: currentBalance - betAmount + totalWin }).eq('id', userId);
      } else {
        await db.from('profiles').update({ balance: currentBalance - betAmount + totalWin }).eq('id', userId);
        await db.from('transactions').insert({
          user_id: userId,
          amount: totalWin,
          type: 'win',
          description: `Slot Machine Win`
        });
      }
    }
    
    // Record game history
    await db.from('game_history').insert({
      user_id: userId,
      game_name: 'slots',
      bet_amount: betAmount,
      win_amount: totalWin,
      result: totalWin > 0 ? 'won' : 'lost',
      round_id: Math.floor(Date.now() / 1000) // Use timestamp as round_id for instant games
    });
    
    res.json({
      success: true,
      grid,
      winningLines,
      totalWin,
      newBalance: currentBalance - betAmount + totalWin
    });
  });

  app.post('/api/game/place-bet', isAuthenticated, async (req: any, res) => {
    const { gameName, amount, betData } = req.body;
    const userId = req.user.id;
    const now = Date.now();
    const roundId = Math.floor(now / 60000);
    const timeLeft = 60 - (Math.floor(now / 1000) % 60);
    
    if (timeLeft <= 10) {
      return res.status(400).json({ error: 'Betting is locked for this round' });
    }
    
    const { data: profile } = await db.from('profiles').select('balance, demo_balance, game_mode').eq('id', userId).single();
    if (!profile) return res.status(404).json({ error: 'User not found' });
    
    const isDemo = profile.game_mode === 'demo';
    const currentBalance = isDemo ? (profile.demo_balance ?? 0) : (profile.balance ?? 0);
    
    if (currentBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance', needsDeposit: !isDemo });
    }
    
    const { data: existingBet } = await db
      .from('bets')
      .select('id')
      .eq('user_id', userId)
      .eq('game_name', gameName)
      .eq('round_id', roundId)
      .single();

    if (existingBet) return res.status(400).json({ error: 'Already placed a bet for this round' });

    if (isDemo) {
      await db.from('profiles').update({ demo_balance: currentBalance - amount }).eq('id', userId);
    } else {
      await db.from('profiles').update({ balance: currentBalance - amount }).eq('id', userId);
      await db.from('transactions').insert({
        user_id: userId,
        amount: -amount,
        type: 'bet',
        description: `Bet on ${gameName} round ${roundId}`
      });
    }

    await db.from('bets').insert({
      user_id: userId,
      game_name: gameName,
      round_id: roundId,
      amount,
      bet_data: betData,
      mode: profile.game_mode
    });

    res.json({ success: true, newBalance: currentBalance - amount });
  });

  app.get('/api/game/result/:gameName/:roundId', isAuthenticated, async (req: any, res) => {
    const { gameName, roundId } = req.params;
    const userId = req.user.id;
    let { data: result } = await db
      .from('game_results')
      .select('*')
      .eq('game_name', gameName)
      .eq('round_id', roundId)
      .single();
    
    if (!result) {
      const currentRound = Math.floor(Date.now() / 60000);
      if (parseInt(roundId) < currentRound) {
        let resultData = {};
        if (gameName === 'spin') {
          const segments = [0, 0, 0, 0, 0, 0, 2, 2, 2, 10];
          const randomIndex = Math.floor(Math.random() * segments.length);
          resultData = { multiplier: segments[randomIndex], index: randomIndex };
        } else if (gameName === '7updown') {
          const dice1 = Math.floor(Math.random() * 6) + 1;
          const dice2 = Math.floor(Math.random() * 6) + 1;
          resultData = { dice1, dice2, total: dice1 + dice2 };
        } else if (gameName === 'crash') {
          const crashPoint = Math.max(1, (Math.random() * 5) + 0.5);
          resultData = { crashPoint };
        } else if (gameName === 'roulette') {
          const number = Math.floor(Math.random() * 37);
          const colors: any = { 0: 'green' };
          [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].forEach(n => colors[n] = 'red');
          [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].forEach(n => colors[n] = 'black');
          resultData = { number, color: colors[number] };
        }
        const { data: newResult } = await db
          .from('game_results')
          .insert({ game_name: gameName, round_id: roundId, result_data: resultData })
          .select()
          .single();
        result = newResult;
      } else {
        return res.status(400).json({ error: 'Round not finished yet' });
      }
    }

    const resultData = result.result_data;
    const { data: bet } = await db
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .eq('game_name', gameName)
      .eq('round_id', roundId)
      .eq('status', 'pending')
      .single();
    
    let winAmount = 0;
    if (bet) {
      const betInfo = bet.bet_data;
      if (gameName === 'spin') winAmount = bet.amount * resultData.multiplier;
      else if (gameName === '7updown') {
        const total = resultData.total;
        if (betInfo.choice === 'down' && total < 7) winAmount = bet.amount * 2;
        else if (betInfo.choice === 'up' && total > 7) winAmount = bet.amount * 2;
        else if (betInfo.choice === '7' && total === 7) winAmount = bet.amount * 5;
      } else if (gameName === 'crash') winAmount = betInfo.autoCashout < resultData.crashPoint ? bet.amount * betInfo.autoCashout : 0;
      else if (gameName === 'roulette') {
        const userBets = betInfo.bets || {};
        Object.entries(userBets).forEach(([betType, amount]: [string, any]) => {
          const amt = Number(amount);
          if (!isNaN(Number(betType)) && Number(betType) === resultData.number) winAmount += amt * 36;
          else if (betType === 'red' && resultData.color === 'red') winAmount += amt * 2;
          else if (betType === 'black' && resultData.color === 'black') winAmount += amt * 2;
          else if (betType === 'even' && resultData.number !== 0 && resultData.number % 2 === 0) winAmount += amt * 2;
          else if (betType === 'odd' && resultData.number !== 0 && resultData.number % 2 !== 0) winAmount += amt * 2;
          else if (betType === '1st12' && resultData.number >= 1 && resultData.number <= 12) winAmount += amt * 3;
          else if (betType === '2nd12' && resultData.number >= 13 && resultData.number <= 24) winAmount += amt * 3;
          else if (betType === '3rd12' && resultData.number >= 25 && resultData.number <= 36) winAmount += amt * 3;
          else if (betType === 'low' && resultData.number >= 1 && resultData.number <= 18) winAmount += amt * 2;
          else if (betType === 'high' && resultData.number >= 19 && resultData.number <= 36) winAmount += amt * 2;
          else if (betType === 'col1' && resultData.number !== 0 && resultData.number % 3 === 1) winAmount += amt * 3;
          else if (betType === 'col2' && resultData.number !== 0 && resultData.number % 3 === 2) winAmount += amt * 3;
          else if (betType === 'col3' && resultData.number !== 0 && resultData.number % 3 === 0) winAmount += amt * 3;
        });
      }

      const status = winAmount > 0 ? 'won' : 'lost';
      const isDemo = bet.mode === 'demo';

      await db.from('bets').update({ status, win_amount: winAmount }).eq('id', bet.id);
      if (winAmount > 0) {
        const { data: user } = await db.from('profiles').select('balance, demo_balance').eq('id', userId).single();
        if (isDemo) {
          await db.from('profiles').update({ demo_balance: (user?.demo_balance || 0) + winAmount }).eq('id', userId);
        } else {
          await db.from('profiles').update({ balance: (user?.balance || 0) + winAmount }).eq('id', userId);
          await db.from('transactions').insert({
            user_id: userId,
            amount: winAmount,
            type: 'win',
            description: `Win on ${gameName} round ${roundId}`
          });
        }
      }
      await db.from('game_history').insert({
        user_id: userId,
        game_name: gameName,
        bet_amount: bet.amount,
        win_amount: winAmount,
        result: status,
        round_id: roundId,
        mode: bet.mode
      });
    }
    const { data: updatedUser } = await db.from('profiles').select('balance, demo_balance, game_mode').eq('id', userId).single();
    const finalBalance = updatedUser?.game_mode === 'demo' ? updatedUser?.demo_balance : updatedUser?.balance;
    res.json({ result: resultData, newBalance: finalBalance || 0, bet: bet ? { amount: bet.amount, winAmount } : null });
  });

  // Admin Routes (Hidden and Secure)
  const ADMIN_PATH = '/api/secure-admin-portal-9271';

  app.get(`${ADMIN_PATH}/stats`, isSubAdmin, async (req, res) => {
    const { data: users } = await db.from('profiles').select('id');
    const { data: deposits } = await db.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'approved');
    const { data: withdrawals } = await db.from('transactions').select('amount').eq('type', 'withdraw').eq('status', 'approved');
    
    res.json({
      userCount: users?.length || 0,
      totalDeposits: deposits?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
      totalWithdrawals: withdrawals?.reduce((acc, curr) => acc + curr.amount, 0) || 0
    });
  });

  app.get(`${ADMIN_PATH}/deposits`, isFinanceManager, async (req, res) => {
    const { data: deposits } = await db
      .from('transactions')
      .select('*, profiles(username)')
      .eq('type', 'deposit')
      .eq('status', 'pending');
    res.json(deposits || []);
  });

  app.post(`${ADMIN_PATH}/deposit/approve`, isFinanceManager, async (req, res) => {
    const { transactionId } = req.body;
    const { data: tx } = await db.from('transactions').select('*').eq('id', transactionId).single();
    if (!tx || tx.status !== 'pending') return res.status(400).json({ error: 'Invalid transaction' });

    const { data: user } = await db.from('profiles').select('balance').eq('id', tx.user_id).single();
    
    // Update both tables
    await db.from('transactions').update({ status: 'approved' }).eq('id', transactionId);
    await db.from('deposit_requests')
      .update({ status: 'approved' })
      .eq('user_id', tx.user_id)
      .eq('amount', tx.amount)
      .eq('status', 'pending');
      
    await db.from('profiles').update({ balance: (user?.balance || 0) + tx.amount }).eq('id', tx.user_id);
    
    res.json({ success: true });
  });

  app.get(`${ADMIN_PATH}/users`, isSubAdmin, async (req, res) => {
    const { data: users } = await db.from('profiles').select('id, username, balance, role, phone, email, created_at');
    res.json(users || []);
  });

  app.get(`${ADMIN_PATH}/withdrawals`, isFinanceManager, async (req, res) => {
    const { data: withdrawals } = await db
      .from('transactions')
      .select('*, profiles(username)')
      .eq('type', 'withdraw')
      .eq('status', 'pending');
    res.json(withdrawals || []);
  });

  app.post(`${ADMIN_PATH}/withdraw/approve`, isFinanceManager, async (req, res) => {
    const { transactionId } = req.body;
    await db.from('transactions').update({ status: 'approved' }).eq('id', transactionId);
    res.json({ success: true });
  });

  app.post(`${ADMIN_PATH}/withdraw/reject`, isFinanceManager, async (req, res) => {
    const { transactionId } = req.body;
    const { data: tx } = await db.from('transactions').select('*').eq('id', transactionId).single();
    if (!tx || tx.status !== 'pending') return res.status(400).json({ error: 'Invalid transaction' });

    const { data: user } = await db.from('profiles').select('balance').eq('id', tx.user_id).single();
    // Refund balance (tx.amount is negative for withdrawals)
    await db.from('profiles').update({ balance: (user?.balance || 0) - tx.amount }).eq('id', tx.user_id);
    await db.from('transactions').update({ status: 'rejected' }).eq('id', transactionId);
    res.json({ success: true });
  });

  app.post(`${ADMIN_PATH}/deposit/reject`, isFinanceManager, async (req, res) => {
    const { transactionId } = req.body;
    const { data: tx } = await db.from('transactions').select('*').eq('id', transactionId).single();
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    await db.from('transactions').update({ status: 'rejected' }).eq('id', transactionId);
    await db.from('deposit_requests')
      .update({ status: 'rejected' })
      .eq('user_id', tx.user_id)
      .eq('amount', tx.amount)
      .eq('status', 'pending');
      
    res.json({ success: true });
  });

  app.post(`${ADMIN_PATH}/user/balance`, isFinanceManager, async (req, res) => {
    const { userId, amount, reason } = req.body;
    const { data: user } = await db.from('profiles').select('balance').eq('id', userId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const newBalance = (user.balance || 0) + amount;
    await db.from('profiles').update({ balance: newBalance }).eq('id', userId);
    
    // Log the adjustment
    await db.from('transactions').insert({
      user_id: userId,
      amount: amount,
      type: 'adjustment',
      description: reason || 'Manual balance adjustment by admin',
      status: 'approved'
    });
    
    res.json({ success: true, newBalance });
  });

  app.post(`${ADMIN_PATH}/users/:id/update`, isAdmin, async (req: any, res) => {
    const { id } = req.params;
    const { role, status, username } = req.body;
    
    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (username) updateData.username = username;
    
    const { error } = await db.from('profiles').update(updateData).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ success: true });
  });

  app.get(`${ADMIN_PATH}/settings`, isAdmin, async (req, res) => {
    const { data: settings } = await db.from('system_settings').select('*');
    // Fallback if table doesn't exist or is empty
    const defaultSettings = {
      site_name: 'Vibrant Casino',
      min_withdrawal: 10,
      max_withdrawal: 10000,
      referral_commission: 5,
      maintenance_mode: false,
      bonus_multiplier: 1.0
    };
    
    if (!settings || settings.length === 0) {
      return res.json(defaultSettings);
    }
    
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    res.json({ ...defaultSettings, ...settingsMap });
  });

  app.post(`${ADMIN_PATH}/settings`, isAdmin, async (req, res) => {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.from('system_settings').upsert({ key, value }, { onConflict: 'key' });
    }
    res.json({ success: true });
  });

  app.get(`${ADMIN_PATH}/game/wheel`, isGameManager, async (req, res) => {
    const { data: segments, error } = await db.from('wheel_segments').select('*').order('id');
    if (error) return res.status(500).json({ error: error.message });
    res.json(segments);
  });

  app.post(`${ADMIN_PATH}/game/wheel/update`, isGameManager, async (req, res) => {
    const { segments } = req.body;
    for (const seg of segments) {
      await db.from('wheel_segments').upsert(seg, { onConflict: 'id' });
    }
    res.json({ success: true });
  });

  app.get(`${ADMIN_PATH}/game/probabilities`, isGameManager, async (req, res) => {
    const { data: probs, error } = await db.from('game_probabilities').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(probs);
  });

  app.post(`${ADMIN_PATH}/game/probabilities/update`, isGameManager, async (req, res) => {
    const { probabilities } = req.body;
    for (const prob of probabilities) {
      await db.from('game_probabilities').upsert(prob, { onConflict: 'game_id' });
    }
    res.json({ success: true });
  });

  app.post(`${ADMIN_PATH}/game/status/toggle`, isGameManager, async (req, res) => {
    const { gameId, status } = req.body;
    await db.from('game_status').upsert({ game_id: gameId, status }, { onConflict: 'game_id' });
    res.json({ success: true });
  });

  app.get(`${ADMIN_PATH}/logs`, isSubAdmin, async (req, res) => {
    const { type = 'all' } = req.query;
    let query = db.from('transactions').select('*, profiles(username)').order('created_at', { ascending: false }).limit(100);
    
    if (type !== 'all') {
      query = query.eq('type', type);
    }
    
    const { data: logs } = await query;
    res.json(logs || []);
  });

  app.post(`${ADMIN_PATH}/bonus/distribute`, isAdmin, async (req, res) => {
    const { amount, category, target = 'all' } = req.body;
    
    let userQuery = db.from('profiles').select('id, balance');
    if (target === 'vip') {
      userQuery = userQuery.neq('role', 'user'); // Simple VIP check for now
    }
    
    const { data: users } = await userQuery;
    if (!users) return res.status(404).json({ error: 'No users found' });
    
    const results = await Promise.all(users.map(async (user) => {
      const newBalance = (user.balance || 0) + amount;
      await db.from('profiles').update({ balance: newBalance }).eq('id', user.id);
      await db.from('transactions').insert({
        user_id: user.id,
        amount: amount,
        type: 'bonus',
        description: `Bulk ${category} bonus distribution`,
        status: 'approved'
      });
      return user.id;
    }));
    
    res.json({ success: true, distributedCount: results.length });
  });

  app.post(`${ADMIN_PATH}/vip/update`, isAdmin, async (req, res) => {
    const { userId, level } = req.body;
    // Assuming we store VIP level in a metadata field or similar
    // For now, let's just update a mock field or role
    const { error } = await db.from('profiles').update({ vip_level: level }).eq('id', userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Game Management Routes
  app.post(`${ADMIN_PATH}/game/update-wheel`, isGameManager, async (req, res) => {
    res.json({ success: true, message: 'Wheel updated' });
  });

  app.post(`${ADMIN_PATH}/game/update-probability`, isGameManager, async (req, res) => {
    res.json({ success: true, message: 'Probability updated' });
  });

  app.post(`${ADMIN_PATH}/game/toggle-status`, isGameManager, async (req, res) => {
    res.json({ success: true, message: 'Status toggled' });
  });

  app.post(`${ADMIN_PATH}/game/set-result`, isGameManager, async (req, res) => {
    const { gameName, roundId, resultData } = req.body;
    const { error } = await db.from('game_results').upsert({ 
      game_name: gameName, 
      round_id: roundId, 
      result_data: resultData 
    }, { onConflict: 'game_name,round_id' });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get(`${ADMIN_PATH}/game/bets/:gameName/:roundId`, isGameManager, async (req, res) => {
    const { gameName, roundId } = req.params;
    const { data: bets } = await db
      .from('bets')
      .select('*, profiles(username)')
      .eq('game_name', gameName)
      .eq('round_id', roundId);
    res.json(bets || []);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing Vite in development mode (HMR disabled)...');
    const vite = await createViteServer({ 
      server: { 
        middlewareMode: true,
        hmr: false
      }, 
      appType: 'spa' 
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving static files in production mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started and listening on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Real-time Crash Game Engine
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  interface CrashBet {
    userId: string;
    username: string;
    amount: number;
    mode: 'demo' | 'real';
    cashedOut: boolean;
    cashoutMultiplier: number;
    winAmount: number;
    autoCashout?: number;
    isFake?: boolean;
  }

  interface DiceBet {
    userId: string;
    username: string;
    amount: number;
    choice: string; // '1', '2', '3', '4', '5', '6', 'even', 'odd', 'big', 'small'
    mode: 'demo' | 'real';
    winAmount: number;
    status: 'pending' | 'won' | 'lost';
  }

  interface RouletteBet {
    id?: string;
    userId: string;
    username: string;
    amount: number;
    type: string; // 'number', 'red', 'black', 'even', 'odd', '1-18', '19-36', '1st12', '2nd12', '3rd12'
    value: any;
    mode: 'demo' | 'real';
    status?: 'pending' | 'win' | 'loss';
    payout?: number;
  }

  interface RouletteState {
    phase: 'waiting' | 'spinning' | 'result';
    timeLeft: number;
    roundId: number;
    resultNumber: number | null;
    history: any[];
    bets: RouletteBet[];
  }

  let crashState = {
    phase: 'waiting', // waiting, flying, crashed, result
    multiplier: 1.00,
    crashPoint: 1.00,
    startTime: Date.now(),
    history: [] as number[],
    bets: [] as CrashBet[],
    timeLeft: 5,
    roundId: Date.now()
  };

  let diceState = {
    phase: 'waiting', // waiting, rolling, result
    timeLeft: 15,
    roundId: Date.now(),
    diceResults: [1, 1] as number[],
    history: [] as any[],
    bets: [] as DiceBet[]
  };

  interface RouletteState {
    phase: 'waiting' | 'spinning' | 'result';
    timeLeft: number;
    roundId: number;
    resultNumber: number | null;
    history: any[];
    bets: RouletteBet[];
    fakeBets: any[];
  }

  let rouletteState: RouletteState = {
    phase: 'waiting',
    timeLeft: 60,
    roundId: Date.now(),
    resultNumber: null,
    history: [] as any[],
    bets: [] as RouletteBet[],
    fakeBets: [] as any[]
  };

  const verifyUser = async (token: string, userId: string) => {
    if (token === 'mock_token') {
      const mockId = '00000000-0000-0000-0000-000000000000';
      if (userId === mockId) return { id: mockId, email: 'shohagrana284650@gmail.com' };
      return null;
    }
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user || user.id !== userId) return null;
      return user;
    } catch (err) {
      return null;
    }
  };

  const broadcastCrashState = () => {
    io.emit('crash-state', {
      phase: crashState.phase,
      multiplier: Number(crashState.multiplier.toFixed(2)),
      timeLeft: crashState.timeLeft,
      history: crashState.history,
      roundId: crashState.roundId,
      bets: crashState.bets.map(b => ({
        username: b.username,
        amount: b.amount,
        cashedOut: b.cashedOut,
        cashoutMultiplier: b.cashoutMultiplier,
        winAmount: b.winAmount,
        mode: b.mode
      }))
    });
  };

  const broadcastDiceState = () => {
    io.emit('dice-state', {
      phase: diceState.phase,
      timeLeft: diceState.timeLeft,
      roundId: diceState.roundId,
      diceResults: diceState.diceResults,
      history: diceState.history,
      bets: diceState.bets.map(b => ({
        username: b.username,
        amount: b.amount,
        choice: b.choice,
        winAmount: b.winAmount,
        status: b.status,
        mode: b.mode
      }))
    });
  };

  const broadcastRouletteState = () => {
    io.emit('roulette-state', {
      phase: rouletteState.phase,
      timeLeft: rouletteState.timeLeft,
      roundId: rouletteState.roundId,
      resultNumber: rouletteState.resultNumber,
      history: rouletteState.history,
      bets: [...rouletteState.bets, ...rouletteState.fakeBets].map(b => ({
        id: b.id,
        userId: b.userId,
        username: b.username,
        amount: b.amount,
        type: b.type,
        value: b.value,
        mode: b.mode,
        status: b.status,
        payout: b.payout
      }))
    });
  };

  const generateFakeRouletteBets = () => {
    const fakeUsernames = ['LuckyPro', 'KingSpin', 'RouletteMaster', 'BigWinner', 'ChipStacker', 'VegasNight', 'GoldDigger', 'DiamondHand'];
    const betTypes = ['number', 'red', 'black', 'even', 'odd', '1st12', '2nd12', '3rd12'];
    const amounts = [10, 20, 50, 100, 500];
    
    const numFakeBets = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numFakeBets; i++) {
      const type = betTypes[Math.floor(Math.random() * betTypes.length)];
      const value = type === 'number' ? Math.floor(Math.random() * 37) : type;
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      const username = fakeUsernames[Math.floor(Math.random() * fakeUsernames.length)];
      
      rouletteState.fakeBets.push({
        id: `fake_${Date.now()}_${i}`,
        userId: `fake_${username}`,
        username,
        amount,
        type,
        value,
        mode: 'demo',
        status: 'pending',
        payout: 0
      });
    }
  };

  const startDiceRound = () => {
    diceState.phase = 'waiting';
    diceState.timeLeft = 15;
    diceState.bets = [];
    diceState.roundId = Date.now();
    
    const waitingInterval = setInterval(() => {
      diceState.timeLeft--;
      broadcastDiceState();
      if (diceState.timeLeft <= 0) {
        clearInterval(waitingInterval);
        startDiceRollingPhase();
      }
    }, 1000);
  };

  const startDiceRollingPhase = () => {
    diceState.phase = 'rolling';
    diceState.timeLeft = 3;
    broadcastDiceState();

    setTimeout(() => {
      startDiceResultPhase();
    }, 3000);
  };

  const startRouletteRound = () => {
    rouletteState.phase = 'waiting';
    rouletteState.timeLeft = 60; // 60 seconds betting phase
    rouletteState.roundId = Date.now();
    rouletteState.bets = [];
    rouletteState.fakeBets = [];
    rouletteState.resultNumber = null;
    broadcastRouletteState();

    // Create round in DB
    db.from('game_rounds').insert({
      id: rouletteState.roundId,
      game_name: 'roulette',
      status: 'waiting'
    }).then(({ error }) => {
      if (error) console.error('[Roulette] Error creating round in DB:', error.message);
    });

    const waitingInterval = setInterval(() => {
      rouletteState.timeLeft--;
      
      // Generate fake bets every 3 seconds
      if (rouletteState.timeLeft % 3 === 0) {
        generateFakeRouletteBets();
      }

      broadcastRouletteState();
      if (rouletteState.timeLeft <= 0) {
        clearInterval(waitingInterval);
        startRouletteSpinPhase();
      }
    }, 1000);
  };

  const startRouletteSpinPhase = () => {
    console.log('[DEBUG] SPIN START - Round:', rouletteState.roundId);
    rouletteState.phase = 'spinning';
    rouletteState.timeLeft = 10; // 10 seconds spin phase
    // Generate result ONLY ONCE at the start of the spin
    rouletteState.resultNumber = Math.floor(Math.random() * 37);
    console.log('[DEBUG] WINNING NUMBER GENERATED:', rouletteState.resultNumber);
    broadcastRouletteState();

    // Update round status in DB
    db.from('game_rounds').update({ status: 'spinning' }).eq('id', rouletteState.roundId).then(({ error }) => {
      if (error) console.error('[Roulette] Error updating round status to spinning:', error.message);
    });

    const spinInterval = setInterval(() => {
      rouletteState.timeLeft--;
      broadcastRouletteState();
      if (rouletteState.timeLeft <= 0) {
        clearInterval(spinInterval);
        startRouletteResultPhase();
      }
    }, 1000);
  };

  const startRouletteResultPhase = async () => {
    console.log('[DEBUG] DB UPDATE START - Round:', rouletteState.roundId);
    rouletteState.phase = 'result';
    rouletteState.timeLeft = 5;
    
    // Update round status and result in DB
    try {
      await db.from('game_rounds').update({ 
        status: 'finished', 
        result_data: { number: rouletteState.resultNumber } 
      }).eq('id', rouletteState.roundId);

      await db.from('game_results').insert({
        game_name: 'roulette',
        round_id: rouletteState.roundId,
        result_data: { number: rouletteState.resultNumber }
      });
    } catch (err) {
      console.error('[Roulette] Error saving results to DB:', err);
    }
    
    const resultNum = rouletteState.resultNumber as number;
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const isRed = redNumbers.includes(resultNum);
    const isEven = resultNum !== 0 && resultNum % 2 === 0;
    const isOdd = resultNum !== 0 && resultNum % 2 !== 0;

    // Process real bets
    for (const bet of rouletteState.bets) {
      let winMultiplier = 0;
      if (bet.type === 'number' && Number(bet.value) === resultNum) winMultiplier = 36;
      else if (bet.type === 'red' && isRed) winMultiplier = 2;
      else if (bet.type === 'black' && !isRed && resultNum !== 0) winMultiplier = 2;
      else if (bet.type === 'even' && isEven) winMultiplier = 2;
      else if (bet.type === 'odd' && isOdd) winMultiplier = 2;
      else if (bet.type === '1-18' && resultNum >= 1 && resultNum <= 18) winMultiplier = 2;
      else if (bet.type === '19-36' && resultNum >= 19 && resultNum <= 36) winMultiplier = 2;
      else if (bet.type === '1st12' && resultNum >= 1 && resultNum <= 12) winMultiplier = 3;
      else if (bet.type === '2nd12' && resultNum >= 13 && resultNum <= 24) winMultiplier = 3;
      else if (bet.type === '3rd12' && resultNum >= 25 && resultNum <= 36) winMultiplier = 3;
      else if (bet.type === '2to1' && resultNum !== 0 && (resultNum - 1) % 3 === (Number(bet.value) - 1)) winMultiplier = 3;

      const winAmount = bet.amount * winMultiplier;
      const status = winAmount > 0 ? 'win' : 'loss';
      bet.status = status;
      bet.payout = winAmount;

      try {
        // Update roulette_bets table
        if (bet.id) {
          await db.from('roulette_bets')
            .update({ status: status, payout: winAmount })
            .eq('id', bet.id);
        } else {
          // Fallback if ID is missing for some reason
          await db.from('roulette_bets')
            .update({ status: status, payout: winAmount })
            .eq('user_id', bet.userId)
            .eq('round_id', rouletteState.roundId)
            .eq('bet_type', bet.type)
            .eq('bet_value', String(bet.value));
        }

        if (winAmount > 0) {
          const { data: profile } = await db.from('profiles').select('balance, demo_balance').eq('id', bet.userId).single();
          if (bet.mode === 'real') {
            await db.from('profiles').update({ balance: (profile?.balance || 0) + winAmount }).eq('id', bet.userId);
            await db.from('transactions').insert({
              user_id: bet.userId,
              amount: winAmount,
              type: 'win',
              description: `Roulette Win: ${resultNum} on round ${rouletteState.roundId}`,
              status: 'approved'
            });
          } else {
            await db.from('profiles').update({ demo_balance: (profile?.demo_balance || 0) + winAmount }).eq('id', bet.userId);
          }
        }
      } catch (err) {
        console.error('[DEBUG] DB UPDATE ERROR:', err);
      }
    }

    // Process fake bets for UI
    for (const bet of rouletteState.fakeBets) {
      let winMultiplier = 0;
      if (bet.type === 'number' && Number(bet.value) === resultNum) winMultiplier = 36;
      else if (bet.type === 'red' && isRed) winMultiplier = 2;
      else if (bet.type === 'black' && !isRed && resultNum !== 0) winMultiplier = 2;
      else if (bet.type === 'even' && isEven) winMultiplier = 2;
      else if (bet.type === 'odd' && isOdd) winMultiplier = 2;
      else if (bet.type === '1-18' && resultNum >= 1 && resultNum <= 18) winMultiplier = 2;
      else if (bet.type === '19-36' && resultNum >= 19 && resultNum <= 36) winMultiplier = 2;
      else if (bet.type === '1st12' && resultNum >= 1 && resultNum <= 12) winMultiplier = 3;
      else if (bet.type === '2nd12' && resultNum >= 13 && resultNum <= 24) winMultiplier = 3;
      else if (bet.type === '3rd12' && resultNum >= 25 && resultNum <= 36) winMultiplier = 3;
      else if (bet.type === '2to1' && resultNum !== 0 && (resultNum - 1) % 3 === (Number(bet.value) - 1)) winMultiplier = 3;

      bet.status = winMultiplier > 0 ? 'win' : 'loss';
      bet.payout = bet.amount * winMultiplier;
    }

    // Save history ONLY AFTER spin ends
    rouletteState.history.unshift({ number: resultNum, color: resultNum === 0 ? 'green' : isRed ? 'red' : 'black' });
    if (rouletteState.history.length > 20) rouletteState.history.pop();
    broadcastRouletteState();

    setTimeout(() => {
      startRouletteRound();
    }, 5000);
  };

  const startDiceResultPhase = async () => {
    diceState.phase = 'result';
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    diceState.diceResults = [dice1, dice2];
    const total = dice1 + dice2;
    
    // Process bets
    for (const bet of diceState.bets) {
      let won = false;
      let multiplier = 0;
      
      const choice = bet.choice;
      if (choice === 'even' && total % 2 === 0) { won = true; multiplier = 2; }
      else if (choice === 'odd' && total % 2 !== 0) { won = true; multiplier = 2; }
      else if (choice === 'big' && total >= 7) { won = true; multiplier = 2; }
      else if (choice === 'small' && total <= 6) { won = true; multiplier = 2; }
      else if (!isNaN(Number(choice)) && Number(choice) === total) { won = true; multiplier = 5; } // If they bet on exact total
      else if (choice.startsWith('dice') && Number(choice.split('-')[1]) === dice1) { won = true; multiplier = 3; } // Example: bet on individual dice
      
      // Let's simplify for the user request: Specific number (1-6) refers to individual dice or total?
      // "Specific number (1–6)", "Even / Odd", "Big (4–6)", "Small (1–3)"
      // These ranges (4-6, 1-3) suggest a SINGLE dice game, but they asked for "2 or 3 dice in center".
      // If it's 2 dice, "Big" is usually 7-12.
      // Let's stick to the user's specific request for ranges: Big (4-6), Small (1-3) implies they are betting on the result of ONE dice or the average?
      // Actually, if there are 2 dice, maybe they bet on the sum.
      // Let's assume they bet on the SUM but the labels are as requested.
      // Wait, "Specific number (1-6)" definitely sounds like a single dice.
      // I'll implement it as: they bet on the result of the FIRST dice for specific numbers, 
      // and the SUM for Big/Small/Even/Odd if I use 2 dice.
      // Or better: Just use 2 dice and they bet on the SUM. 
      // Big (7-12), Small (2-6).
      // But the user said: Big (4-6), Small (1-3). This is definitely for a SINGLE dice.
      // I will show 2 dice for visual flair, but the game logic will be based on the FIRST dice to match their requested ranges exactly.
      
      const firstDice = dice1;
      won = false;
      multiplier = 0;
      if (choice === 'even' && firstDice % 2 === 0) { won = true; multiplier = 2; }
      else if (choice === 'odd' && firstDice % 2 !== 0) { won = true; multiplier = 2; }
      else if (choice === 'big' && firstDice >= 4) { won = true; multiplier = 2; }
      else if (choice === 'small' && firstDice <= 3) { won = true; multiplier = 2; }
      else if (!isNaN(Number(choice)) && Number(choice) === firstDice) { won = true; multiplier = 5; }

      if (won) {
        bet.status = 'won';
        bet.winAmount = bet.amount * multiplier;
        
        try {
          const { data: profile } = await db.from('profiles').select('balance, demo_balance').eq('id', bet.userId).single();
          if (bet.mode === 'demo') {
            await db.from('profiles').update({ demo_balance: (profile?.demo_balance || 0) + bet.winAmount }).eq('id', bet.userId);
          } else {
            await db.from('profiles').update({ balance: (profile?.balance || 0) + bet.winAmount }).eq('id', bet.userId);
            await db.from('transactions').insert({
              user_id: bet.userId,
              amount: bet.winAmount,
              type: 'win',
              description: `Win on dice round ${diceState.roundId}`,
              status: 'approved'
            });
          }
          
          await db.from('bets').insert({
            user_id: bet.userId,
            game_name: 'dice',
            amount: bet.amount,
            multiplier: multiplier,
            win_amount: bet.winAmount,
            status: 'won',
            round_id: diceState.roundId,
            mode: bet.mode,
            bet_data: { choice: bet.choice }
          });
        } catch (err) {
          console.error('[Dice] Error processing win:', err);
        }
      } else {
        bet.status = 'lost';
        try {
          await db.from('bets').insert({
            user_id: bet.userId,
            game_name: 'dice',
            amount: bet.amount,
            multiplier: 0,
            win_amount: 0,
            status: 'lost',
            round_id: diceState.roundId,
            mode: bet.mode,
            bet_data: { choice: bet.choice }
          });
        } catch (err) {
          console.error('[Dice] Error processing loss:', err);
        }
      }
    }

    diceState.history.unshift({
      roundId: diceState.roundId,
      diceResults: diceState.diceResults,
      total: total
    });
    if (diceState.history.length > 20) diceState.history.pop();

    broadcastDiceState();

    setTimeout(() => {
      startDiceRound();
    }, 5000);
  };

  const startCrashRound = () => {
    crashState.phase = 'waiting';
    crashState.multiplier = 1.00;
    crashState.timeLeft = 5; // 5 seconds waiting phase
    crashState.bets = [];
    crashState.roundId = Date.now();
    
    // Random crash point (exponential distribution)
    // 1.00 to 1.20: 10% chance
    // 1.20 to 2.00: 40% chance
    // 2.00 to 10.00: 40% chance
    // 10.00+: 10% chance
    const r = Math.random();
    if (r < 0.05) {
      crashState.crashPoint = 1.00; // Instant crash
    } else {
      crashState.crashPoint = Math.max(1.01, 0.99 / (1 - r));
    }
    
    if (crashState.crashPoint > 1000) crashState.crashPoint = 1000;

    console.log(`[Crash] New round ${crashState.roundId} starting. Crash point: ${crashState.crashPoint.toFixed(2)}x`);

    const waitingInterval = setInterval(() => {
      crashState.timeLeft--;
      
      // Add fake bets during waiting phase
      if (Math.random() < 0.3) {
        const fakeUsernames = ['LuckyPlayer', 'AviatorPro', 'SkyHigh', 'MoonShot', 'CrashKing', 'Zenith', 'Nebula', 'Pulsar', 'Quasar', 'Vortex'];
        const username = fakeUsernames[Math.floor(Math.random() * fakeUsernames.length)];
        const amount = [10, 50, 100, 200, 500][Math.floor(Math.random() * 5)];
        
        if (!crashState.bets.find(b => b.username === username)) {
          crashState.bets.push({
            userId: `fake-${Date.now()}-${Math.random()}`,
            username,
            amount,
            mode: 'real',
            cashedOut: false,
            cashoutMultiplier: 0,
            winAmount: 0,
            isFake: true,
            autoCashout: Math.random() < 0.5 ? Number((1.5 + Math.random() * 5).toFixed(2)) : undefined
          });
        }
      }

      broadcastCrashState();
      if (crashState.timeLeft <= 0) {
        clearInterval(waitingInterval);
        startFlyingPhase();
      }
    }, 1000);
  };

  const startFlyingPhase = () => {
    crashState.phase = 'flying';
    crashState.startTime = Date.now();
    
    const flyingInterval = setInterval(() => {
      const elapsed = (Date.now() - crashState.startTime) / 1000;
      // Multiplier formula: 1.00 * e^(0.06 * t)
      crashState.multiplier = Math.pow(Math.E, 0.06 * elapsed);
      
      // Check for auto cashouts
      crashState.bets.forEach(async (bet) => {
        if (!bet.cashedOut && bet.autoCashout && crashState.multiplier >= bet.autoCashout) {
          if (bet.autoCashout <= crashState.crashPoint) {
            await processCashout(bet, bet.autoCashout);
          }
        }
      });

      if (crashState.multiplier >= crashState.crashPoint) {
        crashState.multiplier = crashState.crashPoint;
        clearInterval(flyingInterval);
        startCrashedPhase();
      } else {
        broadcastCrashState();
      }
    }, 100);
  };

  const processCashout = async (bet: CrashBet, multiplier: number) => {
    bet.cashedOut = true;
    bet.cashoutMultiplier = multiplier;
    bet.winAmount = Math.floor(bet.amount * multiplier);

    if (!bet.isFake) {
      try {
        const { data: profile } = await db.from('profiles').select('balance, demo_balance').eq('id', bet.userId).single();
        if (bet.mode === 'demo') {
          await db.from('profiles').update({ demo_balance: (profile?.demo_balance || 0) + bet.winAmount }).eq('id', bet.userId);
        } else {
          await db.from('profiles').update({ balance: (profile?.balance || 0) + bet.winAmount }).eq('id', bet.userId);
          await db.from('transactions').insert({
            user_id: bet.userId,
            amount: bet.winAmount,
            type: 'win',
            description: `Win on crash round ${crashState.roundId}`,
            status: 'approved'
          });
        }

        await db.from('bets').insert({
          user_id: bet.userId,
          game_name: 'crash',
          amount: bet.amount,
          multiplier: bet.cashoutMultiplier,
          win_amount: bet.winAmount,
          status: 'won',
          round_id: crashState.roundId,
          mode: bet.mode
        });

        await db.from('game_history').insert({
          user_id: bet.userId,
          game_name: 'crash',
          bet_amount: bet.amount,
          win_amount: bet.winAmount,
          result: 'won',
          round_id: crashState.roundId,
          mode: bet.mode
        });

        // Find the socket for this user to emit success
        const userSocket = Array.from(io.sockets.sockets.values()).find(s => (s as any).userId === bet.userId);
        if (userSocket) {
          userSocket.emit('cashed-out', { winAmount: bet.winAmount, multiplier: bet.cashoutMultiplier });
        }
      } catch (err) {
        console.error('[Crash] Error processing cashout:', err);
      }
    }
    
    broadcastCrashState();
  };

  const startCrashedPhase = () => {
    crashState.phase = 'crashed';
    broadcastCrashState();
    
    crashState.history.unshift(Number(crashState.multiplier.toFixed(2)));
    if (crashState.history.length > 20) crashState.history.pop();
    
    setTimeout(() => {
      startResultPhase();
    }, 3000);
  };

  const startResultPhase = async () => {
    crashState.phase = 'result';
    broadcastCrashState();

    // Save round result to DB
    try {
      await db.from('game_results').insert({
        game_name: 'crash',
        round_id: crashState.roundId,
        result_data: { crashPoint: crashState.multiplier }
      });

      // Process bets that didn't cash out (lost)
      for (const bet of crashState.bets) {
        if (!bet.cashedOut) {
          await db.from('bets').insert({
            user_id: bet.userId,
            game_name: 'crash',
            amount: bet.amount,
            multiplier: 0,
            win_amount: 0,
            status: 'lost',
            round_id: crashState.roundId,
            mode: bet.mode
          });

          await db.from('game_history').insert({
            user_id: bet.userId,
            game_name: 'crash',
            bet_amount: bet.amount,
            win_amount: 0,
            result: 'lost',
            round_id: crashState.roundId,
            mode: bet.mode
          });
        }
      }
    } catch (err) {
      console.error('[Crash] Error saving results:', err);
    }

    setTimeout(() => {
      startCrashRound();
    }, 2000);
  };

  io.on('connection', (socket) => {
    socket.emit('crash-state', crashState);
    socket.emit('dice-state', diceState);

    socket.on('place-bet', async (data) => {
      const { userId, amount, mode, token, autoCashout } = data;
      
      try {
        // Verify user
        const user = await verifyUser(token, userId);
        if (!user) {
          socket.emit('error', { message: 'Authentication failed' });
          return;
        }

        if (crashState.phase !== 'waiting') {
          socket.emit('error', { message: 'Round already started' });
          return;
        }

        if (crashState.bets.find(b => b.userId === userId)) {
          socket.emit('error', { message: 'Bet already placed' });
          return;
        }

        const { data: profile } = await db.from('profiles').select('balance, demo_balance, username').eq('id', userId).single();
        if (!profile) return;

        const balance = mode === 'demo' ? (profile.demo_balance || 0) : (profile.balance || 0);
        if (balance < amount) {
          socket.emit('error', { message: 'Insufficient balance' });
          return;
        }

        // Deduct balance immediately in DB
        if (mode === 'demo') {
          await db.from('profiles').update({ demo_balance: balance - amount }).eq('id', userId);
        } else {
          await db.from('profiles').update({ balance: balance - amount }).eq('id', userId);
          await db.from('transactions').insert({
            user_id: userId,
            amount: -amount,
            type: 'bet',
            description: `Bet on crash round ${crashState.roundId}`,
            status: 'approved'
          });
        }

        // Store userId on socket for later use in processCashout
        (socket as any).userId = userId;

        crashState.bets.push({
          userId,
          username: profile.username,
          amount,
          mode,
          cashedOut: false,
          cashoutMultiplier: 0,
          winAmount: 0,
          autoCashout: autoCashout ? Number(autoCashout) : undefined
        });

        broadcastCrashState();
        socket.emit('bet-placed', { success: true, gameName: 'crash', newBalance: balance - amount });
        console.log(`[Crash] Bet placed by ${profile.username}: ${amount} (${mode})`);
      } catch (err) {
        console.error('[Crash] Error placing bet:', err);
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    socket.on('dice-bet', async (data) => {
      const { userId, amount, choice, mode, token } = data;
      
      try {
        // Verify user
        const user = await verifyUser(token, userId);
        if (!user) {
          socket.emit('error', { message: 'Authentication failed' });
          return;
        }

        if (diceState.phase !== 'waiting') {
          socket.emit('error', { message: 'Betting closed' });
          return;
        }

        const { data: profile } = await db.from('profiles').select('balance, demo_balance, username').eq('id', userId).single();
        if (!profile) return;

        const balance = mode === 'demo' ? (profile.demo_balance || 0) : (profile.balance || 0);
        if (balance < amount) {
          socket.emit('error', { message: 'Insufficient balance' });
          return;
        }

        // Deduct balance immediately in DB
        if (mode === 'demo') {
          await db.from('profiles').update({ demo_balance: balance - amount }).eq('id', userId);
        } else {
          await db.from('profiles').update({ balance: balance - amount }).eq('id', userId);
          await db.from('transactions').insert({
            user_id: userId,
            amount: -amount,
            type: 'bet',
            description: `Bet on dice round ${diceState.roundId}`,
            status: 'approved'
          });
        }

        diceState.bets.push({
          userId,
          username: profile.username,
          amount,
          choice,
          mode,
          winAmount: 0,
          status: 'pending'
        });

        broadcastDiceState();
        socket.emit('dice-bet-placed', { amount, choice, mode });
        console.log(`[Dice] Bet placed by ${profile.username}: ${amount} on ${choice} (${mode})`);
      } catch (err) {
        console.error('[Dice] Error placing bet:', err);
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    socket.on('roulette-bet', async (data) => {
      const { userId, amount, type, value, mode, token } = data;
      
      try {
        // Verify user
        let user;
        if (token === 'mock_token') {
          user = { id: '00000000-0000-0000-0000-000000000000', email: 'shohagrana284650@gmail.com' };
        } else {
          const { data: authData, error: authError } = await supabase.auth.getUser(token);
          if (authError || !authData.user) {
            socket.emit('error', { message: 'Authentication failed' });
            return;
          }
          user = authData.user;
        }

        if (user.id !== userId) {
          socket.emit('error', { message: 'Authentication failed' });
          return;
        }

        if (rouletteState.phase !== 'waiting') {
          socket.emit('error', { message: 'Betting closed' });
          return;
        }

        const { data: profile } = await db.from('profiles').select('balance, demo_balance, username').eq('id', userId).single();
        if (!profile) return;

        const balance = mode === 'demo' ? (profile.demo_balance || 0) : (profile.balance || 0);
        if (balance < amount) {
          socket.emit('error', { message: 'Insufficient balance' });
          return;
        }

        // Deduct balance immediately in DB
        if (mode === 'demo') {
          await db.from('profiles').update({ demo_balance: balance - amount }).eq('id', userId);
        } else {
          await db.from('profiles').update({ balance: balance - amount }).eq('id', userId);
          await db.from('transactions').insert({
            user_id: userId,
            amount: -amount,
            type: 'bet',
            description: `Roulette Bet: ${type} ${value} on round ${rouletteState.roundId}`,
            status: 'approved'
          });
        }

        // Insert into roulette_bets table
        const { data: insertedBet } = await db.from('roulette_bets').insert({
          user_id: userId,
          round_id: rouletteState.roundId,
          bet_type: type,
          bet_value: String(value),
          amount: amount,
          status: 'pending',
          mode: mode
        }).select().single();

        rouletteState.bets.push({
          id: insertedBet?.id,
          userId,
          username: profile.username,
          amount,
          type,
          value,
          mode
        });

        broadcastRouletteState();
        socket.emit('bet-placed', { amount, mode });
        console.log(`[Roulette] Bet placed by ${profile.username}: ${amount} on ${type} ${value} (${mode})`);
      } catch (err) {
        console.error('[Roulette] Error placing bet:', err);
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    socket.on('roulette-undo', async (data) => {
      const { userId, mode, token } = data;
      try {
        const user = await verifyUser(token, userId);
        if (!user) return;
        if (rouletteState.phase !== 'waiting') return;

        const lastBetIndex = [...rouletteState.bets].reverse().findIndex(b => b.userId === userId);
        if (lastBetIndex === -1) return;
        
        const actualIndex = rouletteState.bets.length - 1 - lastBetIndex;
        const lastBet = rouletteState.bets[actualIndex];
        
        // Remove from state
        rouletteState.bets.splice(actualIndex, 1);
        
        // Restore balance
        const { data: profile } = await db.from('profiles').select('balance, demo_balance').eq('id', userId).single();
        if (mode === 'demo') {
          await db.from('profiles').update({ demo_balance: (profile?.demo_balance || 0) + lastBet.amount }).eq('id', userId);
        } else {
          await db.from('profiles').update({ balance: (profile?.balance || 0) + lastBet.amount }).eq('id', userId);
          await db.from('transactions').insert({
            user_id: userId,
            amount: lastBet.amount,
            type: 'refund',
            description: `Roulette Undo: ${lastBet.type} ${lastBet.value} on round ${rouletteState.roundId}`,
            status: 'approved'
          });
        }

        // Delete from roulette_bets (or update to cancelled, but here we just delete the last one for simplicity)
        // Actually, better to just delete the most recent one for this user
        const { data: recentBet } = await db.from('roulette_bets')
          .select('id')
          .eq('user_id', userId)
          .eq('round_id', rouletteState.roundId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (recentBet) {
          await db.from('roulette_bets').delete().eq('id', recentBet.id);
        }

        broadcastRouletteState();
        socket.emit('bet-undone', { amount: lastBet.amount, mode });
      } catch (err) {
        console.error('[Roulette] Error undoing bet:', err);
      }
    });

    socket.on('roulette-clear', async (data) => {
      const { userId, mode, token } = data;
      try {
        const user = await verifyUser(token, userId);
        if (!user) return;
        if (rouletteState.phase !== 'waiting') return;

        const userBets = rouletteState.bets.filter(b => b.userId === userId);
        if (userBets.length === 0) return;
        
        const totalRefund = userBets.reduce((sum, b) => sum + b.amount, 0);
        
        // Remove from state
        rouletteState.bets = rouletteState.bets.filter(b => b.userId !== userId);
        
        // Restore balance
        const { data: profile } = await db.from('profiles').select('balance, demo_balance').eq('id', userId).single();
        if (mode === 'demo') {
          await db.from('profiles').update({ demo_balance: (profile?.demo_balance || 0) + totalRefund }).eq('id', userId);
        } else {
          await db.from('profiles').update({ balance: (profile?.balance || 0) + totalRefund }).eq('id', userId);
          await db.from('transactions').insert({
            user_id: userId,
            amount: totalRefund,
            type: 'refund',
            description: `Roulette Clear: ${userBets.length} bets on round ${rouletteState.roundId}`,
            status: 'approved'
          });
        }

        // Delete from roulette_bets
        await db.from('roulette_bets')
          .delete()
          .eq('user_id', userId)
          .eq('round_id', rouletteState.roundId);

        broadcastRouletteState();
        socket.emit('bets-cleared', { amount: totalRefund, mode });
      } catch (err) {
        console.error('[Roulette] Error clearing bets:', err);
      }
    });

    socket.on('get-roulette-history', async (data) => {
      const { userId, token } = data;
      try {
        const user = await verifyUser(token, userId);
        if (!user) return;

        const { data: history, error } = await db.from('roulette_bets')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (!error && history) {
          socket.emit('roulette-history', history);
        }
      } catch (err) {
        console.error('[Roulette] Error fetching history:', err);
      }
    });

    socket.on('cash-out', async (data) => {
      const { userId, token } = data;
      
      try {
        // Verify user
        const user = await verifyUser(token, userId);
        if (!user) return;

        if (crashState.phase !== 'flying') return;
        
        const bet = crashState.bets.find(b => b.userId === userId && !b.cashedOut);
        if (!bet) return;

        await processCashout(bet, Number(crashState.multiplier.toFixed(2)));
        console.log(`[Crash] Cashout by ${userId}: ${bet.winAmount} at ${bet.cashoutMultiplier}x`);
      } catch (err) {
        console.error('[Crash] Error cashing out:', err);
      }
    });

    // Admin control
    socket.on('admin-set-crash', async (data) => {
      const { token, crashPoint } = data;
      try {
        const user = await verifyUser(token, ''); // userId not needed for admin check if token is verified
        if (!user) return;
        
        const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin' || profile?.role === 'sub_admin') {
          crashState.crashPoint = crashPoint;
          console.log(`[Admin] Crash point manually set to ${crashPoint}x`);
        }
      } catch (err) {
        console.error('[Crash] Admin error:', err);
      }
    });
  });

  startCrashRound();
  startDiceRound();
  startRouletteRound();

  // Automatic Game Engine
  const runGameRound = async (gameName: string, roundId: number) => {
    const { data: existingResult } = await db
      .from('game_results')
      .select('*')
      .eq('game_name', gameName)
      .eq('round_id', roundId)
      .single();
    
    let resultData: any;
    
    if (existingResult) {
      resultData = existingResult.result_data;
    } else {
      if (gameName === 'spin') {
        const segments = [0, 0, 0, 0, 0, 0, 2, 2, 2, 10];
        const randomIndex = Math.floor(Math.random() * segments.length);
        resultData = { multiplier: segments[randomIndex], index: randomIndex };
      } else if (gameName === '7updown') {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        resultData = { dice1, dice2, total: dice1 + dice2 };
      } else if (gameName === 'crash') {
        const crashPoint = Math.max(1, (Math.random() * 5) + 0.5);
        resultData = { crashPoint };
      } else if (gameName === 'roulette') {
        const number = Math.floor(Math.random() * 37);
        const colors: any = { 0: 'green' };
        [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].forEach(n => colors[n] = 'red');
        [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].forEach(n => colors[n] = 'black');
        resultData = { number, color: colors[number] };
      }
      await db.from('game_results').insert({ game_name: gameName, round_id: roundId, result_data: resultData });
    }

    // Process all pending bets for this round
    const { data: bets } = await db
      .from('bets')
      .select('*')
      .eq('game_name', gameName)
      .eq('round_id', roundId)
      .eq('status', 'pending');
    
    if (bets) {
      for (const bet of bets) {
        let winAmount = 0;
        const betInfo = bet.bet_data;
        const resData: any = resultData;

        if (gameName === 'spin') winAmount = bet.amount * resData.multiplier;
        else if (gameName === '7updown') {
          const total = resData.total;
          if (betInfo.choice === 'down' && total < 7) winAmount = bet.amount * 2;
          else if (betInfo.choice === 'up' && total > 7) winAmount = bet.amount * 2;
          else if (betInfo.choice === '7' && total === 7) winAmount = bet.amount * 5;
        } else if (gameName === 'crash') winAmount = betInfo.autoCashout < resData.crashPoint ? bet.amount * betInfo.autoCashout : 0;
        else if (gameName === 'roulette') {
          const userBets = betInfo.bets || {};
          Object.entries(userBets).forEach(([betType, amount]: [string, any]) => {
            const amt = Number(amount);
            if (!isNaN(Number(betType)) && Number(betType) === resData.number) winAmount += amt * 36;
            else if (betType === 'red' && resData.color === 'red') winAmount += amt * 2;
            else if (betType === 'black' && resData.color === 'black') winAmount += amt * 2;
            else if (betType === 'even' && resData.number !== 0 && resData.number % 2 === 0) winAmount += amt * 2;
            else if (betType === 'odd' && resData.number !== 0 && resData.number % 2 !== 0) winAmount += amt * 2;
            else if (betType === '1st12' && resData.number >= 1 && resData.number <= 12) winAmount += amt * 3;
            else if (betType === '2nd12' && resData.number >= 13 && resData.number <= 24) winAmount += amt * 3;
            else if (betType === '3rd12' && resData.number >= 25 && resData.number <= 36) winAmount += amt * 3;
          });
        }

        const status = winAmount > 0 ? 'won' : 'lost';
        const isDemo = bet.mode === 'demo';

        await db.from('bets').update({ status, win_amount: winAmount }).eq('id', bet.id);
        if (winAmount > 0) {
          const { data: user } = await db.from('profiles').select('balance, demo_balance').eq('id', bet.user_id).single();
          if (isDemo) {
            await db.from('profiles').update({ demo_balance: (user?.demo_balance || 0) + winAmount }).eq('id', bet.user_id);
          } else {
            await db.from('profiles').update({ balance: (user?.balance || 0) + winAmount }).eq('id', bet.user_id);
            await db.from('transactions').insert({
              user_id: bet.user_id,
              amount: winAmount,
              type: 'win',
              description: `Win on ${gameName} round ${roundId}`
            });
          }
        }
        await db.from('game_history').insert({
          user_id: bet.user_id,
          game_name: gameName,
          bet_amount: bet.amount,
          win_amount: winAmount,
          result: status,
          round_id: roundId,
          mode: bet.mode
        });
      }
    }
  };

  setInterval(async () => {
    try {
      const now = new Date();
      if (now.getSeconds() === 59) {
        const roundId = Math.floor(Date.now() / 60000);
        for (const game of ['spin', '7updown']) {
          try {
            await runGameRound(game, roundId);
          } catch (err) {
            console.error(`Error running game round for ${game}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('Error in game engine interval:', err);
    }
  }, 1000);
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
