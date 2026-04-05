import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface GameCover {
  id: string;
  title: string;
  img: string;
  tag: string;
  color: string;
}

const GAME_COVERS: GameCover[] = [
  { id: 'roulette', title: 'Roulette', img: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&q=80&w=800', tag: 'BETTING', color: 'from-red-500 to-red-900' },
  { id: 'crash', title: 'Crash', img: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=800', tag: 'FAST', color: 'from-blue-500 to-blue-900' },
  { id: 'spin', title: 'Spin Wheel', img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=800', tag: 'DAILY', color: 'from-emerald-500 to-emerald-900' },
  { id: '7updown', title: '7 Up Down', img: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=800', tag: 'BET', color: 'from-yellow-500 to-yellow-900' },
  { id: 'dice', title: 'Dice Roll', img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=800', tag: 'FAST', color: 'from-purple-500 to-purple-900' },
];

export const GameCoverScroll: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GAME_COVERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollAmount = activeIndex * (scrollRef.current.offsetWidth / 2);
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-[25%] snap-x snap-mandatory"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {GAME_COVERS.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ 
              opacity: index === activeIndex ? 1 : 0.5,
              scale: index === activeIndex ? 1.1 : 0.9,
              zIndex: index === activeIndex ? 10 : 1
            }}
            whileHover={{ scale: index === activeIndex ? 1.15 : 0.95 }}
            onClick={() => {
              setActiveIndex(index);
              if (index === activeIndex) onSelect(game.id);
            }}
            className={`relative min-w-[280px] md:min-w-[400px] aspect-[16/9] rounded-[2.5rem] overflow-hidden cursor-pointer snap-center border-2 transition-colors ${
              index === activeIndex ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-white/10'
            }`}
          >
            <img 
              src={game.img} 
              alt={game.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${game.color} opacity-40`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            <div className="absolute top-6 left-6">
              <span className="bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                {game.tag}
              </span>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-2">{game.title}</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Live Multi-Game Casino</p>
              </div>
              
              {index === activeIndex && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl"
                >
                  <Play size={24} fill="currentColor" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20">
        <button 
          onClick={() => setActiveIndex((prev) => (prev - 1 + GAME_COVERS.length) % GAME_COVERS.length)}
          className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-emerald-500 hover:text-black transition-all"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20">
        <button 
          onClick={() => setActiveIndex((prev) => (prev + 1) % GAME_COVERS.length)}
          className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-emerald-500 hover:text-black transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
