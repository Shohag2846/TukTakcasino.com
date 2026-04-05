import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  History, 
  Info, 
  Trophy, 
  Coins, 
  Play,
  RotateCcw,
  Zap,
  LayoutGrid,
  Clock,
  Users,
  Wallet,
  ChevronRight,
  Dices
} from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

interface DiceGameProps {
  user: any;
  setUser: (user: any) => void;
  setActiveTab: (tab: any) => void;
  t: any;
}

const DICE_FACES = [
  // 1
  <div className="w-full h-full bg-white rounded-xl flex items-center justify-center p-4">
    <div className="w-4 h-4 bg-black rounded-full" />
  </div>,
  // 2
  <div className="w-full h-full bg-white rounded-xl flex flex-col justify-between p-4">
    <div className="flex justify-end"><div className="w-4 h-4 bg-black rounded-full" /></div>
    <div className="flex justify-start"><div className="w-4 h-4 bg-black rounded-full" /></div>
  </div>,
  // 3
  <div className="w-full h-full bg-white rounded-xl flex flex-col justify-between p-4">
    <div className="flex justify-end"><div className="w-4 h-4 bg-black rounded-full" /></div>
    <div className="flex justify-center"><div className="w-4 h-4 bg-black rounded-full" /></div>
    <div className="flex justify-start"><div className="w-4 h-4 bg-black rounded-full" /></div>
  </div>,
  // 4
  <div className="w-full h-full bg-white rounded-xl flex flex-col justify-between p-4">
    <div className="flex justify-between">
      <div className="w-4 h-4 bg-black rounded-full" />
      <div className="w-4 h-4 bg-black rounded-full" />
    </div>
    <div className="flex justify-between">
      <div className="w-4 h-4 bg-black rounded-full" />
      <div className="w-4 h-4 bg-black rounded-full" />
    </div>
  </div>,
  // 5
  <div className="w-full h-full bg-white rounded-xl flex flex-col justify-between p-4">
    <div className="flex justify-between">
      <div className="w-4 h-4 bg-black rounded-full" />
      <div className="w-4 h-4 bg-black rounded-full" />
    </div>
    <div className="flex justify-center">
      <div className="w-4 h-4 bg-black rounded-full" />
    </div>
    <div className="flex justify-between">
      <div className="w-4 h-4 bg-black rounded-full" />
      <div className="w-4 h-4 bg-black rounded-full" />
    </div>
  </div>,
  // 6
  <div className="w-full h-full bg-white rounded-xl flex flex-col justify-between p-4">
    <div className="flex justify-between">
      <div className="w-4 h-4 bg-black rounded-full" />
      <div className="w-4 h-4 bg-black rounded-full" />
    </div>
    <div className="flex justify-between">
      <div className="w-4 h-4 bg-black rounded-full" />
      <div className="w-4 h-4 bg-black rounded-full" />
    </div>
    <div className="flex justify-between">
      <div className="w-4 h-4 bg-black rounded-full" />
      <div className="w-4 h-4 bg-black rounded-full" />
    </div>
  </div>
];

