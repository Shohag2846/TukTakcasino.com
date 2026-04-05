import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { AdminView } from '../../types/admin';

interface TopbarProps {
  activeView: AdminView;
  adminName: string;
  onLogout: () => void;
}

const viewTitles: Record<AdminView, string> = {
  dashboard: 'Dashboard Overview',
  users: 'User Management',
  deposits: 'Deposit Requests',
  withdraws: 'Withdrawal Requests',
  transactions: 'Transaction History',
  games: 'Game Control Center',
  settings: 'System Settings',
};

export function Topbar({ activeView, adminName, onLogout }: TopbarProps) {
  return (
    <header className="h-20 bg-[#0f172a]/50 backdrop-blur-xl border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Page Title */}
      <motion.div 
        key={activeView}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col"
      >
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">
          {viewTitles[activeView]}
        </h1>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <span>TukTak Casino</span>
          <span className="w-1 h-1 bg-gray-700 rounded-full" />
          <span className="text-purple-500/80">Admin Panel</span>
        </div>
      </motion.div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-purple-500/50 transition-all group">
          <Search size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm text-white px-3 w-48 placeholder:text-gray-600"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all group">
          <Bell size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#0f172a] shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-white tracking-tight">{adminName}</span>
            <span className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">Super Admin</span>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <User size={20} />
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-red-500/10 rounded-xl text-red-400 transition-all group"
            title="Logout"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}
