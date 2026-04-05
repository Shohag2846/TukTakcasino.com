import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Gamepad2, 
  Gift, 
  TrendingUp,
  Download,
  Calendar
} from 'lucide-react';
import { GlassCard } from '../../components/admin/StatCard';
import { motion } from 'motion/react';
import { Transaction } from '../../types/admin';

const mockTransactions: Transaction[] = [
  { id: '1', user_id: 'u1', amount: 500, type: 'deposit', description: 'bKash Deposit Approved', created_at: '2026-03-26 14:20', user: { username: 'AlexPro' } },
  { id: '2', user_id: 'u2', amount: -1200, type: 'withdraw', description: 'Nagad Withdrawal Approved', created_at: '2026-03-26 15:45', user: { username: 'SarahWin' } },
  { id: '3', user_id: 'u3', amount: -50, type: 'game', description: 'Bet on Spin Game', created_at: '2026-03-26 16:10', user: { username: 'LuckyJohn' } },
  { id: '4', user_id: 'u3', amount: 150, type: 'game', description: 'Win on Spin Game', created_at: '2026-03-26 16:15', user: { username: 'LuckyJohn' } },
  { id: '5', user_id: 'u4', amount: 100, type: 'referral', description: 'Referral Bonus from User u9', created_at: '2026-03-25 10:30', user: { username: 'CasinoKing' } },
  { id: '6', user_id: 'u5', amount: 25, type: 'bonus', description: 'Daily Login Bonus', created_at: '2026-03-25 11:15', user: { username: 'Player99' } },
  { id: '7', user_id: 'u1', amount: -200, type: 'game', description: 'Bet on Crash Game', created_at: '2026-03-25 12:00', user: { username: 'AlexPro' } },
  { id: '8', user_id: 'u2', amount: 5000, type: 'deposit', description: 'Bank Transfer Deposit', created_at: '2026-03-25 14:30', user: { username: 'SarahWin' } },
];

export function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTransactions = mockTransactions.filter(t => {
    const matchesSearch = t.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none w-full md:w-80 placeholder:text-gray-600"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none appearance-none cursor-pointer font-bold uppercase tracking-widest text-[10px]"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdraw">Withdrawals</option>
              <option value="game">Game Bets/Wins</option>
              <option value="referral">Referrals</option>
              <option value="bonus">Bonuses</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Calendar size={16} /> Date Range
          </button>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <GlassCard className="p-0 overflow-hidden" glowBorder>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Type</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Description</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <code className="text-[10px] text-gray-500 font-black tracking-widest">#TX-{tx.id.padStart(6, '0')}</code>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-white tracking-tight">{tx.user?.username}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        tx.type === 'withdraw' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        tx.type === 'game' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownCircle size={14} /> :
                         tx.type === 'withdraw' ? <ArrowUpCircle size={14} /> :
                         tx.type === 'game' ? <Gamepad2 size={14} /> :
                         <Gift size={14} />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs text-gray-400 font-medium">{tx.description}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`text-sm font-black tracking-tight ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{tx.created_at}</div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
