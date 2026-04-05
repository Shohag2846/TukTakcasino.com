import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Ban, 
  Trash2, 
  Shield, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus
} from 'lucide-react';
import { GlassCard } from '../../components/admin/StatCard';
import { motion, AnimatePresence } from 'motion/react';
import { AdminUser } from '../../types/admin';

const mockUsers: AdminUser[] = [
  { id: '1', username: 'AlexPro', email: 'alex@example.com', balance: 5240, role: 'user', status: 'active', created_at: '2026-01-15' },
  { id: '2', username: 'SarahWin', email: 'sarah@example.com', balance: 12800, role: 'admin', status: 'active', created_at: '2026-01-20' },
  { id: '3', username: 'LuckyJohn', email: 'john@example.com', balance: 450, role: 'user', status: 'banned', created_at: '2026-02-05' },
  { id: '4', username: 'CasinoKing', email: 'king@example.com', balance: 89000, role: 'subadmin', status: 'active', created_at: '2026-02-12' },
  { id: '5', username: 'Player99', email: 'p99@example.com', balance: 120, role: 'user', status: 'active', created_at: '2026-02-28' },
  { id: '6', username: 'BetMaster', email: 'bet@example.com', balance: 3400, role: 'game_manager', status: 'active', created_at: '2026-03-01' },
  { id: '7', username: 'RichieRich', email: 'rich@example.com', balance: 150000, role: 'user', status: 'active', created_at: '2026-03-05' },
  { id: '8', username: 'NoobPlayer', email: 'noob@example.com', balance: 10, role: 'user', status: 'active', created_at: '2026-03-10' },
];

export function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none w-full md:w-80 placeholder:text-gray-600"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none appearance-none cursor-pointer font-bold uppercase tracking-widest text-[10px]"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="subadmin">Sub Admin</option>
              <option value="game_manager">Game Manager</option>
              <option value="finance_manager">Finance Manager</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/20 hover:scale-105 transition-all">
            <Plus size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <GlassCard className="p-0 overflow-hidden" glowBorder>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Balance</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Role</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Joined</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-purple-400 font-black">
                        {user.username[0]}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white tracking-tight">{user.username}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-emerald-500 tracking-tight">
                      ${user.balance.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      user.role === 'subadmin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      user.role === 'user' ? 'bg-gray-500/10 text-gray-400 border-white/10' :
                      'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.created_at}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all" title="Change Role">
                        <Shield size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all" title={user.status === 'active' ? 'Ban User' : 'Unban User'}>
                        <Ban size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-all" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/5">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Showing <span className="text-white">1-8</span> of <span className="text-white">1,240</span> users
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all disabled:opacity-30" disabled>
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, '...', 12].map((page, i) => (
                <button 
                  key={i}
                  className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                    page === 1 ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