export function DiceGame({ user, setUser, setActiveTab, t }: DiceGameProps) {
  const [socket, setSocket] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [showWin, setShowWin] = useState(false);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('dice-state', (state) => {
      setGameState(state);
      
      // Reset local bet state if round ended
      if (state.phase === 'waiting' && state.timeLeft === 15) {
        setIsBetPlaced(false);
        setSelectedChoice(null);
      }
    });

    newSocket.on('dice-bet-placed', (data) => {
      const currentBalance = user.game_mode === 'demo' ? (user.demo_balance ?? 0) : (user.balance ?? 0);
      setUser({ ...user, [user.game_mode === 'demo' ? 'demo_balance' : 'balance']: currentBalance - data.amount });
      setIsBetPlaced(true);
      toast.success('Bet placed successfully!');
    });

    newSocket.on('error', (err) => toast.error(err.message));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Watch for game results to show win/loss
  useEffect(() => {
    if (gameState?.phase === 'result' && isBetPlaced) {
      const myBet = gameState.bets.find((b: any) => b.username === user.username);
      if (myBet && myBet.status === 'won') {
        setWinAmount(myBet.winAmount);
        setShowWin(true);
        const currentBalance = user.game_mode === 'demo' ? (user.demo_balance ?? 0) : (user.balance ?? 0);
        setUser({ ...user, [user.game_mode === 'demo' ? 'demo_balance' : 'balance']: currentBalance + myBet.winAmount });
        setTimeout(() => setShowWin(false), 4000);
      }
    }
  }, [gameState?.phase, isBetPlaced]);

  const placeBet = () => {
    const currentBalance = user.game_mode === 'demo' ? (user.demo_balance ?? 0) : (user.balance ?? 0);
    if (!socket || !user || isBetPlaced || !selectedChoice || gameState?.phase !== 'waiting' || currentBalance < betAmount) return;
    
    socket.emit('dice-bet', {
      userId: user.id,
      amount: betAmount,
      choice: selectedChoice,
      mode: user.game_mode,
      token: localStorage.getItem('supabase.auth.token') || 'mock_token'
    });
  };

  const currentBalance = user.game_mode === 'demo' ? (user.demo_balance ?? 0) : (user.balance ?? 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase">Dice Game</h1>
            <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Now
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <Wallet size={16} className="text-emerald-500" />
          <span className="font-black tabular-nums">${currentBalance.toLocaleString()}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Game Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Game Board */}
          <div className="relative aspect-[16/9] bg-[#0f0f0f] rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
            
            {/* Timer / Phase Indicator */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-3">
                <Clock size={16} className={gameState?.phase === 'waiting' ? 'text-emerald-500' : 'text-gray-500'} />
                <span className="text-xs font-black uppercase tracking-widest">
                  {gameState?.phase === 'waiting' ? `Betting: ${gameState.timeLeft}s` : 
                   gameState?.phase === 'rolling' ? 'Rolling...' : 'Result'}
                </span>
              </div>
            </div>

            {/* Dice Display */}
            <div className="relative z-10 flex gap-8">
              {gameState?.diceResults.map((val: number, i: number) => (
                <motion.div
                  key={i}
                  animate={gameState?.phase === 'rolling' ? {
                    rotateX: [0, 360, 720, 1080],
                    rotateY: [0, 360, 720, 1080],
                    scale: [1, 1.2, 1],
                    y: [0, -50, 0]
                  } : {
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    y: 0
                  }}
                  transition={gameState?.phase === 'rolling' ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  } : {
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="w-24 h-24 md:w-32 md:h-32 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                >
                  {DICE_FACES[(gameState?.phase === 'rolling' ? Math.floor(Math.random() * 6) : val - 1)]}
                </motion.div>
              ))}
            </div>

            {/* Win Overlay */}
            <AnimatePresence>
              {showWin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/10 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-[#0a0a0a] border-2 border-emerald-500 p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(16,185,129,0.4)]"
                  >
                    <Trophy size={64} className="text-emerald-500 mx-auto mb-6" />
                    <h3 className="text-3xl font-black uppercase mb-2">Winner!</h3>
                    <p className="text-emerald-500 text-5xl font-black tabular-nums">+${winAmount?.toLocaleString()}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Betting Board */}
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-8">
            {/* Range Bets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'small', label: 'Small', range: '1-3', multiplier: '2x' },
                { id: 'big', label: 'Big', range: '4-6', multiplier: '2x' },
                { id: 'even', label: 'Even', range: '2,4,6', multiplier: '2x' },
                { id: 'odd', label: 'Odd', range: '1,3,5', multiplier: '2x' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedChoice(opt.id)}
                  disabled={isBetPlaced || gameState?.phase !== 'waiting'}
                  className={`
                    relative p-6 rounded-3xl border-2 transition-all group
                    ${selectedChoice === opt.id 
                      ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/5 border-white/5 text-white hover:border-white/20'}
                    disabled:opacity-50
                  `}
                >
                  <div className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">{opt.label}</div>
                  <div className="text-2xl font-black">{opt.multiplier}</div>
                  <div className="text-[10px] font-bold opacity-40 mt-2">{opt.range}</div>
                  
                  {/* Win Highlight */}
                  {gameState?.phase === 'result' && (
                    (opt.id === 'even' && gameState.diceResults[0] % 2 === 0) ||
                    (opt.id === 'odd' && gameState.diceResults[0] % 2 !== 0) ||
                    (opt.id === 'big' && gameState.diceResults[0] >= 4) ||
                    (opt.id === 'small' && gameState.diceResults[0] <= 3)
                  ) && (
                    <motion.div 
                      layoutId="win-glow"
                      className="absolute inset-0 border-4 border-emerald-500 rounded-3xl animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Specific Number Bets */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedChoice(num.toString())}
                  disabled={isBetPlaced || gameState?.phase !== 'waiting'}
                  className={`
                    relative h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-all
                    ${selectedChoice === num.toString()
                      ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}
                    disabled:opacity-50
                  `}
                >
                  <span className="text-2xl font-black">{num}</span>
                  <span className="text-[10px] font-bold opacity-60">5x</span>

                  {/* Win Highlight */}
                  {gameState?.phase === 'result' && gameState.diceResults[0] === num && (
                    <motion.div 
                      layoutId="win-glow-num"
                      className="absolute inset-0 border-4 border-emerald-500 rounded-2xl animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Bet Amount & Place Bet */}
            <div className="pt-4 space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Bet Amount</span>
                <div className="flex gap-2">
                  {[10, 50, 100, 500].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors ${betAmount === amt ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={placeBet}
                disabled={isBetPlaced || !selectedChoice || gameState?.phase !== 'waiting' || currentBalance < betAmount}
                className={`
                  w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-lg flex items-center justify-center gap-3 transition-all
                  ${isBetPlaced
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 cursor-not-allowed'
                    : !selectedChoice || gameState?.phase !== 'waiting'
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-500 text-black shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]'}
                `}
              >
                {isBetPlaced ? 'Bet Placed' : 'Place Bet'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* History */}
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <History className="text-emerald-500" size={18} /> History
              </h3>
            </div>
            
            <div className="space-y-3">
              {gameState?.history?.map((res: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-black font-black text-xl">
                      {res.diceResults[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Round #{res.roundId.toString().slice(-4)}</div>
                      <div className="text-[10px] text-gray-500 font-medium">Result: {res.diceResults[0]}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-black ${res.diceResults[0] >= 4 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {res.diceResults[0] >= 4 ? 'BIG' : 'SMALL'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Bets */}
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Users className="text-emerald-500" size={18} /> Live Bets
              </h3>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
                {gameState?.bets?.length || 0} Players
              </span>
            </div>
            
            <div className="space-y-3">
              {gameState?.bets?.map((bet: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-[10px] font-black">
                      {bet.username?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">{bet.username}</p>
                      <p className="text-[10px] text-gray-500">${bet.amount} on {bet.choice}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {bet.status === 'won' ? (
                      <div className="text-emerald-500 text-[10px] font-black">+${bet.winAmount}</div>
                    ) : bet.status === 'lost' ? (
                      <div className="text-red-500 text-[10px] font-black">-${bet.amount}</div>
                    ) : (
                      <div className="text-gray-500 text-[10px] font-black animate-pulse">PENDING</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
