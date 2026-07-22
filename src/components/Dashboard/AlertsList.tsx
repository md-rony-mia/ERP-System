import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
  Boxes,
  DollarSign,
  Landmark,
  Users,
  Workflow,
  CheckCircle2,
} from 'lucide-react';
import { ExecutiveAlertItem } from '../../lib/dashboardCalculations';

export interface AlertsListProps {
  alerts: ExecutiveAlertItem[];
  onNavigate: (tab: string, subTab?: string) => void;
  isLoading?: boolean;
}

export const AlertsList: React.FC<AlertsListProps> = React.memo(
  ({ alerts, onNavigate, isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 animate-pulse">
          <div className="h-5 w-48 bg-slate-800 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-800/60 rounded-xl"></div>
          ))}
        </div>
      );
    }

    const categoryIcons = {
      inventory: <Boxes className="h-4 w-4" />,
      finance: <DollarSign className="h-4 w-4" />,
      loan: <Landmark className="h-4 w-4" />,
      payroll: <Users className="h-4 w-4" />,
      workflow: <Workflow className="h-4 w-4" />,
    };

    const severityBadges = {
      critical: {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        icon: <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />,
        tag: 'CRITICAL',
      },
      warning: {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        icon: <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />,
        tag: 'WARNING',
      },
      info: {
        bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
        icon: <Info className="h-4 w-4 text-sky-400 shrink-0" />,
        tag: 'INFO',
      },
    };

    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-200 font-display">
                Actionable Executive Alerts & Approvals
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time operational bottlenecks requiring leadership review
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full">
            {alerts.length} Pending Actions
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto opacity-80" />
            <p className="text-sm font-bold text-slate-300">All Operations Clear</p>
            <p className="text-xs text-slate-500">No critical alerts or pending approvals detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((item, idx) => {
              const sev = severityBadges[item.severity] || severityBadges.info;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 hover:border-slate-700/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 shrink-0 mt-0.5">
                      {categoryIcons[item.category] || <Info className="h-4 w-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${sev.bg}`}
                        >
                          {sev.tag}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-100 group-hover:text-white">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {item.metricBadge && (
                      <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        {item.metricBadge}
                      </span>
                    )}

                    <button
                      onClick={() => onNavigate(item.moduleTab, item.moduleSubTab)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>Resolve</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

AlertsList.displayName = 'AlertsList';
