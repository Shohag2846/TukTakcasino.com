import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  AlertCircle, 
  Search, 
  Filter, 
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Clock
} from 'lucide-react';
import { GlassCard } from '../../components/admin/StatCard';
import { motion, AnimatePresence } from 'motion/react';
import { WithdrawRequest } from '../../types/admin';

const mockWithdraws: WithdrawRequest[] = [
  { id: '1', user_id: 'u1', amount: 1000, method: 'bKash', account_details: '01700000000', status: 'pending', created_at: '2026-03-26 14:20', user: { username: 'AlexPro', balance: 5240 } },
  { id: '2', user_id: 'u2', amount: 15000, method: 'Nagad', account_details: '01800000000', status: 'pending', created_at: '2026-03-26 15:45', user: { username: 'SarahWin', balance: 12800 } },
  { id: '3', user_id: 'u3', amount: 500, method: 'Rocket', account_details: '01900000000', status: 'pending', created_at: '2026-03-26 16:10', user: { username: 'LuckyJohn', balance: 450 } },
  { id: '4', user_id: 'u4', amount: 2500, method: 'bKash', account_details: '01600000000', status: 'approved', created_at: '2026-03-25 10:30', user: { username: 'CasinoKing', balance: 89000 } },
  { id: '5', user_id: 'u5', amount: 50, method: 'Nagad', account_details: '01500000000', status: 'rejected', created_at: '2026-03-25 11:15', user: { username: 'Player99', balance: 120 } },
];

export function Withdraws() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filteredWithdraws = mockWithdraws.filter(w => statusFilter === 'all' || w.status === statusFilter);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                statusFilter === status 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                  : 'bg-white/5 text-gray-500 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search user..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-blue-500/50 outline-none w-64 placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Withdraws Table */}
      <GlassCard className="p-0 overflow-hidden" glowBorder>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">User & Balance</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Method</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Account Details</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWithdraws.map((withdraw) => {
                const isInsufficient = (withdraw.user?.balance || 0) < withdraw.amount;
                
                return (
                  <motion.tr 
                    key={withdraw.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div>
                        <div className="text-sm font-black text-white tracking-tight">{withdraw.user?.username}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Wallet size={10} className="text-gray-500" />
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            Balance: <span className={isInsufficient ? 'text-red-500' : 'text-emerald-500'}>
                              ${withdraw.user?.balance.toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-blue-500 tracking-tight">
                        ${withdraw.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {withdraw.method}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-[10px] text-gray-400 font-black tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10">
                        {withdraw.account_details}
                      </code>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          withdraw.status === 'pending' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' :
                          withdraw.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                          'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                        }`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          withdraw.status === 'pending' ? 'text-orange-500' :
                          withdraw.status === 'approved' ? 'text-emerald-500' :
                          'text-red-500'
                        }`}>
                          {withdraw.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {withdraw.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          {isInsufficient && (
                            <div className="flex items-center gap-1 text-[8px] text-red-500 font-black uppercase tracking-widest mr-2">
                              <AlertCircle size={10} /> Insufficient Balance
                            </div>
                          )}
                          <button 
                            disabled={isInsufficient}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                              isInsufficient 
                                ? 'bg-gray-500/10 text-gray-500 border-white/10 cursor-not-allowed' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black'
                            }`}
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">Processed</div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Summary Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center gap-4" glowBorder>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pending Requests</p>
            <p className="text-xl font-black text-white">12 Requests</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4" glowBorder>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Pending Amount</p>
            <p className="text-xl font-black text-white">$18,450</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4" glowBorder>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Approved Today</p>
            <p className="text-xl font-black text-white">$5,200</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
