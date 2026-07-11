import React from 'react';
import { ShieldAlert, AlertTriangle, Inbox, RefreshCw, Clock, ArrowLeft, ArrowUpRight, Copy } from 'lucide-react';

interface PageStandardsWrapperProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  permissionRoles?: string[];
  currentUser?: {
    name?: string;
    role?: string;
    email?: string;
  };
  actionToolbar?: React.ReactNode;
  breadcrumbs?: { label: string; active?: boolean; onClick?: () => void }[];
  onBack?: () => void;
  children: React.ReactNode;
}

export default function PageStandardsWrapper({
  title,
  subtitle,
  loading = false,
  error = null,
  isEmpty = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items in this section. Add one to get started.',
  emptyAction,
  permissionRoles,
  currentUser,
  actionToolbar,
  breadcrumbs,
  onBack,
  children,
}: PageStandardsWrapperProps) {
  
  // 1. PERMISSION CHECK GATE
  const hasPermission = React.useMemo(() => {
    if (!permissionRoles || !currentUser?.role) return true;
    return permissionRoles.includes(currentUser.role);
  }, [permissionRoles, currentUser?.role]);

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center bg-slate-50 border border-slate-200/60 rounded-2xl m-6 animate-in fade-in duration-200">
        <div className="h-14 w-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 animate-bounce">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-800">Security Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          Your current role <strong className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded uppercase text-[10px]">{currentUser?.role || 'Guest'}</strong> does not possess the operational privileges required to view or modify the <strong>{title}</strong> module.
        </p>
        <div className="bg-white border border-slate-100 rounded-lg p-3 mt-4 text-[11px] text-slate-400 font-mono text-left space-y-1 shadow-sm">
          <div>User: {currentUser?.name || 'Unknown'}</div>
          <div>Identity Path: {currentUser?.email || 'N/A'}</div>
          <div>Resource Signature: {title.toUpperCase()}</div>
          <div>Security Policy: RBAC_RESTRICTED</div>
        </div>
        <p className="text-[10px] text-slate-400 mt-6">
          Contact your System Administrator to request authorization overrides.
        </p>
      </div>
    );
  }

  // 2. RUNTIME ERROR STATE
  if (error) {
    return (
      <div className="p-6 bg-rose-50/50 border border-rose-200 rounded-xl m-6 space-y-4 animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-xs text-rose-800 uppercase tracking-wider">Operational Fault Detected</h4>
            <p className="text-xs text-slate-600 font-medium">
              An unexpected failure occurred while trying to process the data for {title}. This could be due to a live Firestore network disruption or schema mismatch.
            </p>
            <div className="bg-rose-950 text-rose-200 font-mono text-[10px] p-3 rounded-lg overflow-x-auto max-w-full leading-normal border border-rose-900/60 mt-3 shadow-md">
              {error}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-rose-100 pt-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reload ERP Session</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150 p-6 max-w-7xl mx-auto">
      
      {/* 3. BREADCRUMBS & NAVIGATION TRACK */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 select-none">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              <span
                onClick={crumb.onClick}
                className={`transition-colors duration-150 ${
                  crumb.active
                    ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full'
                    : crumb.onClick
                    ? 'hover:text-slate-700 cursor-pointer'
                    : 'text-slate-400'
                }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* 4. PAGE HEADER & ACTION TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
              <span>{title}</span>
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1 leading-normal">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Dynamic Action Toolbar */}
        {actionToolbar && (
          <div className="flex flex-wrap items-center gap-2">
            {actionToolbar}
          </div>
        )}
      </div>

      {/* 5. LOADING SKELETON LOADER */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 bg-slate-100 rounded-xl"></div>
            <div className="h-24 bg-slate-100 rounded-xl"></div>
            <div className="h-24 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="h-64 bg-slate-100 rounded-xl w-full"></div>
        </div>
      ) : isEmpty ? (
        
        // 6. EMPTY STATE PLATFORM
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-700">{emptyTitle}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{emptyDescription}</p>
          
          {emptyAction && (
            <button
              onClick={emptyAction.onClick}
              className="mt-4 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-indigo-600/10 cursor-pointer"
            >
              {emptyAction.icon}
              <span>{emptyAction.label}</span>
            </button>
          )}
        </div>
      ) : (
        // 7. RESPONSIVE CHILDREN CONTAINER
        <div className="w-full">
          {children}
        </div>
      )}
    </div>
  );
}
