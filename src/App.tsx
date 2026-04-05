import React, { useState, useEffect, useCallback, Component } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RouletteGame } from './RouletteGame';
import { Login } from './Login';
import { ProtectedRoute } from './ProtectedRoute';
import { signOut, getActiveSession } from '../auth';
import { 
  Coins, 
  User, 
  Home,
  LogOut, 
  LayoutDashboard, 
  RotateCw, 
  Plane, 
  Dice5, 
  History, 
  Clock,
  Settings, 
  Users, 
  TrendingUp,
  ShieldAlert,
  Wallet,
  PlusCircle,
  RotateCcw,
  ArrowDownCircle,
  Bell,
  HelpCircle,
  FileText,
  Gamepad2,
  Flame,
  Heart,
  Dices,
  Spade,
  Gift,
  Trophy,
  Percent,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Star,
  Share2,
  CreditCard,
  Play,
  Info,
  ShieldCheck,
  Mail,
  Banknote,
  Download,
  Zap,
  Crown,
  Tag,
  MessageSquare,
  Shield,
  Smartphone,
  Globe,
  LayoutGrid,
  Search,
  Activity,
  BarChart3,
  PieChart,
  Database,
  Key,
  Eye,
  EyeOff,
  UserMinus,
  UserPlus,
  DollarSign,
  RefreshCw,
  Lock,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Register } from './Register';
import CrashGame from './components/CrashGame';
import { DiceGame } from './components/DiceGame';

// --- Types ---
type ViewState = 'splash' | 'landing' | 'auth' | 'app';
type GameType = 'home' | 'balance' | 'game' | 'history' | 'profile' | 'referearn' | 'help' | 'setting' | 'admin' | 'subadmin' | 'gamecontrol' | 'finance' | 'spin' | 'crash' | 'dice' | '7updown' | 'roulette' | 'slots' | 'offers' | 'vip' | 'hot' | 'trend' | 'love' | 'bet' | 'casino' | 'bonus' | 'cashback' | 'tournament' | 'livechat' | 'notifications';
type UserRole = 'user' | 'admin' | 'subadmin' | 'game_manager' | 'finance_manager';

interface UserData {
  id: string;
  username: string;
  balance: number;
  demo_balance?: number;
  game_mode?: 'demo' | 'real';
  role: UserRole;
  phone?: string;
  full_name?: string;
  email?: string;
  language?: string;
  hasWithdrawPassword?: boolean;
  created_at?: string;
  numeric_id?: string;
}

import { apiFetch } from './lib/api';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const TRANSLATIONS: Record<string, any> = {
  en: {
    home: "Home",
    games: "Games",
    balance: "Balance",
    history: "History",
    profile: "Profile",
    refer: "Refer & Earn",
    help: "Help & Support",
    settings: "Settings",
    logout: "Logout",
    add_money: "Add Money",
    withdraw: "Withdraw",
    total_balance: "Total Balance",
    live_chat: "Live Chat",
    email_support: "Email Support",
    faq: "FAQ",
    change_password: "Change Password",
    language: "Language",
    phone: "Phone Number",
    full_name: "Full Name",
    username: "Username",
    password: "Password",
    confirm_password: "Confirm Password",
    register: "Register",
    login: "Login",
    forgot_password: "Forgot Password",
    back_to_home: "Back to Home",
    start_legacy: "Start Your Legacy",
    live_feed: "Live Feed",
    real_time_payouts: "Real-Time Payouts",
    site_about: "Site About",
    betting_rules: "Betting Rules",
    version: "Version",
    withdraw_password: "Withdrawal Password",
    set_withdraw_password: "Set Withdrawal Password",
    enter_withdraw_password: "Enter Withdrawal Password",
    upload_screenshot: "Upload Screenshot",
    select_file: "Select File",
    submit: "Submit",
    success: "Success",
    error: "Error",
    loading: "Loading...",
    deposit_methods: "Deposit Methods",
    select_method: "Select Method",
    amount: "Amount",
    transaction_id: "Transaction ID",
    copy: "Copy",
    copied: "Copied!",
    chat_with_manager: "Chat with Manager",
    email_us: "Email Us",
    faq_desc: "Frequently Asked Questions",
    support_desc: "We are here to help you 24/7",
    english: "English",
    bangla: "Bangla",
    current_password: "Current Password",
    new_password: "New Password",
    update_password: "Update Password",
    update_profile: "Update Profile",
    save_changes: "Save Changes",
    not_set: "Not Set",
    tourney: "Tournament",
    bonus: "Bonus",
    spins: "Spins",
    cashback: "Cashback",
    offers: "Offers",
    vip: "VIP",
    refer_earn: "Refer & Earn",
    active_players: "Active Players",
    today_jackpot: "Today's Jackpot",
    online_friends: "Online Friends",
    fair_play: "Fair Play",
    verified: "Verified",
    live_chat_desc: "Chat with our support manager",
    email_support_desc: "Send us an email for help",
    faq_q1: "How to deposit money?",
    faq_a1: "Go to Balance > Add Money, select method, send money, and submit TrxID with screenshot.",
    faq_q2: "How to withdraw money?",
    faq_a2: "Go to Balance > Withdraw, enter amount and account details. Make sure you have set a withdrawal password.",
    faq_q3: "Is my data secure?",
    faq_a3: "Yes, we use industry-standard encryption to protect your personal information and transactions.",
    faq_q4: "How to change password?",
    faq_a4: "Go to Settings > Change Password, enter current and new password.",
    faq_q5: "How to set withdrawal password?",
    faq_a5: "Go to Settings > Withdrawal Password, enter a new password and save.",
    notifications: "Notifications",
    no_notifications: "No notifications yet",
    claim: "Claim",
    claimed: "Claimed",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    status: "Status",
    deposit_history: "Deposit History",
    insufficient_balance: "Insufficient balance",
    set_password_first: "Please set a withdrawal password first in settings",
    account_info: "Account Information",
    email: "Email Address",
    role: "Account Role",
  },
  bn: {
    home: "হোম",
    games: "গেমস",
    balance: "ব্যালেন্স",
    history: "ইতিহাস",
    profile: "প্রোফাইল",
    refer: "রেফার ও আয়",
    help: "সাহায্য ও সাপোর্ট",
    settings: "সেটিংস",
    logout: "লগআউট",
    add_money: "টাকা যোগ করুন",
    withdraw: "টাকা উত্তোলন",
    total_balance: "মোট ব্যালেন্স",
    live_chat: "লাইভ চ্যাট",
    email_support: "ইমেইল সাপোর্ট",
    faq: "সাধারণ জিজ্ঞাসা (FAQ)",
    change_password: "পাসওয়ার্ড পরিবর্তন",
    language: "ভাষা",
    phone: "ফোন নম্বর",
    full_name: "পুরো নাম",
    username: "ইউজারনেম",
    password: "পাসওয়ার্ড",
    confirm_password: "পাসওয়ার্ড নিশ্চিত করুন",
    register: "নিবন্ধন করুন",
    login: "লগইন",
    forgot_password: "পাসওয়ার্ড ভুলে গেছেন?",
    back_to_home: "হোমে ফিরে যান",
    start_legacy: "আপনার যাত্রা শুরু করুন",
    live_feed: "লাইভ ফিড",
    real_time_payouts: "রিয়েল-টাইম পেআউট",
    site_about: "সাইট সম্পর্কে",
    betting_rules: "বেটিং নিয়মাবলী",
    version: "ভার্সন",
    withdraw_password: "উত্তোলন পাসওয়ার্ড",
    set_withdraw_password: "উত্তোলন পাসওয়ার্ড সেট করুন",
    enter_withdraw_password: "উত্তোলন পাসওয়ার্ড লিখুন",
    upload_screenshot: "স্ক্রিনশট আপলোড করুন",
    select_file: "ফাইল নির্বাচন করুন",
    submit: "জমা দিন",
    success: "সফল",
    error: "ত্রুটি",
    loading: "লোড হচ্ছে...",
    deposit_methods: "ডিপোজিট পদ্ধতি",
    select_method: "পদ্ধতি নির্বাচন করুন",
    amount: "পরিমাণ",
    transaction_id: "ট্রানজেকশন আইডি",
    copy: "কপি",
    copied: "কপি হয়েছে!",
    chat_with_manager: "ম্যানেজারের সাথে চ্যাট করুন",
    email_us: "আমাদের ইমেইল করুন",
    faq_desc: "সাধারণ জিজ্ঞাসা ও উত্তর",
    support_desc: "আমরা আপনার সেবায় ২৪/৭ নিয়োজিত",
    english: "ইংরেজি",
    bangla: "বাংলা",
    current_password: "বর্তমান পাসওয়ার্ড",
    new_password: "নতুন পাসওয়ার্ড",
    update_password: "পাসওয়ার্ড আপডেট করুন",
    update_profile: "প্রোফাইল আপডেট করুন",
    save_changes: "পরিবর্তন সংরক্ষণ করুন",
    not_set: "সেট করা নেই",
    tourney: "টুর্নামেন্ট",
    bonus: "বোনাস",
    spins: "স্পিন",
    cashback: "ক্যাশব্যাক",
    offers: "অফার",
    vip: "ভিআইপি",
    refer_earn: "রেফার ও আয়",
    active_players: "সক্রিয় খেলোয়াড়",
    today_jackpot: "আজকের জ্যাকপট",
    online_friends: "অনলাইন বন্ধু",
    fair_play: "ফেয়ার প্লে",
    verified: "ভেরিফাইড",
    live_chat_desc: "সাপোর্ট ম্যানেজারের সাথে চ্যাট করুন",
    email_support_desc: "সাহায্যের জন্য আমাদের ইমেইল করুন",
    faq_q1: "কিভাবে টাকা জমা দেব?",
    faq_a1: "ব্যালেন্স > টাকা যোগ করুন-এ যান, পদ্ধতি নির্বাচন করুন, টাকা পাঠান এবং স্ক্রিনশট সহ ট্রানজেকশন আইডি জমা দিন।",
    faq_q2: "কিভাবে টাকা উত্তোলন করব?",
    faq_a2: "ব্যালেন্স > টাকা উত্তোলন-এ যান, পরিমাণ এবং অ্যাকাউন্টের বিবরণ লিখুন। নিশ্চিত করুন যে আপনি একটি উত্তোলন পাসওয়ার্ড সেট করেছেন।",
    faq_q3: "আমার তথ্য কি নিরাপদ?",
    faq_a3: "হ্যাঁ, আমরা আপনার ব্যক্তিগত তথ্য এবং লেনদেন রক্ষা করতে ইন্ডাস্ট্রি-স্ট্যান্ডার্ড এনক্রিপশন ব্যবহার করি।",
    faq_q4: "কিভাবে পাসওয়ার্ড পরিবর্তন করব?",
    faq_a4: "সেটিংস > পাসওয়ার্ড পরিবর্তন-এ যান, বর্তমান এবং নতুন পাসওয়ার্ড লিখুন।",
    faq_q5: "কিভাবে উত্তোলন পাসওয়ার্ড সেট করব?",
    faq_a5: "সেটিংস > উত্তোলন পাসওয়ার্ড-এ যান, একটি নতুন পাসওয়ার্ড লিখুন এবং সংরক্ষণ করুন।",
    notifications: "নোটিফিকেশন",
    no_notifications: "এখনও কোনো নোটিফিকেশন নেই",
    claim: "দাবি করুন",
    claimed: "দাবি করা হয়েছে",
    pending: "পেন্ডিং",
    approved: "অনুমোদিত",
    rejected: "প্রত্যাখ্যাত",
    status: "অবস্থা",
    deposit_history: "ডিপোজিট ইতিহাস",
    insufficient_balance: "পর্যাপ্ত ব্যালেন্স নেই",
    set_password_first: "দয়া করে প্রথমে সেটিংসে একটি উত্তোলন পাসওয়ার্ড সেট করুন",
    account_info: "অ্যাকাউন্ট তথ্য",
    email: "ইমেইল ঠিকানা",
    role: "অ্যাকাউন্ট রোল",
  }
};

interface GameHistoryItem {
  id: number;
  game_name: string;
  bet_amount: number;
  win_amount: number;
  result: string;
  created_at: string;
}

// --- Components ---

const Logo = ({ onClick, className = "" }: { onClick?: () => void, className?: string }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-2 cursor-pointer group ${className}`}
  >
    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-900 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform border border-white/20">
      <Dices className="text-white" size={24} />
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-xl font-black text-white tracking-tighter uppercase">TukTak</span>
      <span className="text-[8px] font-bold text-emerald-500 tracking-[0.3em] uppercase">Casino</span>
    </div>
  </div>
);

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<any, any> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Something went wrong</h1>
          <p className="text-gray-400 mb-8">We encountered an unexpected error. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-emerald-500 text-black font-black px-8 py-4 rounded-2xl uppercase tracking-widest shadow-lg"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

function LeaderboardItem({ rank, name, score, prize }: { rank: number, name: string, score: number, prize: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${rank === 1 ? 'bg-yellow-500 text-black' : rank === 2 ? 'bg-gray-400 text-black' : rank === 3 ? 'bg-orange-500 text-black' : 'bg-white/10 text-gray-400'}`}>
          {rank}
        </div>
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{score} Points</div>
        </div>
      </div>
      <div className="text-emerald-500 font-black">{prize}</div>
    </div>
  );
}

function TournamentView({ t }: { t: any }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-8 md:p-12 rounded-[2.5rem] text-black shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <Trophy size={64} className="mb-6" />
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">Weekly Champion</h2>
          <p className="text-lg font-bold opacity-80 mb-8 max-w-md">Compete with other players and win massive prizes every week!</p>
          <div className="flex gap-4">
            <div className="bg-black/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-black/10">
              <div className="text-[10px] uppercase font-black tracking-widest opacity-60">Prize Pool</div>
              <div className="text-2xl font-black">$5,000</div>
            </div>
            <div className="bg-black/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-black/10">
              <div className="text-[10px] uppercase font-black tracking-widest opacity-60">Ends In</div>
              <div className="text-2xl font-black">2d 14h</div>
            </div>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12">
          <Trophy size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
            <Users className="text-emerald-500" /> Leaderboard
          </h3>
          <div className="space-y-4">
            <LeaderboardItem rank={1} name="AlexPro" score={12500} prize="$2,500" />
            <LeaderboardItem rank={2} name="SarahWin" score={10200} prize="$1,200" />
            <LeaderboardItem rank={3} name="LuckyJohn" score={8400} prize="$800" />
            <LeaderboardItem rank={4} name="CasinoKing" score={7200} prize="$300" />
            <LeaderboardItem rank={5} name="Player99" score={6500} prize="$200" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
            <h3 className="text-xl font-black mb-4">How to Join?</h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-black font-black flex-shrink-0">1</div>
                <p className="text-sm text-gray-400 font-medium">Play any game in the casino to earn points.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-black font-black flex-shrink-0">2</div>
                <p className="text-sm text-gray-400 font-medium">Every $1 bet equals 1 tournament point.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-black font-black flex-shrink-0">3</div>
                <p className="text-sm text-gray-400 font-medium">Top 10 players share the prize pool at the end of the week.</p>
              </li>
            </ul>
          </div>
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20">
            JOIN NOW
          </button>
        </div>
      </div>
    </div>
  );
}

