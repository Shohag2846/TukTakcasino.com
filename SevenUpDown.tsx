import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Wallet, History, Trophy, Clock, Info, ChevronRight, ChevronLeft, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface SevenUpDownProps {
  user: any;
  setUser: (user: any) => void;
  onBack: () => void;
  t: any;
}

export const SevenUpDown: React.FC<SevenUpDownProps> = ({ user, setUser, onBack, t }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedSide, setSelectedSide] = useState<'up' | 'down' | '7' | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState([1, 1]);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('game-state-7updown', (state) => {
      setGameState(state);
      if (state.phase === 'result' && state.result && !isRolling) {
        handleRoll(state.result.dice1, state.result.dice2);
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

  const handleRoll = (d1: number, d2: number) => {
    setIsRolling(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValues([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      rolls++;
      if (rolls >= 20) {
        clearInterval(interval);
        setDiceValues([d1, d2]);
        setIsRolling(false);
        const total = d1 + d2;
        if (selectedSide === 'up' && total > 7) toast.success(`You won $${betAmount * 2}!`);
        else if (selectedSide === 'down' && total < 7) toast.success(`You won $${betAmount * 2}!`);
        else if (selectedSide === '7' && total === 7) toast.success(`You won $${betAmount * 5}!`);
        else if (selectedSide) toast.info('Better luck next time!');
      }
    }, 100);
  };

  const placeBet = (side: 'up' | 'down' | '7') => {
    if (!socket || !user) return;
    setSelectedSide(side);
    socket.emit('place-bet', {
      userId: user.id,
      gameName: '7updown',
      amount: betAmount,
      betData: { value: side },
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
        <h1 className="text-2xl font-black tracking-tighter uppercase text-white">7 Up Down</h1>
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
                  {gameState?.phase === 'waiting' ? `Waiting (${gameState.timeLeft}s)` : 'Rolling...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
              <Trophy className="text-emerald-500" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Last Total</span>
                <span className="text-sm font-black text-emerald-500">{gameState?.result?.total || '-'}</span>
              </div>
            </div>
          </div>

          {/* Dice Area */}
          <div className="flex gap-8 mt-12 mb-16">
            {diceValues.map((val, i) => (
              <motion.div
                key={i}
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] } : { rotate: 0, scale: 1 }}
                transition={isRolling ? { repeat: Infinity, duration: 0.2 } : {}}
                className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center relative border-4 border-emerald-500/20"
              >
                <div className="grid grid-cols-3 grid-rows-3 gap-2 p-4 w-full h-full">
                  {[...Array(9)].map((_, idx) => {
                    const showDot = (
                      (val === 1 && idx === 4) ||
                      (val === 2 && (idx === 0 || idx === 8)) ||
                      (val === 3 && (idx === 0 || idx === 4 || idx === 8)) ||
                      (val === 4 && (idx === 0 || idx === 2 || idx === 6 || idx === 8)) ||
                      (val === 5 && (idx === 0 || idx === 2 || idx === 4 || idx === 6 || idx === 8)) ||
                      (val === 6 && (idx === 0 || idx === 2 || idx === 3 || idx === 5 || idx === 6 || idx === 8))
                    );
                    return (
                      <div key={idx} className={`w-full h-full flex items-center justify-center`}>
                        {showDot && <div className="w-3 h-3 md:w-4 md:h-4 bg-slate-900 rounded-full shadow-inner" />}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Betting Zones */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
            <BetZone 
              side="down" 
              label="2 - 6" 
              multiplier="2x" 
              icon={<TrendingDown />} 
              active={selectedSide === 'down'} 
              onClick={() => placeBet('down')} 
              disabled={gameState?.phase !== 'waiting' || isRolling}
            />
            <BetZone 
              side="7" 
              label="Lucky 7" 
              multiplier="5x" 
              icon={<Star />} 
              active={selectedSide === '7'} 
              onClick={() => placeBet('7')} 
              disabled={gameState?.phase !== 'waiting' || isRolling}
              highlight
            />
            <BetZone 
              side="up" 
              label="8 - 12" 
              multiplier="2x" 
              icon={<TrendingUp />} 
              active={selectedSide === 'up'} 
              onClick={() => placeBet('up')} 
              disabled={gameState?.phase !== 'waiting' || isRolling}
            />
          </div>

          {/* Bet Amount Selection */}
          <div className="mt-8 w-full max-w-md flex gap-2">
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${res.total === 7 ? 'bg-yellow-500 text-black' : res.total > 7 ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
                    {res.total}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Round #{gameState.roundId - i}</div>
                    <div className="text-[10px] text-gray-500 font-medium">Result: {res.dice1} + {res.dice2}</div>
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
              Select your bet amount.
            </li>
            <li className="flex gap-3 text-xs text-gray-400">
              <span className="text-emerald-500 font-black">02.</span>
              Choose one of the three betting zones.
            </li>
            <li className="flex gap-3 text-xs text-gray-400">
              <span className="text-emerald-500 font-black">03.</span>
              Wait for the dice to roll.
            </li>
            <li className="flex gap-3 text-xs text-gray-400">
              <span className="text-emerald-500 font-black">04.</span>
              Win 2x for Up/Down and 5x for Lucky 7.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);
};

function BetZone({ side, label, multiplier, icon, active, onClick, disabled, highlight = false }: any) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative h-40 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
        active 
          ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
          : highlight
            ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10'
            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`${active ? 'text-black' : highlight ? 'text-yellow-500' : 'text-emerald-500'}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg font-black uppercase tracking-tighter leading-none">{label}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-black/60' : 'text-gray-500'}`}>{multiplier}</span>
      </div>
      {active && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-black rounded-full animate-ping" />
        </div>
      )}
    </motion.button>
  );
}
