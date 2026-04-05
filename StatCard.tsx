import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: boolean;
  glowBorder?: boolean;
}

export function GlassCard({ children, className, hoverScale = false, glowBorder = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverScale ? { scale: 1.02, y: -5 } : undefined}
      className={cn(
        "bg-slate-950/50 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-500",
        glowBorder && "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
        className
      )}
    >
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['-100%', '200%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"
      />

      {/* Glow Effect */}
      {glowBorder && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: 'purple' | 'blue' | 'emerald' | 'orange';
}

const colorMap = {
  purple: 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
  blue: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]',
  emerald: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
  orange: 'from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]',
};

export function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <GlassCard hoverScale glowBorder className="p-8 border-white/5 bg-black/40">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">{title}</p>
          </div>
          <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">{value}</h3>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-2 mt-3 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 border border-white/5 w-fit",
              trend.isUp ? "text-emerald-500" : "text-red-500"
            )}>
              <span>{trend.isUp ? '↑' : '↓'} {trend.value}%</span>
              <span className="text-gray-600">DELTA_SYNC</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-black/60 border transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-2xl",
          colorMap[color]
        )}>
          <Icon size={32} className="drop-shadow-[0_0_12px_currentColor]" />
        </div>
      </div>
      
      {/* Technical Corner Accents */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-white/10 rounded-tr-[2rem] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-white/10 rounded-bl-[2rem] pointer-events-none" />
      
      {/* Decorative Background Icon */}
      <Icon size={100} className="absolute -bottom-6 -right-6 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none blur-[1px]" />
    </GlassCard>
  );
}
