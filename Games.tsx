import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Power, 
  RefreshCw, 
  TrendingUp, 
  History, 
  Settings2,
  Play,
  Pause,
  ChevronRight,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../../components/admin/StatCard';
import { motion, AnimatePresence } from 'motion/react';

const lastResults = ['Red', 'Black', 'Red', 'Red', 'Black', 'Green', 'Red', 'Black', 'Black', 'Red'];

export function Games() {
  const [isGameOn, setIsGameOn] = useState(true);
  const [autoResult, setAutoResult] = useState(true);
  const [winRatio, setWinRatio] = useState(65);
  const [timeLeft, setTimeLeft] = useState(60);
  const [manualResult, setManualResult] = useState<string | null>(null);

  useEffect(() => {
    if (!autoResult) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoResult]);

  return (
    <div className="space-y-8">
      {/* Game Status & Main Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 p-8" glowBorder>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isGameOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <Gamepad2 size={28} className={isGameOn ? 'animate-pulse' : ''} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Spin Game Control</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isGameOn ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isGameOn ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isGameOn ? 'Live & Active' : 'System Paused'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsGameOn(!isGameOn)}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${
                isGameOn ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black'
              }`}
            >
              <Power size={18} /> {isGameOn ? 'Stop Game' : 'Start Game'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {/* Timer & Round Info */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Current Round Countdown</p>
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * timeLeft) / 60}
                    className="text-purple-500 transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-black text-white tracking-tighter">{timeLeft}s</span>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Round ID</p>
                  <p className="text-sm font-black text-white">#88234</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Total Bets</p>
                  <p className="text-sm font-black text-emerald-500">$12,450</p>
                </div>
              </div>
            </div>

            {/* Win Ratio Control */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Win Ratio Control</h4>
                <span className="text-xl font-black text-purple-500">{winRatio}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={winRatio}
                onChange={(e) => setWinRatio(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-6"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>Low Risk (0%)</span>
                <span>High Risk (100%)</span>
              </div>
              <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-3">
                <TrendingUp size={18} className="text-purple-400" />
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                  Higher win ratio increases player winning chances. Current setting is <span className="text-white font-black">Optimized</span>.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Settings */}
        <div className="space-y-6">
          <GlassCard className="p-8" glowBorder>
            <h3 className="text-lg font-black text-white tracking-tight uppercase mb-6 flex items-center gap-2">
              <Settings2 size={20} className="text-purple-500" /> Quick Controls
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => setAutoResult(!autoResult)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  autoResult ? 'bg-purple-500/10 border-purple-500/30 text-white' : 'bg-white/5 border-white/10 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RefreshCw size={18} className={autoResult ? 'animate-spin-slow' : ''} />
                  <span className="text-xs font-bold uppercase tracking-widest">Auto Result</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${autoResult ? 'bg-purple-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoResult ? 'right-1' : 'left-1'}`} />
                </div>
              </button>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Manual Result Set</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Red', 'Black', 'Green'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setManualResult(color)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        manualResult === color 
                          ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                          : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                {manualResult && (
                  <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest mt-3 text-center">
                    Next result forced to: {manualResult}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8" glowBorder>
            <h3 className="text-lg font-black text-white tracking-tight uppercase mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-500" /> Risk Alert
            </h3>
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
              <p className="text-[10px] text-orange-400 font-medium leading-relaxed">
                Total bets on current round exceed <span className="text-white font-black">$10,000</span>. Manual intervention recommended.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* History Section */}
      <GlassCard className="p-8" glowBorder>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <History size={24} className="text-purple-500" /> Result History
          </h3>
          <button className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors">
            Clear History
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {lastResults.map((result, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest border shadow-lg ${
                result === 'Red' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/10' :
                result === 'Black' ? 'bg-gray-800 text-gray-400 border-white/10 shadow-black/50' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
              }`}
            >
              {result[0]}
            </motion.div>
          ))}
          <div className="w-12 h-12 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-gray-600">
            <ChevronRight size={20} />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
