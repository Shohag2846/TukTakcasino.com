import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  Search, 
  Filter, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { GlassCard } from '../../components/admin/StatCard';
import { motion, AnimatePresence } from 'motion/react';
import { DepositRequest } from '../../types/admin';

const mockDeposits: DepositRequest[] = [
  { id: '1', user_id: 'u1', amount: 500, method: 'bKash', transaction_id: 'TRX982347', status: 'pending', created_at: '2026-03-26 14:20', user: { username: 'AlexPro', email: 'alex@example.com' }, screenshot_url: 'https://picsum.photos/seed/deposit1/800/1200' },
  { id: '2', user_id: 'u2', amount: 1200, method: 'Nagad', transaction_id: 'TRX123456', status: 'pending', created_at: '2026-03-26 15:45', user: { username: 'SarahWin', email: 'sarah@example.com' }, screenshot_url: 'https://picsum.photos/seed/deposit2/800/1200' },
  { id: '3', user_id: 'u3', amount: 100, method: 'Rocket', transaction_id: 'TRX555666', status: 'pending', created_at: '2026-03-26 16:10', user: { username: 'LuckyJohn', email: 'john@example.com' }, screenshot_url: 'https://picsum.photos/seed/deposit3/800/1200' },
  { id: '4', user_id: 'u4', amount: 2500, method: 'bKash', transaction_id: 'TRX777888', status: 'approved', created_at: '2026-03-25 10:30', user: { username: 'CasinoKing', email: 'king@example.com' } },
  { id: '5', user_id: 'u5', amount: 50, method: 'Nagad', transaction_id: 'TRX999000', status: 'rejected', created_at: '2026-03-25 11:15', user: { username: 'Player99', email: 'p99@example.com' } },
];

export function Deposits() {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filteredDeposits = mockDeposits.filter(d => statusFilter === 'all' || d.status === statusFilter);

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
                  ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                  : 'bg-white/5 text-gray-500 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search TRX ID..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-purple-500/50 outline-none w-64 placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <GlassCard className="p-0 overflow-hidden" glowBorder>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Method</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">TRX ID</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Screenshot</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDeposits.map((deposit) => (
                <motion.tr 
                  key={deposit.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div>
                      <div className="text-sm font-black text-white tracking-tight">{deposit.user?.username}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{deposit.user?.email}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-emerald-500 tracking-tight">
                      ${deposit.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {deposit.method}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-[10px] text-purple-400 font-black tracking-widest bg-purple-500/5 px-2 py-1 rounded border border-purple-500/10">
                      {deposit.transaction_id}
                    </code>
                  </td>
                  <td className="px-8 py-6">
                    {deposit.screenshot_url ? (
                      <button 
                        onClick={() => setSelectedScreenshot(deposit.screenshot_url!)}
                        className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-purple-400 transition-colors group/btn"
                      >
                        <ImageIcon size={14} className="group-hover/btn:scale-110 transition-transform" /> View Proof
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">No Image</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        deposit.status === 'pending' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' :
                        deposit.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                        'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                      }`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        deposit.status === 'pending' ? 'text-orange-500' :
                        deposit.status === 'approved' ? 'text-emerald-500' :
                        'text-red-500'
                      }`}>
                        {deposit.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {deposit.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
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
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {selectedScreenshot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScreenshot(null)}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-[#0f172a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-black text-white tracking-tight uppercase">Payment Proof</h3>
                <button 
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 flex items-center justify-center bg-black/20">
                <img 
                  src={selectedScreenshot} 
                  alt="Payment Proof" 
                  className="max-h-[60vh] rounded-xl shadow-2xl border border-white/5"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedScreenshot(null)}
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-purple-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/20 hover:scale-105 transition-all">
                  Download Image
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
