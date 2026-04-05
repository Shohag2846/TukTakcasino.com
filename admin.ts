export type AdminView = 'dashboard' | 'users' | 'deposits' | 'withdraws' | 'transactions' | 'games' | 'settings';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: 'user' | 'admin' | 'subadmin' | 'game_manager' | 'finance_manager';
  status: 'active' | 'banned';
  created_at: string;
}

export interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  transaction_id: string;
  screenshot_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface WithdrawRequest {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  account_details: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: {
    username: string;
    balance: number;
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'game' | 'referral' | 'bonus';
  description: string;
  created_at: string;
  user?: {
    username: string;
  };
}

export interface GameSettings {
  is_active: boolean;
  win_ratio: number;
  auto_result: boolean;
  last_results: string[];
  current_round: number;
}