// apiFetch is now imported from ./lib/api

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<GameType>('home');
  
  console.log('App: rendering, loading:', loading, 'user:', !!user);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
  };

  const [logoClicks, setLogoClicks] = useState(0);
  const [showHiddenLogin, setShowHiddenLogin] = useState(false);

  useEffect(() => {
    // Safety timeout to ensure loading screen is cleared even if session check hangs
    const safetyTimeout = setTimeout(() => {
      console.warn('App: Safety timeout reached, clearing loading screen');
      setLoading(false);
    }, 5000);

    const checkSession = async () => {
      console.log('App: checkSession starting...');
      try {
        const session = await getActiveSession();
        console.log('App: session found:', !!session);
        
        if (session?.user) {
          console.log('App: fetching user profile...');
          const res = await apiFetch('/api/auth/me');
          console.log('App: profile response ok:', res.ok);
          if (res.ok) {
            const userData = await res.json();
            console.log('App: user profile loaded:', userData.username);
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        console.log('App: checkSession complete, setting loading to false');
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    };

    checkSession();

    // Refresh session every 10 minutes
    const refreshInterval = setInterval(async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.getSession();
        if (data.session) {
          console.log('App: Session refreshed');
        }
      }
    }, 10 * 60 * 1000);

    let subscription: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('App: onAuthStateChange event:', event, 'session:', !!session);
        // Also check for mock session on auth state change
        const mockSessionStr = typeof window !== 'undefined' ? localStorage.getItem('mock_session') : null;
        const mockSession = mockSessionStr ? JSON.parse(mockSessionStr) : null;
        
        const activeSession = session || mockSession;
        
        if (activeSession?.user) {
          const res = await apiFetch('/api/auth/me');
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      });
      subscription = data.subscription;
    }

    const handleUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      if (subscription) subscription.unsubscribe();
      clearInterval(refreshInterval);
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      if (prev + 1 >= 5) {
        setShowHiddenLogin(true);
        return 0;
      }
      return prev + 1;
    });
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      // signOut already redirects to /login and reloads, but we can be explicit
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback if signOut fails
      localStorage.removeItem('mock_session');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8">
        <Logo className="scale-150" />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage user={user} handleLogoClick={handleLogoClick} />} />
        
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route 
          path="/login" 
          element={
            <Login 
              role="user" 
              title="User Login" 
              icon={<User className="text-blue-500" size={32} />} 
              redirectPath="/dashboard" 
            />
          } 
        />
        <Route 
          path="/admin-login" 
          element={
            <Login 
              role="admin" 
              title="Admin Login" 
              icon={<ShieldCheck className="text-blue-500" size={32} />} 
              redirectPath="/admin" 
            />
          } 
        />
        <Route 
          path="/sub-admin-login" 
          element={
            <Login 
              role="subadmin" 
              title="Sub Admin Login" 
              icon={<Users className="text-purple-500" size={32} />} 
              redirectPath="/sub-admin" 
            />
          } 
        />
        <Route 
          path="/game-login" 
          element={
            <Login 
              role="game_manager" 
              title="Game Control Login" 
              icon={<Gamepad2 className="text-orange-500" size={32} />} 
              redirectPath="/game-panel" 
            />
          } 
        />
        <Route 
          path="/finance-login" 
          element={
            <Login 
              role="finance_manager" 
              title="Finance Login" 
              icon={<DollarSign className="text-emerald-500" size={32} />} 
              redirectPath="/finance" 
            />
          } 
        />

        {/* Protected User Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'subadmin', 'game_manager', 'finance_manager']}>
              {user ? (
                <UserPage 
                  user={user} 
                  setUser={setUser} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  logout={handleLogout} 
                  renderHiddenLoginModal={renderHiddenLoginModal} 
                  onLogoClick={handleLogoClick}
                  showToast={showToast} 
                  setView={() => {}} 
                />
              ) : (
                <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8">
                  <Logo className="scale-150" />
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              )}
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage 
                user={user!} 
                setUser={setUser} 
                activeTab="admin" 
                setActiveTab={setActiveTab} 
                logout={handleLogout} 
                renderHiddenLoginModal={renderHiddenLoginModal} 
                onLogoClick={handleLogoClick}
                showToast={showToast} 
                setView={() => {}} 
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/sub-admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
              <AdminPage 
                user={user!} 
                setUser={setUser} 
                activeTab="subadmin" 
                setActiveTab={setActiveTab} 
                logout={handleLogout} 
                renderHiddenLoginModal={renderHiddenLoginModal} 
                onLogoClick={handleLogoClick}
                showToast={showToast} 
                setView={() => {}} 
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/game-panel/*" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'game_manager']}>
              <AdminPage 
                user={user!} 
                setUser={setUser} 
                activeTab="gamecontrol" 
                setActiveTab={setActiveTab} 
                logout={handleLogout} 
                renderHiddenLoginModal={renderHiddenLoginModal} 
                onLogoClick={handleLogoClick}
                showToast={showToast} 
                setView={() => {}} 
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/finance/*" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'finance_manager']}>
              <AdminPage 
                user={user!} 
                setUser={setUser} 
                activeTab="finance" 
                setActiveTab={setActiveTab} 
                logout={handleLogout} 
                renderHiddenLoginModal={renderHiddenLoginModal} 
                onLogoClick={handleLogoClick}
                showToast={showToast} 
                setView={() => {}} 
              />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {renderHiddenLoginModal()}
      <ToastContainer 
        aria-label="Notifications"
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="dark"
      />
    </>
  );

  function renderHiddenLoginModal() {
    if (!showHiddenLogin) return null;
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl"
          >
            <button 
              onClick={() => setShowHiddenLogin(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8 text-center">
              <Logo className="mx-auto mb-6 scale-125" />
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <ShieldAlert className="text-emerald-500" size={32} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Access</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Select Management Portal</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { role: 'admin', label: 'Admin', icon: ShieldCheck, path: '/admin-login', color: 'blue' },
                { role: 'subadmin', label: 'Sub Admin', icon: Users, path: '/sub-admin-login', color: 'purple' },
                { role: 'game_manager', label: 'Game Control', icon: Gamepad2, path: '/game-login', color: 'orange' },
                { role: 'finance_manager', label: 'Finance', icon: DollarSign, path: '/finance-login', color: 'emerald' }
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    setShowHiddenLogin(false);
                    navigate(item.path);
                  }}
                  className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <item.icon className={`text-${item.color}-500 group-hover:scale-110 transition-transform`} size={24} />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
}

function LandingPage({ user, handleLogoClick }: { user: UserData | null, handleLogoClick: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="min-h-[100dvh] bg-[#0a0a0a] text-white overflow-x-hidden">
        {/* Top Bar for Recent Withdrawals */}
        <div className="absolute top-0 left-0 w-full z-50 px-4 py-2 bg-black/40 backdrop-blur-md border-b border-white/5 overflow-hidden flex items-center justify-between">
          <div className="flex-1 flex gap-8 animate-marquee whitespace-nowrap items-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-bold">
                <span className="text-gray-500 uppercase">Recent Withdrawal:</span>
                <span className="text-white">User_{Math.floor(1000 + Math.random()*8999)}</span>
                <span className="text-emerald-500">+${(Math.random() * 2000 + 50).toFixed(2)}</span>
                <div className="w-1 h-1 bg-white/20 rounded-full mx-2" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 ml-4">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-emerald-400 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-white/10 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative min-h-[100dvh] flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20 gap-8 lg:gap-12 pt-24 lg:pt-32 pb-12 lg:pb-20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full" />
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="z-10 max-w-3xl text-center lg:text-left"
          >
            <Logo onClick={handleLogoClick} className="mb-8" />
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black mb-6 lg:mb-8 leading-[0.85] tracking-tighter">
              TUKTAK: THE <span className="text-emerald-500 italic">ULTIMATE</span> FORTUNE
            </h1>
            <p className="text-base md:text-xl text-gray-400 mb-8 lg:mb-12 max-w-xl leading-relaxed mx-auto lg:mx-0">
              Welcome to TukTak, where every spin is a story and every bet is a legacy. Our platform is built on the pillars of transparency, security, and the thrill of the win.
            </p>

            {/* Interesting Picture Scroll */}
            <div className="mb-8 lg:mb-12 relative group hidden sm:block">
              <div className="flex gap-4 overflow-hidden py-4 mask-fade">
                <div className="flex gap-4 animate-marquee-fast">
                  {[
                    "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=400"
                  ].map((src, i) => (
                    <div key={i} className="w-72 h-44 rounded-3xl overflow-hidden border border-white/10 flex-shrink-0 shadow-2xl group-hover:border-emerald-500/50 transition-all duration-500">
                      <img src={src} alt="Casino Experience" className="w-full h-full object-cover hover:scale-125 transition-transform duration-700" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                // Always go to login as requested to prevent auto-login to previous session
                navigate('/login');
              }}
              className="group relative bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-black font-black px-10 lg:px-14 py-5 lg:py-7 rounded-[1.5rem] lg:rounded-[2rem] text-xl lg:text-2xl transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              <span className="relative flex items-center gap-3">
                GET STARTED <Coins className="w-6 h-6" />
              </span>
            </button>
          </motion.div>

          {/* Recent Withdrawals on the side - Enhanced */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="z-10 w-full max-w-md hidden lg:block"
          >
            <div className="relative h-[650px] overflow-hidden bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-[3rem] border border-white/10 p-10 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#111] to-transparent z-10" />
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
              
              <div className="mb-10 relative z-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Live Feed</h3>
                </div>
                <p className="text-yellow-500 text-xs font-bold uppercase tracking-[0.3em] opacity-80">Real-Time Payouts</p>
              </div>

              <div className="animate-vertical-scroll space-y-5">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/20 to-emerald-500/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                        <User className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-white tracking-tight">User_{Math.floor(1000 + Math.random()*8999)}</div>
                        <div className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">Success</div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-400 tabular-nums">
                      +${(Math.random() * 5000 + 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </header>

        {/* Mobile Withdrawals (Visible only on mobile) */}
        <div className="lg:hidden px-4 mb-20">
          <div className="bg-[#111] rounded-3xl p-6 border border-white/5">
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Live Activity</h3>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-sm">User_{Math.floor(1000 + Math.random()*8999)}</span>
                  </div>
                  <span className="text-emerald-500 font-bold">+$450.00</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TukTak Related Section */}
        <section className="py-24 bg-[#111] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-4xl font-black mb-6 text-emerald-500 uppercase">Site About</h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  TukTak Casino is the premier destination for high-stakes online gaming. We provide a secure, transparent, and exhilarating platform where players can test their luck and skill across multiple unique games. Our mission is to deliver the fastest payouts and the most exciting gaming environment in the industry.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
                    <div className="text-emerald-500 font-bold mb-1">100% Secure</div>
                    <div className="text-xs text-gray-500">Advanced encryption for all transactions</div>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
                    <div className="text-emerald-500 font-bold mb-1">Fast Payouts</div>
                    <div className="text-xs text-gray-500">Withdraw your winnings in minutes</div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-black mb-6 text-emerald-500 uppercase">Betting Rules</h2>
                <ul className="space-y-4 text-gray-400">
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs flex-shrink-0">1</div>
                    <span>Minimum bet amount is $1.00 for all games.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs flex-shrink-0">2</div>
                    <span>All game results are generated using a provably fair algorithm.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs flex-shrink-0">3</div>
                    <span>Withdrawals are processed only to verified accounts.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs flex-shrink-0">4</div>
                    <span>Multi-accounting is strictly prohibited and may lead to account suspension.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2026 TukTak Casino. All rights reserved. Play responsibly.</p>
        </footer>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes vertical-scroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee-fast {
            animation: marquee 15s linear infinite;
          }
          .animate-vertical-scroll {
            animation: vertical-scroll 40s linear infinite;
          }
          .animate-vertical-scroll:hover {
            animation-play-state: paused;
          }
          .mask-fade {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          }
        `}</style>
      </div>
    </div>
  );
}

// --- Admin Page Layout ---
function AdminPage({ user, setUser, activeTab, setActiveTab, logout, renderHiddenLoginModal, onLogoClick, showToast, setView }: { 
  user: UserData, 
  setUser: (u: UserData) => void, 
  activeTab: GameType, 
  setActiveTab: (t: GameType) => void,
  logout: () => void,
  renderHiddenLoginModal: () => React.ReactNode,
  onLogoClick?: () => void,
  showToast: (m: string, type?: any) => void,
  setView: (v: string) => void
}) {
  const t = TRANSLATIONS[user.language || 'en'] || TRANSLATIONS.en;

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white font-mono selection:bg-blue-500/30 overflow-x-hidden">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-b border-blue-500/20 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo onClick={onLogoClick} />
          
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Operator</span>
              <span className="text-[10px] text-blue-400 font-black">{user.username}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Access Level</span>
              <span className="text-[10px] text-emerald-500 font-black uppercase">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">System Online</span>
          </div>
          
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 transition-all group"
          >
            <Home className="w-4 h-4 text-gray-400 group-hover:text-white" />
            <span className="text-[9px] font-black text-gray-400 group-hover:text-white uppercase tracking-widest">Exit Portal</span>
          </button>
          
          <button 
            onClick={logout}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="pt-16 p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'admin' && <AdminPanel t={t} logout={logout} setActiveTab={setActiveTab} onLogoClick={onLogoClick} />}
          {activeTab === 'subadmin' && <SubAdminPanel t={t} logout={logout} setActiveTab={setActiveTab} onLogoClick={onLogoClick} />}
          {activeTab === 'gamecontrol' && <GameControlPanel t={t} logout={logout} setActiveTab={setActiveTab} onLogoClick={onLogoClick} />}
          {activeTab === 'finance' && <FinancePanel t={t} logout={logout} setActiveTab={setActiveTab} onLogoClick={onLogoClick} />}
        </AnimatePresence>
      </main>
      
      {renderHiddenLoginModal()}
      <ToastContainer 
        aria-label="Notifications"
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="dark"
      />
    </div>
  );
}

// --- New User Page Layout ---
function UserPage({ user, setUser, activeTab, setActiveTab, logout, renderHiddenLoginModal, onLogoClick, showToast, setView }: { 
  user: UserData, 
  setUser: (u: UserData) => void, 
  activeTab: GameType, 
  setActiveTab: (t: GameType) => void,
  logout: () => void,
  renderHiddenLoginModal: () => React.ReactNode,
  onLogoClick?: () => void,
  showToast: (m: string, type?: any) => void,
  setView: (v: string) => void
}) {
  if (!user) return null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const t = TRANSLATIONS[user.language || 'en'] || TRANSLATIONS.en;

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch('/api/user/notifications');
      if (res.ok) {
        const data = await res.json();
        const unread = data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh count every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    // Scroll to top on tab change
    window.scrollTo(0, 0);
    if (activeTab === 'notifications') {
      setUnreadCount(0);
    }
  }, [activeTab]);

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Header */}
      {(activeTab !== 'crash' && activeTab !== 'roulette') && (
        <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50 px-2 md:px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-4">
            <Logo onClick={() => { setActiveTab('home'); onLogoClick?.(); }} className="hidden sm:flex" />
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:p-3 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Menu className="w-6 h-6 md:w-7 md:h-7 text-gray-400" />
              <span className="hidden md:block text-[10px] font-black text-gray-500 uppercase tracking-widest">Menu</span>
            </button>

            <div className="flex items-center gap-1 md:gap-2 bg-white/5 border-white/10 p-0.5 pr-1 md:pr-4 rounded-full border">
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-900 flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Guest'}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] md:text-xs font-black text-white/90 leading-none mb-0.5 md:mb-1">{user?.username || 'Guest'}</div>
                <div className="text-[8px] md:text-[10px] font-mono text-emerald-500/70 leading-none">ID: #{user?.numeric_id || '00000'}</div>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center bg-black/40 rounded-2xl border border-white/10 p-1">
              <button 
                onClick={async () => {
                  const newMode = user.game_mode === 'demo' ? 'real' : 'demo';
                  try {
                    const res = await apiFetch('/api/user/toggle-mode', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ mode: newMode })
                    });
                    if (res.ok) {
                      setUser({ ...user, game_mode: newMode });
                      toast.success(`Switched to ${newMode.toUpperCase()} mode`);
                    }
                  } catch (err) {
                    toast.error('Failed to switch mode');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.game_mode === 'demo' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-white'}`}
              >
                Demo
              </button>
              <button 
                onClick={async () => {
                  const newMode = user.game_mode === 'real' ? 'demo' : 'real';
                  try {
                    const res = await apiFetch('/api/user/toggle-mode', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ mode: newMode })
                    });
                    if (res.ok) {
                      setUser({ ...user, game_mode: newMode });
                      toast.success(`Switched to ${newMode.toUpperCase()} mode`);
                    }
                  } catch (err) {
                    toast.error('Failed to switch mode');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.game_mode === 'real' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-white'}`}
              >
                Real
              </button>
            </div>

            <div className="flex items-center gap-1 md:gap-2 bg-emerald-500/10 px-1.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-emerald-500/20">
              <Wallet className="w-3 h-3 md:w-4 md:h-4 text-emerald-500 hidden xs:block" />
              <span className="font-mono font-black text-emerald-400 text-[9px] md:text-sm">
                ${(user.game_mode === 'demo' ? (user.demo_balance ?? 0) : (user.balance ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-0.5 md:gap-1 bg-white/5 p-0.5 md:p-1 rounded-xl md:rounded-2xl border border-white/10">
              <HeaderActionButton icon={<PlusCircle />} label={t.add_money} color="text-emerald-500" onClick={() => setActiveTab('balance')} />
              <HeaderActionButton icon={<Banknote />} label={t.withdraw} color="text-yellow-500" onClick={() => setActiveTab('balance')} />
            </div>

            <div className="flex items-center gap-0.5 md:gap-1">
              <div className="relative">
                <HeaderIconButton icon={<Bell />} onClick={() => setActiveTab('notifications')} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                    {unreadCount}
                  </span>
                )}
              </div>
              <HeaderIconButton icon={<Settings />} onClick={() => setActiveTab('setting')} />
              <HeaderIconButton icon={<HelpCircle />} onClick={() => setActiveTab('help')} />
            </div>
          </div>
        </header>
      )}

      {/* Main Layout */}
      <div className={`${(activeTab === 'crash' || activeTab === 'dice' || activeTab === 'roulette') ? '' : 'pt-16 md:pt-20 pb-24 md:pb-0'} flex min-h-[100dvh] overflow-x-hidden`}>
        {/* Sidebar */}
        {(activeTab !== 'crash' && activeTab !== 'dice' && activeTab !== 'roulette') && (
          <aside className="fixed left-0 top-16 md:top-20 bottom-20 md:bottom-0 w-14 md:w-20 bg-black/40 backdrop-blur-md border-r border-white/5 z-40 transition-all duration-300 flex flex-col items-center py-2 gap-2 overflow-y-auto scrollbar-hide">
          <SidebarCategoryIcon icon={<Gamepad2 />} label={t.games} active={activeTab === 'game'} onClick={() => setActiveTab('game')} />
          
          <div className="w-6 md:w-8 h-[1px] bg-white/10" />
          
          <div className="flex flex-col gap-1 w-full px-1">
            <SidebarCategoryIcon icon={<Flame />} label={t.hot} active={activeTab === 'hot'} onClick={() => setActiveTab('hot')} />
            <SidebarCategoryIcon icon={<TrendingUp />} label={t.trend} active={activeTab === 'trend'} onClick={() => setActiveTab('trend')} />
            <SidebarCategoryIcon icon={<Heart />} label={t.love} active={activeTab === 'love'} onClick={() => setActiveTab('love')} />
            <SidebarCategoryIcon icon={<Dices />} label={t.bet} active={activeTab === 'bet'} onClick={() => setActiveTab('bet')} />
            <SidebarCategoryIcon icon={<Spade />} label={t.casino} active={activeTab === 'casino'} onClick={() => setActiveTab('casino')} />
            <SidebarCategoryIcon icon={<Trophy />} label={t.tourney} active={activeTab === 'tournament'} onClick={() => setActiveTab('tournament')} />
            <SidebarCategoryIcon icon={<Star />} label={t.vip} active={activeTab === 'vip'} onClick={() => setActiveTab('vip')} />
            <SidebarCategoryIcon icon={<Percent />} label={t.offers} active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
          </div>
        </aside>
        )}

        {/* Content Area */}
        <main className={`flex-1 ${(activeTab === 'crash' || activeTab === 'dice' || activeTab === 'roulette') ? '' : 'ml-14 md:ml-20 p-2 md:p-6'} overflow-x-hidden`}>
          <AnimatePresence mode="wait">
            {activeTab === 'home' && <CasinoHome user={user} setActiveTab={setActiveTab} t={t} />}
            {(activeTab === 'game' || activeTab === 'hot' || activeTab === 'trend' || activeTab === 'love' || activeTab === 'bet' || activeTab === 'casino') && <GameGrid category={activeTab} setActiveTab={setActiveTab} t={t} />}
            {activeTab === 'spin' && <SpinGame user={user} setUser={setUser} t={t} />}
            {activeTab === 'slots' && <SlotMachine user={user} setUser={setUser} t={t} />}
            {activeTab === 'roulette' && <RouletteGame user={user} setUser={setUser} setActiveTab={setActiveTab} t={t} />}
            {activeTab === 'crash' && <CrashGame user={user} setUser={setUser} setActiveTab={setActiveTab} t={t} />}
            {activeTab === 'dice' && <DiceGame user={user} setUser={setUser} setActiveTab={setActiveTab} t={t} />}
            {activeTab === '7updown' && <SevenUpDown user={user} setUser={setUser} t={t} />}
            {activeTab === 'history' && <GameHistory t={t} />}
            {activeTab === 'profile' && <ProfileView user={user} setUser={setUser} logout={logout} t={t} />}
            {activeTab === 'balance' && <BalanceView user={user} setUser={setUser} t={t} showToast={showToast} setView={setView} logout={logout} />}
            {activeTab === 'referearn' && <ReferEarnView user={user} t={t} showToast={showToast} />}
            {activeTab === 'tournament' && <TournamentView t={t} />}
            {activeTab === 'help' && <HelpView t={t} setActiveTab={setActiveTab} />}
            {activeTab === 'livechat' && <LiveChatView t={t} setActiveTab={setActiveTab} />}
            {activeTab === 'setting' && <SettingsView user={user} setUser={setUser} t={t} logout={logout} showToast={showToast} />}
            {activeTab === 'notifications' && <NotificationView t={t} />}
            {activeTab === 'offers' && <OffersView t={t} showToast={showToast} />}
            {activeTab === 'vip' && <VIPView user={user} t={t} />}
            {activeTab === 'bonus' && <BonusView t={t} showToast={showToast} />}
            {activeTab === 'cashback' && <CashbackView t={t} showToast={showToast} />}
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Bottom Navigation Bar */}
      {(activeTab !== 'crash' && activeTab !== 'dice' && activeTab !== 'roulette') && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg h-16 bg-black/80 backdrop-blur-2xl border border-white/10 z-[100] flex items-center justify-around px-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:hidden">
        <BottomNavIcon icon={<Home />} label={t.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <BottomNavIcon icon={<RotateCw />} label={t.spins} active={activeTab === 'spin'} onClick={() => setActiveTab('spin')} />
        <BottomNavIcon icon={<Trophy />} label={t.tourney} active={activeTab === 'tournament'} onClick={() => setActiveTab('tournament')} />
        
        {/* Central Action Button */}
        <div className="relative -top-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab('balance')}
            className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center text-black shadow-[0_10px_20px_rgba(16,185,129,0.3)] border-4 border-[#050505]"
          >
            <Wallet className="w-7 h-7" />
          </motion.button>
        </div>

        <BottomNavIcon icon={<Gift />} label={t.bonus} active={activeTab === 'bonus'} onClick={() => setActiveTab('bonus')} />
        <BottomNavIcon icon={<Percent />} label={t.offers} active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
        <BottomNavIcon icon={<User />} label={t.profile} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
      )}

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-[#0a0a0a] border-r border-white/10 z-[70] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-emerald-500">MENU</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide pr-2">
                <MenuLink icon={<Gamepad2 />} label={t.home} onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }} />
                <MenuLink icon={<CreditCard />} label={t.balance} onClick={() => { setActiveTab('balance'); setIsMenuOpen(false); }} />
                <MenuLink icon={<Play />} label={t.games} onClick={() => { setActiveTab('game'); setIsMenuOpen(false); }} />
                <MenuLink icon={<History />} label={t.history} onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} />
                <MenuLink icon={<User />} label={t.profile} onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }} />
                <MenuLink icon={<Gift />} label={t.refer_earn} onClick={() => { setActiveTab('referearn'); setIsMenuOpen(false); }} />
                <MenuLink icon={<HelpCircle />} label={t.help} onClick={() => { setActiveTab('help'); setIsMenuOpen(false); }} />
                <MenuLink icon={<Settings />} label={t.settings} onClick={() => { setActiveTab('setting'); setIsMenuOpen(false); }} />
                <div className="h-[1px] bg-white/5 my-4" />
                <MenuLink icon={<LogOut />} label={t.logout} color="text-red-500" onClick={() => { setIsMenuOpen(false); logout(); }} />
              </div>

              <div className="absolute bottom-8 left-6 right-6">
                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                  <div className="text-xs text-gray-500 mb-1">Version</div>
                  <div className="text-sm font-mono text-emerald-500">v2.4.0-stable</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {renderHiddenLoginModal()}
      <ToastContainer 
        aria-label="Notifications"
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="dark"
      />
    </div>
  );
}

