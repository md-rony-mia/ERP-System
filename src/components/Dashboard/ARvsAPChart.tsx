import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Scale } from 'lucide-react';

export interface ARvsAPChartProps {
  data: { bucket: string; Receivables: number; Payables: number }[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl text-xs space-y-1">
        <p className="font-bold text-slate-300 mb-1">{label} Aging Bucket</p>
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

export const ARvsAPChart: React.FC<ARvsAPChartProps> = React.memo(({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 h-[380px] animate-pulse flex flex-col justify-between">
        <div className="h-5 w-48 bg-slate-800 rounded"></div>
        <div className="h-56 w-full bg-slate-800/60 rounded-xl"></div>
      </div>
    );
  }

  const totalAR = data.reduce((s, x) => s + (x.Receivables || 0), 0);
  const totalAP = data.reduce((s, x) => s + (x.Payables || 0), 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Scale className="h-4 w-4" />
            </span>
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-200 font-display">
              Receivables (AR) vs Payables (AP) Aging
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Customer balance collection vs Supplier liability buckets
          </p>
        </div>

        <div className="flex gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total AR</span>
            <span className="text-emerald-400 font-extrabold">৳{totalAR.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total AP</span>
            <span className="text-rose-400 font-extrabold">৳{totalAP.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="bucket"
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
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar dataKey="Receivables" name="Receivables (AR)" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Payables" name="Payables (AP)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

ARvsAPChart.displayName = 'ARvsAPChart';
