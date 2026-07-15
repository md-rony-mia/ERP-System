import { useEffect, useState } from 'react';
import { Bell, User, ChevronDown, Calendar, Clock, LogOut } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  currentTab: string;
  currentSubTab: string;
  onTabChange: (tab: string, subTab?: string) => void;
  settings?: AppSettings;
  isVisualEditMode?: boolean;
  onToggleVisualEditMode?: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

export default function Header({
  currentTab,
  currentSubTab,
  onTabChange,
  settings,
  isVisualEditMode = false,
  onToggleVisualEditMode,
  currentUser,
  onLogout,
}: HeaderProps) {
  const [time, setTime] = useState(new Date('2026-07-06T19:54:10'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => new Date(prevTime.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      purchase: 'Purchase',
      sales: 'Sales',
      banking: 'Banking',
      accounting: 'Accounting',
      loan: 'Loan',
      reports: 'Reports',
      gridReport: 'Grid Report',
      rdlReport: 'RDL Report',
      settings: 'Settings',
      employee: 'Employee',
      salary: 'Salary',
    };
    return labels[tab] || tab;
  };

  const getSubTabLabel = (subTab: string) => {
    return subTab
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="h-16 glass-header px-6 flex items-center justify-between shrink-0 select-none z-40">
      {/* Breadcrumb / Section indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold text-slate-800 font-display tracking-tight uppercase">
          {getTabLabel(currentTab)}
        </span>
        {currentSubTab && (
          <>
            <span className="text-slate-300 text-xs font-semibold">/</span>
            <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 border border-brand-orange/15 px-2.5 py-0.5 rounded-full font-sans tracking-wide uppercase">
              {getSubTabLabel(currentSubTab)}
            </span>
          </>
        )}
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Live clock and date */}
        <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-500 bg-white/60 border border-slate-200/50 rounded-xl px-3 py-1.5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brand-orange" />
            <span>{formatDate(time)}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-orange" />
            <span className="font-semibold text-slate-700">{formatTime(time)}</span>
          </div>
        </div>

        {/* Store branch switcher */}
        <div className="flex items-center gap-2">
          {onToggleVisualEditMode && (
            <button
              onClick={onToggleVisualEditMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border cursor-pointer ${
                isVisualEditMode
                  ? 'bg-brand-orange hover:bg-brand-orange-hover text-white border-brand-orange shadow-md shadow-brand-orange/20 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              title="Toggle Drag & Drop Page/Form Customizer"
            >
              <span>🛠️</span>
              <span>{isVisualEditMode ? 'Visual Customizer Active' : 'Customize Layout'}</span>
            </button>
          )}

          <div className="relative group">
            <button className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 bg-white/80 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-xs">
              <div className="h-2 w-2 rounded-full bg-brand-orange animate-pulse active-glow-orange"></div>
              <span>MAIN — {settings?.companyName || 'M/S Madani Traders'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* User profile with initials avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-black text-slate-800 tracking-tight">{currentUser?.name || 'Rony Mia'}</span>
            <span className="text-[9px] font-black text-brand-orange bg-brand-orange/10 border border-brand-orange/15 px-1.5 py-0.5 rounded uppercase mt-0.5 tracking-wider self-end">{currentUser?.role || 'Admin'}</span>
          </div>
          <div className="relative group">
            <button className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white font-black text-xs flex items-center justify-center cursor-pointer shadow-md shadow-brand-orange/10 uppercase transition-transform hover:scale-105 active:scale-95 duration-150">
              {currentUser?.avatar || (currentUser?.name ? currentUser.name[0] : 'RM')}
            </button>
            {/* Quick dropdown menu on hover / click */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 p-1">
              <div className="p-3 border-b border-slate-100 text-xs text-left">
                <p className="font-extrabold text-slate-800">{currentUser?.name || 'Rony Mia'}</p>
                <p className="text-slate-400 font-mono mt-0.5 text-[10px] truncate">{currentUser?.email || 'ronymia2022@gmail.com'}</p>
              </div>
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => onTabChange('settings', 'system_settings')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-brand-orange/10 hover:text-brand-orange rounded-lg transition-colors font-semibold cursor-pointer"
                >
                  System Settings
                </button>
                <button
                  onClick={() => onTabChange('employee', 'employees_list')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-brand-orange/10 hover:text-brand-orange rounded-lg transition-colors font-semibold cursor-pointer"
                >
                  My Profile
                </button>
                <div className="border-t border-slate-100 my-1 mx-2"></div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-bold cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
