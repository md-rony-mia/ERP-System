import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Boxes, AlertTriangle } from 'lucide-react';

export interface InventoryHealthProps {
  data: { name: string; value: number; color: string; percent: number }[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          ></span>
          <p className="font-extrabold text-slate-200">{item.name}</p>
        </div>
        <p className="text-slate-300 font-mono font-bold">
          {item.value} SKUs ({item.percent}%)
        </p>
      </div>
    );
  }
  return null;
};

export const InventoryHealth: React.FC<InventoryHealthProps> = React.memo(({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 h-[380px] animate-pulse flex flex-col justify-between">
        <div className="h-5 w-48 bg-slate-800 rounded"></div>
        <div className="h-56 w-full bg-slate-800/60 rounded-full mx-auto my-auto max-w-[200px]"></div>
      </div>
    );
  }

  const totalSKUs = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Boxes className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-200 font-display">
              Inventory Health & Safety
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Stock availability distribution across SKU catalog
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700/60">
          {totalSKUs} Total SKUs
        </span>
      </div>

      <div className="h-[280px] w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value, entry: any) => {
                const item = data.find((d) => d.name === value);
                return (
                  <span className="text-slate-300 font-medium">
                    {value} <span className="text-slate-500 font-mono">({item?.value || 0})</span>
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label inside donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-2xl font-black font-display text-white">{totalSKUs}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Catalog SKUs
          </span>
        </div>
      </div>
    </div>
  );
});

InventoryHealth.displayName = 'InventoryHealth';
