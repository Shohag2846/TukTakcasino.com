import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Wallet, History, Trophy, Clock, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface SpinGameProps {
  user: any;
  setUser: (user: any) => void;
  onBack: () => void;
  t: any;
}

const SEGMENTS = [0, 2, 5, 10, 0, 2, 5, 20];
const COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];

export const SpinGame: React.FC<SpinGameProps> = ({ user, setUser, onBack, t }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<any>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('game-state-spin', (state) => {
      setGameState(state);
      if (state.phase === 'result' && state.result && !isSpinning) {
        handleSpin(state.result.index);
      }
    });

    newSocket.on('bet-placed', (data) => {
      if (data.success) {
        setUser({ ...user, [user.game_mode === 'demo' ? 'demo_balance' : 'balance']: data.newBalance });
        toast.success('Bet placed successfully!');
      }
    });

    newSocket.on('error', (err) => toast.error(err.message));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSpin = (targetIndex: number) => {
    setIsSpinning(true);
    const segmentAngle = 360 / SEGMENTS.length;
    const extraSpins = 5 * 360;
    const targetAngle = extraSpins + (360 - (targetIndex * segmentAngle));
    
    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setLastResult(SEGMENTS[targetIndex]);
      if (SEGMENTS[targetIndex] > 0) {
        toast.success(`You won $${betAmount * SEGMENTS[targetIndex]}!`);
      } else {
        toast.info('Better luck next time!');
      }
    }, 5000);
  };

  const placeBet = () => {
    if (!socket || !user) return;
    socket.emit('place-bet', {
      userId: user.id,
      gameName: 'spin',
      amount: betAmount,
      betData: {},
      mode: user.game_mode
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase text-white">Spin Wheel</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Game Board */}
      <div className="lg:col-span-8 space-y-8">
        <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-[3rem] border border-white/5 p-12 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          
          {/* Status Header */}
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
            <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-2xl border border-white/10">
              <Clock className="text-emerald-500" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</span>
                <span className="text-sm font-black text-white uppercase tracking-tighter">
                  {gameState?.phase === 'waiting' ? `Waiting (${gameState.timeLeft}s)` : 'Spinning...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
              <Trophy className="text-emerald-500" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Last Win</span>
                <span className="text-sm font-black text-emerald-500">{lastResult ? `${lastResult}x` : '-'}</span>
              </div>
            </div>
          </div>

          {/* The Wheel */}
          <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] mt-12">
            {/* Pointer */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-8 h-12 bg-white rounded-b-full shadow-xl flex items-center justify-center border-4 border-emerald-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>

            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: [0.45, 0.05, 0.55, 0.95] }}
              className="w-full h-full rounded-full border-[12px] border-white/5 shadow-[0_0_100px_rgba(16,185,129,0.1)] relative overflow-hidden"
            >
              {SEGMENTS.map((val, i) => {
                const angle = 360 / SEGMENTS.length;
                return (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-end pr-12"
                    style={{ 
                      transform: `rotate(${i * angle}deg)`,
                      backgroundColor: COLORS[i],
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 50%)',
                      width: '100%',
                      left: '0',
                      transformOrigin: '50% 50%',
                      maskImage: `conic-gradient(from 0deg, black ${angle}deg, transparent ${angle}deg)`,
                      WebkitMaskImage: `conic-gradient(from 0deg, black ${angle}deg, transparent ${angle}deg)`
                    }}
                  >
                    <div 
                      className="text-white font-black text-2xl md:text-4xl tracking-tighter drop-shadow-lg"
                      style={{ transform: `rotate(${angle / 2}deg)` }}
                    >
                      {val}x
                    </div>
                  </div>
                );
              })}
              
              {/* Center Cap */}
              <div className="absolute inset-0 m-auto w-20 h-20 bg-slate-900 rounded-full border-4 border-white/10 shadow-2xl z-20 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-900 rounded-full border border-white/20 flex items-center justify-center">
                  <RotateCw className="text-white animate-spin-slow" size={24} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Betting Controls */}
          <div className="mt-12 w-full max-w-md space-y-6">
            <div className="flex gap-2">
              {[10, 50, 100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                    betAmount === amt ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              onClick={placeBet}
              disabled={gameState?.phase !== 'waiting' || isSpinning}
              className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                gameState?.phase === 'waiting' && !isSpinning
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-emerald-500/20 hover:scale-[1.02]'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {gameState?.phase === 'waiting' ? 'Place Bet' : 'Waiting for Next Round'}
            </button>
          </div>
        </div>
      </div>

      {/* Right: History & Info */}
      <div className="lg:col-span-4 space-y-6">
        {/* Wallet Card */}
        <div className="bg-emerald-500/10 p-8 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="text-black" size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Balance</div>
              <div className="text-2xl font-black text-white">
                ${(user.game_mode === 'demo' ? (user.demo_balance ?? 0) : (user.balance ?? 0)).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/20 px-3 py-1 rounded-full">
            {user.game_mode}
          </div>
        </div>

        {/* History */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <History className="text-emerald-500" size={18} /> History
            </h3>
            <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">View All</button>
          </div>
          
          <div className="space-y-3">
            {gameState?.history?.map((res: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${res.multiplier > 0 ? 'bg-emerald-500 text-black' : 'bg-red-500/10 text-red-500'}`}>
                    {res.multiplier}x
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Round #{gameState.roundId - i}</div>
                    <div className="text-[10px] text-gray-500 font-medium">Multiplier Result</div>
                  </div>
                </div>
                <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" size={16} />
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-4">
            <Info className="text-emerald-500" size={18} /> How to Play
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-3 text-xs text-gray-400">
              <span className="text-emerald-500 font-black">01.</span>
              Select your bet amount from the options.
            </li>
            <li className="flex gap-3 text-xs text-gray-400">
              <span className="text-emerald-500 font-black">02.</span>
              Place your bet before the timer runs out.
            </li>
            <li className="flex gap-3 text-xs text-gray-400">
              <span className="text-emerald-500 font-black">03.</span>
              Wait for the wheel to spin and reveal the result.
            </li>
            <li className="flex gap-3 text-xs text-gray-400">
              <span className="text-emerald-500 font-black">04.</span>
              Wins are calculated as Bet x Multiplier.
            </li>
          </ul>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);
};
