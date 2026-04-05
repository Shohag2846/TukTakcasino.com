import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  Gamepad2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { AdminView } from '../../types/admin';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'deposits', label: 'Deposits', icon: ArrowDownCircle },
  { id: 'withdraws', label: 'Withdraws', icon: ArrowUpCircle },
  { id: 'transactions', label: 'Transactions', icon: History },
  { id: 'games', label: 'Game Control', icon: Gamepad2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeView, onViewChange, onLogout, isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-[#0f172a]/80 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center justify-center">
              <span className="text-white font-black text-xl">T</span>
            </div>
            <span className="text-white font-black text-xl tracking-tighter">TukTak</span>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as AdminView)}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group relative",
              activeView === item.id 
                ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.1)]" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            {activeView === item.id && (
              <motion.div 
                layoutId="active-glow"
                className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur-md -z-10"
              />
            )}
            <item.icon 
              size={22} 
              className={cn(
                "transition-all duration-300",
                activeView === item.id ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "group-hover:text-white"
              )} 
            />
            {!isCollapsed && (
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            )}
            {activeView === item.id && !isCollapsed && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute right-2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
        >
          <LogOut size={22} className="group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
}