function MenuLink({ icon, label, onClick, color = "text-gray-400" }: { icon: React.ReactNode, label: string, onClick: () => void, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
    >
      <div className={`${color} group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>
      <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function BottomNavIcon({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-500 scale-110' : 'text-gray-500'}`}
    >
      <div className={`${active ? 'bg-emerald-500/10 p-2 rounded-xl animate-pulse-glow' : ''}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function BottomActionIcon({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.2, y: -5 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <div className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-all shadow-lg">
        {React.cloneElement(icon as React.ReactElement, { size: 20, className: (icon as any).props.className + " md:w-6 md:h-6" })}
      </div>
      <span className="text-[8px] md:text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors uppercase tracking-widest">{label}</span>
    </motion.button>
  );
}

function HeaderActionButton({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all group`}
    >
      <div className={`${color} group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider hidden md:block">{label}</span>
    </button>
  );
}

function HeaderIconButton({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-gray-400 hover:text-white flex items-center justify-center"
    >
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </button>
  );
}

function SidebarCategoryIcon({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-0.5 group cursor-pointer" onClick={onClick}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
        active 
          ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
          : 'bg-white/5 text-gray-400 border border-white/5 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20'
      }`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${active ? 'text-emerald-500' : 'text-gray-500 group-hover:text-white'}`}>
        {label}
      </span>
    </div>
  );
}

function CasinoHome({ user, setActiveTab, t }: { user: UserData, setActiveTab: (t: GameType) => void, t: any }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { title: "MEGA JACKPOT", desc: "Win up to $10,000", img: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=800" },
    { title: "ROYAL CASINO", desc: "Exclusive Rewards", img: "https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&q=80&w=800" },
    { title: "SLOT MANIA", desc: "Free Spins Daily", img: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=800" },
    { title: "POKER NIGHT", desc: "High Stakes Table", img: "https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&q=80&w=800" },
    { title: "DICE ROLL", desc: "Double Your Luck", img: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=800" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 md:space-y-6"
    >
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start">
        {/* Banner Slider (Reduced size and adjusted) */}
        <div className="w-full lg:w-[20%] aspect-video lg:aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden border border-white/10 relative group shadow-2xl flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
              <div className="absolute bottom-3 left-3 z-20">
                <h3 className="text-sm md:text-lg font-black tracking-tighter mb-0.5">{slides[currentSlide].title}</h3>
                <p className="text-emerald-500 font-bold uppercase tracking-widest text-[7px] md:text-[9px]">{slides[currentSlide].desc}</p>
              </div>
              <img 
                src={slides[currentSlide].img} 
                alt="Banner" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-2 right-3 z-30 flex gap-1">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`w-1 h-1 rounded-full transition-all ${i === currentSlide ? 'bg-emerald-500 w-2' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Game Grid (Adjusted to fill space) */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <GameThumbnail title="Roulette" img="https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&q=80&w=400" type="Casino" onClick={() => setActiveTab('roulette')} />
          <GameThumbnail title="Slots" img="https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=400" type="Slots" onClick={() => setActiveTab('slots')} />
          <GameThumbnail title="Poker" img="https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&q=80&w=400" type="Card" onClick={() => setActiveTab('game')} />
          <GameThumbnail title="Blackjack" img="https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=400" type="Table" onClick={() => setActiveTab('game')} />
          <GameThumbnail title="Dice" img="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400" type="Betting" onClick={() => setActiveTab('dice')} />
          <GameThumbnail title="Baccarat" img="https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&q=80&w=400" type="Casino" onClick={() => setActiveTab('game')} />
          <GameThumbnail title="Crash" img="https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=400" type="Fast" onClick={() => setActiveTab('crash')} />
          <GameThumbnail title="Spin" img="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400" type="Daily" onClick={() => setActiveTab('spin')} />
          <GameThumbnail title="7 Up Down" img="https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=400" type="Bet" onClick={() => setActiveTab('7updown')} />
          <GameThumbnail title="Bingo" img="https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&q=80&w=400" type="Fun" onClick={() => setActiveTab('game')} />
        </div>
      </div>

      {/* Quick Stats / Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat icon={<Zap className="text-yellow-500" />} label={t.active_players} value="1,248" />
        <QuickStat icon={<Trophy className="text-emerald-500" />} label={t.today_jackpot} value="$4,500" onClick={() => setActiveTab('tournament')} />
        <QuickStat icon={<Users className="text-blue-500" />} label={t.online_friends} value="12" />
        <QuickStat icon={<ShieldCheck className="text-purple-500" />} label={t.fair_play} value={t.verified} />
      </div>
    </motion.div>
  );
}

function QuickStat({ icon, label, value, onClick }: { icon: React.ReactNode, label: string, value: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 flex items-center gap-3 ${onClick ? 'cursor-pointer hover:bg-white/10 transition-all' : ''}`}
    >
      <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-lg flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, { size: 16 })}
      </div>
      <div>
        <div className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">{label}</div>
        <div className="text-xs md:text-sm font-black text-white">{value}</div>
      </div>
    </div>
  );
}

const GameThumbnail: React.FC<{ title: string, img: string, type: string, onClick: () => void }> = ({ title, img, type, onClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -3, scale: 1.02 }}
      onClick={onClick}
      className="bg-white/5 rounded-xl md:rounded-2xl overflow-hidden border border-white/5 group cursor-pointer shadow-lg"
    >
      <div className="aspect-square relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <button className="bg-emerald-500 text-black font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[6px] md:text-[8px] uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform">
            Play
          </button>
        </div>
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-1.5 left-1.5 z-20">
          <span className="bg-black/60 backdrop-blur-md text-[5px] md:text-[6px] font-black uppercase tracking-widest px-1 py-0.5 rounded-sm border border-white/10">
            {type}
          </span>
        </div>
      </div>
      <div className="p-1.5 md:p-2 text-center">
        <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter truncate text-gray-300 group-hover:text-white transition-colors">{title}</h4>
      </div>
    </motion.div>
  );
}

function OfferCard({ icon, title, desc, value }: { icon: React.ReactNode, title: string, desc: string, value: string }) {
  return (
    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h5 className="text-xs font-black uppercase tracking-widest text-white/90">{title}</h5>
          <p className="text-[10px] text-gray-500 font-medium">{desc}</p>
        </div>
      </div>
      <div className="text-xl font-black tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

function GameGrid({ category = 'game', setActiveTab, t }: { category?: string, setActiveTab: (t: GameType) => void, t: any }) { 
  const games = [
    { title: "Roulette", img: "https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&q=80&w=400", type: "Casino" },
    { title: "Slots", img: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400", type: "Slots" },
    { title: "Poker", img: "https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&q=80&w=400", type: "Card" },
    { title: "Blackjack", img: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=400", type: "Table" },
    { title: "Dice", img: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400", type: "Betting" },
    { title: "Crash", img: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=400", type: "Fast" },
    { title: "Spin", img: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400", type: "Daily" },
    { title: "7 Up Down", img: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=400", type: "Bet" },
  ];

  const filteredGames = games.filter(game => {
    if (category === 'game') return true;
    if (category === 'hot') return game.type === 'Fast' || game.type === 'Slots';
    if (category === 'trend') return game.type === 'Casino' || game.type === 'Card';
    if (category === 'love') return game.type === 'Daily' || game.type === 'Bet';
    if (category === 'bet') return game.type === 'Betting' || game.type === 'Bet';
    if (category === 'casino') return game.type === 'Casino' || game.type === 'Table';
    return true;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
        <LayoutGrid className="text-emerald-500" /> {t.games}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredGames.map((game, i) => (
          <GameThumbnail 
            key={i}
            title={game.title} 
            img={game.img} 
            type={game.type} 
            onClick={() => {
              if (game.title === 'Spin') setActiveTab('spin');
              else if (game.title === 'Crash') setActiveTab('crash');
              else if (game.title === '7 Up Down') setActiveTab('7updown');
              else if (game.title === 'Roulette') setActiveTab('roulette');
              else if (game.title === 'Dice') setActiveTab('7updown');
              else if (game.title === 'Slots') setActiveTab('slots');
              else if (game.title === 'Blackjack') setActiveTab('roulette');
              else if (game.title === 'Poker') setActiveTab('roulette');
              else setActiveTab('game');
            }} 
          />
        ))}
      </div>
    </div>
  ); 
}

function ProfileView({ user, setUser, logout, t }: { user: UserData, setUser: (u: UserData) => void, logout: () => void, t: any }) {
  if (!user) return null;
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser({ ...user, ...updatedUser });
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black uppercase tracking-widest text-emerald-500">User Profile</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-gray-400 font-bold text-sm">Account ID</span>
            <span className="text-emerald-500 font-mono font-black">#{user.numeric_id || '00000'}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-gray-400 font-bold text-sm">Email</span>
            <span className="text-white font-black">{user.email}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-gray-400 font-bold text-sm">Username</span>
            <span className="text-white font-black">{user.username}</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Full Name</label>
            {isEditing ? (
              <input 
                type="text" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-emerald-500/50"
              />
            ) : (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white font-black">{user.full_name || 'Not set'}</div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Phone Number</label>
            {isEditing ? (
              <input 
                type="text" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-emerald-500/50"
              />
            ) : (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white font-black">{user.phone || 'Not set'}</div>
            )}
          </div>

          {isEditing && (
            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        <button 
          onClick={logout}
          className="w-full mt-8 py-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500/5 transition-all"
        >
          Logout Account
        </button>
      </div>
    </motion.div>
  );
}

function ProfileItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
      <span className="text-gray-400 font-bold text-sm">{label}</span>
      <span className="text-white font-black">{value}</span>
    </div>
  );
}

function BalanceView({ user, setUser, t, showToast, setView, logout }: { user: UserData, setUser: (u: UserData) => void, t: any, showToast: (m: string, type?: any) => void, setView: (v: string) => void, logout: () => void }) { 
  if (!user) return null;
  const [mode, setMode] = useState<'view' | 'deposit' | 'withdraw'>('view');
  const [amount, setAmount] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bkash');
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await apiFetch('/api/user/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions');
    }
  }, []);

  useEffect(() => {
    if (mode === 'view') {
      fetchTransactions();
    }
  }, [mode, fetchTransactions]);

  const handleDeposit = async () => {
    if (!amount || !refNumber || !screenshot) {
      return showToast('Please fill all fields: Amount, Transaction ID, and Screenshot', 'error');
    }
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 10) {
      return showToast('Minimum deposit amount is $10', 'error');
    }

    setLoading(true);
    try {
      const session = await getActiveSession();
      if (!session) {
        showToast('Authentication session error. Please login again.', 'error');
        return setView('auth');
      }

      // 1. Upload screenshot to storage
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, screenshot);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        let errorMsg = 'Failed to upload screenshot. ';
        if (uploadError.message.includes('bucket not found')) {
          errorMsg += 'Bucket "screenshots" not found in Supabase Storage.';
        } else if (uploadError.message.includes('permission denied')) {
          errorMsg += 'Permission denied. Check storage RLS policies.';
        } else {
          errorMsg += uploadError.message;
        }
        return showToast(errorMsg, 'error');
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      console.log('Submitting deposit:', { depositAmount, transactionId: refNumber, screenshot: publicUrl, method: paymentMethod });
      const res = await apiFetch('/api/user/deposit', {
        method: 'POST',
        body: JSON.stringify({
          amount: depositAmount,
          transactionId: refNumber,
          screenshot: publicUrl,
          method: paymentMethod
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast('Deposit Request Submitted Successfully! Admin will review it soon.', 'success');
        setMode('view');
        setScreenshot(null);
        setAmount('');
        setRefNumber('');
        fetchTransactions();
      } else {
        showToast(data.error || 'Deposit failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !withdrawMethod || !withdrawDetails || !withdrawPassword) {
      return showToast('Please fill all fields: Method, Account Details, Amount, and Password', 'error');
    }
    
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 100) {
      return showToast('Minimum withdrawal amount is $100', 'error');
    }

    if (user.balance < withdrawAmount) {
      return showToast('Insufficient balance for this withdrawal', 'error');
    }

    setLoading(true);
    try {
      console.log('Submitting withdrawal:', { withdrawAmount, withdrawMethod, withdrawDetails });
      const res = await apiFetch('/api/user/withdraw', {
        method: 'POST',
        body: JSON.stringify({ 
          amount: withdrawAmount, 
          method: withdrawMethod, 
          details: withdrawDetails,
          password: withdrawPassword 
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, balance: data.newBalance });
        showToast('Withdrawal Request Submitted Successfully! It will be reviewed by our team.', 'success');
        setMode('view');
        setAmount('');
        setWithdrawPassword('');
        setWithdrawDetails('');
        fetchTransactions();
      } else {
        showToast(data.error || 'Withdrawal failed. Please check your password.', 'error');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/user/reset-demo', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, demo_balance: data.demo_balance });
        showToast('Demo balance reset to 1000!', 'success');
      } else {
        showToast(data.error || 'Failed to reset demo balance', 'error');
      }
    } catch (err) {
      console.error('Reset demo error:', err);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {mode === 'view' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-[2.5rem] text-black shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet size={80} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Real Balance</div>
              <div className="text-4xl font-black mb-6">${(user.balance ?? 0).toLocaleString()}</div>
              <div className="flex gap-2">
                <button onClick={() => setMode('deposit')} className="flex-1 bg-black text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/80 transition-all">
                  <PlusCircle size={14} /> {t.add_money}
                </button>
                <button onClick={() => setMode('withdraw')} className="flex-1 bg-white/20 backdrop-blur-md text-black font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/30 transition-all">
                  <Banknote size={14} /> {t.withdraw}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Gamepad2 size={80} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Demo Balance</div>
              <div className="text-4xl font-black mb-6">${(user.demo_balance ?? 0).toLocaleString()}</div>
              <div className="flex gap-2">
                <button 
                  onClick={handleResetDemo}
                  disabled={loading}
                  className="flex-1 bg-white/20 backdrop-blur-md text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  <RotateCcw size={14} className={loading ? 'animate-spin' : ''} /> Reset Balance
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <h3 className="text-lg font-bold mb-4">{t.history || 'Transaction History'}</h3>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-bold">No transaction history</div>
              ) : (
                transactions.map((t: any) => (
                  <TransactionItem 
                    key={t.id}
                    type={`${t.type.charAt(0).toUpperCase() + t.type.slice(1)} (${t.method})`} 
                    amount={t.amount} 
                    date={new Date(t.created_at).toLocaleString()} 
                    status={t.status === 'approved' ? 'Success' : t.status.charAt(0).toUpperCase() + t.status.slice(1)} 
                    description={t.description}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {mode === 'deposit' && (
        <div className="bg-[#1a1a1a] p-4 md:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{t.add_money}</h2>
            <button onClick={() => setMode('view')} className="text-gray-500 hover:text-white"><X /></button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.select_method}</label>
              <div className="grid grid-cols-3 gap-2">
                {['Bkash', 'Nagad', 'Rocket'].map(m => (
                  <button 
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-3 rounded-xl border font-bold text-sm transition-all ${paymentMethod === m ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <p className="text-xs text-emerald-500 font-bold mb-1 uppercase">Payment Details</p>
              <p className="text-sm font-mono">Send Money to: <span className="text-white font-black">+880 1700 000000</span></p>
              <p className="text-[10px] text-gray-500 mt-2 italic">Please use your username as reference.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">{t.amount}</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder="Enter Amount"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">{t.transaction_id || 'Transaction ID'}</label>
              <input 
                type="text" 
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder="Enter Transaction ID"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">{t.upload_screenshot}</label>
              {screenshot ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                  <img src={URL.createObjectURL(screenshot)} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setScreenshot(null)}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="w-full h-32 bg-[#2a2a2a] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-emerald-500/50 transition-all cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  />
                  <Download size={24} className="mb-2" />
                  <span className="text-[10px] font-bold uppercase">{t.select_file}</span>
                </label>
              )}
            </div>

            <button 
              onClick={handleDeposit}
              disabled={loading}
              className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? t.loading : t.submit}
            </button>
          </div>
        </div>
      )}

      {mode === 'withdraw' && (
        <div className="bg-[#1a1a1a] p-4 md:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{t.withdraw}</h2>
            <button onClick={() => setMode('view')} className="text-gray-500 hover:text-white"><X /></button>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">{t.select_method}</label>
              <select 
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 text-white"
              >
                <option value="">{t.select_method}</option>
                <option value="Bkash">Bkash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Payment Details (Account No)</label>
              <input 
                type="text" 
                value={withdrawDetails}
                onChange={(e) => setWithdrawDetails(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder="Enter Account Number"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">{t.amount}</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder="Enter Amount"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">{t.account_password || 'Account Password'}</label>
              <input 
                type="password" 
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                placeholder={t.enter_account_password || 'Enter Account Password'}
              />
            </div>

            <button 
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl shadow-lg shadow-yellow-500/20 disabled:opacity-50"
            >
              {loading ? t.loading : t.withdraw}
            </button>
          </div>
        </div>
      )}
    </div>
  ); 
}

const TransactionItem: React.FC<{ type: string, amount: number, date: string, status: string, description?: string }> = ({ type, amount, date, status, description }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {amount > 0 ? <PlusCircle size={20} /> : <Banknote size={20} />}
        </div>
        <div>
          <div className="font-black text-sm">{type}</div>
          <div className="text-[10px] text-gray-500">{date}</div>
          {description && <div className="text-[10px] text-gray-400 mt-1 italic">{description}</div>}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-black ${amount > 0 ? 'text-emerald-500' : 'text-white'}`}>
          {amount > 0 ? '+' : ''}{amount}
        </div>
        <div className={`text-[8px] font-black uppercase tracking-widest ${status === 'Success' ? 'text-emerald-500' : status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{status}</div>
      </div>
    </div>
  );
}

function ReferEarnView({ user, t, showToast }: { user: UserData, t: any, showToast: (msg: string, type?: 'success' | 'error') => void }) { 
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-8 rounded-[2.5rem] text-black text-center">
        <Gift size={64} className="mx-auto mb-4" />
        <h2 className="text-3xl font-black mb-2">Refer & Earn $50</h2>
        <p className="font-bold opacity-80 mb-6">Invite your friends and get a bonus for every signup!</p>
        <div className="bg-black/10 p-4 rounded-2xl border border-black/10 flex items-center justify-between">
          <span className="font-mono font-black">TUKTAK-REF-{user.id}</span>
          <button onClick={() => {
            navigator.clipboard.writeText(`TUKTAK-REF-${user.id}`);
            showToast('Code Copied!', 'success');
          }} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black">COPY</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
          <div className="text-3xl font-black text-emerald-500 mb-1">12</div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Refers</div>
        </div>
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
          <div className="text-3xl font-black text-yellow-500 mb-1">$600</div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Earned</div>
        </div>
      </div>
    </div>
  ); 
}

function NotificationView({ t }: { t: any }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiFetch('/api/user/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        // Mark as read
        apiFetch('/api/user/notifications/read', { method: 'POST' });
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
        <Bell className="text-emerald-500" /> {t.notifications}
      </h2>
      
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">{t.loading}</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/5 p-12 rounded-3xl border border-white/5 text-center">
            <Bell size={48} className="mx-auto mb-4 text-gray-700" />
            <div className="text-gray-500 font-bold">{t.no_notifications}</div>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`p-6 rounded-3xl border ${n.is_read ? 'bg-white/5 border-white/5' : 'bg-emerald-500/5 border-emerald-500/20'} transition-all`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-lg">{n.title}</h3>
                <span className="text-[10px] text-gray-500 font-mono">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function OffersView({ t, showToast }: { t: any, showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await apiFetch('/api/user/offers?type=offer');
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (err) {
      console.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleClaim = async (offerId: number) => {
    try {
      const res = await apiFetch('/api/user/claim-offer', {
        method: 'POST',
        body: JSON.stringify({ offerId })
      });
      if (res.ok) {
        showToast('Offer claimed successfully!', 'success');
        fetchOffers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Claim failed', 'error');
      }
    } catch (err) {
      showToast('Claim failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Tag className="text-emerald-500" /> Exclusive Offers
      </h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500">{t.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((o) => (
            <OfferItem 
              key={o.id}
              title={o.title} 
              desc={o.description} 
              amount={o.amount}
              isClaimed={o.isClaimed}
              onClaim={() => handleClaim(o.id)}
              color="from-purple-500 to-indigo-600" 
              t={t}
            />
          ))}
          {offers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">No active offers</div>
          )}
        </div>
      )}
    </div>
  );
}

function BonusView({ t, showToast }: { t: any, showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await apiFetch('/api/user/offers?type=bonus');
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (err) {
      console.error('Failed to fetch bonuses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleClaim = async (offerId: number) => {
    try {
      const res = await apiFetch('/api/user/claim-offer', {
        method: 'POST',
        body: JSON.stringify({ offerId })
      });
      if (res.ok) {
        showToast('Bonus claimed successfully!', 'success');
        fetchOffers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Claim failed', 'error');
      }
    } catch (err) {
      showToast('Claim failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Gift className="text-yellow-500" /> {t.bonus}
      </h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500">{t.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((o) => (
            <OfferItem 
              key={o.id}
              title={o.title} 
              desc={o.description} 
              amount={o.amount}
              isClaimed={o.isClaimed}
              onClaim={() => handleClaim(o.id)}
              color="from-emerald-500 to-teal-600" 
              t={t}
            />
          ))}
          {offers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">No active bonuses</div>
          )}
        </div>
      )}
    </div>
  );
}

function CashbackView({ t, showToast }: { t: any, showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await apiFetch('/api/user/offers?type=cashback');
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (err) {
      console.error('Failed to fetch cashback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleClaim = async (offerId: number) => {
    try {
      const res = await apiFetch('/api/user/claim-offer', {
        method: 'POST',
        body: JSON.stringify({ offerId })
      });
      if (res.ok) {
        showToast('Cashback claimed successfully!', 'success');
        fetchOffers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Claim failed', 'error');
      }
    } catch (err) {
      showToast('Claim failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Percent className="text-blue-500" /> {t.cashback}
      </h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500">{t.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((o) => (
            <OfferItem 
              key={o.id}
              title={o.title} 
              desc={o.description} 
              amount={o.amount}
              isClaimed={o.isClaimed}
              onClaim={() => handleClaim(o.id)}
              color="from-blue-500 to-blue-700" 
              t={t}
            />
          ))}
          {offers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">No active cashback</div>
          )}
        </div>
      )}
    </div>
  );
}

const OfferItem: React.FC<{ title: string, desc: string, amount: number, isClaimed: boolean, onClaim: () => void, color: string, t: any }> = ({ title, desc, amount, isClaimed, onClaim, color, t }) => {
  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-3xl text-white shadow-xl relative overflow-hidden`}>
      <div className="relative z-10">
        <h3 className="text-xl font-black mb-2">{title}</h3>
        <p className="text-sm font-medium opacity-90 mb-6">{desc}</p>
        <div className="flex items-center justify-between bg-black/20 p-3 rounded-2xl border border-white/10">
          <span className="font-mono font-black text-lg">${amount}</span>
          <button 
            onClick={onClaim}
            disabled={isClaimed}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${isClaimed ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-black hover:scale-105 active:scale-95'}`}
          >
            {isClaimed ? t.claimed : t.claim}
          </button>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Gift size={120} />
      </div>
    </div>
  );
}

function VIPView({ user, t }: { user: UserData, t: any }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400" />
        <Crown size={64} className="mx-auto mb-4 text-yellow-500" />
        <h2 className="text-3xl font-black mb-2">VIP Bronze Member</h2>
        <p className="text-gray-500 font-bold mb-6">Progress to Silver: 65%</p>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-yellow-500 w-[65%]" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">VIP Privileges</h3>
        <VIPBenefit icon={<Zap />} title="Faster Withdrawals" desc="Get your money in under 1 hour" />
        <VIPBenefit icon={<Percent />} title="Higher Cashback" desc="Enjoy 10% daily cashback" />
        <VIPBenefit icon={<Shield />} title="Personal Manager" desc="24/7 dedicated support agent" />
      </div>
    </div>
  );
}

function VIPBenefit({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <div>
        <div className="font-black text-sm">{title}</div>
        <div className="text-[10px] text-gray-500">{desc}</div>
      </div>
    </div>
  );
}

function HelpView({ t, setActiveTab }: { t: any, setActiveTab: (t: GameType) => void }) { 
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
        <HelpCircle className="text-emerald-500" /> {t.help}
      </h2>
      <p className="text-gray-500 font-bold">{t.support_desc}</p>
      
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => setActiveTab('livechat')}
          className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <div className="text-left">
            <div className="font-black text-lg">{t.live_chat}</div>
            <div className="text-xs text-gray-500">{t.live_chat_desc}</div>
          </div>
        </button>

        <button 
          onClick={() => window.location.href = 'mailto:manager@tuktak.com'}
          className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mail size={24} />
          </div>
          <div className="text-left">
            <div className="font-black text-lg">{t.email_support}</div>
            <div className="text-xs text-gray-500">manager@tuktak.com</div>
          </div>
        </button>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="text-yellow-500" /> {t.faq}
          </h3>
          <div className="space-y-4">
            <FAQItem question={t.faq_q1} answer={t.faq_a1} />
            <FAQItem question={t.faq_q2} answer={t.faq_a2} />
            <FAQItem question={t.faq_q3} answer={t.faq_a3} />
            <FAQItem question={t.faq_q4} answer={t.faq_a4} />
            <FAQItem question={t.faq_q5} answer={t.faq_a5} />
          </div>
        </div>
      </div>
    </div>
  ); 
}

function LiveChatView({ t, setActiveTab }: { t: any, setActiveTab: (t: GameType) => void }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: 'manager', time: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
    
    // Simulate manager response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Thank you for your message. A manager will be with you shortly.",
        sender: 'manager',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-[#111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-4 bg-emerald-500/10 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black">
            <User size={20} />
          </div>
          <div>
            <div className="font-black text-sm">Support Manager</div>
            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
            </div>
          </div>
        </div>
        <button onClick={() => setActiveTab('help')} className="p-2 hover:bg-white/5 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-emerald-500 text-black rounded-tr-none' : 'bg-white/5 text-white rounded-tl-none border border-white/10'}`}>
              {m.text}
              <div className={`text-[8px] mt-1 opacity-60 ${m.sender === 'user' ? 'text-black' : 'text-gray-400'}`}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm"
        />
        <button type="submit" className="bg-emerald-500 text-black p-2 rounded-xl hover:bg-emerald-600 transition-all">
          <ChevronRight size={20} />
        </button>
      </form>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 pb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left font-bold text-sm hover:text-emerald-500 transition-colors"
      >
        {question}
        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.p 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-xs text-gray-500 mt-2 overflow-hidden"
          >
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function HelpCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer">
      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <div>
        <h4 className="font-black text-white">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

function SettingsView({ user, setUser, t, logout, showToast }: { user: UserData, setUser: (u: UserData) => void, t: any, logout: () => void, showToast: (m: string, type?: any) => void }) { 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const updateLanguage = async (lang: string) => {
    try {
      apiFetch('/api/user/update-language', {
        method: 'POST',
        body: JSON.stringify({ language: lang }),
      });
      setUser({ ...user, language: lang });
      showToast('Language updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update language', 'error');
    }
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword) return showToast('Please fill both current and new password fields', 'error');
    if (newPassword.length < 6) return showToast('New password must be at least 6 characters long', 'error');
    if (currentPassword === newPassword) return showToast('New password cannot be the same as current password', 'error');
    
    const session = await getActiveSession();
    if (!session) {
      showToast('Authentication session error. Please login again.', 'error');
      return logout();
    }

    setLoading(true);
    try {
      console.log('Updating account password...');
      const res = await apiFetch('/api/user/update-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password updated successfully! You will now be logged out. Please login with your new password.', 'success');
        setTimeout(logout, 2000);
      } else {
        showToast(data.error || 'Failed to update password. Please check your current password.', 'error');
      }
    } catch (err) {
      console.error('Password update error:', err);
      showToast('Network error while updating password. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
        <Settings className="text-emerald-500" /> {t.settings}
      </h2>

      <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="text-emerald-500" /> {t.account_info}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t.username}</span>
              <span className="font-bold">{user.username}</span>
            </div>
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t.email}</span>
              <span className="font-bold">{user.email || 'Not set'}</span>
            </div>
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t.phone}</span>
              <span className="font-bold">{user.phone || 'Not set'}</span>
            </div>
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t.role}</span>
              <span className="font-bold uppercase text-emerald-500">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-white/5" />

        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="text-blue-500" /> {t.language}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => updateLanguage('en')}
              className={`p-4 rounded-2xl border font-bold transition-all ${user?.language === 'en' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              {t.english}
            </button>
            <button 
              onClick={() => updateLanguage('bn')}
              className={`p-4 rounded-2xl border font-bold transition-all ${user?.language === 'bn' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              {t.bangla}
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-white/5" />

        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" /> {t.change_password}
          </h3>
          <input 
            type="password" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t.current_password}
            className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t.new_password}
            className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
          <button 
            onClick={updatePassword}
            disabled={loading}
            className="w-full bg-emerald-500 text-black font-black py-3 rounded-xl disabled:opacity-50"
          >
            {t.update_password}
          </button>
        </div>
      </div>
    </div>
  ); 
}

function SettingToggle({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-bold text-gray-300">{label}</span>
      <div className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

// --- Game Helper Components ---
function useGameStatus(gameName: string) {
  const [status, setStatus] = useState<{ roundId: number, timeLeft: number, history: any[] }>({ roundId: 0, timeLeft: 0, history: [] });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiFetch(`/api/game/status/${gameName}`);
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch game status', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [gameName]);

  return status;
}

function GameTimer({ timeLeft, roundId }: { timeLeft: number, roundId: number }) {
  return (
    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Next Round</p>
          <p className="text-lg font-black font-mono">#{roundId + 1}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Time Left</p>
        <p className={`text-2xl font-black font-mono ${(timeLeft ?? 0) <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          00:{(timeLeft ?? 0).toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

function GameHistoryList({ history }: { history: any[] }) {
  if (!history || history.length === 0) return null;
  
  return (
    <div className="space-y-3 mt-8">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
        <History size={14} /> Recent Results
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {history.map((h, i) => {
          let data: any = {};
          try {
            data = typeof h.result_data === 'string' ? JSON.parse(h.result_data) : (h.result_data || {});
          } catch (e) {
            console.error('Failed to parse result_data', e);
          }
          
          let display = '';
          let color = 'bg-white/5';
          
          if (h.game_name === 'spin') {
            display = `${data.multiplier ?? 0}x`;
            color = (data.multiplier ?? 0) > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500';
          } else if (h.game_name === '7updown') {
            display = data.total ?? '?';
            color = (data.total ?? 0) < 7 ? 'bg-blue-500/20 text-blue-500' : (data.total ?? 0) > 7 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500';
          } else if (h.game_name === 'crash') {
            display = `${(data.crashPoint ?? 0).toFixed(2)}x`;
            color = (data.crashPoint ?? 0) > 2 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500';
          } else if (h.game_name === 'roulette') {
            display = data.number ?? '?';
            color = data.color === 'red' ? 'bg-red-500/20 text-red-500' : data.color === 'black' ? 'bg-gray-800/50 text-gray-400' : 'bg-emerald-500/20 text-emerald-500';
          }
          
          return (
            <div key={i} className={`min-w-[50px] h-10 rounded-xl flex items-center justify-center font-black text-sm border border-white/5 ${color}`}>
              {display}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Spin Game ---
interface SlotReelProps {
  symbols: string[];
  spinning: boolean;
  delay: number;
}

const SlotReel: React.FC<SlotReelProps> = ({ symbols, spinning, delay }) => {
  const allSymbols = ['🍒', '💎', '🔔', '⭐', '7️⃣'];
  
  return (
    <div className="h-[300px] md:h-[450px] bg-black/60 rounded-3xl border-2 border-white/5 overflow-hidden relative shadow-inner">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent z-10" />
      
      <motion.div 
        animate={spinning ? { 
          y: [-1000, 0],
        } : { 
          y: 0 
        }}
        transition={spinning ? { 
          repeat: Infinity, 
          duration: 0.5, 
          ease: "linear",
          delay: delay
        } : { 
          type: "spring", 
          stiffness: 100, 
          damping: 15 
        }}
        className="flex flex-col items-center"
      >
        {/* Duplicate symbols for seamless loop during spin */}
        {(spinning ? [...allSymbols, ...allSymbols, ...allSymbols] : symbols).map((symbol, idx) => (
          <div 
            key={idx} 
            className="h-[100px] md:h-[150px] flex items-center justify-center text-5xl md:text-7xl select-none filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          >
            {symbol}
          </div>
        ))}
      </motion.div>
      
      {/* Motion Blur Effect Overlay */}
      {spinning && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none" />
      )}
    </div>
  );
}

function SlotMachine({ user, setUser, t }: { user: UserData, setUser: (u: UserData) => void, t: any }) {
  const [betAmount, setBetAmount] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['🍒', '💎', '🔔'],
    ['🔔', '🍒', '⭐'],
    ['7️⃣', '💎', '🍒'],
    ['⭐', '🔔', '💎'],
    ['💎', '7️⃣', '⭐']
  ]);
  const [winResult, setWinResult] = useState<{ totalWin: number, winningLines: any[] } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const symbols = ['🍒', '💎', '🔔', '⭐', '7️⃣'];

  const handleSpin = async () => {
    if (spinning || betAmount <= 0 || (user.game_mode === 'demo' ? (user.demo_balance ?? 0) : user.balance) < betAmount) {
      if ((user.game_mode === 'demo' ? (user.demo_balance ?? 0) : user.balance) < betAmount) {
        toast.error('Insufficient balance');
      }
      return;
    }

    setSpinning(true);
    setWinResult(null);

    try {
      const res = await apiFetch('/api/game/slots/spin', {
        method: 'POST',
        body: JSON.stringify({ betAmount })
      });
      const data = await res.json();

      if (data.success) {
        // Update user balance immediately for the bet
        const isDemo = user.game_mode === 'demo';
        const currentBalance = isDemo ? (user.demo_balance ?? 0) : user.balance;
        setUser({ 
          ...user, 
          [isDemo ? 'demo_balance' : 'balance']: currentBalance - betAmount 
        });

        // Sequential stop animation
        setTimeout(() => {
          setReels(data.grid);
          setSpinning(false);
          setWinResult({ totalWin: data.totalWin, winningLines: data.winningLines });
          
          // Update balance with win
          setUser({ 
            ...user, 
            [isDemo ? 'demo_balance' : 'balance']: data.newBalance 
          });

          // Add to history
          setHistory(prev => [{
            id: Date.now(),
            betAmount,
            winAmount: data.totalWin,
            result: data.totalWin > 0 ? 'won' : 'lost',
            time: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 10));

          if (data.totalWin > 0) {
            toast.success(`YOU WIN $${data.totalWin.toLocaleString()}!`, {
              position: "top-center",
              autoClose: 5000,
              theme: "colored"
            });
          }
        }, 2000);
      } else {
        setSpinning(false);
        toast.error(data.error || 'Spin failed');
      }
    } catch (err) {
      setSpinning(false);
      toast.error('Connection error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Slot Machine Header */}
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap className="text-black" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Neon Slots</h2>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Premium Casino</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Win</div>
            <div className="text-xl font-mono font-black text-emerald-500">${winResult?.totalWin.toLocaleString() || '0.00'}</div>
          </div>
        </div>
      </div>

      {/* Slot Machine Reels Container */}
      <div className="relative bg-[#0a0a0a] p-4 md:p-8 rounded-[3rem] border-4 border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
        {/* Neon Glow Effects */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-600/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 grid grid-cols-5 gap-2 md:gap-4">
          {reels.map((reel, i) => (
            <SlotReel key={i} symbols={reel} spinning={spinning} delay={i * 0.2} />
          ))}
        </div>

        {/* Win Overlay */}
        <AnimatePresence>
          {winResult && winResult.totalWin > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-emerald-500/20 backdrop-blur-md border-2 border-emerald-500/50 px-12 py-6 rounded-[3rem] shadow-[0_0_50px_rgba(16,185,129,0.5)] text-center">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl"
                >
                  WINNER!
                </motion.div>
                <div className="text-2xl md:text-4xl font-mono font-black text-emerald-400 mt-2">
                  +${winResult.totalWin.toLocaleString()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Select Bet</label>
                <span className="text-xs font-bold text-emerald-500">20 Paylines Active</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    disabled={spinning}
                    className={`py-3 rounded-2xl font-black transition-all border ${
                      betAmount === amt 
                        ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="number" 
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                  disabled={spinning}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-mono font-black text-xl focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSpin}
              disabled={spinning || betAmount <= 0}
              className={`w-full md:w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2 shadow-2xl transition-all relative overflow-hidden group ${
                spinning 
                  ? 'bg-gray-800 cursor-not-allowed' 
                  : 'bg-gradient-to-tr from-emerald-600 to-emerald-400 hover:shadow-emerald-500/40'
              }`}
            >
              {spinning ? (
                <RotateCw className="text-white/20 animate-spin" size={48} />
              ) : (
                <>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Play className="text-black relative z-10" size={48} fill="currentColor" />
                  <span className="text-black font-black text-xl tracking-tighter relative z-10">SPIN</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock size={16} /> Recent Spins
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-600 font-bold italic">No spins yet</div>
            ) : (
              history.map(item => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5"
                >
                  <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase">{item.time}</div>
                    <div className="text-xs font-bold text-gray-300">Bet: ${item.betAmount}</div>
                  </div>
                  <div className={`font-mono font-black ${item.winAmount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.winAmount > 0 ? `+$${item.winAmount}` : '-$'+item.betAmount}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SpinGame({ user, setUser, t }: { user: UserData, setUser: (u: UserData) => void, t: any }) {
  const [betAmount, setBetAmount] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ multiplier: number, winAmount: number } | null>(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [lastProcessedRound, setLastProcessedRound] = useState(0);
  
  const { roundId, timeLeft, history } = useGameStatus('spin');

  useEffect(() => {
    // If round changed and we had a bet, fetch result
    if (roundId > lastProcessedRound && betPlaced) {
      const fetchResult = async () => {
        try {
          const res = await apiFetch(`/api/game/result/spin/${roundId - 1}`);
          const data = await res.json();
          
          if (!data.result) {
            setBetPlaced(false);
            setLastProcessedRound(roundId);
            return;
          }
          
          setSpinning(true);
          setResult(null);
          
          // Simulate spin animation delay
          setTimeout(() => {
            setSpinning(false);
            setResult({ multiplier: data.result.multiplier, winAmount: data.bet?.winAmount || 0 });
            setUser({ ...user, balance: data.newBalance });
            setBetPlaced(false);
            setLastProcessedRound(roundId);
          }, 2000);
        } catch (err) {
          console.error('Failed to fetch result', err);
        }
      };
      fetchResult();
    } else if (roundId > lastProcessedRound) {
      setLastProcessedRound(roundId);
      setResult(null);
    }
  }, [roundId, betPlaced, lastProcessedRound, user, setUser]);

  const handleBet = async () => {
    if (betAmount <= 0 || betAmount > user.balance || betPlaced || timeLeft <= 5) return;

    try {
      const res = await apiFetch('/api/game/place-bet', {
        method: 'POST',
        body: JSON.stringify({ gameName: 'spin', amount: betAmount, betData: {} }),
      });
      const data = await res.json();
      if (data.success) {
        setBetPlaced(true);
        setUser({ ...user, balance: data.newBalance });
      }
    } catch (err) {
      console.error('Failed to place bet', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1a1a1a] p-4 md:p-8 rounded-3xl border border-white/5"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <RotateCw className="text-purple-500" /> Spin Wheel
        </h2>
        <div className="bg-purple-500/10 px-4 py-1 rounded-full text-purple-500 text-sm font-bold">
          Max Win: 10x
        </div>
      </div>

      <GameTimer timeLeft={timeLeft} roundId={roundId} />

      <div className="flex flex-col items-center gap-12">
        <div className="relative w-64 h-64">
          <motion.div 
            animate={spinning ? { rotate: 3600 } : { rotate: 0 }}
            transition={{ duration: 2, ease: "circOut" }}
            className="w-full h-full rounded-full border-8 border-[#2a2a2a] relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 shadow-2xl"
          >
            {/* Visual segments */}
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 left-1/2 w-1 h-1/2 bg-white/10 origin-bottom"
                style={{ transform: `translateX(-50%) rotate(${i * 36}deg)` }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full" />
              </div>
            </div>
          </motion.div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-emerald-500 z-10" />
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Bet Amount</label>
            <div className="flex gap-2">
              {[10, 50, 100, 500].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  disabled={betPlaced || timeLeft <= 5}
                  className={`flex-1 py-2 rounded-xl border transition-all ${betAmount === amt ? 'bg-purple-500 border-purple-500 text-white' : 'bg-[#2a2a2a] border-white/5 text-gray-400 hover:border-white/20'} disabled:opacity-50`}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <input 
              type="number" 
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={betPlaced || timeLeft <= 5}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
          </div>

          <button 
            onClick={handleBet}
            disabled={spinning || betAmount <= 0 || betAmount > user.balance || betPlaced || timeLeft <= 5}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-xl shadow-lg shadow-purple-500/20 transition-all"
          >
            {betPlaced ? 'BET PLACED (WAITING...)' : timeLeft <= 5 ? 'BETTING CLOSED' : 'PLACE BET'}
          </button>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-center font-bold text-xl ${result.multiplier > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}
              >
                {result.multiplier > 0 
                  ? `YOU WON ${(result.winAmount ?? 0).toLocaleString()} (${result.multiplier}x)!` 
                  : 'BETTER LUCK NEXT TIME!'}
              </motion.div>
            )}
          </AnimatePresence>

          <GameHistoryList history={history} />
        </div>
      </div>
    </motion.div>
  );
}

// --- 7 Up Down Game ---
function SevenUpDown({ user, setUser, t }: { user: UserData, setUser: (u: UserData) => void, t: any }) {
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState<'up' | 'down' | '7'>('up');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ dice1: number, dice2: number, total: number, winAmount: number } | null>(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [lastProcessedRound, setLastProcessedRound] = useState(0);

  const { roundId, timeLeft, history } = useGameStatus('7updown');

  useEffect(() => {
    if (roundId > lastProcessedRound && betPlaced) {
      const fetchResult = async () => {
        try {
          const res = await apiFetch(`/api/game/result/7updown/${roundId - 1}`);
          const data = await res.json();
          
          if (!data.result) {
            setBetPlaced(false);
            setLastProcessedRound(roundId);
            return;
          }
          
          setRolling(true);
          setResult(null);
          
          setTimeout(() => {
            setRolling(false);
            setResult({ 
              dice1: data.result.dice1, 
              dice2: data.result.dice2, 
              total: data.result.total,
              winAmount: data.bet?.winAmount || 0 
            });
            setUser({ ...user, balance: data.newBalance });
            setBetPlaced(false);
            setLastProcessedRound(roundId);
          }, 2000);
        } catch (err) {
          console.error('Failed to fetch result', err);
        }
      };
      fetchResult();
    } else if (roundId > lastProcessedRound) {
      setLastProcessedRound(roundId);
      setResult(null);
    }
  }, [roundId, betPlaced, lastProcessedRound, user, setUser]);

  const handleBet = async () => {
    if (betAmount <= 0 || betAmount > user.balance || betPlaced || timeLeft <= 5) return;

    try {
      const res = await apiFetch('/api/game/place-bet', {
        method: 'POST',
        body: JSON.stringify({ gameName: '7updown', amount: betAmount, betData: { choice } }),
      });
      const data = await res.json();
      if (data.success) {
        setBetPlaced(true);
        setUser({ ...user, balance: data.newBalance });
      }
    } catch (err) {
      console.error('Failed to place bet', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1a1a1a] p-4 md:p-8 rounded-3xl border border-white/5"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Dice5 className="text-orange-500" /> 7 Up Down
        </h2>
        <div className="bg-orange-500/10 px-4 py-1 rounded-full text-orange-500 text-sm font-bold">
          7 Wins 5x!
        </div>
      </div>

      <GameTimer timeLeft={timeLeft} roundId={roundId} />

      <div className="flex flex-col items-center gap-12">
        <div className="flex gap-8">
          <Dice value={result?.dice1 || 1} rolling={rolling} />
          <Dice value={result?.dice2 || 6} rolling={rolling} />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <ChoiceButton 
              label="2-6 (Down)" 
              active={choice === 'down'} 
              onClick={() => !betPlaced && setChoice('down')} 
              multiplier="2x"
              color="border-blue-500 text-blue-500"
              disabled={betPlaced || timeLeft <= 5}
            />
            <ChoiceButton 
              label="7 (Lucky)" 
              active={choice === '7'} 
              onClick={() => !betPlaced && setChoice('7')} 
              multiplier="5x"
              color="border-orange-500 text-orange-500"
              disabled={betPlaced || timeLeft <= 5}
            />
            <ChoiceButton 
              label="8-12 (Up)" 
              active={choice === 'up'} 
              onClick={() => !betPlaced && setChoice('up')} 
              multiplier="2x"
              color="border-emerald-500 text-emerald-500"
              disabled={betPlaced || timeLeft <= 5}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Bet Amount</label>
              <input 
                type="number" 
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={betPlaced || timeLeft <= 5}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 disabled:opacity-50"
              />
            </div>

            <button 
              onClick={handleBet}
              disabled={rolling || betAmount <= 0 || betAmount > user.balance || betPlaced || timeLeft <= 5}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-xl shadow-lg shadow-orange-500/20 transition-all"
            >
              {betPlaced ? 'BET PLACED (WAITING...)' : timeLeft <= 5 ? 'BETTING CLOSED' : 'PLACE BET'}
            </button>
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl text-center border ${result.winAmount > 0 ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}
            >
              <div className="text-sm uppercase tracking-widest mb-1">Total Result</div>
              <div className="text-4xl font-black mb-2">{result.total}</div>
              <div className="font-bold">
                {result.winAmount > 0 ? `WON ${result.winAmount.toLocaleString()}` : 'LOST BET'}
              </div>
            </motion.div>
          )}

          <GameHistoryList history={history} />
        </div>
      </div>
    </motion.div>
  );
}

function Dice({ value, rolling }: { value: number, rolling: boolean }) {
  return (
    <motion.div 
      animate={rolling ? { rotate: [0, 90, 180, 270, 360], x: [0, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
      className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-gray-200"
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-12 h-12">
        {/* Simplified dice dots logic */}
        {[...Array(9)].map((_, i) => {
          const show = (
            (value === 1 && i === 4) ||
            (value === 2 && (i === 0 || i === 8)) ||
            (value === 3 && (i === 0 || i === 4 || i === 8)) ||
            (value === 4 && (i === 0 || i === 2 || i === 6 || i === 8)) ||
            (value === 5 && (i === 0 || i === 2 || i === 4 || i === 6 || i === 8)) ||
            (value === 6 && (i === 0 || i === 2 || i === 3 || i === 5 || i === 6 || i === 8))
          );
          return <div key={i} className={`w-2.5 h-2.5 rounded-full ${show ? 'bg-black' : 'bg-transparent'}`} />;
        })}
      </div>
    </motion.div>
  );
}

function ChoiceButton({ label, active, onClick, multiplier, color, disabled }: { label: string, active: boolean, onClick: () => void, multiplier: string, color: string, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all disabled:opacity-50 ${active ? `${color} bg-white/5` : 'border-white/5 text-gray-500 hover:border-white/20'}`}
    >
      <span className="text-xs font-black uppercase tracking-tighter mb-1">{label}</span>
      <span className="text-xl font-black">{multiplier}</span>
    </button>
  );
}

// --- Game History ---
function GameHistory({ t }: { t: any }) {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiFetch('/api/user/history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('History error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
        <History className="text-emerald-500" /> Game History
      </h2>

      <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-6 py-4">Game</th>
                <th className="px-6 py-4">Bet Amount</th>
                <th className="px-6 py-4">Win Amount</th>
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading history...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No games played yet.</td></tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black text-sm capitalize">{item.game_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-400">${(item.bet_amount ?? 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-mono text-sm ${item.win_amount > 0 ? 'text-emerald-500' : 'text-gray-500'}`}>
                        ${(item.win_amount ?? 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                        item.result === 'win' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {item.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Dashboard Components ---

function DashboardWrapper({ title, icon, color, children, sidebarItems, activeSubTab, setActiveSubTab, themeColor, logout, onLogoClick }: any) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh] pb-20 relative font-mono">
      {/* Technical Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        {/* Scanning Line Effect */}
        <motion.div 
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"
        />
      </div>

      {/* Dashboard Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 flex flex-col gap-2 h-fit relative z-10 shadow-2xl">
        <Logo className="mb-8 px-2" onClick={onLogoClick} />
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className={`${themeColor} p-2.5 rounded-xl bg-white/5 border border-white/10 shadow-lg shadow-current/10`}>{icon}</div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{title}</h2>
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Management Console</div>
          </div>
        </div>
        <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible scrollbar-hide pb-2 lg:pb-0">
          {sidebarItems.map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveSubTab(item.id);
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider whitespace-nowrap shrink-0 lg:shrink border ${
                activeSubTab === item.id 
                  ? `${themeColor} bg-white/10 border-white/20 shadow-xl` 
                  : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={activeSubTab === item.id ? themeColor : 'text-gray-600'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 hidden lg:block">
          <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">System Health</div>
          <div className="space-y-3 px-2">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold text-gray-500 uppercase">Database</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase">Optimal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold text-gray-500 uppercase">Network</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase">9ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold text-gray-500 uppercase">Security</span>
              <span className="text-[8px] font-black text-blue-500 uppercase">Encrypted</span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Dashboard Content */}
      <div className="flex-1 space-y-6 relative z-10">
        {/* Top Navbar */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Terminal size={14} className="text-gray-600" />
              CORE <span className="text-gray-700">/</span> <span className="text-white">{title}</span> <span className="text-gray-700">/</span> <span className={themeColor}>{activeSubTab}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-black/20 rounded-xl border border-white/5">
              <div className="text-right">
                <div className="text-[9px] font-black text-white uppercase tracking-widest leading-none mb-1">Live Feed</div>
                <div className="text-[7px] font-bold text-emerald-500 uppercase flex items-center gap-1 justify-end">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Synchronized
                </div>
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, color, trend, trendColor }: any) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex justify-between items-start mb-6">
        <div className={`${color} p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg shadow-current/5`}>{icon}</div>
        {trend && (
          <div className={`text-[9px] font-black ${trendColor} bg-white/5 px-2 py-1 rounded-lg border border-white/10 tracking-tighter`}>
            {trend}
          </div>
        )}
      </div>
      <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</div>
      <div className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</div>
    </div>
  );
}

// --- Admin Panel (Gold) ---
function AdminPanel({ t, logout, setActiveTab, onLogoClick }: { t: any, logout: () => void, setActiveTab: (t: GameType) => void, onLogoClick?: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [bonusForm, setBonusForm] = useState({ amount: '', category: 'Daily Login Bonus', target: 'all' });
  const [adjustmentForm, setAdjustmentForm] = useState<{ [key: string]: { amount: string, reason: string } }>({});

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'User Control', icon: <Users size={18} /> },
    { id: 'coins', label: 'Coin Control', icon: <Coins size={18} /> },
    { id: 'vip', label: 'VIP Control', icon: <Crown size={18} /> },
    { id: 'bonus', label: 'Bonus Control', icon: <Gift size={18} /> },
    { id: 'games', label: 'Game Control', icon: <Gamepad2 size={18} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={18} /> },
    { id: 'logs', label: 'All Logs', icon: <FileText size={18} /> },
    { id: 'user_panel', label: 'User Panel', icon: <Home size={18} />, action: () => setActiveTab('home') },
  ];

  const ADMIN_PATH = '/api/secure-admin-portal-9271';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, settingsRes, logsRes] = await Promise.all([
        apiFetch(`${ADMIN_PATH}/stats`),
        apiFetch(`${ADMIN_PATH}/users`),
        apiFetch(`${ADMIN_PATH}/settings`),
        apiFetch(`${ADMIN_PATH}/logs`)
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      const res = await apiFetch(`${ADMIN_PATH}/users/${userId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success('User updated successfully');
        fetchData();
        setEditingUser(null);
      }
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleAdjustBalance = async (userId: string) => {
    const form = adjustmentForm[userId];
    if (!form || !form.amount) return;
    try {
      const res = await apiFetch(`${ADMIN_PATH}/user/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: Number(form.amount), reason: form.reason })
      });
      if (res.ok) {
        toast.success('Balance adjusted');
        fetchData();
        setAdjustmentForm(prev => ({ ...prev, [userId]: { amount: '', reason: '' } }));
      }
    } catch (err) {
      toast.error('Adjustment failed');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const res = await apiFetch(`${ADMIN_PATH}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleDistributeBonus = async () => {
    if (!bonusForm.amount) return;
    try {
      const res = await apiFetch(`${ADMIN_PATH}/bonus/distribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bonusForm, amount: Number(bonusForm.amount) })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Bonus distributed to ${data.distributedCount} users`);
        fetchData();
      }
    } catch (err) {
      toast.error('Distribution failed');
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-amber-500 animate-pulse">INITIALIZING SECURE CORE...</div>;

  return (
    <DashboardWrapper 
      title="Root Admin" 
      icon={<ShieldCheck size={24} />} 
      color="text-amber-500" 
      themeColor="text-amber-500"
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      sidebarItems={sidebarItems}
      logout={logout}
      onLogoClick={onLogoClick}
    >
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-amber-500 uppercase tracking-widest mb-6">Edit System User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Username</label>
                <input 
                  type="text" 
                  value={editingUser.username} 
                  onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Access Level</label>
                <select 
                  value={editingUser.role} 
                  onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-amber-500/50 uppercase tracking-widest"
                >
                  <option value="user">USER</option>
                  <option value="subadmin">SUB-ADMIN</option>
                  <option value="admin">ROOT ADMIN</option>
                  <option value="finance">FINANCE MANAGER</option>
                  <option value="game">GAME MANAGER</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Account Status</label>
                <select 
                  value={editingUser.status || 'active'} 
                  onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-amber-500/50 uppercase tracking-widest"
                >
                  <option value="active">ACTIVE</option>
                  <option value="blocked">BLOCKED</option>
                  <option value="suspended">SUSPENDED</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => handleUpdateUser(editingUser.id, editingUser)} className="flex-1 py-3 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">Commit Changes</button>
            </div>
          </motion.div>
        </div>
      )}

      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Total Users" value={stats?.totalUsers?.count ?? 0} icon={<Users />} color="text-amber-500" trend="+12%" trendColor="text-emerald-500" />
            <DashboardCard title="Total Coins" value={`$${(stats?.totalBets?.sum ?? 0).toLocaleString()}`} icon={<Coins />} color="text-amber-500" />
            <DashboardCard title="Total Spins" value="45.2k" icon={<RotateCw />} color="text-amber-500" trend="+5.4k" trendColor="text-emerald-500" />
            <DashboardCard title="Active Users" value="1,284" icon={<Activity />} color="text-emerald-500" trend="LIVE" trendColor="text-emerald-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-gray-400">
                <BarChart3 className="text-amber-500" size={18} /> Revenue Analytics
              </h3>
              <div className="h-48 flex items-end gap-3 px-4">
                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg shadow-lg shadow-amber-500/10"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6 text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] px-4">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-gray-400">
                <PieChart className="text-amber-500" size={18} /> Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Slot Games', val: '65%', color: 'bg-amber-500' },
                  { label: 'Live Casino', val: '25%', color: 'bg-emerald-500' },
                  { label: 'Others', val: '10%', color: 'bg-blue-500' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color} shadow-lg shadow-current/20`} />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                    </div>
                    <span className="font-black text-white text-xs tabular-nums">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">User Management</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <input type="text" placeholder="SEARCH SYSTEM..." className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/50 w-64 placeholder:text-gray-700" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] bg-black/20">
                  <th className="px-8 py-5">Identified User</th>
                  <th className="px-8 py-5">Access Level</th>
                  <th className="px-8 py-5">Credit Balance</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10 text-amber-500 font-black text-xs">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-white text-xs uppercase tracking-tight">{u.username}</div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-tighter">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${u.role === 'admin' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' : 'bg-blue-500/5 border-blue-500/20 text-blue-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono text-amber-500 font-black text-xs">${(u.balance ?? 0).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingUser(u)}
                          className="p-2 hover:bg-amber-500/10 rounded-lg text-amber-500 transition-colors border border-transparent hover:border-amber-500/20"
                        >
                          <Settings size={14} />
                        </button>
                        <button 
                          onClick={() => handleUpdateUser(u.id, { status: 'blocked' })}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'coins' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">Coin Control</h3>
            <div className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Manual Balance Adjustment</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] bg-black/20">
                  <th className="px-8 py-5">Identified User</th>
                  <th className="px-8 py-5">Current Credit</th>
                  <th className="px-8 py-5 text-right">Adjustment Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-black text-white text-xs uppercase tracking-tight">{u.username}</div>
                      <div className="text-[9px] text-gray-600 font-mono tracking-tighter">{u.email}</div>
                    </td>
                    <td className="px-8 py-5 font-mono text-amber-500 font-black text-xs">${(u.balance ?? 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={adjustmentForm[u.id]?.amount || ''}
                          onChange={e => setAdjustmentForm(prev => ({ ...prev, [u.id]: { ...prev[u.id], amount: e.target.value } }))}
                          className="w-24 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase focus:outline-none focus:border-amber-500/50 placeholder:text-gray-700" 
                        />
                        <input 
                          type="text" 
                          placeholder="Reason" 
                          value={adjustmentForm[u.id]?.reason || ''}
                          onChange={e => setAdjustmentForm(prev => ({ ...prev, [u.id]: { ...prev[u.id], reason: e.target.value } }))}
                          className="w-32 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase focus:outline-none focus:border-amber-500/50 placeholder:text-gray-700" 
                        />
                        <button 
                          onClick={() => handleAdjustBalance(u.id)}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                        >
                          Execute
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'vip' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">VIP Management</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {users.slice(0, 6).map(u => (
              <div key={u.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-amber-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10 group-hover:bg-amber-500/10 transition-colors">
                    <Crown size={22} />
                  </div>
                  <div>
                    <div className="font-black text-white text-xs uppercase tracking-tight">{u.username}</div>
                    <div className="text-[8px] text-gray-600 uppercase font-black tracking-widest">VIP Level: {u.vip_level || 0}</div>
                  </div>
                </div>
                <select 
                  value={u.vip_level || 0}
                  onChange={(e) => handleUpdateUser(u.id, { vip_level: Number(e.target.value) })}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-black text-amber-500 focus:outline-none uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {[0, 1, 2, 3, 4, 5].map(lvl => (
                    <option key={lvl} value={lvl}>LVL {lvl}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'bonus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-gray-400">
              <Gift className="text-amber-500" size={18} /> Distribution Hub
            </h3>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">Bonus Category</label>
                  <select 
                    value={bonusForm.category}
                    onChange={e => setBonusForm({...bonusForm, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                  >
                    <option>Daily Login Bonus</option>
                    <option>VIP Weekly Reward</option>
                    <option>Event Special</option>
                    <option>System Compensation</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">Amount (USD)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={bonusForm.amount}
                    onChange={e => setBonusForm({...bonusForm, amount: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/50 placeholder:text-gray-700" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">Target Segment</label>
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'All Users' },
                    { id: 'vip', label: 'VIP Only' },
                    { id: 'active', label: 'Active Today' }
                  ].map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => setBonusForm({...bonusForm, target: t.id})}
                      className={`flex-1 py-3 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${bonusForm.target === t.id ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleDistributeBonus}
                className="w-full bg-amber-500 text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-xs shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Execute Global Distribution
              </button>
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-gray-400">Recent Operations</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-5 bg-black/20 rounded-2xl border border-white/5 hover:border-amber-500/10 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">Event Special</span>
                    <span className="text-[9px] text-gray-600 font-mono">2h ago</span>
                  </div>
                  <div className="text-xs font-black text-white uppercase tracking-tight">$50.00 Distributed</div>
                  <div className="text-[9px] text-gray-600 mt-2 uppercase font-bold tracking-widest">Target: 1,284 Users</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'games' && <AdminGameControl ADMIN_PATH={ADMIN_PATH} />}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-gray-400">
              <Settings className="text-amber-500" size={18} /> System Toggles
            </h3>
            <div className="space-y-4">
              {settings && [
                { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Disable app access for all users' },
                { key: 'registration_open', label: 'Registration Open', desc: 'Allow new users to sign up' },
                { key: 'auto_withdrawal', label: 'Auto-Withdrawal', desc: 'Process small withdrawals instantly' },
                { key: 'vip_system', label: 'VIP System', desc: 'Enable/Disable VIP progression' }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 hover:bg-black/30 transition-colors">
                  <div>
                    <div className="text-[11px] font-black text-white uppercase tracking-wider">{s.label}</div>
                    <div className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-0.5">{s.desc}</div>
                  </div>
                  <div 
                    onClick={() => setSettings({...settings, [s.key]: !settings[s.key]})}
                    className={`w-11 h-6 ${settings[s.key] ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30'} rounded-full relative border cursor-pointer transition-colors`}
                  >
                    <div className={`absolute ${settings[s.key] ? 'right-1 bg-emerald-500' : 'left-1 bg-red-500'} top-1 w-3.5 h-3.5 rounded-full shadow-lg transition-all`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-gray-400">
              <Database className="text-amber-500" size={18} /> Core Parameters
            </h3>
            <div className="space-y-4">
              {settings && [
                { key: 'min_withdrawal', label: 'Min Withdrawal' },
                { key: 'max_withdrawal', label: 'Max Withdrawal' },
                { key: 'referral_commission', label: 'Referral Bonus (%)' },
                { key: 'site_name', label: 'Site Name' }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 hover:bg-black/30 transition-colors">
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{s.label}</span>
                  <input 
                    type="text" 
                    value={settings[s.key]} 
                    onChange={e => setSettings({...settings, [s.key]: e.target.value})}
                    className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-right font-black text-amber-500 uppercase tracking-widest focus:outline-none focus:border-amber-500/50" 
                  />
                </div>
              ))}
              <button 
                onClick={handleUpdateSettings}
                className="w-full mt-6 bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              >
                Commit Changes to Core
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">System Activity Logs</h3>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Purge Logs</button>
              <button className="px-5 py-2.5 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">Export Database</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] bg-black/20">
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Event Description</th>
                  <th className="px-8 py-5">Operator</th>
                  <th className="px-8 py-5">Network IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 text-[10px] font-mono text-gray-500 tracking-tighter">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          log.type === 'deposit' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                          log.type === 'withdrawal' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' :
                          'bg-blue-500/5 border-blue-500/20 text-blue-500'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-tight">{log.description}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-wider">{log.profiles?.username || 'System'}</td>
                    <td className="px-8 py-5 text-xs font-black text-amber-500 tabular-nums">${Math.abs(log.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

// --- Admin Game Control ---
function AdminGameControl({ ADMIN_PATH }: { ADMIN_PATH: string }) {
  const [selectedGame, setSelectedGame] = useState('roulette');
  const [manualResult, setManualResult] = useState('');
  const [currentBets, setCurrentBets] = useState<any[]>([]);
  const [roundId, setRoundId] = useState(Math.floor(Date.now() / 60000));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBets = async () => {
      const res = await apiFetch(`${ADMIN_PATH}/game/bets/${selectedGame}/${roundId}`);
      if (res.ok) setCurrentBets(await res.json());
    };
    fetchBets();
    const interval = setInterval(fetchBets, 5000);
    return () => clearInterval(interval);
  }, [selectedGame, roundId]);

  const handleSetResult = async () => {
    if (!manualResult) return;
    setLoading(true);
    try {
      let resultData: any = {};
      if (selectedGame === 'roulette') {
        const num = Number(manualResult);
        const colors: any = { 0: 'green' };
        [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].forEach(n => colors[n] = 'red');
        [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].forEach(n => colors[n] = 'black');
        resultData = { number: num, color: colors[num] };
      } else if (selectedGame === 'crash') {
        resultData = { crashPoint: Number(manualResult) };
      }
      
      const res = await apiFetch(`${ADMIN_PATH}/game/set-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName: selectedGame, roundId: roundId + 1, resultData })
      });
      if (res.ok) toast.success(`Result set for next round (${roundId + 1})`);
    } catch (err) {
      toast.error('Failed to set result');
    } finally {
      setLoading(false);
    }
  };

  const totalBets = currentBets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-gray-400">Control Panel</h3>
          <div className="space-y-6">
            <div>
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] px-1 block mb-2">Select Game</label>
              <select 
                value={selectedGame}
                onChange={e => setSelectedGame(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
              >
                <option value="roulette">Roulette</option>
                <option value="crash">Crash</option>
                <option value="spin">Spin</option>
                <option value="7updown">7 Up Down</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] px-1 block mb-2">Manual Result (Next Round: {roundId + 1})</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={selectedGame === 'roulette' ? 'Number (0-36)' : 'Value'} 
                  value={manualResult}
                  onChange={e => setManualResult(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/50 placeholder:text-gray-700" 
                />
                <button 
                  onClick={handleSetResult}
                  disabled={loading}
                  className="bg-amber-500 text-black px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  Set
                </button>
              </div>
              <p className="text-[8px] text-gray-500 mt-2 uppercase font-bold tracking-widest italic">Leave empty for random result</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Active Round Bets (#{roundId})</h3>
            <div className="text-amber-500 font-black text-xs uppercase tracking-widest">Total: ${totalBets.toLocaleString()}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] bg-black/20">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentBets.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-[10px] text-gray-600 font-black uppercase tracking-widest">No active bets</td></tr>
                ) : (
                  currentBets.map(b => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-white text-xs uppercase tracking-tight">{b.profiles?.username}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-amber-500 font-black text-xs">${b.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest truncate max-w-[200px]">
                          {JSON.stringify(b.bet_data)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Admin Panel (Blue) ---
function SubAdminPanel({ t, logout, setActiveTab, onLogoClick }: { t: any, logout: () => void, setActiveTab: (t: GameType) => void, onLogoClick?: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [adjustmentForm, setAdjustmentForm] = useState<{ [key: string]: { amount: string, reason: string } }>({});

  const sidebarItems = [
    { id: 'users', label: 'View Users', icon: <Users size={18} /> },
    { id: 'block', label: 'Block System', icon: <ShieldAlert size={18} /> },
    { id: 'coins', label: 'Coin Ops', icon: <Coins size={18} /> },
    { id: 'spins', label: 'Spin Logs', icon: <RotateCw size={18} /> },
    { id: 'user_panel', label: 'User Panel', icon: <Home size={18} />, action: () => setActiveTab('home') },
  ];

  const ADMIN_PATH = '/api/secure-admin-portal-9271';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch(`${ADMIN_PATH}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('SubAdmin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      const res = await apiFetch(`${ADMIN_PATH}/users/${userId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success('User updated');
        fetchUsers();
        setEditingUser(null);
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleAdjustBalance = async (userId: string) => {
    const form = adjustmentForm[userId];
    if (!form || !form.amount) return;
    try {
      const res = await apiFetch(`${ADMIN_PATH}/user/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: Number(form.amount), reason: form.reason })
      });
      if (res.ok) {
        toast.success('Balance adjusted');
        fetchUsers();
        setAdjustmentForm(prev => ({ ...prev, [userId]: { amount: '', reason: '' } }));
      }
    } catch (err) {
      toast.error('Adjustment failed');
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-blue-500 animate-pulse">LOADING SUB-SYSTEM...</div>;

  return (
    <DashboardWrapper 
      title="Sub Admin" 
      icon={<Users size={24} />} 
      color="text-blue-500" 
      themeColor="text-blue-500"
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      sidebarItems={sidebarItems}
      logout={logout}
      onLogoClick={onLogoClick}
    >
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-blue-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-blue-500/10">
            <h3 className="text-lg font-black text-blue-500 uppercase tracking-widest mb-6">Edit System User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Username</label>
                <input 
                  type="text" 
                  value={editingUser.username} 
                  onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Account Status</label>
                <select 
                  value={editingUser.status || 'active'} 
                  onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50 uppercase tracking-widest"
                >
                  <option value="active">ACTIVE</option>
                  <option value="blocked">BLOCKED</option>
                  <option value="suspended">SUSPENDED</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => handleUpdateUser(editingUser.id, editingUser)} className="flex-1 py-3 rounded-xl bg-blue-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Commit Changes</button>
            </div>
          </motion.div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-blue-500/20 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="text-xs font-black text-blue-500 uppercase tracking-[0.2em]">User Directory ({users.length})</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <input type="text" placeholder="SEARCH DIRECTORY..." className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50 w-64 placeholder:text-gray-700" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] bg-black/20">
                  <th className="px-8 py-5">Identified User</th>
                  <th className="px-8 py-5">Access Level</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Joined</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/5 flex items-center justify-center border border-blue-500/10 text-blue-500 font-black text-xs">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-white text-xs uppercase tracking-tight">{u.username}</div>
                          <div className="text-[9px] text-gray-600 font-mono tracking-tighter">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border bg-blue-500/5 border-blue-500/20 text-blue-500">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'blocked' ? 'bg-red-500' : 'bg-emerald-500'} shadow-lg shadow-current/20`} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${u.status === 'blocked' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {u.status || 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[10px] text-gray-400 font-mono">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-colors border border-transparent hover:border-blue-500/20 opacity-0 group-hover:opacity-100"
                      >
                        <Settings size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'block' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-blue-500/20 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Access Restriction Control</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] bg-black/20">
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-black text-white text-xs uppercase tracking-tight">{u.username}</div>
                      <div className="text-[9px] text-gray-600 font-mono tracking-tighter">{u.email}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${u.status === 'blocked' ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleUpdateUser(u.id, { status: u.status === 'blocked' ? 'active' : 'blocked' })}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${u.status === 'blocked' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-black' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                      >
                        {u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'coins' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-blue-500/20 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Coin Operations</h3>
          </div>
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">Select User</label>
                <select 
                  onChange={(e) => {
                    const userId = users.find(u => u.username === e.target.value)?.id;
                    if (userId) setAdjustmentForm(prev => ({ ...prev, selectedUserId: userId }));
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                >
                  <option value="">Choose User...</option>
                  {users.map(u => <option key={u.id} value={u.username}>{u.username}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    onChange={(e) => {
                      const userId = (adjustmentForm as any).selectedUserId;
                      if (userId) setAdjustmentForm(prev => ({ ...prev, [userId]: { ...prev[userId], amount: e.target.value } }));
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50 placeholder:text-gray-700" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">Reason</label>
                  <input 
                    type="text" 
                    placeholder="Adjustment Reason" 
                    onChange={(e) => {
                      const userId = (adjustmentForm as any).selectedUserId;
                      if (userId) setAdjustmentForm(prev => ({ ...prev, [userId]: { ...prev[userId], reason: e.target.value } }));
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50 placeholder:text-gray-700" 
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  const userId = (adjustmentForm as any).selectedUserId;
                  if (userId) handleAdjustBalance(userId);
                }}
                className="w-full bg-blue-500 text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Confirm Transaction
              </button>
            </div>
            <div className="bg-black/20 rounded-3xl border border-white/5 p-8 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Recent Operations</h4>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-tight">player_42</div>
                      <div className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-1">Manual Adjustment</div>
                    </div>
                    <div className="text-xs font-black text-emerald-500 tabular-nums">+$500.00</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'spins' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-blue-500/20 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Real-time Game Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] bg-black/20">
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Bet</th>
                  <th className="px-8 py-5">Result</th>
                  <th className="px-8 py-5 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-8 py-5 text-[10px] font-mono text-gray-500">16:25:0{i}</td>
                    <td className="px-8 py-5 text-xs font-black text-white uppercase tracking-tight">user_{i}92</td>
                    <td className="px-8 py-5 text-xs font-mono text-gray-400">$10.00</td>
                    <td className="px-8 py-5">
                      <span className="text-[8px] font-black uppercase px-2.5 py-1 rounded-md bg-purple-500/5 border border-purple-500/20 text-purple-500">Slot {i*2}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-emerald-500 tabular-nums">+${i*20}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

// --- Game Control Panel (Purple) ---
function GameControlPanel({ t, logout, setActiveTab, onLogoClick }: { t: any, logout: () => void, setActiveTab: (t: GameType) => void, onLogoClick?: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState('wheel');
  const [wheelSegments, setWheelSegments] = useState<any[]>([]);
  const [probabilities, setProbabilities] = useState<any[]>([]);
  const [gameStatus, setGameStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { id: 'wheel', label: 'Wheel Config', icon: <RotateCw size={18} /> },
    { id: 'odds', label: 'Probabilities', icon: <Percent size={18} /> },
    { id: 'bonus', label: 'Bonus Logic', icon: <Gift size={18} /> },
    { id: 'status', label: 'Engine Status', icon: <Activity size={18} /> },
    { id: 'user_panel', label: 'User Panel', icon: <Home size={18} />, action: () => setActiveTab('home') },
  ];

  const ADMIN_PATH = '/api/secure-admin-portal-9271';

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      const [wheelRes, probRes] = await Promise.all([
        apiFetch(`${ADMIN_PATH}/game/wheel`),
        apiFetch(`${ADMIN_PATH}/game/probabilities`)
      ]);
      setWheelSegments(await wheelRes.json());
      setProbabilities(await probRes.json());
      setGameStatus([
        { id: 'spin', label: 'Spin Wheel', status: 'online' },
        { id: 'crash', label: 'Crash Game', status: 'online' },
        { id: 'slot', label: 'Slot Machine', status: 'online' },
        { id: 'roulette', label: 'Live Roulette', status: 'maintenance' }
      ]);
    } catch (err) {
      console.error('GameControl fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWheel = async () => {
    try {
      const res = await apiFetch(`${ADMIN_PATH}/game/wheel/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments: wheelSegments })
      });
      if (res.ok) toast.success('Wheel configuration updated');
    } catch (err) {
      toast.error('Failed to update wheel');
    }
  };

  const handleUpdateProbabilities = async () => {
    try {
      const res = await apiFetch(`${ADMIN_PATH}/game/probabilities/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probabilities })
      });
      if (res.ok) toast.success('Probabilities updated');
    } catch (err) {
      toast.error('Failed to update probabilities');
    }
  };

  const handleToggleStatus = async (gameId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'online' ? 'maintenance' : 'online';
    try {
      const res = await apiFetch(`${ADMIN_PATH}/game/status/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, status: newStatus })
      });
      if (res.ok) {
        toast.success(`${gameId} status updated`);
        setGameStatus(prev => prev.map(g => g.id === gameId ? { ...g, status: newStatus } : g));
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-purple-500 animate-pulse">SYNCHRONIZING GAME ENGINE...</div>;

  return (
    <DashboardWrapper 
      title="Game Control" 
      icon={<Gamepad2 size={24} />} 
      color="text-purple-500" 
      themeColor="text-purple-500"
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      sidebarItems={sidebarItems}
      logout={logout}
      onLogoClick={onLogoClick}
    >
      {activeSubTab === 'wheel' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/20 overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">Segment Configuration</h3>
                <button onClick={handleUpdateWheel} className="px-4 py-2 bg-purple-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20">Save Config</button>
              </div>
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                {wheelSegments.map((s, i) => (
                  <div key={s.id} className="flex gap-4 items-center p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 font-black text-[10px] border border-purple-500/20">{i + 1}</div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Label</label>
                        <input 
                          type="text" 
                          value={s.label} 
                          onChange={e => {
                            const newSegs = [...wheelSegments];
                            newSegs[i].label = e.target.value;
                            setWheelSegments(newSegs);
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-purple-500/50" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Multiplier</label>
                        <input 
                          type="number" 
                          value={s.multiplier} 
                          onChange={e => {
                            const newSegs = [...wheelSegments];
                            newSegs[i].multiplier = Number(e.target.value);
                            setWheelSegments(newSegs);
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-purple-500/50" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0,transparent_70%)]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-12 relative z-10">Live Preview</h3>
              <div className="w-64 h-64 rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(168,85,247,0.2)] relative z-10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-[spin_20s_linear_infinite]" />
                <RotateCw size={48} className="text-purple-500/20 animate-pulse" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
              </div>
              <div className="mt-12 grid grid-cols-2 gap-4 w-full relative z-10">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Segments</div>
                  <div className="text-xl font-black text-white">{wheelSegments.length}</div>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Max Payout</div>
                  <div className="text-xl font-black text-purple-500">x{wheelSegments.length > 0 ? Math.max(...wheelSegments.map(s => s.multiplier || 0)) : 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'odds' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/20 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">Probability Matrix</h3>
            <button onClick={handleUpdateProbabilities} className="px-4 py-2 bg-purple-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20">Update Matrix</button>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {probabilities.map((p, i) => (
              <div key={p.game_id} className="bg-black/40 p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">{p.game_id}</div>
                  <Percent size={14} className="text-purple-500/50 group-hover:text-purple-500 transition-colors" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">Win Rate</span>
                      <span className="text-purple-500">{p.win_rate}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={p.win_rate} 
                      onChange={e => {
                        const newProbs = [...probabilities];
                        newProbs[i].win_rate = Number(e.target.value);
                        setProbabilities(newProbs);
                      }}
                      className="w-full accent-purple-500 bg-white/5 h-1 rounded-full appearance-none cursor-pointer" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">House Edge</span>
                      <span className="text-purple-500">{p.house_edge}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="20" 
                      step="0.1"
                      value={p.house_edge} 
                      onChange={e => {
                        const newProbs = [...probabilities];
                        newProbs[i].house_edge = Number(e.target.value);
                        setProbabilities(newProbs);
                      }}
                      className="w-full accent-purple-500 bg-white/5 h-1 rounded-full appearance-none cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'bonus' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/20">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 mb-8">System Triggers</h3>
            <div className="space-y-4">
              {[
                { label: 'Free Spin on Deposit', active: true },
                { label: 'Loss Rebate System', active: false },
                { label: 'VIP Level Up Bonus', active: true },
                { label: 'Referral Milestone', active: true }
              ].map((b, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{b.label}</span>
                  <div className="w-10 h-5 bg-black/60 rounded-full relative cursor-pointer border border-white/10">
                    <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${b.active ? 'right-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'left-1 bg-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/20">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 mb-8">Bonus Schedule</h3>
            <div className="space-y-3">
              {[
                { day: 'Monday', bonus: 'Double XP', color: 'text-blue-500' },
                { day: 'Wednesday', bonus: 'Free Spins', color: 'text-purple-500' },
                { day: 'Friday', bonus: 'Deposit Match', color: 'text-emerald-500' },
                { day: 'Weekend', bonus: 'Mega Jackpot', color: 'text-amber-500' }
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.day}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.bonus}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'status' && (
        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/20">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 mb-10 flex items-center gap-3">
            <Activity className="animate-pulse" size={18} /> Game Engine Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameStatus.map((g, i) => (
              <div key={g.id} className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 text-center space-y-4 group hover:border-purple-500/30 transition-all">
                <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{g.label}</div>
                <div className={`text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${g.status === 'online' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${g.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                  {g.status}
                </div>
                <button 
                  onClick={() => handleToggleStatus(g.id, g.status)}
                  className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all text-gray-500 hover:text-white"
                >
                  Toggle Engine
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

// --- Finance Panel (Green) ---
function FinancePanel({ t, logout, setActiveTab, onLogoClick }: { t: any, logout: () => void, setActiveTab: (t: GameType) => void, onLogoClick?: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState('logs');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ type: string, id: number, action: string } | null>(null);

  const sidebarItems = [
    { id: 'logs', label: 'Transaction Logs', icon: <FileText size={18} /> },
    { id: 'coins', label: 'Manual Adj', icon: <Coins size={18} /> },
    { id: 'bonus', label: 'Bonus History', icon: <Gift size={18} /> },
    { id: 'vip', label: 'VIP Rewards', icon: <Crown size={18} /> },
    { id: 'user_panel', label: 'User Panel', icon: <Home size={18} />, action: () => setActiveTab('home') },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const ADMIN_PATH = '/api/secure-admin-portal-9271';
    try {
      const [depRes, withRes] = await Promise.all([
        apiFetch(`${ADMIN_PATH}/deposits`),
        apiFetch(`${ADMIN_PATH}/withdrawals`)
      ]);
      setDeposits(await depRes.json());
      setWithdrawals(await withRes.json());
    } catch (err) {
      console.error('Finance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!confirmModal) return;
    const { type, id, action } = confirmModal;
    const ADMIN_PATH = '/api/secure-admin-portal-9271';
    const endpoint = `${ADMIN_PATH}/${type}/${action}`;
    
    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id })
      });
      if (res.ok) {
        toast.success(`${type} ${action}ed`);
        fetchData();
      }
    } catch (err) {
      toast.error(`Failed to ${action}`);
    } finally {
      setConfirmModal(null);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-emerald-500 animate-pulse">VERIFYING LEDGER...</div>;

  return (
    <DashboardWrapper 
      title="Finance Hub" 
      icon={<Banknote size={24} />} 
      color="text-emerald-500" 
      themeColor="text-emerald-500"
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      sidebarItems={sidebarItems}
      logout={logout}
      onLogoClick={onLogoClick}
    >
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-emerald-500/10">
            <h3 className="text-lg font-black text-emerald-500 uppercase tracking-widest mb-4">Confirm Operation</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Are you sure you want to {confirmModal.action} this {confirmModal.type}?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleAction} className="flex-1 py-3 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-emerald-500/20 overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Incoming Deposits</h3>
                <PlusCircle size={18} className="text-emerald-500/50" />
              </div>
              <div className="max-h-[500px] overflow-y-auto scrollbar-hide divide-y divide-white/5">
                {deposits.map(d => (
                  <div key={d.id} className="p-6 hover:bg-emerald-500/5 transition-all flex justify-between items-center group">
                    <div>
                      <div className="font-black text-white text-xs uppercase tracking-tight">{d.username}</div>
                      <div className="text-[9px] text-gray-600 font-mono tracking-tighter mt-1">{d.method} | {d.ref_number}</div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="font-black text-emerald-500 tabular-nums text-sm">+${d.amount}</div>
                      <div className="flex gap-2">
                        {d.status === 'pending' ? (
                          <>
                            <button onClick={() => setConfirmModal({ type: 'deposit', id: d.id, action: 'approve' })} className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">Approve</button>
                            <button onClick={() => setConfirmModal({ type: 'deposit', id: d.id, action: 'reject' })} className="text-[8px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all">Reject</button>
                          </>
                        ) : (
                          <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${d.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>{d.status}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-red-500/20 overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Outgoing Withdrawals</h3>
                <ArrowDownCircle size={18} className="text-red-500/50" />
              </div>
              <div className="max-h-[500px] overflow-y-auto scrollbar-hide divide-y divide-white/5">
                {withdrawals.map(w => (
                  <div key={w.id} className="p-6 hover:bg-red-500/5 transition-all flex justify-between items-center group">
                    <div>
                      <div className="font-black text-white text-xs uppercase tracking-tight">{w.username}</div>
                      <div className="text-[9px] text-gray-600 font-mono tracking-tighter mt-1">{w.method} | {w.details}</div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="font-black text-red-500 tabular-nums text-sm">-${w.amount}</div>
                      <div className="flex gap-2">
                        {w.status === 'pending' ? (
                          <>
                            <button onClick={() => setConfirmModal({ type: 'withdraw', id: w.id, action: 'approve' })} className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">Approve</button>
                            <button onClick={() => setConfirmModal({ type: 'withdraw', id: w.id, action: 'reject' })} className="text-[8px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all">Reject</button>
                          </>
                        ) : (
                          <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${w.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>{w.status}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'coins' && (
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-emerald-500/20">
          <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3">
            <DollarSign className="text-emerald-500" /> Manual Adjustments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Account</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Search username or ID..." className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</label>
                  <input type="number" placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500">
                    <option>Credit (Add)</option>
                    <option>Debit (Remove)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reason / Reference</label>
                <textarea placeholder="Reason for adjustment..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 h-24 resize-none" />
              </div>
              <button className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg shadow-emerald-500/20">Execute Adjustment</button>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Audit Trail</h4>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-white">Manual Credit</div>
                      <div className="text-[8px] text-gray-500 uppercase font-black">Ref: ADJ-9283{i}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-500">+$1,000.00</div>
                      <div className="text-[8px] text-gray-500 font-mono">10 Mar 16:20</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'bonus' && (
        <div className="bg-white/5 rounded-[2.5rem] border border-emerald-500/20 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-emerald-500/5">
            <h3 className="font-black uppercase tracking-widest text-emerald-500">Bonus History</h3>
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Financial Reward Logs</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-black/40">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Bonus Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-white">user_{i}92</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">Daily Login</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-500">+$5.00</td>
                    <td className="px-6 py-4 text-[10px] font-mono text-gray-500">2026-03-10</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Settled</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'vip' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/5 p-8 rounded-[2.5rem] border border-emerald-500/20">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <Crown className="text-emerald-500" /> VIP Reward Pool
            </h3>
            <div className="space-y-4">
              {[
                { level: 'Bronze', reward: '$10.00', frequency: 'Weekly', total: '$1,240' },
                { level: 'Silver', reward: '$50.00', frequency: 'Weekly', total: '$4,500' },
                { level: 'Gold', reward: '$200.00', frequency: 'Monthly', total: '$12,800' },
                { level: 'Platinum', reward: '$1,000.00', frequency: 'Monthly', total: '$25,000' }
              ].map((v, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 font-black text-xs">{v.level[0]}</div>
                    <div>
                      <div className="text-sm font-bold text-white">{v.level} Tier</div>
                      <div className="text-[10px] text-gray-500 uppercase font-black">{v.frequency} Distribution</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-500">{v.reward}</div>
                    <div className="text-[8px] text-gray-500 uppercase font-bold">Total Paid: {v.total}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-emerald-500/20 flex flex-col justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <TrendingUp className="text-emerald-500" size={40} />
            </div>
            <div>
              <div className="text-2xl font-black text-white">$43,540</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Total VIP Payouts</div>
            </div>
            <button className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg shadow-emerald-500/20">Process All Rewards</button>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: any, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5">
      <div className={`${color} mb-4`}>{React.cloneElement(icon as React.ReactElement, { size: 24 })}</div>
      <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">{title}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}

function GamePreviewCard({ title, icon, color }: { title: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="inline-flex items-center gap-4 bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 min-w-[250px]">
      <div className={`${color} p-3 rounded-xl text-white`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <span className="text-xl font-bold">{title}</span>
    </div>
  );
}

function WinnerCard({ name, amount, time }: { name: string, amount: number, time: string }) {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      </div>
      <div className="text-2xl font-black text-emerald-500">
        +${amount.toLocaleString()}
      </div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Withdrawal Success</div>
    </div>
  );
}
