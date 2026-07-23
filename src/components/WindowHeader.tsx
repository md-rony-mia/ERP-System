import React from 'react';
import * as Icons from 'lucide-react';
import { Minus, Square, X, ExternalLink, Layers } from 'lucide-react';
import { useWindowManager } from '../context/WindowManagerContext';

interface WindowHeaderProps {
  id: string;
  title: string;
  subtitle?: string;
  iconName?: string;
  isModal?: boolean;
  onCloseCustom?: () => void;
  extraControls?: React.ReactNode;
}

export default function WindowHeader({
  id,
  title,
  subtitle,
  iconName = 'Window',
  isModal = false,
  onCloseCustom,
  extraControls,
}: WindowHeaderProps) {
  const { minimizeWindow, closeWindow } = useWindowManager();

  const renderIcon = () => {
    const IconComp = (Icons as any)[iconName] || Icons.Layout;
    return <IconComp className="h-4 w-4 text-indigo-400 shrink-0" />;
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    minimizeWindow(id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCloseCustom) {
      onCloseCustom();
    } else {
      closeWindow(id);
    }
  };

  return (
    <div className={`flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-100 border-b border-slate-800 rounded-t-xl select-none ${
      isModal ? 'shadow-md' : 'mb-3'
    }`}>
      {/* Window Title & Icon */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700/80 flex items-center justify-center">
          {renderIcon()}
        </div>
        <div className="truncate">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-100 font-display truncate">
              {title}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              লাইভ
            </span>
          </div>
          {subtitle && (
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Extra Controls & Window Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {extraControls}

        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          type="button"
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer group"
          title="মিনিমাইজ করুন (Minimize to Taskbar)"
        >
          <Minus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          className="p-1.5 rounded-md hover:bg-rose-600/80 text-slate-400 hover:text-white transition-colors cursor-pointer group ml-0.5"
          title="বন্ধ করুন (Close Window)"
        >
          <X className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
