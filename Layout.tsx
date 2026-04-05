import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AdminView } from '../../types/admin';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  onLogout: () => void;
  adminName: string;
}

export function Layout({ children, activeView, onViewChange, onLogout, adminName }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={onViewChange} 
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <motion.main 
        initial={false}
        animate={{ 
          marginLeft: isCollapsed ? 80 : 260,
          width: `calc(100% - ${isCollapsed ? 80 : 260}px)`
        }}
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
      >
        {/* Topbar */}
        <Topbar 
          activeView={activeView} 
          adminName={adminName} 
          onLogout={onLogout} 
        />

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-[#0f172a] via-[#1e293b]/20 to-[#0f172a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-white/5 bg-[#0f172a]/50 backdrop-blur-xl">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            &copy; 2026 TukTak Casino &bull; Premium Admin Panel &bull; v2.4.0
          </p>
        </footer>
      </motion.main>
    </div>
  );
}
