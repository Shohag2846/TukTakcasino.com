import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Coins, 
  Trophy, 
  Clock, 
  ArrowRight, 
  Check, 
  X, 
  TrendingUp,
  MessageSquare,
  Users,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface Card {
  suit: string;
  value: string;
}

interface Player {
  id: string;
  username: string;
  balance: number;
  bet: number;
  cards: Card[];
  status: 'active' | 'folded' | 'all-in' | 'out';
  position: number;
  lastAction?: string;
  isDealer?: boolean;
  isTurn?: boolean;
}

interface PokerState {
  id: string;
  players: (Player | null)[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  phase: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';
  roundId: string;
  timer: number;
  dealerIndex: number;
  turnIndex: number;
  winners?: { id: string; handName: string; winAmount: number }[];
}

const SUIT_ICONS: Record<string, string> = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠'
};

const SUIT_COLORS: Record<string, string> = {
  'hearts': 'text-red-500',
  'diamonds': 'text-red-500',
  'clubs': 'text-white',
  'spades': 'text-white'
};

interface CardProps {
  card?: Card;
  hidden?: boolean;
  index?: number;
  animate?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, hidden, index = 0, animate = true }) => {
  return (
    <motion.div
      initial={animate ? { y: -100, x: 0, opacity: 0, rotateY: 180 } : false}
      animate={{ y: 0, x: 0, opacity: 1, rotateY: hidden ? 180 : 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      className={`relative w-12 h-16 md:w-16 md:h-24 rounded-lg border-2 ${hidden ? 'bg-emerald-900 border-emerald-500' : 'bg-white border-gray-200'} flex items-center justify-center shadow-xl preserve-3d`}
    >
      {!hidden && card ? (
        <div className="flex flex-col items-center justify-center">
          <span className={`text-lg md:text-2xl font-black ${SUIT_COLORS[card.suit]}`}>{card.value}</span>
          <span className={`text-xl md:text-3xl ${SUIT_COLORS[card.suit]}`}>{SUIT_ICONS[card.suit]}</span>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-12 md:w-10 md:h-16 border border-emerald-400/30 rounded flex items-center justify-center">
            <Zap className="text-emerald-400/20 w-4 h-4" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function PokerGame({ user, setUser, t }: { user: any, setUser: (u: any) => void, t: any }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<PokerState | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isJoined, setIsJoined] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ user: string, text: string }[]>([]);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('poker-state', (state: PokerState) => {
      setGameState(state);
      // Check if current user is in the players list
      const player = state.players.find(p => p?.id === user.id);
      if (player) setIsJoined(true);
      else setIsJoined(false);
    });

    newSocket.on('poker-message', (msg: { user: string, text: string }) => {
      setChatMessages(prev => [...prev, msg]);
    });

    newSocket.on('poker-error', (err: string) => {
      toast.error(err);
    });

    newSocket.on('poker-win', (data: { winners: any[], pot: number }) => {
      // Update balance locally if user won
      const myWin = data.winners.find(w => w.id === user.id);
      if (myWin) {
        setUser((prev: any) => ({ ...prev, balance: prev.balance + myWin.winAmount }));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user.id, setUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const joinTable = () => {
    if (socket) {
      socket.emit('poker-join', { 
        userId: user.id, 
        username: user.username, 
        balance: user.game_mode === 'demo' ? user.demo_balance : user.balance,
        mode: user.game_mode,
        token: localStorage.getItem('supabase.auth.token') // Assuming token is stored here or similar
      });
    }
  };

  const handleAction = (action: string, amount?: number) => {
    if (socket && gameState) {
      socket.emit('poker-action', { 
        userId: user.id, 
        action, 
        amount: amount || 0 
      });
    }
  };

  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit('poker-chat', { user: user.username, text: message });
      setMessage('');
    }
  };

  if (!gameState) return (
    <div className="flex items-center justify-center h-[600px]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 font-bold animate-pulse">Connecting to Poker Table...</p>
      </div>
    </div>
  );

  const currentPlayer = gameState.players.find(p => p?.id === user.id);
  const isMyTurn = gameState.players[gameState.turnIndex]?.id === user.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Game Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Poker Table */}
        <div className="relative aspect-[16/9] bg-[#0a2e1a] rounded-[10rem] border-[12px] border-[#3d2b1f] shadow-[0_0_100px_rgba(0,0,0,0.5),inset_0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
          {/* Table Felt Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          {/* Neon Border */}
          <div className="absolute inset-2 rounded-[9rem] border-2 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" />

          {/* Pot Display */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
            <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total Pot</div>
              <div className="text-2xl font-mono font-black text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                ${gameState.pot.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Community Cards */}
          <div className="flex gap-2 md:gap-4 z-20">
            {gameState.communityCards.map((card, i) => (
              <CardComponent key={i} card={card} index={i} />
            ))}
            {Array.from({ length: 5 - gameState.communityCards.length }).map((_, i) => (
              <div key={i} className="w-12 h-16 md:w-16 md:h-24 rounded-lg border-2 border-white/5 bg-black/20" />
            ))}
          </div>

          {/* Players Around the Table */}
          {gameState.players.map((player, i) => {
            if (!player) return null;
            
            // Calculate position around the oval
            const angle = (i / 6) * 2 * Math.PI + Math.PI / 2;
            const x = 42 * Math.cos(angle);
            const y = 38 * Math.sin(angle);

            return (
              <motion.div 
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute z-30"
                style={{ left: `${50 + x}%`, top: `${50 + y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className={`relative flex flex-col items-center ${player.status === 'folded' ? 'opacity-50' : ''}`}>
                  {/* Player Info Card */}
                  <div className={`bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border-2 transition-all ${player.id === gameState.players[gameState.turnIndex]?.id ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110' : 'border-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
                          <User className="w-6 h-6 text-emerald-500" />
                        </div>
                        {gameState.dealerIndex === i && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-black border-2 border-slate-900">D</div>
                        )}
                        {player.id === gameState.players[gameState.turnIndex]?.id && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white truncate w-20">{player.username}</div>
                        <div className="text-[10px] font-mono font-bold text-emerald-500">${player.balance.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {/* Player Action Label */}
                    {player.lastAction && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-center text-[8px] font-black uppercase tracking-widest bg-white/10 py-1 rounded-lg"
                      >
                        {player.lastAction}
                      </motion.div>
                    )}
                  </div>

                  {/* Player Cards */}
                  <div className="flex gap-1 -mt-4">
                    {player.cards.length > 0 ? (
                      player.cards.map((card, ci) => (
                        <CardComponent 
                          key={ci} 
                          card={card} 
                          hidden={player.id !== user.id && gameState.phase !== 'showdown'} 
                          index={ci}
                          animate={false}
                        />
                      ))
                    ) : (
                      player.status !== 'out' && (
                        <>
                          <div className="w-8 h-12 rounded bg-emerald-900/50 border border-emerald-500/30" />
                          <div className="w-8 h-12 rounded bg-emerald-900/50 border border-emerald-500/30" />
                        </>
                      )
                    )}
                  </div>

                  {/* Player Bet Chips */}
                  {player.bet > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-12 bg-yellow-500/20 border border-yellow-500/50 px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      <Coins className="w-3 h-3 text-yellow-500" />
                      <span className="text-[10px] font-mono font-black text-white">${player.bet}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Game Controls */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 space-y-6">
          {!isJoined ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <div className="text-center">
                <h3 className="text-xl font-black uppercase tracking-tighter">Ready to Play?</h3>
                <p className="text-gray-400 text-sm">Join the table and show your skills.</p>
              </div>
              <button 
                onClick={joinTable}
                className="px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                Join Table
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Betting Slider/Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Your Bet</div>
                    <div className="text-lg font-mono font-black text-emerald-500">${betAmount}</div>
                  </div>
                  <div className="flex gap-2">
                    {[10, 50, 100, 500].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => setBetAmount(amt)}
                        className={`w-12 h-12 rounded-xl border font-black text-xs transition-all ${betAmount === amt ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    disabled={!isMyTurn}
                    onClick={() => handleAction('fold')}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30"
                  >
                    Fold
                  </button>
                  <button 
                    disabled={!isMyTurn}
                    onClick={() => handleAction('check')}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30"
                  >
                    Check
                  </button>
                  <button 
                    disabled={!isMyTurn}
                    onClick={() => handleAction('call')}
                    className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30"
                  >
                    Call
                  </button>
                  <button 
                    disabled={!isMyTurn}
                    onClick={() => handleAction('raise', betAmount)}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-30"
                  >
                    Raise
                  </button>
                </div>
              </div>

              {/* Game Status Info */}
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      {isMyTurn ? 'Your Turn' : `Waiting for ${gameState.players[gameState.turnIndex]?.username || 'Player'}`}
                    </span>
                  </div>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      {gameState.players.filter(p => p !== null).length} Players
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phase</div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    {gameState.phase}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Chat & History */}
      <div className="space-y-6">
        {/* Chat Box */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col h-[400px]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest">Table Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-500">Live</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.user === user.username ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{msg.user}</span>
                <div className={`px-3 py-2 rounded-2xl text-xs font-bold max-w-[80%] ${msg.user === user.username ? 'bg-emerald-500 text-black rounded-tr-none' : 'bg-white/5 text-white rounded-tl-none border border-white/5'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="relative">
              <input 
                type="text" 
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-emerald-500/50 pr-12"
              />
              <button 
                onClick={sendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 rounded-lg text-black hover:bg-emerald-600 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Stats */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500">Table Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400">Blinds</span>
              <span className="text-[10px] font-mono font-black text-white">$10 / $20</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400">Min Buy-in</span>
              <span className="text-[10px] font-mono font-black text-white">$200</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400">Avg Pot</span>
              <span className="text-[10px] font-mono font-black text-white">$1,240</span>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500">
              <ShieldCheck className="w-3 h-3" />
              Provably Fair System
            </div>
          </div>
        </div>
      </div>

      {/* Winner Overlay */}
      <AnimatePresence>
        {gameState.phase === 'showdown' && gameState.winners && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border-2 border-emerald-500 p-8 rounded-[3rem] max-w-md w-full text-center space-y-6 shadow-[0_0_100px_rgba(16,185,129,0.3)]"
            >
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <Trophy className="w-10 h-10 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Winner!</h2>
                <p className="text-emerald-500 font-bold">Congratulations to the winners</p>
              </div>
              <div className="space-y-3">
                {gameState.winners.map((winner, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                    <div className="text-left">
                      <div className="text-sm font-black text-white">{gameState.players.find(p => p?.id === winner.id)?.username}</div>
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{winner.handName}</div>
                    </div>
                    <div className="text-xl font-mono font-black text-emerald-500">+${winner.winAmount}</div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setGameState(prev => prev ? { ...prev, winners: undefined } : null)}
                className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all"
              >
                Continue Playing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
