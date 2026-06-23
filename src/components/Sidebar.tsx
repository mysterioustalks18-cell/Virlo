/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, LayoutDashboard, Image as ImageIcon, Flame, 
  Type as FontIcon, Bookmark, History, Settings, LogOut, 
  User as UserIcon, CreditCard, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activePage: 'dashboard' | 'analyzer' | 'title-optimizer' | 'viral-topics' | 'saved' | 'history' | 'settings';
  onChangePage: (page: 'dashboard' | 'analyzer' | 'title-optimizer' | 'viral-topics' | 'saved' | 'history' | 'settings') => void;
  savedCount: number;
}

export default function Sidebar({
  user,
  onOpenAuth,
  onLogout,
  activePage,
  onChangePage,
  savedCount
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  interface NavItem {
    id: 'dashboard' | 'analyzer' | 'title-optimizer' | 'viral-topics' | 'saved' | 'history' | 'settings';
    label: string;
    icon: any;
    animate?: boolean;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Thumbnail Analyzer', icon: ImageIcon },
    { id: 'title-optimizer', label: 'Title Optimizer', icon: FontIcon },
    { id: 'viral-topics', label: 'Viral Topics', icon: Flame, animate: true },
    { id: 'saved', label: 'Saved Vault', icon: Bookmark, badge: savedCount > 0 ? savedCount : undefined },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`hidden md:flex fixed top-0 bottom-0 left-0 z-45 flex-col border-r border-brand-border bg-brand-bg transition-all duration-300 md:relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Brand Header */}
      <div className="relative flex h-16 items-center justify-between px-4.5 border-b border-brand-border bg-brand-bg">
        <div 
          onClick={() => onChangePage('dashboard')}
          className="flex cursor-pointer items-center space-x-2.5 transition active:scale-95"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-primary">
            <Sparkles className="h-4 w-4 text-brand-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-display text-base font-semibold tracking-wide text-[#F4F1EA]">
                VIRLO CONSOLE
              </span>
              <span className="font-mono text-[8px] tracking-widest text-[#7B8FA8] uppercase font-bold leading-none">
                Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Toggle Collapse controller */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-brand-border bg-brand-surface text-[#7B8FA8] hover:text-[#F4F1EA] transition hover:bg-[#111B2E]"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* Navigation middle sections */}
      <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all group duration-150 outline-none border-l-2 text-left ${
                isActive
                  ? 'bg-brand-card/70 text-[#F4F1EA] border-brand-primary'
                  : 'text-[#7B8FA8] border-transparent hover:bg-brand-card/30 hover:text-[#F4F1EA]'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 duration-150 ${
                  isActive ? 'text-brand-primary' : 'text-[#7B8FA8] group-hover:text-[#F4F1EA]'
                }`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary/10 border border-brand-primary/30 px-1 text-[9px] font-bold text-brand-primary font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* bottom actions / user profile identity */}
      <div className="p-3 border-t border-brand-border bg-brand-surface/40 space-y-2">
        {/* Pro Plan Indicator */}
        {!isCollapsed && (
          <div className="rounded-lg bg-brand-card/50 border border-brand-border p-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-3.5 w-3.5 text-brand-primary fill-brand-primary/10" />
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#7B8FA8]">PRO ACTIVE TRANSMISSION</span>
            </div>
            <p className="text-[10px] text-[#7B8FA8] mt-1 leading-normal">
              Infinite evaluations and title generation slots verified.
            </p>
          </div>
        )}

        {user ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-brand-card/50 transition">
            <div className="flex items-center space-x-2.5 truncate">
              {/* Profile Orb */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary text-brand-bg border border-brand-primary/30 text-xs font-bold uppercase font-mono">
                {user.name.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-semibold text-[#F4F1EA] leading-tight truncate">{user.name}</span>
                  <span className="text-[9px] font-mono font-bold text-brand-primary leading-tight uppercase tracking-wider">ONLINE CORE</span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={onLogout}
                className="rounded-lg p-1.5 text-brand-danger hover:bg-brand-danger/10 transition"
                title="Log Out Account"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center space-x-2 rounded-lg bg-brand-primary py-2.5 text-xs font-bold text-brand-bg hover:opacity-90 transition active:scale-95"
          >
            <UserIcon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Sign In / Join</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
