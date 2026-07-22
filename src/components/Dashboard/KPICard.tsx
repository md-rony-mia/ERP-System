import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changePercent?: number;
  icon: React.ReactNode;
  trendLabel?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan';
  onClick?: () => void;
  isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = React.memo(
  ({
    title,
    value,
    subtitle,
    changePercent = 0,
    icon,
    trendLabel = 'vs last period',
    badgeColor = 'emerald',
    onClick,
    isLoading = false,
  }) => {
    const isPositive = changePercent >= 0;

    const badgeStyles = {
      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    };

    const iconBgStyles = {
      emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    };

    if (isLoading) {
      return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-3 w-28 bg-slate-800 rounded"></div>
            <div className="h-8 w-8 bg-slate-800 rounded-xl"></div>
          </div>
          <div className="h-7 w-36 bg-slate-800 rounded"></div>
          <div className="h-3 w-24 bg-slate-800 rounded"></div>
        </div>
      );
    }

    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col justify-between select-none`}
      >
        {/* Subtle radial glow overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.04] transition-all"></div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
              {title}
            </span>
            <div className={`p-2.5 rounded-xl border ${iconBgStyles[badgeColor]} transition-transform group-hover:scale-110`}>
              {icon}
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black font-display text-slate-100 tracking-tight group-hover:text-white">
              {value}
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}

          <div className="flex items-center gap-1.5 ml-auto">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? `+${changePercent}%` : `${changePercent}%`}
            </span>
            <span className="text-slate-500 text-[10px] hidden sm:inline">{trendLabel}</span>
          </div>
        </div>
      </motion.div>
    );
  }
);

KPICard.displayName = 'KPICard';
