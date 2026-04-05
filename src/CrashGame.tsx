import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, History, Users, TrendingUp, AlertCircle, Wallet, Play, Pause, XCircle, CheckCircle2, Zap } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';

interface CrashBet {
  userId: string;
  username: string;
  amount: number;
  mode: 'demo' | 'real';
  cashedOut: boolean;
  cashoutMultiplier: number;
  winAmount: number;
  autoCashout?: number;
  isFake?: boolean;
}

interface CrashState {
  phase: 'waiting' | 'flying' | 'crashed' | 'result';
  multiplier: number;
  timeLeft: number;
  history: number[];
  bets: CrashBet[];
  roundId: number;
}

interface CrashGameProps {
  user: any;
  setUser: (user: any) => void;
  setActiveTab: (tab: string) => void;
  t: any;
}

const CrashGame: React.FC<CrashGameProps> = ({ user, setUser, setActiveTab, t }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<CrashState>({
    phase: 'waiting',
    multiplier: 1.00,
    timeLeft: 0,
    history: [],
    bets: [],
    roundId: 0
  });

  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashout, setAutoCashout] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [hasBetInRound, setHasBetInRound] = useState(false);
  const [cashedOutInRound, setCashedOutInRound] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);

  const graphRef = useRef<SVGSVGElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const engineSound = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);

  const refreshProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data && !error) {
      setUser(data);
    }
  };

  // Initialize Audio
  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNode.current = audioContext.current.createGain();
      gainNode.current.connect(audioContext.current.destination);
      gainNode.current.gain.value = 0;
    }
  };

  const playEngineSound = (multiplier: number) => {
    if (!audioContext.current || !gainNode.current) return;
    
    if (!engineSound.current) {
      engineSound.current = audioContext.current.createOscillator();
      engineSound.current.type = 'sawtooth';
      engineSound.current.connect(gainNode.current);
      engineSound.current.start();
    }
    
    // Pitch increases with multiplier
    const frequency = 50 + (multiplier * 20);
    engineSound.current.frequency.setTargetAtTime(frequency, audioContext.current.currentTime, 0.1);
    gainNode.current.gain.setTargetAtTime(0.05, audioContext.current.currentTime, 0.1);
  };

  const stopEngineSound = () => {
    if (gainNode.current && audioContext.current) {
      gainNode.current.gain.setTargetAtTime(0, audioContext.current.currentTime, 0.1);
    }
    if (engineSound.current) {
      engineSound.current.stop();
      engineSound.current = null;
    }
  };

  const playCrashSound = () => {
    if (!audioContext.current) return;
    const osc = audioContext.current.createOscillator();
    const g = audioContext.current.createGain();
    osc.type = 'square';
    osc.connect(g);
    g.connect(audioContext.current.destination);
    osc.frequency.setValueAtTime(100, audioContext.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.5);
    g.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.5);
    osc.start();
    osc.stop(audioContext.current.currentTime + 0.5);
  };

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('crash-state', (state: CrashState) => {
      setGameState(state);
      
      if (state.phase === 'flying') {
        initAudio();
        playEngineSound(state.multiplier);
      } else {
        stopEngineSound();
        if (state.phase === 'crashed') {
          playCrashSound();
        }
      }

      // Reset round-specific states
      if (state.phase === 'waiting') {
        setHasBetInRound(false);
        setCashedOutInRound(false);
        setWinAmount(null);
      }
    });

    newSocket.on('bet-placed', (data: any) => {
      if (data.gameName === 'crash') {
        setIsPlacingBet(false);
        setHasBetInRound(true);
        refreshProfile();
        toast.success('Bet placed successfully!');
      }
    });

    newSocket.on('cashed-out', (data: any) => {
      setCashedOutInRound(true);
      setWinAmount(data.winAmount);
      refreshProfile();
      toast.success(`Cashed out at ${data.multiplier}x! Win: ${data.winAmount}`);
    });

    newSocket.on('error', (err: any) => {
      setIsPlacingBet(false);
      toast.error(err.message);
    });

    return () => {
      newSocket.disconnect();
      stopEngineSound();
    };
  }, []);

  const handlePlaceBet = () => {
    if (!user || !socket || isPlacingBet) return;
    if (betAmount <= 0) return toast.error('Invalid bet amount');

    setIsPlacingBet(true);
    socket.emit('place-bet', {
      userId: user.id,
      amount: betAmount,
      mode: user.game_mode,
      token: localStorage.getItem('supabase.auth.token'),
      autoCashout: autoCashout ? parseFloat(autoCashout) : undefined
    });
  };

  const handleCashout = () => {
    if (!user || !socket || cashedOutInRound) return;
    socket.emit('cash-out', {
      userId: user.id,
      token: localStorage.getItem('supabase.auth.token')
    });
  };

  // Graph calculations
  const getGraphPath = () => {
    if (gameState.phase === 'waiting' || gameState.phase === 'result') return '';
    
    const width = 800;
    const height = 400;
    const points = [];
    const steps = 50;
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * (gameState.multiplier - 1);
      const x = (i / steps) * width * 0.8;
      const y = height - (Math.pow(t + 1, 1.5) * 20); // Exponential curve
      points.push(`${x},${y}`);
    }
    
    return `M 0,${height} Q ${width * 0.4},${height} ${points[points.length - 1]}`;
  };

  const rocketPos = useMemo(() => {
    const width = 800;
    const height = 400;
    const t = gameState.multiplier - 1;
    const x = Math.min(width * 0.8, t * 50);
    const y = height - (Math.pow(t + 1, 1.5) * 20);
    return { x, y };
  }, [gameState.multiplier]);

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] text-white overflow-hidden font-sans">
      {/* Top Bar: History */}
      <div className="flex items-center gap-2 p-3 bg-[#151a21] border-b border-white/5 overflow-x-auto no-scrollbar">
        <History className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="flex gap-2">
          {gameState.history.map((m, i) => (
            <span
              key={i}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                m >= 2 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {m.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Multiplier Display */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
            <AnimatePresence mode="wait">
              {gameState.phase === 'waiting' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-gray-400 uppercase tracking-widest text-sm mb-2">Next Round In</span>
                  <span className="text-6xl font-black text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    {gameState.timeLeft}s
                  </span>
                </motion.div>
              ) : gameState.phase === 'crashed' ? (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  className="flex flex-col items-center"
                >
                  <span className="text-red-500 text-7xl font-black drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                    CRASHED
                  </span>
                  <span className="text-red-400 text-4xl font-bold mt-2">
                    @{gameState.multiplier.toFixed(2)}x
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key={gameState.multiplier}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className={`text-8xl font-black tracking-tighter ${
                    gameState.multiplier >= 2 ? 'text-green-400' : 'text-white'
                  } drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                    {gameState.multiplier.toFixed(2)}x
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Graph Canvas */}
          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#1a212c_0%,_#0b0e11_100%)]">
            <svg
              ref={graphRef}
              viewBox="0 0 800 400"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              {[...Array(10)].map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 80}
                  y1="0"
                  x2={i * 80}
                  y2="400"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              ))}
              {[...Array(5)].map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 80}
                  x2="800"
                  y2={i * 80}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              ))}

              {/* Growth Line */}
              {gameState.phase === 'flying' && (
                <motion.path
                  d={getGraphPath()}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.1 }}
                />
              )}

              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Rocket */}
              {(gameState.phase === 'flying' || gameState.phase === 'crashed') && (
                <motion.g
                  animate={{
                    x: rocketPos.x,
                    y: rocketPos.y,
                    rotate: gameState.phase === 'crashed' ? 180 : -15
                  }}
                  transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                >
                  <Rocket 
                    className={`w-12 h-12 -translate-x-6 -translate-y-6 ${
                      gameState.phase === 'crashed' ? 'text-red-500' : 'text-red-400'
                    }`} 
                    fill="currentColor"
                  />
                  {gameState.phase === 'flying' && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ repeat: Infinity, duration: 0.2 }}
                      className="absolute w-8 h-8 bg-orange-500 blur-xl -translate-x-4 translate-y-2"
                    />
                  )}
                </motion.g>
              )}
            </svg>

            {/* Win Animation Overlay */}
            <AnimatePresence>
              {winAmount && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.5)] flex flex-col items-center"
                >
                  <span className="text-sm font-bold uppercase tracking-widest opacity-80">You Won!</span>
                  <span className="text-4xl font-black">+{winAmount.toLocaleString()}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Betting Controls */}
          <div className="p-6 bg-[#151a21] border-t border-white/5">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bet Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <span>Bet Amount</span>
                  <div className="flex gap-2">
                    {[10, 50, 100, 500].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBetAmount(amt)}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors"
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#0b0e11] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl font-bold focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Auto Cashout</span>
                    <input
                      type="number"
                      step="0.01"
                      value={autoCashout}
                      onChange={(e) => setAutoCashout(e.target.value)}
                      className="w-full bg-[#0b0e11] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="e.g. 2.00"
                    />
                  </div>
                  <div className="flex-1 flex items-end">
                    <button
                      onClick={() => setBetAmount(prev => prev * 2)}
                      className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      2x
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col justify-end">
                {gameState.phase === 'flying' && hasBetInRound && !cashedOutInRound ? (
                  <button
                    onClick={handleCashout}
                    className="w-full h-24 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black text-3xl shadow-[0_8px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center gap-1"
                  >
                    <span>CASHOUT</span>
                    <span className="text-lg opacity-80">{(betAmount * gameState.multiplier).toFixed(0)}</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceBet}
                    disabled={isPlacingBet || (gameState.phase !== 'waiting' && !hasBetInRound)}
                    className={`w-full h-24 rounded-2xl font-black text-3xl shadow-lg transition-all flex flex-col items-center justify-center gap-1 ${
                      hasBetInRound 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-400 text-white shadow-[0_8px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none'
                    }`}
                  >
                    {isPlacingBet ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : hasBetInRound ? (
                      <>
                        <span className="text-sm uppercase tracking-widest opacity-60">Waiting for next round</span>
                        <span>BET PLACED</span>
                      </>
                    ) : (
                      <>
                        <span>BET</span>
                        <span className="text-sm opacity-80 uppercase tracking-widest">Next Round</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Players & History */}
        <div className="w-80 bg-[#151a21] border-l border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold uppercase tracking-wider">Live Bets</span>
            </div>
            <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">
              {gameState.bets.length} Players
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {gameState.bets.sort((a, b) => b.amount - a.amount).map((bet, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  bet.cashedOut ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${bet.isFake ? 'text-gray-400 italic' : 'text-white'}`}>
                    {bet.username}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {bet.amount.toLocaleString()} {bet.mode === 'demo' ? 'DEMO' : 'REAL'}
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  {bet.cashedOut ? (
                    <>
                      <span className="text-xs font-bold text-green-400">{bet.cashoutMultiplier.toFixed(2)}x</span>
                      <span className="text-[10px] text-green-500">+{bet.winAmount.toLocaleString()}</span>
                    </>
                  ) : gameState.phase === 'crashed' ? (
                    <XCircle className="w-4 h-4 text-red-500/50" />
                  ) : (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Footer */}
          <div className="p-4 bg-[#0b0e11] border-t border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Bets</span>
              <span className="font-bold">{gameState.bets.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Wins</span>
              <span className="font-bold text-green-400">{gameState.bets.reduce((sum, b) => sum + b.winAmount, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;
