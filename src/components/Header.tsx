/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, User as UserIcon, LogOut, LayoutDashboard, History, Flame, Image as ImageIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  hasActiveReport: boolean;
  onClearActiveReport: () => void;
  activePage: 'analyzer' | 'viral-topics';
  onChangePage: (page: 'analyzer' | 'viral-topics') => void;
}

export default function Header({
  user,
  onOpenAuth,
  onLogout,
  onNavigateHome,
  hasActiveReport,
  onClearActiveReport,
  activePage,
  onChangePage
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => { onNavigateHome(); onChangePage('analyzer'); }}
          className="flex cursor-pointer items-center space-x-2.5 transition active:scale-95 shrink-0"
          id="header-logo"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            ThumbScore<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">AI</span>
          </span>
        </div>

        {/* Dashboard Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/40 border border-slate-900 px-1 py-1 rounded-xl">
          <button
            onClick={() => { onChangePage('analyzer'); onClearActiveReport(); }}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition ${
              activePage === 'analyzer'
                ? 'bg-slate-800/80 text-white border-b border-indigo-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="nav-btn-analyzer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="hidden xs:inline">Analyzer</span>
            <span className="inline xs:hidden">Scan</span>
          </button>
          
          <button
            onClick={() => { onChangePage('viral-topics'); onClearActiveReport(); }}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition ${
              activePage === 'viral-topics'
                ? 'bg-slate-800/80 text-white border-b border-orange-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="nav-btn-viral"
          >
            <Flame className="h-3.5 w-3.5 text-orange-400 animate-pulse shrink-0" />
            <span className="hidden xs:inline">Viral Topics</span>
            <span className="inline xs:hidden">Topics</span>
          </button>
        </nav>

        {/* Navigation / Action controls */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          {hasActiveReport && (
            <button
              onClick={onClearActiveReport}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              id="nav-back-to-dashboard"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Back to Analyzer</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center space-x-3.5 pl-2 border-l border-slate-800">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-xs font-medium text-slate-200">{user.name}</span>
                <span className="font-mono text-[10px] text-indigo-400">Pro Advisor</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700/60 ring-2 ring-indigo-500/20 text-slate-200">
                <span className="text-sm font-semibold uppercase">{user.name.charAt(0)}</span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                id="btn-logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <button
                onClick={onOpenAuth}
                className="relative overflow-hidden rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-500/20 transition active:scale-95"
                id="btn-trigger-login"
              >
                <span className="relative z-10 flex items-center space-x-1">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Log In / Sign Up</span>
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-violet-500 to-indigo-505 transition-transform duration-300 hover:translate-x-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
