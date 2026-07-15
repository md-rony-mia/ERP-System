import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, ChevronDown, ChevronRight, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  variant?: 'full' | 'section';
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Intentionally silent: logs are captured, but the ErrorBoundary actively renders a rich visual crash interface to notify the user
    // Log the error with full diagnostic details to the console
    console.error("==========================================");
    console.error("NEXOVA ERP ERROR BOUNDARY CAUGHT A CRASH!");
    console.error(`Component Context: ${this.props.sectionName || 'Top-Level App'}`);
    console.error("Error Message:", error.message);
    console.error("Error Details:", error);
    console.error("Component Stack Trace:", errorInfo.componentStack);
    console.error("==========================================");

    // TODO: Wire up persistent cloud logging or analytics reporting services here:
    // Example: Sentry integration
    // if (window.Sentry) {
    //   window.Sentry.withScope((scope) => {
    //     scope.setTag("module", this.props.sectionName || "root");
    //     scope.setExtra("componentStack", errorInfo.componentStack);
    //     window.Sentry.captureException(error);
    //   });
    // }

    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev }));
  };

  render() {
    if (this.state.hasError) {
      // Determine active language from local storage
      const activeLanguage = (typeof window !== 'undefined' && localStorage.getItem('nexova_nav_language')) || 'en';
      const isBn = activeLanguage === 'bn';

      // Smart environment detection (Localhost or AI Studio development/preview containers)
      const isDev =
        process.env.NODE_ENV !== 'production' ||
        (typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' ||
          window.location.hostname.includes('127.0.0.1') ||
          window.location.hostname.includes('ais-dev-') ||
          window.location.hostname.includes('-dev-')
        ));

      if (this.props.variant === 'section') {
        // Inline section / module level fallback
        return (
          <div id="section_error_boundary" className="p-6 bg-rose-50 border border-rose-200 rounded-xl space-y-4 my-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  {isBn ? `${this.props.sectionName || 'বিভাগ'} লোড হতে ব্যর্থ হয়েছে` : `${this.props.sectionName || 'Section'} failed to load`}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isBn
                    ? "এই মডিউলটি রেন্ডার করার সময় একটি অভ্যন্তরীণ সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
                    : "An unexpected error occurred while rendering this module. Please try resetting or refreshing."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                id="btn_retry_section"
                onClick={this.handleReset}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-lg transition shadow-sm cursor-pointer"
              >
                <RefreshCw className="h-3 w-3 animate-spin-hover" />
                <span>{isBn ? "পুনরায় চেষ্টা করুন" : "Retry Loading Module"}</span>
              </button>

              {isDev && this.state.error && (
                <button
                  id="btn_toggle_section_details"
                  onClick={this.toggleDetails}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  {this.state.showDetails ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  <span>{this.state.showDetails ? (isBn ? "ত্রুটি বিবরণী বন্ধ করুন" : "Hide Details") : (isBn ? "ত্রুটি বিবরণী দেখুন" : "Show Error Details")}</span>
                </button>
              )}
            </div>

            {isDev && this.state.showDetails && this.state.error && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner space-y-2 max-h-60 custom-scrollbar">
                <div className="flex items-center gap-1 text-rose-400 border-b border-slate-800 pb-1 font-bold">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>CRASH LOG: {this.state.error.name} - {this.state.error.message}</span>
                </div>
                <div className="whitespace-pre-wrap select-text selection:bg-rose-500/30 selection:text-white">
                  {this.state.error.stack || "No stack trace available."}
                  {this.state.errorInfo && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 text-slate-400">
                      <p className="font-bold text-slate-300">Component Tree Stack:</p>
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Full screen application level fallback
      return (
        <div id="full_app_error_boundary" className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6 font-sans selection:bg-rose-500/20 select-none">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700/80 rounded-2xl p-8 space-y-6 shadow-xl relative overflow-hidden">
            {/* Warning visual accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500" />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 animate-pulse">
                <AlertTriangle className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white flex flex-col items-center gap-1">
                  <span>Something Went Wrong</span>
                  <span className="text-xs font-medium text-slate-400 font-bengali">কিছু ভুল হয়েছে</span>
                </h2>
                <div className="text-xs text-slate-300 leading-relaxed max-w-md space-y-3">
                  <p>
                    We apologize for the inconvenience. An unexpected error occurred while executing the Nexova ERP cloud core engine.
                  </p>
                  <p className="text-slate-400 font-bengali">
                    সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত। Nexova ERP ক্লাউড ইঞ্জিন চালানোর সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                id="btn_reload_app"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Application / অ্যাপ্লিকেশন পুনরায় লোড করুন</span>
              </button>

              {isDev && this.state.error && (
                <button
                  id="btn_toggle_full_details"
                  onClick={this.toggleDetails}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-850 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {this.state.showDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span>{this.state.showDetails ? "Hide Error Details" : "Show Error Details (Developer Mode)"}</span>
                </button>
              )}
            </div>

            {isDev && this.state.showDetails && this.state.error && (
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner space-y-3 max-h-72 custom-scrollbar">
                <div className="flex items-center gap-1.5 text-rose-400 border-b border-slate-900 pb-2 font-bold uppercase tracking-wider text-[10px]">
                  <Terminal className="h-4 w-4" />
                  <span>Developer Diagnostics Console</span>
                </div>
                <div className="whitespace-pre-wrap select-text selection:bg-rose-500/30">
                  <p className="text-rose-400 font-bold font-sans text-xs">{this.state.error.name}: {this.state.error.message}</p>
                  <p className="mt-1 opacity-90">{this.state.error.stack}</p>
                  
                  {this.state.errorInfo && (
                    <div className="mt-4 pt-4 border-t border-slate-900 text-slate-400">
                      <p className="font-bold text-slate-200 font-sans text-xs uppercase tracking-wider mb-1">Component Rendering Hierarchy:</p>
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
