import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle, Info } from 'lucide-react';
import { AppSettings } from '../types';

interface LoginProps {
  settings: AppSettings;
  onLoginSuccess: (user: any) => void;
}

export default function Login({ settings, onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    // Find user in local settings list (or default list)
    const fallbackUsersList = [
      { id: '1', name: 'Rony Mia', username: 'admin_rony', email: 'ronymia2022@gmail.com', role: 'Administrator', status: 'Active', avatar: 'RM' },
      { id: '2', name: 'Tasnim Ahmed', username: 'tasnim_mgr', email: 'tasnim@madani.com', role: 'Manager', status: 'Active', avatar: 'TA' },
      { id: '3', name: 'Sabbir Rahman', username: 'sabbir_csh', email: 'sabbir@madani.com', role: 'Cashier', status: 'Active', avatar: 'SR' },
      { id: '4', name: 'Sumona Yasmin', username: 'sumona_sales', email: 'sumona@madani.com', role: 'Sales Agent', status: 'Inactive', avatar: 'SY' },
    ];
    const actualUsersList = settings?.usersList && settings.usersList.length > 0
      ? settings.usersList
      : fallbackUsersList;

    const user = actualUsersList.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setError('Invalid username or account does not exist.');
      return;
    }

    if (user.status !== 'Active') {
      setError('This account is currently inactive. Please contact support.');
      return;
    }

    // Since we don't have explicit passwords stored, let's accept '123456', 'admin', or matching the username for convenience
    const validPasswords = ['123456', 'admin', user.username];
    if (!validPasswords.includes(password)) {
      setError('Incorrect password. Use "123456" or "admin".');
      return;
    }

    // Login success!
    onLoginSuccess(user);
  };

  return (
    <div id="login-container" className="h-screen w-screen flex flex-col items-center justify-center bg-[#243042] text-slate-700 font-sans p-4 relative overflow-y-auto">
      <div id="login-card" className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl w-full max-w-[420px] border border-slate-100 flex flex-col gap-6 relative z-10 my-auto">
        
        {/* Logo and Tagline matching screenshot */}
        <div id="login-logo-container" className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center font-display tracking-wider text-[#334155] text-4xl font-extrabold select-none mb-1">
            <span className="font-light text-indigo-900">N</span>
            <span className="relative text-blue-600 font-black">
              E
              <span className="absolute top-[35%] left-[34%] text-indigo-500 text-[10px] select-none animate-pulse">✦</span>
            </span>
            <span className="font-extrabold tracking-tight text-[#334155]">XOVA</span>
          </div>
          <p id="login-tagline" className="text-[#3b82f6] text-xs font-semibold tracking-wider font-sans uppercase">
            Elevate your business logic.
          </p>
        </div>

        {/* Login form */}
        <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div id="login-error-alert" className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-3 rounded-lg font-medium animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input Field */}
          <div id="username-field-group" className="flex flex-col gap-1.5">
            <label id="username-label" className="text-xs font-bold text-slate-700 font-sans uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div id="password-field-group" className="flex flex-col gap-1.5">
            <label id="password-label" className="text-xs font-bold text-slate-700 font-sans uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Sign In button */}
          <button
            id="signin-submit-btn"
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#3b82f6] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-lg focus:ring-2 focus:ring-blue-500/30 outline-none mt-2"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </button>
        </form>

        {/* Divider line */}
        <div className="border-t border-slate-100 mt-2"></div>

        {/* Dynamic Helpful Quick Login Box */}
        {showHint && (
          <div id="login-helper-box" className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-2.5 text-xs text-blue-800/90 font-medium font-sans">
            <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-950">Quick Sign In Credentials</span>
                <button
                  type="button"
                  onClick={() => setShowHint(false)}
                  className="text-[10px] text-blue-400 hover:text-blue-600 hover:underline"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-blue-800/80 leading-normal">
                Try logging in with standard administrator:
              </p>
              <div className="font-mono bg-white/80 border border-blue-100/50 rounded px-2 py-1 mt-0.5 text-[10px] text-blue-900/90 flex flex-col gap-0.5">
                <div>Username: <span className="font-bold text-indigo-600">admin_rony</span></div>
                <div>Password: <span className="font-bold text-indigo-600">123456</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Copyright notice matching screenshot */}
        <p id="login-copyright" className="text-slate-400 text-[11px] font-medium text-center font-sans tracking-tight">
          © 2026 Nexova ERP Solution. All rights reserved.
        </p>
      </div>
    </div>
  );
}
