import React, { useState } from 'react';
import { Shield, Mail, Lock, RefreshCw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

export function AdminLogin({ onLogin, error, isLoading }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#020617]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      
      {/* Particle Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random()
            }}
            animate={{ 
              y: [null, "-100%"],
              opacity: [null, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-[450px] bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-2xl overflow-hidden"
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
        
        <div className="text-center mb-10 relative">
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 relative group"
          >
            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <Shield className="text-purple-400 relative z-10" size={48} />
          </motion.div>
          <h2 className="text-4xl font-black text-white tracking-tight uppercase">Admin Portal</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-3">Secure Management Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-gray-700"
                  placeholder="admin@tuktaktak.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-gray-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168,85,247,0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl transition-all relative overflow-hidden group flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <RefreshCw size={24} className="animate-spin" />
            ) : (
              <>
                Enter Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </motion.button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            &copy; 2026 TukTak Casino &bull; System Security v4.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
