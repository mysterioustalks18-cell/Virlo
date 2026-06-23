/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, ShieldAlert, Image as ImageIcon, Zap, Trophy, 
  Flame, Menu, Calendar, User as UserIcon, Type, RefreshCw, LogOut, Key,
  LayoutDashboard, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import DragDropUpload from './components/DragDropUpload';
import ReportView from './components/ReportView';
import HistoryGallery from './components/HistoryGallery';
import ViralTopics from './components/ViralTopics';
import TitleOptimizer from './components/TitleOptimizer';
import SavedView from './components/SavedView';
import SettingsView from './components/SettingsView';
import AuthModal from './components/AuthModal';

import { User, ThumbnailAnalysis, SavedTopic } from './types';

async function safeParseJSON(res: Response): Promise<any> {
  const url = res.url;
  const status = res.status;
  const contentType = res.headers.get('content-type') || '';
  
  console.log(`[Fetch Debug] Response from ${url} | Status: ${status} | Content-Type: ${contentType}`);
  
  const text = await res.text();
  
  if (!contentType.includes('application/json')) {
    console.error(`[Fetch Debug Error] Expected JSON but received Content-Type: "${contentType}" from ${url}. Body Preview:`, text.slice(0, 1000));
    throw new Error(`Response is not valid JSON format (received: ${contentType || 'blank'}). Status: ${status}`);
  }
  
  try {
    if (!text.trim()) {
      throw new Error('Empty response body received');
    }
    return JSON.parse(text);
  } catch (err: any) {
    console.error(`[Fetch Debug Error] Failed to parse JSON from ${url}. Text length: ${text.length}. Body Preview:`, text.slice(0, 1000), err);
    throw new Error(`Response body was empty or corrupted JSON. Status: ${status}`);
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<ThumbnailAnalysis | null>(null);
  const [reports, setReports] = useState<ThumbnailAnalysis[]>([]);
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [savedTitles, setSavedTitles] = useState<any[]>([]);
  
  // Navigation states
  const [activePage, setActivePage] = useState<'dashboard' | 'analyzer' | 'title-optimizer' | 'viral-topics' | 'saved' | 'history' | 'settings'>('dashboard');
  
  // UI states
  const [authOpen, setAuthOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // 1. Check local session cache on init
  useEffect(() => {
    const cachedToken = localStorage.getItem('thumbscore_token');
    const cachedUser = localStorage.getItem('thumbscore_user');

    if (cachedToken && cachedUser && cachedToken !== 'undefined' && cachedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(cachedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setToken(cachedToken);
          setUser(parsedUser);
          validateSession(cachedToken);
          return;
        }
      } catch (err) {
        console.error('Failed to parse cached user session:', err);
      }
    }
    
    // Clear potentially corrupt keys and fetch default states
    localStorage.removeItem('thumbscore_token');
    localStorage.removeItem('thumbscore_user');
    fetchHistory(null);
    fetchSavedTopics(null);
    fetchSavedTitles(null);
  }, []);

  // Validate session against endpoint
  const validateSession = async (sessionToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        const data = await safeParseJSON(res);
        setUser(data.user);
        fetchHistory(sessionToken);
        fetchSavedTopics(sessionToken);
        fetchSavedTitles(sessionToken);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error('Session validation connection issue:', err);
      fetchHistory(sessionToken);
      fetchSavedTopics(sessionToken);
      fetchSavedTitles(sessionToken);
    }
  };

  // 2. Load thumbnail log report history
  const fetchHistory = async (sessionToken: string | null) => {
    setIsLoadingHistory(true);
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
      
      const res = await fetch('/api/thumbnail/history', { headers });
      if (res.ok) {
        const data = await safeParseJSON(res);
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Could not fetch reports logs:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 3. Load saved topics
  const fetchSavedTopics = async (sessionToken: string | null = token) => {
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
      const res = await fetch('/api/topics/saved', { headers });
      if (res.ok) {
        const data = await safeParseJSON(res);
        setSavedTopics(data.saved || []);
      }
    } catch (err) {
      console.error('Failed to load saved topics archive files:', err);
    }
  };

  // 3.5. Load saved titles
  const fetchSavedTitles = async (sessionToken: string | null = token) => {
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
      const res = await fetch('/api/titles/saved', { headers });
      if (res.ok) {
        const data = await safeParseJSON(res);
        setSavedTitles(data.savedTitles || data.saved || []);
      }
    } catch (err) {
      console.error('Failed to load saved titles archives:', err);
    }
  };

  // Save Topic bridging function
  const handleSaveTopic = async (topic: any) => {
    try {
      const res = await fetch('/api/topics/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ topic })
      });

      if (res.ok) {
        const savedItem = await safeParseJSON(res);
        setSavedTopics(prev => [savedItem, ...prev]);
      }
    } catch (err) {
      console.error('Failed saving topic via main app layer:', err);
    }
  };

  const handleDeleteSavedTopic = async (savedId: string) => {
    try {
      const res = await fetch(`/api/topics/saved/${savedId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        setSavedTopics(prev => prev.filter(item => item.id !== savedId));
      }
    } catch (err) {
      console.error('Failed deleting topic from vault list:', err);
    }
  };

  const handleDeleteSavedTitle = async (savedId: string) => {
    try {
      const res = await fetch(`/api/titles/saved/${savedId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        setSavedTitles(prev => prev.filter(item => item.id !== savedId));
      } else {
        const errorData = await safeParseJSON(res);
        throw new Error(errorData.error || 'Delete rejected.');
      }
    } catch (err: any) {
      console.error('Failed deleting title from vault list:', err);
      throw err;
    }
  };

  // SaveTitle bridging function
  const handleSaveTitle = async (titlePayload: any) => {
    const res = await fetch('/api/titles/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(titlePayload)
    });

    if (res.ok) {
      const savedItem = await safeParseJSON(res);
      setSavedTitles(prev => [savedItem, ...prev]);
    } else {
      const data = await safeParseJSON(res);
      throw new Error(data.error || 'Saved title rejected.');
    }
  };

  // 4. User actions
  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    localStorage.setItem('thumbscore_token', newToken);
    localStorage.setItem('thumbscore_user', JSON.stringify(authenticatedUser));
    
    setToken(newToken);
    setUser(authenticatedUser);
    setAuthOpen(false);
    
    // Refresh history, topics & titles
    fetchHistory(newToken);
    fetchSavedTopics(newToken);
    fetchSavedTitles(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('thumbscore_token');
    localStorage.removeItem('thumbscore_user');
    
    setToken(null);
    setUser(null);
    setActiveReport(null);
    setSavedTopics([]);
    setSavedTitles([]);
    
    // Reload anonymous default templates
    fetchHistory(null);
    fetchSavedTopics(null);
    fetchSavedTitles(null);
  };

  const handleAnalyzeThumbnail = async (payload: {
    base64Data?: string;
    imageUrl?: string;
    mimeType?: string;
    title: string;
  }) => {
    setGlobalError('');
    setIsAnalyzing(true);

    try {
      const customKey = localStorage.getItem('custom_gemini_api_key') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (customKey) {
        headers['X-Gemini-API-Key'] = customKey;
      }

      const res = await fetch('/api/thumbnail/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      let data: any = {};
      try {
        data = await safeParseJSON(res);
      } catch (parseErr) {
        if (!res.ok) {
          throw new Error('API server returned an error page.');
        } else {
          throw parseErr;
        }
      }

      if (!res.ok) {
        throw new Error(data.error || 'The analyzer encountered an issue. Please try another image file.');
      }

      setReports(prev => [data, ...prev]);
      setActiveReport(data);
    } catch (err: any) {
      setGlobalError(err.message || 'Connecting to evaluation network failed. Please attempt your analysis again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGlobalError('');

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/thumbnail/delete/${reportId}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        if (activeReport?.id === reportId) {
          setActiveReport(null);
        }
      } else {
        const data = await safeParseJSON(res);
        throw new Error(data.error || 'Failed to remove the analysis file from archives.');
      }
    } catch (err: any) {
      setGlobalError(err.message);
    }
  };

  // Pages switcher rendering helper
  const renderActivePage = () => {
    if (activeReport) {
      return (
        <ReportView 
          report={activeReport} 
          onBack={() => setActiveReport(null)} 
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardView
            user={user}
            reportsCount={reports.length}
            savedTopicsCount={savedTopics.length}
            recentReports={reports}
            onSelectReport={(report) => {
              setActiveReport(report);
            }}
            onChangePage={(page) => {
              setActiveReport(null);
              setActivePage(page);
            }}
            onOpenAuth={() => setAuthOpen(true)}
            savedTopics={savedTopics}
            savedTitles={savedTitles}
            onDeleteTopic={handleDeleteSavedTopic}
            onDeleteTitle={handleDeleteSavedTitle}
            onDeleteReport={handleDeleteReport}
          />
        );

      case 'analyzer':
        return (
          <div className="space-y-6">
            <section id="upload-stage">
              <DragDropUpload 
                onAnalyze={handleAnalyzeThumbnail} 
                isLoading={isAnalyzing} 
              />
            </section>
          </div>
        );

      case 'title-optimizer':
        return (
          <TitleOptimizer
            token={token}
            onShowAuth={() => setAuthOpen(true)}
            onSaveTitle={handleSaveTitle}
            isSavedTitleChecked={(optTitle) => savedTitles.some(t => t.optimizedTitle.toLowerCase() === optTitle.toLowerCase())}
          />
        );

      case 'viral-topics':
        return (
          <ViralTopics 
            token={token} 
            onShowAuth={() => setAuthOpen(true)} 
          />
        );

      case 'saved':
        return (
          <SavedView
            token={token}
            onShowAuth={() => setAuthOpen(true)}
            savedTopics={savedTopics}
            onDeleteTopic={handleDeleteSavedTopic}
            onRefreshTopics={() => fetchSavedTopics(token)}
            savedTitles={savedTitles}
            onDeleteTitle={handleDeleteSavedTitle}
            onRefreshTitles={() => fetchSavedTitles(token)}
          />
        );

      case 'history':
        return (
          <HistoryGallery
            reports={reports}
            onSelectReport={setActiveReport}
            onDeleteReport={handleDeleteReport}
            isLoadingHistory={isLoadingHistory}
          />
        );

      case 'settings':
        return (
          <SettingsView
            user={user}
            onOpenAuth={() => setAuthOpen(true)}
          />
        );

      default:
        return (
          <div className="text-center py-20 text-xs text-slate-500">
            Resource tab not found. Return to secure channels.
          </div>
        );
    }
  };

  // Readable header titles
  const getPageHeaderLabel = () => {
    if (activeReport) return { title: 'Analysis Report', subtitle: 'Targeted visual CTR breakdown' };
    switch (activePage) {
      case 'dashboard': return { title: 'Workspace Dashboard', subtitle: 'Create What Wins.' };
      case 'analyzer': return { title: 'Thumbnail Analyzer', subtitle: 'Scan visual clickability metrics' };
      case 'title-optimizer': return { title: 'SaaS Title Optimizer', subtitle: 'Hype copywriting formulas' };
      case 'viral-topics': return { title: 'Daily Viral Topics', subtitle: 'AI video recommendations & sequence planners' };
      case 'saved': return { title: 'Creative Vault', subtitle: 'Organized topic boards and saved optimized titles' };
      case 'history': return { title: 'Analysis Archives', subtitle: 'Complete collection of completed scans' };
      case 'settings': return { title: 'System Settings', subtitle: 'Creator profiles and prompt tone biases' };
    }
  };

  const headerInfo = getPageHeaderLabel();

  return (
    <div className="min-h-screen flex bg-brand-bg text-slate-200 antialiased overflow-x-hidden">
      
      {/* 1. Left collapsible Sidebar */}
      <Sidebar
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
        activePage={activePage}
        onChangePage={(newPage) => {
          setActiveReport(null);
          setActivePage(newPage);
        }}
        savedCount={savedTopics.length}
      />

      {/* 2. Right Main Layout Arena */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen relative">
        
        {/* Dynamic ambient background gradients */}
        <div className="absolute top-0 right-0 h-[450px] w-[450px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-20 h-[500px] w-[500px] bg-brand-secondary/4 rounded-full blur-[140px] pointer-events-none" />

        {/* Top workspace action rail */}
        <header className="hidden md:flex sticky top-0 z-40 h-16 shrink-0 items-center justify-between border-b border-brand-border bg-brand-bg/90 px-6 backdrop-blur-md">
          
          {/* Breadcrumb / Page slogan info */}
          <div className="flex items-center space-x-2 truncate">
            <span className="font-display text-base font-semibold text-[#F4F1EA] shrink-0">
              {headerInfo.title}
            </span>
            <span className="text-[#4D5C73] hidden xs:inline shrink-0 select-none">·</span>
            <span className="hidden xs:inline text-xs font-mono font-medium text-[#7B8FA8] uppercase tracking-wider truncate">
              {headerInfo.subtitle}
            </span>
          </div>

          {/* Quick Info bar */}
          <div className="flex items-center space-x-4">
            {/* Live Status indicator */}
            <div className="font-mono text-[11px] text-[#7B8FA8] tracking-wider hidden md:block">
              STATUS: <span className="text-brand-success font-bold">ONLINE</span>
            </div>

            {/* UTC Live Clock */}
            <div className="hidden sm:flex items-center space-x-2 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-[#7B8FA8]" />
              <span className="font-mono text-[10px] uppercase font-bold text-[#F4F1EA]">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* User credentials identifier */}
            {user ? (
              <div 
                onClick={() => setActivePage('settings')}
                className="flex items-center space-x-2 bg-brand-surface hover:bg-brand-card px-2.5 py-1.5 rounded-lg border border-brand-border cursor-pointer transition select-none"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-brand-bg text-[10px] font-bold font-mono">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-[#F4F1EA] hidden sm:inline">{user.name}</span>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-lg bg-brand-primary hover:opacity-90 text-xs font-bold text-brand-bg px-3.5 py-1.5 transition active:scale-95 shrink-0"
              >
                Sign In
              </button>
            )}
          </div>

        </header>

        {/* Global Error indicator panel */}
        {globalError && (
          <div className="max-w-4xl mx-auto w-full mt-4 px-6 z-10">
            <div className="flex items-center space-x-3 rounded-lg bg-brand-danger/10 border border-brand-danger/25 px-4 py-3 text-xs text-brand-danger">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <p className="font-bold">{globalError}</p>
            </div>
          </div>
        )}

        {/* Render Workspace Tab */}
        <main className="flex-grow z-10 px-4 md:px-6 pt-4 md:pt-6 pb-28 md:pb-16 bg-[#0B1020] md:bg-transparent">
          {renderActivePage()}
        </main>

        {/* Tactile Floating Mobile Bottom Navigation Bar (Virlo Native Touch) */}
        <div className="block md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-1.75rem)] max-w-md z-50">
          <div className="relative rounded-2xl bg-[#161F32]/95 border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.75)] backdrop-blur-2xl px-2 py-2.5 flex items-center justify-around">
            
            {/* Top Border Inner Gloss Highlight */}
            <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'viral-topics', label: 'Topics', icon: Flame },
              { id: 'analyzer', label: 'Analyze', icon: ImageIcon },
              { id: 'history', label: 'History', icon: History },
              { id: 'settings', label: 'Profile', icon: UserIcon }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activePage === tab.id;
              
              const triggerHaptic = () => {
                if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                  // Premium short dual tap vibration pattern
                  window.navigator.vibrate([15, 30, 10]);
                }
              };

              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.90, y: 1.5 }}
                  onClick={() => {
                    triggerHaptic();
                    setActiveReport(null);
                    setActivePage(tab.id as any);
                  }}
                  className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[58px] min-h-[46px] rounded-xl outline-none select-none cursor-pointer"
                >
                  {/* Fluid sliding active background pill layout */}
                  {isActive && (
                    <motion.div 
                      layoutId="mobileActiveTabPill"
                      className="absolute inset-0 bg-[#4F7CFF]/15 rounded-xl border border-[#4F7CFF]/30 shadow-[inset_0_1px_6px_rgba(79,124,255,0.15)] -z-1"
                      transition={{ 
                        type: "spring", 
                        stiffness: 270, 
                        damping: 24, 
                        mass: 0.7 
                      }}
                    />
                  )}
                  
                  {/* Bottom interactive dot glow */}
                  {isActive && (
                    <motion.div 
                      layoutId="mobileActiveTabGlow"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-4 bg-[#4F7CFF] rounded-t-full shadow-[0_-2px_8px_#4F7CFF]"
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 25 
                      }}
                    />
                  )}
                  
                  <div className="relative">
                    <motion.div
                      animate={isActive ? { 
                        scale: 1.18,
                        y: -2.5
                      } : { 
                        scale: 1, 
                        y: 0 
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 380, 
                        damping: 15,
                        mass: 0.6
                      }}
                    >
                      <TabIcon 
                        className={`h-5 w-5 transition-colors duration-150 ${
                          isActive ? 'text-[#4F7CFF]' : 'text-[#7B8FA8]'
                        }`} 
                      />
                    </motion.div>
                    
                    {isActive && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#7C3AED] shadow-[0_0_8px_#7C3AED] ring-2 ring-[#0B1020] animate-pulse" />
                    )}
                  </div>
                  
                  <span className={`text-[9.5px] font-medium mt-1 tracking-wide font-sans transition-colors duration-150 active:scale-95 ${
                    isActive ? 'text-[#F4F1EA] font-bold' : 'text-[#7B8FA8]'
                  }`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Brand footer */}
        <footer className="border-t border-brand-border bg-[#0D1421]/30 py-6 px-6 z-10 mt-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full border border-brand-primary flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-brand-primary" />
              </div>
              <span className="font-display font-medium text-[#F4F1EA] tracking-wide">VIRLO CONSOLE</span>
              <span className="text-[#4D5C73]">•</span>
              <span className="font-mono text-[9px] text-[#7B8FA8] uppercase tracking-wider">Content Intelligence Instrument</span>
            </div>
            
            <p className="text-[10px] text-[#7B8FA8] max-w-sm text-center md:text-right leading-relaxed font-sans">
              Decoupled visual intelligence backed by secure serverless architecture frames. Running on <strong className="font-mono">gemini-3.5-flash</strong>.
            </p>
          </div>
        </footer>

      </div>

      {/* Authentication Gateways modal popup */}
      {authOpen && (
        <AuthModal 
          onClose={() => setAuthOpen(false)} 
          onAuthSuccess={handleAuthSuccess} 
        />
      )}

    </div>
  );
}
