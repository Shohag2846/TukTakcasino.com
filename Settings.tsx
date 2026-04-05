import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  ShieldCheck, 
  Bell, 
  Database, 
  Key, 
  Save, 
  Upload, 
  Image as ImageIcon,
  Lock,
  Mail,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../../components/admin/StatCard';
import { motion } from 'motion/react';

export function SettingsPage() {
  const [siteName, setSiteName] = useState('TukTak Casino');
  const [siteLogo, setSiteLogo] = useState('https://picsum.photos/seed/logo/200/200');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8" glowBorder>
            <h3 className="text-xl font-black text-white tracking-tight uppercase mb-8 flex items-center gap-3">
              <Globe size={24} className="text-purple-500" /> General Configuration
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Site Name</label>
                  <div className="relative group">
                    <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Support Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      defaultValue="support@tuktaktak.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Site Logo</label>
                <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-[2rem]">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                    <img src={siteLogo} alt="Logo" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      Recommended size: 512x512px. Supported formats: PNG, SVG, JPG. Max size: 2MB.
                    </p>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <Upload size={14} /> Upload New
                      </button>
                      <button className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:text-red-400 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8" glowBorder>
            <h3 className="text-xl font-black text-white tracking-tight uppercase mb-8 flex items-center gap-3">
              <ShieldCheck size={24} className="text-emerald-500" /> Security Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white tracking-tight">Two-Factor Authentication</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Add an extra layer of security to admin accounts</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white tracking-tight">IP Whitelisting</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Restrict admin access to specific IP addresses</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <GlassCard className="p-8" glowBorder>
            <h3 className="text-lg font-black text-white tracking-tight uppercase mb-6 flex items-center gap-2">
              <Bell size={20} className="text-orange-500" /> Notifications
            </h3>
            <div className="space-y-4">
              {[
                { label: 'New User Alerts', active: true },
                { label: 'Large Deposit Alerts', active: true },
                { label: 'Withdrawal Requests', active: true },
                { label: 'System Errors', active: false },
                { label: 'Game Status Changes', active: true }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${item.active ? 'bg-purple-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8" glowBorder>
            <h3 className="text-lg font-black text-white tracking-tight uppercase mb-6 flex items-center gap-2">
              <Database size={20} className="text-blue-500" /> Maintenance
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Clear Cache</span>
                </div>
                <ChevronRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <Key size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Backup Database</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>

          <motion.button 
            onClick={handleSave}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168,85,247,0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            {isSaving ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <>
                <Save size={20} /> Save Changes
              </>
            )}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function RefreshCw({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
