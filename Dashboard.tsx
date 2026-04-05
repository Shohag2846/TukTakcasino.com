import React from 'react';
import { 
  Users, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { GlassCard } from '../../components/admin/StatCard';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { motion } from 'motion/react';

const data = [
  { name: 'Mon', deposits: 4000, withdraws: 2400 },
  { name: 'Tue', deposits: 3000, withdraws: 1398 },
  { name: 'Wed', deposits: 2000, withdraws: 9800 },
  { name: 'Thu', deposits: 2780, withdraws: 3908 },
  { name: 'Fri', deposits: 1890, withdraws: 4800 },
  { name: 'Sat', deposits: 2390, withdraws: 3800 },
  { name: 'Sun', deposits: 3490, withdraws: 4300 },
];

const recentActivity = [
  { id: 1, user: 'AlexPro', action: 'Deposit Approved', amount: '$500', time: '2 mins ago', type: 'deposit' },
  { id: 2, user: 'SarahWin', action: 'Withdraw Requested', amount: '$1,200', time: '15 mins ago', type: 'withdraw' },
  { id: 3, user: 'LuckyJohn', action: 'New User Registered', amount: null, time: '45 mins ago', type: 'user' },
  { id: 4, user: 'CasinoKing', action: 'Deposit Rejected', amount: '$100', time: '1 hour ago', type: 'deposit' },
  { id: 5, user: 'Player99', action: 'Withdraw Approved', amount: '$250', time: '3 hours ago', type: 'withdraw' },
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value="12,450" 
          icon={Users} 
          trend={{ value: 12, isUp: true }} 
          color="blue" 
        />
        <StatCard 
          title="Total Balance" 
          value="$458,200" 
          icon={Wallet} 
          trend={{ value: 8, isUp: true }} 
          color="purple" 
        />
        <StatCard 
          title="Total Deposits" 
          value="$89,400" 
          icon={ArrowDownCircle} 
          trend={{ value: 15, isUp: true }} 
          color="emerald" 
        />
        <StatCard 
          title="Total Withdraws" 
          value="$34,200" 
          icon={ArrowUpCircle} 
          trend={{ value: 5, isUp: false }} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <GlassCard className="lg:col-span-2 p-8" glowBorder>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Financial Analytics</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Weekly deposit vs withdrawal performance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Deposits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Withdrawals</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWithdraws" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="deposits" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorDeposits)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="withdraws" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWithdraws)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-8" glowBorder>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white tracking-tight uppercase">Recent Activity</h3>
            <button className="text-[10px] text-purple-500 font-bold uppercase tracking-widest hover:text-purple-400 transition-colors flex items-center gap-1">
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 group cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                  activity.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  activity.type === 'withdraw' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  {activity.type === 'deposit' ? <ArrowDownCircle size={18} /> :
                   activity.type === 'withdraw' ? <ArrowUpCircle size={18} /> :
                   <Users size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-white truncate">{activity.user}</h4>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest whitespace-nowrap">{activity.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{activity.action}</p>
                  {activity.amount && (
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-1 block ${
                      activity.type === 'deposit' ? 'text-emerald-500' : 'text-blue-500'
                    }`}>
                      {activity.amount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Summary Card */}
          <div className="mt-8 p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Growth Rate</p>
                <p className="text-sm font-black text-white">+24.5% <span className="text-emerald-500 text-[8px] ml-1">↑</span></p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
