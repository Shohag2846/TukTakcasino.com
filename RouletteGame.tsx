import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  ChevronLeft, 
  History, 
  Coins, 
  RotateCcw, 
  Zap, 
  Trophy,
  PlusCircle,
  Clock,
  User,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Menu,
  Settings,
  HelpCircle,
  LogOut,
  Trash2,
  X
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface RouletteGameProps {
  user: any;
  setUser: (user: any) => void;
  setActiveTab: (tab: any) => void;
  t: any;
}

const ROULETTE_NUMBERS_WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export function RouletteGame({ user, setUser, setActiveTab, t }: RouletteGameProps) {
  useEffect(() => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in the Settings menu.', {
        autoClose: false,
        toastId: 'supabase-config-error'
      });
    }
  }, []);

  const [betAmount, setBetAmount] = useState(10);
  const [showActivity, setShowActivity] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [gameState, setGameState] = useState<any>({
    phase: 'waiting',
    timeLeft: 60,
    roundId: '',
    resultNumber: null,
    history: [],
    bets: []
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [myBets, setMyBets] = useState<any[]>([]);
  const myBetsRef = useRef<any[]>([]);
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [localRecentResults, setLocalRecentResults] = useState<any[]>([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [lastWinAmount, setLastWinAmount] = useState(0);
  const [gameMode, setGameMode] = useState<'demo' | 'real'>(user.game_mode || 'demo');

  const fetchRecentResults = async () => {
    try {
      console.log('[DEBUG] Fetching recent results...');
      const { data, error } = await supabase
        .from('game_results')
        .select('result_data, created_at')
        .eq('game_name', 'roulette')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('[DEBUG] Error fetching recent results:', error.message);
        return;
      }

      if (data) {
        const results = data.map(r => {
          const res = r.result_data;
          if (typeof res === 'number') return res;
          if (res && typeof res === 'object' && 'number' in res) return res.number;
          return null;
        }).filter(n => n !== null);
        
        console.log('[DEBUG] Recent results fetched:', results);
        setLocalRecentResults(results);
      }
    } catch (err) {
      console.error('Error fetching recent results:', err);
    }
  };

  useEffect(() => {
    fetchRecentResults();
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isSpinning, setIsSpinning] = useState(false);
  const [liveBets, setLiveBets] = useState<any[]>([]);
  const [winningNumberGlow, setWinningNumberGlow] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const wheelControls = useAnimation();
  const ballControls = useAnimation();
  const idleRotationRef = useRef(0);
  const isSpinningRef = useRef(false);
  const lastProcessedRoundId = useRef<any>(null);
  const animationStartedRef = useRef<any>(null);
  const localTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentBalance = gameMode === 'real' ? user.balance : (user.demo_balance || 0);

  const totalBet = useMemo(() => myBets.reduce((sum, b) => sum + b.amount, 0), [myBets]);

  const fetchHistory = () => {
    if (!socket || !user?.id) return;
    socket.emit('get-roulette-history', {
      userId: user.id,
      token: localStorage.getItem('supabase.auth.token') || 'mock_token'
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('roulette-history', (history: any[]) => {
      setDbHistory(history);
    });

    socket.on('bet-placed', () => {
      fetchHistory();
    });

    socket.on('bet-undone', () => {
      fetchHistory();
    });

    socket.on('bets-cleared', () => {
      fetchHistory();
    });

    return () => {
      socket.off('roulette-history');
      socket.off('bet-placed');
      socket.off('bet-undone');
      socket.off('bets-cleared');
    };
  }, [socket]);

  useEffect(() => {
    fetchHistory();
    fetchRecentResults();
  }, [user.id, gameState.roundId, socket]);

  const combinedResults = useMemo(() => {
    const serverHistory = gameState.history || [];
    // If server history is available, use it as primary source
    if (serverHistory.length > 0) return serverHistory;
    // Otherwise fallback to local history
    return localRecentResults;
  }, [gameState.history, localRecentResults]);
  
  const potentialWin = useMemo(() => {
    if (myBets.length === 0) return 0;
    
    let maxWin = 0;
    
    // Check every possible outcome (0-36)
    for (let i = 0; i <= 36; i++) {
      let currentOutcomeWin = 0;
      const isRed = RED_NUMBERS.includes(i);
      const isEven = i !== 0 && i % 2 === 0;
      const isOdd = i !== 0 && i % 2 !== 0;
      const isLow = i >= 1 && i <= 18;
      const isHigh = i >= 19 && i <= 36;
      const is1st12 = i >= 1 && i <= 12;
      const is2nd12 = i >= 13 && i <= 24;
      const is3rd12 = i >= 25 && i <= 36;

      myBets.forEach(bet => {
        if (bet.type === 'number' && bet.value === i) currentOutcomeWin += bet.amount * 36;
        else if (bet.type === 'red' && isRed) currentOutcomeWin += bet.amount * 2;
        else if (bet.type === 'black' && !isRed && i !== 0) currentOutcomeWin += bet.amount * 2;
        else if (bet.type === 'even' && isEven) currentOutcomeWin += bet.amount * 2;
        else if (bet.type === 'odd' && isOdd) currentOutcomeWin += bet.amount * 2;
        else if (bet.type === '1-18' && isLow) currentOutcomeWin += bet.amount * 2;
        else if (bet.type === '19-36' && isHigh) currentOutcomeWin += bet.amount * 2;
        else if (bet.type === '1st12' && is1st12) currentOutcomeWin += bet.amount * 3;
        else if (bet.type === '2nd12' && is2nd12) currentOutcomeWin += bet.amount * 3;
        else if (bet.type === '3rd12' && is3rd12) currentOutcomeWin += bet.amount * 3;
        else if (bet.type === '2to1' && i !== 0 && (i - 1) % 3 === (bet.value - 1)) currentOutcomeWin += bet.amount * 3;
      });
      
      maxWin = Math.max(maxWin, currentOutcomeWin);
    }
    
    return maxWin;
  }, [myBets]);

  const refreshProfile = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data && !error) {
      setUser(data);
    }
  };

  useEffect(() => {
    let animationFrame: number;
    const animateIdle = () => {
      if (!isSpinningRef.current) {
        idleRotationRef.current += 0.2;
        wheelControls.set({ rotate: idleRotationRef.current });
      }
      animationFrame = requestAnimationFrame(animateIdle);
    };
    animateIdle();
    return () => cancelAnimationFrame(animationFrame);
  }, [wheelControls]);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('roulette-state', (state) => {
      console.log('[DEBUG] Roulette State:', state.phase, 'Time:', state.timeLeft, 'Result:', state.resultNumber);
      setGameState(state);
      
      if (state.roundId) {
        localStorage.setItem('last_roulette_round_id', state.roundId);
      }
      // Update live bets from state
      if (state.bets) {
        setLiveBets(state.bets);
      }
      
      if (state.phase === 'spinning') {
        if (animationStartedRef.current !== state.roundId) {
          console.log('[DEBUG] SPIN START - Round:', state.roundId, 'Winning Number:', state.resultNumber);
          startSpinAnimation(state.resultNumber);
          animationStartedRef.current = state.roundId;
        }
      } else if (state.phase === 'waiting') {
        if (lastProcessedRoundId.current !== state.roundId) {
          setMyBets([]);
          myBetsRef.current = [];
          setShowWinOverlay(false);
          setIsSpinning(false);
          isSpinningRef.current = false;
          setWinningNumberGlow(null);
          lastProcessedRoundId.current = state.roundId;
          refreshProfile();
          fetchHistory();
        }
      } else if (state.phase === 'result') {
        if (lastProcessedRoundId.current !== state.roundId) {
          console.log('[DEBUG] WINNING NUMBER:', state.resultNumber);
          setWinningNumberGlow(state.resultNumber);
          processResults(state);
          lastProcessedRoundId.current = state.roundId;
          refreshProfile();
          fetchHistory();
          
          // Keep highlight for 3 seconds
          setTimeout(() => {
            // Glow handled by state winningNumberGlow
          }, 3000);
        }
      }
    });

    newSocket.on('bet-placed', () => refreshProfile());
    newSocket.on('bet-undone', () => refreshProfile());
    newSocket.on('bets-cleared', () => refreshProfile());

    return () => {
      newSocket.disconnect();
    };
  }, [user.id, gameMode, gameState.roundId]);

  const processResults = (state: any) => {
    // Use server-provided bets if available and not empty, otherwise fallback to local bets
    const serverBets = state.bets || [];
    const myRoundBets = (serverBets.length > 0 ? serverBets : myBetsRef.current).filter((b: any) => b.userId === user.id || !b.userId);
    
    let totalWin = 0;
    if (myRoundBets.length > 0) {
      const resultNum = state.resultNumber;
      const isRed = RED_NUMBERS.includes(resultNum);
      const isEven = resultNum !== 0 && resultNum % 2 === 0;
      const isOdd = resultNum !== 0 && resultNum % 2 !== 0;

      myRoundBets.forEach((bet: any) => {
        let winMultiplier = 0;
        const val = Number(bet.value);
        if (bet.type === 'number' && val === resultNum) winMultiplier = 36;
        else if (bet.type === 'red' && isRed) winMultiplier = 2;
        else if (bet.type === 'black' && !isRed && resultNum !== 0) winMultiplier = 2;
        else if (bet.type === 'even' && isEven) winMultiplier = 2;
        else if (bet.type === 'odd' && isOdd) winMultiplier = 2;
        else if (bet.type === '1-18' && resultNum >= 1 && resultNum <= 18) winMultiplier = 2;
        else if (bet.type === '19-36' && resultNum >= 19 && resultNum <= 36) winMultiplier = 2;
        else if (bet.type === '1st12' && resultNum >= 1 && resultNum <= 12) winMultiplier = 3;
        else if (bet.type === '2nd12' && resultNum >= 13 && resultNum <= 24) winMultiplier = 3;
        else if (bet.type === '3rd12' && resultNum >= 25 && resultNum <= 36) winMultiplier = 3;
        else if (bet.type === '2to1' && resultNum !== 0 && (resultNum - 1) % 3 === (Number(bet.value) - 1)) winMultiplier = 3;

        totalWin += bet.amount * winMultiplier;
      });

      if (totalWin > 0) {
        setLastWinAmount(totalWin);
        setShowWinOverlay(true);
        refreshProfile();
      }
    }
    return totalWin;
  };

  const startSpinAnimation = async (resultNum: any) => {
    if (resultNum === null || resultNum === undefined) {
      console.error('[DEBUG] CANNOT SPIN: resultNum is null');
      return;
    }
    
    const num = Number(resultNum);
    setIsSpinning(true);
    isSpinningRef.current = true;
    const resultIndex = ROULETTE_NUMBERS_WHEEL.indexOf(num);
    const segmentAngle = 360 / 37;
    
    // Wheel animation: rotate clockwise (at least 6 full rotations)
    const spins = 6;
    const currentWheelRotation = idleRotationRef.current;
    const targetAngle = (360 - (resultIndex * segmentAngle)) % 360;
    const currentAngle = ((currentWheelRotation % 360) + 360) % 360;
    const angleDiff = (targetAngle - currentAngle + 360) % 360;
    const targetWheelRotation = currentWheelRotation + (spins * 360) + angleDiff;
    
    // Ball animation: rotate counter-clockwise (at least 10 full rotations)
    const ballSpins = 10;
    const currentBallRotation = ballRotation;
    const targetBallRotation = currentBallRotation - (ballSpins * 360) - (((currentBallRotation % 360) + 360) % 360);

    const duration = 10;
    
    // Both wheel and ball start and end at the same time
    const commonEase = [0.15, 0, 0.2, 1] as any;
    
    wheelControls.start({
      rotate: targetWheelRotation,
      transition: { duration, ease: commonEase }
    });

    ballControls.start({
      rotate: targetBallRotation,
      scale: [1, 1.2, 1, 0.9, 1], // Simulate ball bouncing
      top: ['8%', '8%', '8%', '10%', '18%'], // Ball falls deeper into pocket at the very end
      transition: { 
        rotate: { duration, ease: commonEase },
        scale: { duration, times: [0, 0.2, 0.5, 0.9, 1] },
        top: { duration, times: [0, 0.5, 0.8, 0.95, 1] }
      }
    } as any);

    setTimeout(() => {
      idleRotationRef.current = targetWheelRotation;
      setWheelRotation(targetWheelRotation);
      setBallRotation(targetBallRotation);
      setIsSpinning(false);
      isSpinningRef.current = false;
      setWinningNumberGlow(num);
      fetchRecentResults();
      fetchHistory();
      
      // Clear glow after 5 seconds
      setTimeout(() => setWinningNumberGlow(null), 5000);
    }, duration * 1000 + 50); // Small buffer
  };

  const handleUndoBet = () => {
    if (gameState.phase !== 'waiting' || myBets.length === 0) return;
    
    const lastBet = myBets[myBets.length - 1];
    socket?.emit('roulette-undo', {
      userId: user.id,
      mode: gameMode,
      token: localStorage.getItem('supabase.auth.token')
    });

    setMyBets(prev => prev.slice(0, -1));
    myBetsRef.current = myBetsRef.current.slice(0, -1);
    
    if (gameMode === 'real') {
      setUser({ ...user, balance: user.balance + lastBet.amount });
    } else {
      setUser({ ...user, demo_balance: (user.demo_balance || 0) + lastBet.amount });
    }
  };

  const handleClearBets = () => {
    if (gameState.phase !== 'waiting' || myBets.length === 0) return;
    
    const totalRefund = myBets.reduce((sum, b) => sum + b.amount, 0);
    socket?.emit('roulette-clear', {
      userId: user.id,
      mode: gameMode,
      token: localStorage.getItem('supabase.auth.token')
    });

    setMyBets([]);
    myBetsRef.current = [];
    
    if (gameMode === 'real') {
      setUser({ ...user, balance: user.balance + totalRefund });
    } else {
      setUser({ ...user, demo_balance: (user.demo_balance || 0) + totalRefund });
    }
  };

  const handlePlaceBet = (type: string, value: any) => {
    if (gameState.phase !== 'waiting') {
      toast.warning('Betting is closed');
      return;
    }

    if (currentBalance < betAmount) {
      toast.error(
        <div className="flex flex-col gap-2">
          <span className="font-bold">Insufficient Balance</span>
          <button 
            onClick={() => setActiveTab('balance')}
            className="bg-white text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase"
          >
            Add Money / Deposit
          </button>
        </div>,
        { autoClose: 5000 }
      );
      return;
    }

    const betData = {
      userId: user.id,
      username: user.username,
      amount: betAmount,
      type,
      value,
      mode: gameMode,
      token: localStorage.getItem('supabase.auth.token')
    };

    console.log('[DEBUG] BET INSERT:', betData);
    socket?.emit('roulette-bet', betData);
    
    // Update local state immediately for UI feedback
    const newBet = { type, value, amount: betAmount };
    setMyBets(prev => {
      const updated = [...prev, newBet];
      myBetsRef.current = updated;
      return updated;
    });
    
    if (gameMode === 'real') {
      setUser({ ...user, balance: user.balance - betAmount });
    } else {
      setUser({ ...user, demo_balance: (user.demo_balance || 0) - betAmount });
    }
  };

  // Debug logging
  useEffect(() => {
    if (myBets.length > 0) {
      console.log('[Roulette] Current Bets Updated:', myBets);
    }
  }, [myBets]);

  const getChipForPosition = (type: string, value: any) => {
    const totalAmount = myBets
      .filter(b => b.type === type && b.value === value)
      .reduce((sum, b) => sum + b.amount, 0);
    
    if (totalAmount === 0) return null;

    // Determine chip color based on amount
    const getChipColor = (amt: number) => {
      if (amt >= 100) return 'bg-orange-500 shadow-orange-500/50';
      if (amt >= 50) return 'bg-purple-500 shadow-purple-500/50';
      if (amt >= 20) return 'bg-yellow-500 shadow-yellow-500/50';
      if (amt >= 10) return 'bg-emerald-500 shadow-emerald-500/50';
      if (amt >= 5) return 'bg-red-500 shadow-red-500/50';
      return 'bg-blue-500 shadow-blue-500/50';
    };

    return (
      <motion.div 
        initial={{ scale: 0, y: -10 }}
        animate={{ scale: 1, y: 0 }}
        className="absolute inset-0 flex items-center justify-center z-[30] pointer-events-none"
      >
        <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full ${getChipColor(totalAmount)} border-2 border-dashed border-white/60 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center text-[9px] md:text-[11px] font-black text-white ring-2 ring-black/40 animate-pulse-glow`}>
          <div className="absolute inset-0 rounded-full border border-white/20" />
          {totalAmount >= 1000 ? `${(totalAmount/1000).toFixed(1)}k` : totalAmount}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-white overflow-hidden font-sans flex flex-col relative">
      {/* Header: Back (Left), Title (Center), Balance/Menu (Right) */}
      <header className="h-14 bg-black/80 backdrop-blur-2xl border-b border-white/5 px-4 flex items-center justify-between shrink-0 z-[60]">
        <button 
          onClick={() => setActiveTab('home')}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-black italic uppercase tracking-tighter text-emerald-500">Roulette Pro</h1>
          <div className="flex gap-1">
            <div className={`w-1 h-1 rounded-full ${gameState.phase === 'waiting' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
            <div className={`w-1 h-1 rounded-full ${gameState.phase === 'spinning' ? 'bg-orange-500 animate-pulse' : 'bg-zinc-700'}`} />
            <div className={`w-1 h-1 rounded-full ${gameState.phase === 'result' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={refreshProfile}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-emerald-500/50 hover:text-emerald-500"
            title="Refresh Balance"
          >
            <RotateCcw size={18} />
          </button>

          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Coins size={14} className="text-emerald-500" />
            <span className="font-black tabular-nums text-emerald-500 text-xs">₹{currentBalance.toLocaleString()}</span>
            <button 
              onClick={() => setActiveTab('balance')}
              className="ml-1 p-1 bg-emerald-500 text-black rounded-md hover:scale-105 transition-all"
            >
              <PlusCircle size={12} />
            </button>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <AnimatePresence>
            {showMenu && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[70]" 
                  onClick={() => setShowMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[80] overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-white/5 rounded-xl transition-colors">
                      <Settings size={16} className="text-gray-400" /> Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-white/5 rounded-xl transition-colors">
                      <HelpCircle size={16} className="text-gray-400" /> How to Play
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut size={16} /> Exit Game
                    </button>
                  </div>
                </motion.div>
              </>
            )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col landscape:flex-row sm:flex-row overflow-hidden relative bg-[#0a0a0a]">
        {/* Left Side: Wheel Section */}
        <div className="w-full landscape:w-[40%] sm:w-[40%] h-[35%] landscape:h-full sm:h-full flex flex-col items-center justify-center relative p-2 md:p-4 border-r border-white/5 bg-gradient-to-b from-zinc-900/40 to-black shrink-0">
          {/* Status Display */}
          <div className="absolute top-1 md:top-8 flex flex-col items-center gap-0 z-20">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[6px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            >
              {gameState.phase === 'waiting' ? 'Place Your Bets' : gameState.phase.toUpperCase()}
            </motion.div>
            <div className={`text-lg md:text-5xl font-black tabular-nums tracking-tighter ${gameState.phase === 'waiting' ? 'text-white' : 'text-orange-500'} drop-shadow-2xl`}>
              {gameState.timeLeft}<span className="text-[8px] md:text-xl ml-0.5 opacity-50">s</span>
            </div>
          </div>

          {/* The Wheel */}
          <div className="relative w-full max-w-[200px] md:max-w-[450px] aspect-square flex items-center justify-center">
            {/* Outer Glow */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-[30px] md:blur-[120px] animate-pulse" />
            
            <motion.div 
              className="relative w-full h-full rounded-full border-[3px] md:border-[12px] border-[#1a1a1a] shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(255,255,255,0.05)] bg-[#0a0a0a]"
              animate={wheelControls}
            >
              {ROULETTE_NUMBERS_WHEEL.map((num, i) => {
                const angle = (i * 360) / 37;
                const isRed = RED_NUMBERS.includes(num);
                const isZero = num === 0;
                const isWinning = winningNumberGlow === num;
                
                return (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 w-[8%] h-1/2 origin-bottom -translate-x-1/2"
                    style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                  >
                    <div className={`w-full h-[15%] flex items-center justify-center text-[3px] md:text-[8px] font-black
                      ${isZero ? 'bg-emerald-600' : isRed ? 'bg-red-600' : 'bg-zinc-900'}
                      ${isWinning ? 'ring-[1px] md:ring-4 ring-white ring-inset z-10 animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]' : ''}
                    `}>
                      <span style={{ transform: 'rotate(180deg)' }}>{num}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Center Hub */}
            <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-zinc-800 to-black shadow-2xl border border-white/10 z-20 flex items-center justify-center">
              <div className="w-1/2 h-1/2 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
            </div>

            {/* The Ball */}
            <motion.div
              className="absolute w-full h-full z-40 pointer-events-none"
              animate={ballControls}
              initial={{ rotate: 0, top: '8%' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 md:w-4 h-1.5 md:h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] border border-gray-200" />
            </motion.div>
          </div>

          {/* Winning Number Display */}
          <AnimatePresence>
            {gameState.phase === 'result' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
              >
                <div className={`
                  w-12 h-12 md:w-24 md:h-24 rounded-full flex items-center justify-center text-xl md:text-5xl font-black shadow-[0_0_50px_rgba(255,255,255,0.3)] border-2 md:border-8 border-white
                  ${RED_NUMBERS.includes(gameState.resultNumber) ? 'bg-red-600' : gameState.resultNumber === 0 ? 'bg-emerald-600' : 'bg-zinc-900'}
                `}>
                  {gameState.resultNumber}
                </div>
                <div className="mt-0.5 md:mt-2 px-2 py-0.5 md:px-4 md:py-1 bg-white text-black text-[6px] md:text-[10px] font-black uppercase rounded-full">Winner</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Betting Grid Section */}
        <div className="w-full landscape:w-[60%] sm:w-[60%] flex-1 landscape:h-full sm:h-full flex flex-col bg-zinc-950 p-1.5 md:p-6 overflow-y-auto scrollbar-hide pb-20 sm:pb-0">
          {/* Active Bets Summary */}
          {myBets.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1.5 md:mb-4 px-3 py-1.5 md:px-6 md:py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-between shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Bets ({myBets.length})</span>
              </div>
              <div className="text-[10px] md:text-sm font-black text-emerald-500">₹{totalBet.toLocaleString()}</div>
            </motion.div>
          )}

          {/* Betting Grid Container */}
          <div className="flex-1 min-h-0 flex flex-col gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
            <div className="relative min-w-[600px] md:min-w-0 flex-1 bg-zinc-950/60 rounded-[24px] md:rounded-[48px] border border-white/5 p-4 md:p-8 shadow-2xl flex flex-col">
              {/* Unified Table Grid */}
              <div className="flex-1 grid grid-cols-[60px_repeat(12,1fr)_60px] grid-rows-[repeat(3,1fr)_50px_50px] md:grid-rows-[repeat(3,1fr)_80px_80px] gap-1 md:gap-2">
                {/* Zero Section */}
                <button
                  onClick={() => handlePlaceBet('number', 0)}
                  className={`
                    row-start-1 row-end-4 col-start-1
                    bg-emerald-600/10 border border-emerald-500/20 rounded-l-2xl md:rounded-l-[40px] flex flex-col items-center justify-center transition-all hover:bg-emerald-600/30 relative group
                    ${winningNumberGlow === 0 ? 'bg-white text-black z-10 scale-105 shadow-[0_0_60px_rgba(255,255,255,0.5)] ring-2 ring-white' : ''}
                  `}
                >
                  <span className={`text-sm md:text-4xl font-black ${winningNumberGlow === 0 ? 'text-black' : 'text-emerald-500'}`}>0</span>
                  <span className="text-[6px] md:text-[12px] font-black text-emerald-500/40 uppercase tracking-tighter">36x</span>
                  {getChipForPosition('number', 0)}
                </button>

                {/* Numbers Grid */}
                {Array.from({ length: 36 }, (_, i) => {
                  const num = i + 1;
                  const isRed = RED_NUMBERS.includes(num);
                  const row = 3 - (i % 3);
                  const col = Math.floor(i / 3) + 2;
                  const isWinning = winningNumberGlow === num;

                  return (
                    <button
                      key={num}
                      onClick={() => handlePlaceBet('number', num)}
                      className={`
                        relative flex flex-col items-center justify-center transition-all border border-white/5 rounded-md md:rounded-xl group
                        ${isRed ? 'bg-red-600/10 text-red-500 hover:bg-red-600/30' : 'bg-zinc-800/40 text-gray-400 hover:bg-zinc-700/60'}
                        ${isWinning ? 'bg-white text-black z-10 scale-110 shadow-[0_0_60px_rgba(255,255,255,0.5)] ring-2 ring-white' : ''}
                      `}
                      style={{ gridColumn: col, gridRow: row }}
                    >
                      <span className={`text-[10px] md:text-xl font-black ${isWinning ? 'text-black' : ''}`}>{num}</span>
                      <span className="text-[5px] md:text-[10px] font-black opacity-40">36x</span>
                      {getChipForPosition('number', num)}
                    </button>
                  );
                })}

                {/* 2 to 1 Columns */}
                {[3, 2, 1].map((val, idx) => (
                  <button
                    key={`2to1-${val}`}
                    onClick={() => handlePlaceBet('2to1', val)}
                    className="col-start-14 bg-white/5 border border-white/10 rounded-r-2xl md:rounded-r-[40px] flex flex-col items-center justify-center hover:bg-white/10 transition-all relative text-[7px] md:text-[14px] font-black text-gray-400 uppercase group"
                    style={{ gridRow: idx + 1 }}
                  >
                    <span className="vertical-text tracking-tighter">2 to 1</span>
                    <span className="opacity-40 text-[6px] md:text-[10px]">3x</span>
                    {getChipForPosition('2to1', val)}
                  </button>
                ))}

                {/* Dozens Row */}
                {['1st12', '2nd12', '3rd12'].map((val, idx) => (
                  <button 
                    key={val}
                    onClick={() => handlePlaceBet(val, val)}
                    className="row-start-4 col-span-4 bg-white/5 border border-white/10 text-[8px] md:text-[14px] font-black uppercase tracking-widest hover:bg-white/10 flex flex-col items-center justify-center rounded-xl md:rounded-3xl group relative"
                    style={{ gridColumn: (idx * 4) + 2 }}
                  >
                    <span>{idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : 'rd'} 12</span>
                    <span className="text-[6px] md:text-[10px] font-black opacity-40">3x</span>
                    {getChipForPosition(val, val)}
                  </button>
                ))}

                {/* Even Money Row */}
                {[
                  { id: '1-18', label: '1-18', mult: '2x' },
                  { id: 'even', label: 'Even', mult: '2x' },
                  { id: 'red', label: 'Red', mult: '2x', color: 'bg-red-600/10 text-red-500 border-red-500/20' },
                  { id: 'black', label: 'Black', mult: '2x', color: 'bg-zinc-800/40 text-gray-400 border-white/10' },
                  { id: 'odd', label: 'Odd', mult: '2x' },
                  { id: '19-36', label: '19-36', mult: '2x' }
                ].map((bet, idx) => (
                  <button 
                    key={bet.id}
                    onClick={() => handlePlaceBet(bet.id, bet.id)}
                    className={`row-start-5 col-span-2 rounded-xl md:rounded-3xl border flex flex-col items-center justify-center text-[7px] md:text-[12px] font-black uppercase tracking-tighter group relative
                      ${bet.color || 'bg-white/5 border-white/10 text-gray-400'}
                      hover:brightness-125 transition-all
                    `}
                    style={{ gridColumn: (idx * 2) + 2 }}
                  >
                    <span>{bet.label}</span>
                    <span className="text-[6px] md:text-[10px] font-black opacity-40">{bet.mult}</span>
                    {getChipForPosition(bet.id, bet.id)}
                  </button>
                ))}
              </div>
            </div>
          </div>

            {/* Betting Controls */}
            <div className="mt-2 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 glass-effect flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Coins size={12} />
                  </div>
                  <div>
                    <div className="text-[6px] font-black text-emerald-500/60 uppercase tracking-widest">Total Bet</div>
                    <div className="text-xs font-black text-emerald-500">₹{totalBet.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-blue-500/5 p-2 rounded-xl border border-blue-500/10 glass-effect flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <TrendingUp size={12} />
                  </div>
                  <div>
                    <div className="text-[6px] font-black text-blue-500/60 uppercase tracking-widest">Potential Win</div>
                    <div className="text-xs font-black text-blue-500">₹{potentialWin.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Chip Selector */}
              <div className="flex items-center justify-center gap-2 md:gap-6 bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
                {[1, 5, 10, 20, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className={`
                      relative w-8 h-8 md:w-14 md:h-14 rounded-full flex items-center justify-center text-[10px] md:text-sm font-black transition-all
                      ${betAmount === amount ? 'scale-110 z-10 ring-1 ring-white ring-offset-2 ring-offset-black' : 'opacity-60 hover:opacity-100 hover:scale-105'}
                      ${amount === 1 ? 'bg-blue-500 text-white' : 
                        amount === 5 ? 'bg-red-500 text-white' : 
                        amount === 10 ? 'bg-emerald-500 text-black' : 
                        amount === 20 ? 'bg-yellow-500 text-black' :
                        amount === 50 ? 'bg-purple-500 text-white' : 'bg-orange-500 text-white'}
                      shadow-[0_0_10px_rgba(0,0,0,0.5)]
                      before:absolute before:inset-0.5 before:rounded-full before:border before:border-dashed before:border-white/30
                    `}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <button 
                  onClick={handleUndoBet}
                  disabled={gameState.phase !== 'waiting' || myBets.length === 0}
                  className="p-3 bg-white/5 hover:bg-orange-500/20 rounded-xl border border-white/10 transition-all text-gray-400 hover:text-orange-500 flex items-center gap-1 disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  <span className="text-[8px] font-black uppercase">Undo</span>
                </button>

                <button 
                  onClick={handleClearBets}
                  disabled={gameState.phase !== 'waiting' || myBets.length === 0}
                  className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl border border-white/10 transition-all text-gray-400 hover:text-red-500 flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  <span className="text-[8px] font-black uppercase">Clear</span>
                </button>

                <button 
                  onClick={() => setShowActivity(!showActivity)}
                  className={`md:hidden p-3 rounded-xl border transition-all flex items-center gap-1
                    ${showActivity ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-gray-400 border-white/10'}
                  `}
                >
                  <Zap size={16} />
                  <span className="text-[8px] font-black uppercase">Activity</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Live Activity Section (Collapsible on mobile) */}
      <AnimatePresence>
        {(showActivity || !isMobile) && (
          <motion.div 
            initial={isMobile ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
            animate={{ height: isMobile ? 'auto' : 'auto', opacity: 1 }}
            exit={isMobile ? { height: 0, opacity: 0 } : undefined}
            className={`
              bg-[#0a0a0a] border-t border-white/5 flex flex-col shrink-0 z-50 overflow-hidden
              ${isMobile ? 'fixed bottom-12 left-0 right-0 max-h-[60vh] rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.8)]' : 'h-48 md:h-64'}
            `}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-emerald-500" />
                <h3 className="text-xs md:text-sm font-black text-emerald-500 uppercase tracking-tighter">Live Round Activity</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time Updates</div>
                {isMobile && (
                  <button onClick={() => setShowActivity(false)} className="p-1 hover:bg-white/10 rounded-full">
                    <X size={16} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Current Round Bets */}
              <div className="w-1/2 border-r border-white/5 flex flex-col">
                <div className="px-4 py-2 text-[8px] md:text-[10px] font-black text-gray-500 uppercase border-b border-white/5 bg-white/[0.02]">Current Round Bets</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
                  {liveBets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-800 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Waiting for bets...</span>
                    </div>
                  ) : (
                    liveBets.map((bet) => (
                      <div key={bet.id || Math.random()} className="flex items-center justify-between bg-white/[0.03] p-2 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg
                            ${(bet.bet_type || bet.type) === 'number' ? (RED_NUMBERS.includes(Number(bet.bet_value || bet.value)) ? 'bg-red-600' : Number(bet.bet_value || bet.value) === 0 ? 'bg-emerald-600' : 'bg-zinc-800') : 'bg-zinc-700'}
                          `}>
                            {(bet.bet_type || bet.type) === 'number' ? (bet.bet_value || bet.value) : String(bet.bet_type || bet.type || '').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-white/60 uppercase">{bet.user_id === user.id || bet.userId === user.id ? 'YOU' : 'USER'}</span>
                              <span className="text-[10px] font-bold text-gray-400">{bet.bet_type || bet.type}</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${bet.status === 'win' ? 'text-emerald-500' : bet.status === 'loss' ? 'text-red-500' : 'text-yellow-500'}`}>
                              {bet.status || 'pending'}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs font-black text-emerald-500">₹{bet.amount}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* My Recent History */}
              <div className="w-1/2 flex flex-col">
                <div className="px-4 py-2 text-[8px] md:text-[10px] font-black text-gray-500 uppercase border-b border-white/5 bg-white/[0.02]">My Recent History</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
                  {dbHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">No history yet...</div>
                  ) : (
                    dbHistory.map((bet) => (
                      <div key={bet.id} className="flex items-center justify-between bg-white/[0.03] p-2 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black
                            ${bet.status === 'win' ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30' : 
                              bet.status === 'pending' ? 'bg-orange-600/20 text-orange-500 border border-orange-500/30' :
                              'bg-red-600/20 text-red-500 border border-red-500/30'}
                          `}>
                            {bet.bet_type === 'number' ? bet.bet_value : String(bet.bet_type || '').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">Round #{bet.round_id?.toString().slice(-4) || '----'}</span>
                              <span className="text-[8px] font-black text-white/20">{new Date(bet.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span className={`text-[10px] font-black 
                              ${bet.status === 'win' ? 'text-emerald-500' : 
                                bet.status === 'pending' ? 'text-orange-500' : 
                                'text-red-500'}
                            `}>
                              {bet.status === 'win' ? `+₹${bet.payout}` : 
                                bet.status === 'pending' ? `₹${bet.amount} (Pending)` :
                                `-₹${bet.amount}`}
                            </span>
                          </div>
                        </div>
                        <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">{bet.bet_type}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer: Recent Results */}
      <footer className="h-12 bg-black border-t border-white/5 px-4 flex items-center gap-4 shrink-0 z-[60]">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          <History size={14} /> Recent Results
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {combinedResults.map((h: any, i: number) => {
            if (h === undefined || h === null) return null;
            const num = typeof h === 'object' ? h.number : h;
            const color = typeof h === 'object' ? h.color : (num === 0 ? 'green' : RED_NUMBERS.includes(num) ? 'red' : 'black');
            
            if (num === undefined || num === null) return null;
            return (
              <div 
                key={i}
                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black border border-white/10
                  ${color === 'green' ? 'bg-emerald-500 text-black' : color === 'red' ? 'bg-red-600' : 'bg-zinc-900'}
                `}
              >
                {num}
              </div>
            );
          })}
        </div>
      </footer>

      <AnimatePresence>
        {showWinOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setShowWinOverlay(false)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                <Trophy size={48} className="text-black" />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Big Win!</h2>
              <div className="text-5xl font-black text-emerald-500 tabular-nums">₹{lastWinAmount.toLocaleString()}</div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Congratulations!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media screen and (max-width: 1024px) and (orientation: portrait) {
          .landscape-warning { display: flex !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}} />
      
      <div className="landscape-warning fixed inset-0 z-[200] bg-black flex-col items-center justify-center hidden p-8 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-500">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Please Rotate Your Device</h2>
        <p className="text-gray-400 text-sm font-bold">This game is best experienced in landscape mode.</p>
      </div>
    </div>
  );
}
