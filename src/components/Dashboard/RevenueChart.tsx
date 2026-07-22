import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

export interface RevenueChartProps {
  data: { name: string; Revenue: number; Profit?: number }[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl text-xs space-y-1">
        <p className="font-extrabold text-slate-300 font-mono mb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span
                className="h-2 w-2 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              ></span>
              {item.name}:
            </span>
            <span className="font-bold font-mono text-slate-100">
              ৳{item.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = React.memo(({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 h-[380px] animate-pulse flex flex-col justify-between">
        <div className="h-5 w-48 bg-slate-800 rounded"></div>
        <div className="h-56 w-full bg-slate-800/60 rounded-xl"></div>
      </div>
    );
  }

  const totalRev = data.reduce((sum, item) => sum + (item.Revenue || 0), 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-200 font-display">
              Revenue & Profit Growth Trend
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical billing performance & margin trajectory
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total In Period
          </span>
          <p className="text-lg font-black text-indigo-400 font-mono">
            ৳{totalRev.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Revenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="Profit"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

RevenueChart.displayName = 'RevenueChart';
