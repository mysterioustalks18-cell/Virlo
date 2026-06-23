/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, TrendingUp, Zap, Trophy, History, Bookmark, 
  Search, ArrowRight, Eye, Video, Compass, HelpCircle, 
  Lightbulb, AlertCircle, ChevronRight, Activity, Calendar,
  Bell, Trash2, Heart, ExternalLink, Play, Sparkle, User as UserIcon, Type
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, ThumbnailAnalysis, SavedTopic } from '../types';

interface DashboardViewProps {
  user: User | null;
  reportsCount: number;
  savedTopicsCount: number;
  recentReports: ThumbnailAnalysis[];
  onSelectReport: (report: ThumbnailAnalysis) => void;
  onChangePage: (page: 'dashboard' | 'analyzer' | 'title-optimizer' | 'viral-topics' | 'saved' | 'history' | 'settings') => void;
  onOpenAuth: () => void;
  savedTopics?: SavedTopic[];
  savedTitles?: any[];
  onDeleteTopic?: (id: string) => Promise<void>;
  onDeleteTitle?: (id: string) => Promise<void>;
  onDeleteReport?: (id: string, e: React.MouseEvent) => Promise<void>;
}

export default function DashboardView({
  user,
  reportsCount,
  savedTopicsCount,
  recentReports,
  onSelectReport,
  onChangePage,
  onOpenAuth,
  savedTopics = [],
  savedTitles = [],
  onDeleteTopic,
  onDeleteTitle,
  onDeleteReport
}: DashboardViewProps) {
  const [quickInput, setQuickInput] = useState('');
  const [mobileActivityTab, setMobileActivityTab] = useState<'reports' | 'topics' | 'titles'>('reports');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Daily AI curated Creator Tips and Ideas
  const dailyTips = [
    {
      id: 1,
      category: 'Contrast',
      title: 'Neon Frame Glow Edge Loop',
      desc: 'Thumbnails using cyan-on-black or orange-on-violet double-edge lines are achieving up to 2.4x scroll attention rates on high-competition feeds.',
      impact: 'High Impact'
    },
    {
      id: 2,
      category: 'Cropping',
      title: 'Z-Axis Depth Scaling Rules',
      desc: 'Keep main subject foreground depth under 10% margins of the background canvas to enhance mobile list scale detection.',
      impact: 'Medium Impact'
    },
    {
      id: 3,
      category: 'Copywriting',
      title: 'Curiosity Cliffhanger Puzzles',
      desc: 'Formatting titles with unresolved brackets like — "The Insane Truth... (And Why it Stops)" command 30% higher active choice triggers.',
      impact: 'Critical Uplift'
    }
  ];

  // Curated growth recommendations of subjects
  const recommendedSubjects = [
    { title: 'AI Engineering Solutions', category: 'Educational', ctr: '11.4%' },
    { title: 'Micro-Habit Mastery 2026', category: 'Self Improvement', ctr: '9.8%' },
    { title: 'Stoic Business Rules', category: 'Finance', ctr: '10.2%' },
    { title: 'Solo Adventure Blueprints', category: 'Lifestyle', ctr: '12.1%' }
  ];

  // Dynamic welcome statement based on time
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(item => item !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }
  };

  const handleDeleteActivityItem = async (itemId: string, type: 'report' | 'topic' | 'title', e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeletingId(itemId);
    try {
      if (type === 'report' && onDeleteReport) {
        await onDeleteReport(itemId, e);
      } else if (type === 'topic' && onDeleteTopic) {
        await onDeleteTopic(itemId);
      } else if (type === 'title' && onDeleteTitle) {
        await onDeleteTitle(itemId);
      }
    } catch (err) {
      console.error('Failed deleting dashboard activity item:', err);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <>
      {/* ==========================================
          1. DESKTOP INTERFACE (Hides on Mobile)
          ========================================== */}
      <div className="hidden md:block space-y-8 max-w-6xl mx-auto py-8 px-4 sm:px-6">
        
        {/* Welcome Section & Banner */}
        <div className="relative overflow-hidden rounded-xl border border-brand-border bg-brand-surface p-6 sm:p-8">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-md bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 text-[10px] font-bold text-brand-primary tracking-widest uppercase font-mono">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>DAILY INSTRUMENT SCAN ACTIVE</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[#F4F1EA] leading-tight">
              Welcome back, {user ? user.name : 'Creator'}.
            </h1>
            
            <p className="text-[#7B8FA8] text-xs sm:text-sm leading-relaxed font-sans">
              Unleash professional CTR scores. Optimize thumbnail layout clarity and mine viral topics with the <strong className="text-brand-primary font-semibold">VIRLO Predictive Engine</strong>.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onChangePage('analyzer')}
                className="inline-flex items-center space-x-2 rounded-lg bg-brand-primary hover:opacity-90 text-brand-bg text-xs font-bold px-4.5 py-2.5 transition active:scale-95"
              >
                <Eye className="h-4 w-4" />
                <span>Analyze Thumbnail</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onChangePage('viral-topics')}
                className="inline-flex items-center space-x-2 rounded-lg border border-brand-border hover:border-[#9C824F] bg-transparent text-[#7B8FA8] hover:text-[#F4F1EA] text-xs font-bold px-4.5 py-2.5 transition"
              >
                <Video className="h-4 w-4 text-brand-secondary" />
                <span>Explore Viral Angles</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 relative overflow-hidden group hover:border-[#9C824F] transition duration-150">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 mb-3">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#7B8FA8] tracking-widest font-mono">Scans Run</span>
            <p className="text-2xl font-extrabold text-[#F4F1EA] mt-1 font-mono">{reportsCount}</p>
            <p className="text-[10px] text-[#4D5C73] mt-1 leading-normal font-sans">Evaluations logged in cloud database</p>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 relative overflow-hidden group hover:border-[#9C824F] transition duration-150">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-brand-success/10 text-brand-success border border-brand-success/20 mb-3">
              <TrendingUp className="h-4 w-4 animate-pulse" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#7B8FA8] tracking-widest font-mono">Average CTR</span>
            <p className="text-2xl font-extrabold text-brand-success mt-1 font-mono">9.45%</p>
            <p className="text-[10px] text-[#4D5C73] mt-1 leading-normal font-sans">Secure breakthrough bracket</p>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 relative overflow-hidden group hover:border-[#9C824F] transition duration-150">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 mb-3">
              <Bookmark className="h-4 w-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#7B8FA8] tracking-widest font-mono">Saved Vaults</span>
            <p className="text-2xl font-extrabold text-[#F4F1EA] mt-1 font-mono">{savedTopicsCount}</p>
            <p className="text-[10px] text-[#4D5C73] mt-1 leading-normal font-sans">Preserved ideation plans</p>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 relative overflow-hidden group hover:border-[#9C824F] transition duration-150">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 mb-3">
              <Zap className="h-4 w-4 fill-brand-primary/10" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#7B8FA8] tracking-widest font-mono">AI Model Level</span>
            <p className="text-xs font-bold text-[#F4F1EA] mt-2.5 truncate font-mono">gemini-3.5-flash</p>
            <p className="text-[10px] text-brand-success mt-1 flex items-center space-x-1 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-success inline-block animate-pulse" />
              <span>Operational (Verified)</span>
            </p>
          </div>
        </div>

        {/* Bento Grid: Playbook & Keyword Miner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 rounded-xl border border-brand-border bg-brand-surface p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center space-x-2.5">
                <Lightbulb className="h-5 w-5 text-brand-primary" />
                <h3 className="font-display text-sm font-bold text-[#F4F1EA] uppercase tracking-wider">Today's Creator IQ Playbook</h3>
              </div>
              <span className="text-[9px] font-bold text-[#7B8FA8] font-mono tracking-widest flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>UPDATED TODAY</span>
              </span>
            </div>

            <div className="space-y-4">
              {dailyTips.map((tip) => (
                <div key={tip.id} className="p-4 rounded-lg border border-brand-border bg-brand-card/30 hover:border-brand-primary/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold bg-[#1C2842] text-brand-primary border border-brand-border rounded-md px-1.5 py-0.5 uppercase tracking-wider">
                      {tip.category}
                    </span>
                    <h4 className="text-sm font-semibold text-[#F4F1EA] pt-1">{tip.title}</h4>
                    <p className="text-[11px] text-[#7B8FA8] leading-relaxed max-w-xl">{tip.desc}</p>
                  </div>
                  <div className="shrink-0 font-mono">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                      tip.impact === 'Critical Uplift' ? 'bg-[#E07856]/10 text-[#E07856] border border-[#E07856]/20' :
                      tip.impact === 'High Impact' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25' :
                      'bg-brand-card text-[#7B8FA8]'
                    }`}>
                      {tip.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-brand-border bg-brand-surface p-6 space-y-5">
            <div className="space-y-1 border-b border-brand-border pb-3">
              <h3 className="font-display text-sm font-bold text-[#F4F1EA] uppercase tracking-wider flex items-center space-x-2">
                <Compass className="h-4.5 w-4.5 text-brand-primary" />
                <span>Keyword Miner</span>
              </h3>
              <p className="text-[10px] text-[#7B8FA8] font-sans">Fast tracking search signals.</p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest font-mono">HOT DEMAND TOPICS</span>
              
              <div className="space-y-2">
                {recommendedSubjects.map((sub, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onChangePage('viral-topics')}
                    className="flex items-center justify-between p-3 rounded-lg bg-brand-card/30 border border-brand-border hover:border-brand-primary/40 text-left transition cursor-pointer group"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-[#F4F1EA] group-hover:text-brand-primary truncate transition">{sub.title}</p>
                      <p className="text-[9px] text-[#7B8FA8] font-mono">{sub.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] font-bold text-brand-success">{sub.ctr} CTR</span>
                      <p className="text-[8px] text-[#4D5C73] font-mono">Projection</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => onChangePage('viral-topics')}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border border-dashed border-brand-border hover:border-brand-primary/50 text-[#7B8FA8] hover:text-[#F4F1EA] text-xs font-semibold transition mt-2"
              >
                <span>Explore All Viral Trends</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Evaluation Records */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center space-x-2.5">
              <History className="h-5 w-5 text-brand-primary" />
              <h3 className="font-display text-sm font-bold text-[#F4F1EA] uppercase tracking-wider">Recent Evaluation Records</h3>
            </div>
            <button
              onClick={() => onChangePage('history')}
              className="text-xs text-brand-primary font-semibold hover:underline flex items-center space-x-1"
            >
              <span>View Full Archives</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-[#7B8FA8] text-xs font-mono">
              No evaluations completed yet. Upload your first thumbnail layout under the Analyzer page.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentReports.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  onClick={() => { onSelectReport(r); onChangePage('analyzer'); }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-brand-border bg-brand-card/20 hover:bg-brand-card/60 transition duration-150 cursor-pointer hover:border-brand-primary/40"
                >
                  <div className="aspect-video relative overflow-hidden bg-brand-bg border-b border-brand-border">
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform group-hover:scale-102 duration-300"
                    />
                    <div className="absolute right-2.5 top-2.5 rounded-md bg-black/85 border border-brand-border px-2.5 py-1 text-center font-mono font-bold text-xs">
                      <span className={r.overallScore >= 85 ? 'text-brand-success' : r.overallScore >= 70 ? 'text-brand-primary' : 'text-brand-secondary'}>
                        {r.overallScore}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="text-xs font-semibold text-[#F4F1EA] leading-snug truncate group-hover:text-brand-primary transition font-sans">
                      {r.title}
                    </h4>
                    <div className="flex items-center justify-between font-mono text-[9px] text-[#7B8FA8] pt-1">
                      <span>{r.ctrPrediction}</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          2. MOBILE REDESIGN — VIRLO NATIVE DASHBOARD
          ========================================== */}
      <div className="block md:hidden pb-12 bg-[#0B1020] text-[#F4F1EA] space-y-6">
        
        {/* Mobile Custom Top Header and Meta section */}
        <section className="flex flex-col space-y-3 px-1 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative h-9 w-9 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#4F7CFF] p-[1.5px] shadow-sm">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#111827] text-[11px] font-bold font-mono text-[#F4F1EA]">
                  {user ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#22C55E] border-2 border-[#0B1020]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-semibold text-[#8F9BB3] uppercase tracking-wider font-mono">
                    {getGreeting()}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-[#4F7CFF]" />
                  <span className="text-[8px] font-bold bg-[#4F7CFF]/15 text-[#4F7CFF] px-1.5 py-0.5 rounded-md uppercase tracking-widest font-mono border border-[#4F7CFF]/10">
                    Pro Active
                  </span>
                </div>
                <h2 className="text-sm font-extrabold text-[#F4F1EA] truncate max-w-[140px] tracking-tight">
                  {user ? user.name : 'Creator Guest'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-[#111827] border border-white/5 rounded-full p-1 shadow-inner">
              <button 
                onClick={() => onChangePage('viral-topics')}
                className="h-8 w-8 flex items-center justify-center rounded-full text-[#7B8FA8] hover:text-[#F4F1EA] active:bg-[#161F32] transition"
                aria-label="Search Trends"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              <div className="relative h-8 w-8 flex items-center justify-center rounded-full text-[#7B8FA8] hover:text-[#F4F1EA] active:bg-[#161F32] transition">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Hero Card — Custom Linear inspired design */}
        <section>
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7C3AED]/90 via-[#4F7CFF]/85 to-[#0B1020]/95 border border-white/8 p-6 shadow-[0_12px_24px_-8px_rgba(124,58,237,0.35)]">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[#7C3AED]/25 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 h-32 w-32 bg-[#4F7CFF]/20 rounded-full blur-xl pointer-events-none -ml-12 -mb-12" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest font-mono">DASHBOARD CORE INDEX</span>
                  <p className="text-xs text-white/90">Today's Creator IQ Score</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                  <Sparkles className="h-5 w-5 text-[#E8C77C]" />
                </div>
              </div>

              <div className="flex items-baseline space-x-1.5">
                <span className="text-4xl font-black text-white font-mono tracking-tight">94.5%</span>
                <span className="text-[10px] text-white/80 font-mono font-medium">CTR POTENTIAL</span>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/90 leading-relaxed font-medium">
                    "Elevate title typographical outlines to secure an instant CTR increase on high-competition feeds."
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onChangePage('analyzer')}
                className="w-full py-3 bg-white text-[#0B1020] rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition active:opacity-95"
              >
                <Eye className="h-4 w-4" />
                <span>Audit Next Thumbnail Layout</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>
        </section>

        {/* Dashboard Metrics Horizontal Swipe Grid */}
        <section className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-extrabold text-[#8F9BB3] uppercase tracking-widest font-mono flex items-center space-x-1">
              <Activity className="h-3.5 w-3.5 text-[#4F7CFF]" />
              <span>Workspace Statistics</span>
            </span>
            <span className="text-[9px] text-[#4F7CFF] font-bold font-mono">SWIPE RANGE</span>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none snap-x snap-mandatory">
            
            {/* Scans Run */}
            <div className="min-w-[136px] bg-[#161F32] rounded-[20px] p-4.5 border border-white/5 snap-start relative overflow-hidden flex flex-col justify-between">
              <div className="h-6.5 w-6.5 bg-[#4F7CFF]/10 text-[#4F7CFF] border border-[#4F7CFF]/20 rounded-lg flex items-center justify-center">
                <Eye className="h-3.5 w-3.5" />
              </div>
              <div className="mt-4">
                <span className="text-[9px] font-bold text-[#8F9BB3] uppercase tracking-wider font-mono">SCANS CURRENT</span>
                <p className="text-2xl font-black text-white font-mono mt-1 leading-none">{reportsCount}</p>
                <p className="text-[8px] text-[#4F7CFF] font-mono mt-1.5">+12% this week</p>
              </div>
            </div>

            {/* Saved Titles */}
            <div className="min-w-[136px] bg-[#161F32] rounded-[20px] p-4.5 border border-white/5 snap-start relative overflow-hidden flex flex-col justify-between">
              <div className="h-6.5 w-6.5 bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 rounded-lg flex items-center justify-center">
                <Bookmark className="h-3.5 w-3.5" />
              </div>
              <div className="mt-4">
                <span className="text-[9px] font-bold text-[#8F9BB3] uppercase tracking-wider font-mono">SAVED TITLES</span>
                <p className="text-2xl font-black text-white font-mono mt-1 leading-none">{savedTitles.length}</p>
                <p className="text-[8px] text-[#7C3AED] font-mono mt-1.5">Optimize blueprint</p>
              </div>
            </div>

            {/* Saved Topics */}
            <div className="min-w-[136px] bg-[#161F32] rounded-[20px] p-4.5 border border-white/5 snap-start relative overflow-hidden flex flex-col justify-between">
              <div className="h-6.5 w-6.5 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 rounded-lg flex items-center justify-center">
                <Video className="h-3.5 w-3.5" />
              </div>
              <div className="mt-4">
                <span className="text-[9px] font-bold text-[#8F9BB3] uppercase tracking-wider font-mono">SAVED TOPICS</span>
                <p className="text-2xl font-black text-white font-mono mt-1 leading-none">{savedTopicsCount}</p>
                <p className="text-[8px] text-[#22C55E] font-mono mt-1.5">Ideation active</p>
              </div>
            </div>

            {/* Streak metrics */}
            <div className="min-w-[136px] bg-[#161F32] rounded-[20px] p-4.5 border border-white/5 snap-start relative overflow-hidden flex flex-col justify-between">
              <div className="h-6.5 w-6.5 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5" />
              </div>
              <div className="mt-4">
                <span className="text-[9px] font-bold text-[#8F9BB3] uppercase tracking-wider font-mono">CREATOR STREAK</span>
                <p className="text-2xl font-black text-white font-mono mt-1 leading-none">6 Days</p>
                <p className="text-[8px] text-[#F59E0B] font-mono mt-1.5">Active Fire Streak</p>
              </div>
            </div>

            {/* AI usage limits */}
            <div className="min-w-[136px] bg-[#161F32] rounded-[20px] p-4.5 border border-white/5 snap-start relative overflow-hidden flex flex-col justify-between">
              <div className="h-6.5 w-6.5 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-lg flex items-center justify-center">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <div className="mt-4">
                <span className="text-[9px] font-bold text-[#8F9BB3] uppercase tracking-wider font-mono">GEMINI RATIO</span>
                <p className="text-base font-bold text-white truncate font-mono mt-1.5 leading-none">gemini-3.5</p>
                <p className="text-[8px] text-[#EF4444] font-mono mt-1.5">High Speed Active</p>
              </div>
            </div>

          </div>
        </section>

        {/* Quick Actions (Large Touch Friendly) */}
        <section className="space-y-3">
          <span className="text-[10px] font-extrabold text-[#8F9BB3] uppercase tracking-widest font-mono block px-1">
            Core Copywriting Playbooks
          </span>

          <div className="grid grid-cols-1 gap-3">
            
            {/* Viral Topics Action layout */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onChangePage('viral-topics')}
              className="flex items-center justify-between p-4 bg-[#161F32] border border-white/5 rounded-[20px] text-left active:border-[#71829e] transition relative overflow-hidden group min-h-[72px]"
            >
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#4F7CFF] flex items-center justify-center shadow-lg text-white font-semibold">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F4F1EA]">🔥 Viral Topic Generator</h4>
                  <p className="text-[10px] text-[#8F9BB3] mt-0.5">Mine daily low-competition breakthrough trends</p>
                </div>
              </div>
              <ChevronRight className="h-4.5 w-4.5 text-[#8F9BB3] group-hover:text-white transition" />
            </motion.button>

            {/* Thumbnail Analyzer Action layout */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onChangePage('analyzer')}
              className="flex items-center justify-between p-4 bg-[#161F32] border border-white/5 rounded-[20px] text-left active:border-[#71829e] transition relative overflow-hidden group min-h-[72px]"
            >
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#EF4444] to-[#F59E0B] flex items-center justify-center shadow-lg text-white font-semibold">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F4F1EA]">🖼 Visual Thumbnail Analyzer</h4>
                  <p className="text-[10px] text-[#8F9BB3] mt-0.5">Audit layout details, depth, and safe margins</p>
                </div>
              </div>
              <ChevronRight className="h-4.5 w-4.5 text-[#8F9BB3] group-hover:text-white transition" />
            </motion.button>

            {/* Title Optimizer Action layout */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onChangePage('title-optimizer')}
              className="flex items-center justify-between p-4 bg-[#161F32] border border-white/5 rounded-[20px] text-left active:border-[#71829e] transition relative overflow-hidden group min-h-[72px]"
            >
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#22C55E] flex items-center justify-center shadow-lg text-white font-semibold">
                  <Type className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F4F1EA]">✍ High-Click Title Optimizer</h4>
                  <p className="text-[10px] text-[#8F9BB3] mt-0.5">Formulate psychological cliffhangers & triggers</p>
                </div>
              </div>
              <ChevronRight className="h-4.5 w-4.5 text-[#8F9BB3] group-hover:text-white transition" />
            </motion.button>

          </div>
        </section>

        {/* AI Assistant Coach Card */}
        <section>
          <div className="rounded-[24px] bg-[#111827] border border-white/5 p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <div className="h-6 w-6 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center">
                <Sparkle className="h-3.5 w-3.5 text-[#7C3AED]" />
              </div>
              <span className="text-[10px] font-bold text-[#F4F1EA] uppercase tracking-wider font-mono">VIRLO CREATIVE COACH</span>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-[#8F9BB3] leading-relaxed">
                "Trending niche alerts for you: <strong className="text-white">Stoic Habits</strong> and <strong className="text-white">Micro Solopreneur Tactics</strong> are witnessing an average 18.4% increase in click-likelihood. I recommend generating title options for Stoic Habits today."
              </p>
              
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161F32] border border-white/5">
                <div className="truncate">
                  <p className="text-[9px] text-[#8F9BB3] font-mono uppercase font-bold tracking-wider">PREVIOUS HIGH SCAN</p>
                  <p className="text-xs text-[#F4F1EA] font-semibold truncate mt-0.5">Stoic Habit Mastery</p>
                </div>
                <button
                  onClick={() => onChangePage('title-optimizer')}
                  className="px-3 py-1.5 bg-[#4F7CFF]/15 hover:bg-[#4F7CFF]/25 text-[#4F7CFF] text-[10px] font-bold rounded-lg font-mono transition"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Togglable Mobile Activity Feed Segment Bar */}
        <section className="space-y-4">
          <div className="flex flex-col space-y-2 px-1">
            <span className="text-[10px] font-extrabold text-[#8F9BB3] uppercase tracking-widest font-mono">
              Live Vault & Logs
            </span>
            
            {/* Filter buttons */}
            <div className="flex bg-[#111827] rounded-xl p-1 border border-white/5">
              {[
                { id: 'reports', label: 'Evaluations' },
                { id: 'topics', label: 'Topics' },
                { id: 'titles', label: 'Titles' }
              ].map((item) => {
                const isActive = mobileActivityTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMobileActivityTab(item.id as any)}
                    className={`flex-1 py-2 text-[10px] font-semibold tracking-wide rounded-lg transition-all duration-150 ${
                      isActive 
                        ? 'bg-[#161F32] text-white shadow-md border border-white/5' 
                        : 'text-[#8F9BB3] hover:text-[#F4F1EA]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Logs rendering panels */}
          <div className="space-y-2.5 pt-0.5">
            
            {/* Segment Evaluations */}
            {mobileActivityTab === 'reports' && (
              <>
                {recentReports.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-[#8F9BB3] font-mono italic">
                    No visual evaluations found. Analyze a thumbnail to save records.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentReports.slice(0, 4).map((item) => {
                      const isFavorited = favorites.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => { onSelectReport(item); onChangePage('analyzer'); }}
                          className="flex items-center justify-between p-3 bg-[#111827] border border-white/5 rounded-xl transition hover:border-[#4F7CFF]/30 active:scale-99 cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3.5 truncate pr-2">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              referrerPolicy="no-referrer"
                              className="h-9 w-9 rounded-lg object-cover bg-black border border-white/10" 
                            />
                            <div className="truncate text-left">
                              <p className="text-xs font-bold text-[#F4F1EA] truncate max-w-[150px]">{item.title}</p>
                              <p className="text-[10px] text-[#8F9BB3] font-mono mt-0.5">Score: <strong className="text-brand-success">{item.overallScore}%</strong></p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className={`p-2 rounded-lg transition-all ${
                                isFavorited ? 'text-[#EF4444]' : 'text-[#8F9BB3] hover:text-white'
                              }`}
                              title="Favorite"
                            >
                              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-[#EF4444]' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteActivityItem(item.id, 'report', e)}
                              disabled={isDeletingId === item.id}
                              className="p-2 text-[#8F9BB3] hover:text-white transition disabled:opacity-50"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4 text-[#EF4444]/80" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Segment Topics */}
            {mobileActivityTab === 'topics' && (
              <>
                {savedTopics.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-[#8F9BB3] font-mono italic">
                    Your Saved Topics vault is clear. Generate topics to track blueprints.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedTopics.slice(0, 4).map((item: any) => {
                      const isFavorited = favorites.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-[#111827] border border-white/5 rounded-xl text-left"
                        >
                          <div className="truncate pr-2 space-y-0.5">
                            <p className="text-xs font-bold text-[#F4F1EA] truncate max-w-[180px]">
                              {item.title || item.topic?.title || 'Idea Blueprint'}
                            </p>
                            <span className="text-[8px] font-mono bg-[#7C3AED]/15 text-[#7C3AED] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest mt-1 inline-block">
                              {item.category || item.topic?.category || 'General'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button 
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className={`p-2 rounded-lg transition-all ${
                                isFavorited ? 'text-[#EF4444]' : 'text-[#8F9BB3] hover:text-white'
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-[#EF4444]' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteActivityItem(item.id, 'topic', e)}
                              disabled={isDeletingId === item.id}
                              className="p-2 text-[#8F9BB3] hover:text-white transition disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 text-[#EF4444]/80" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Segment Titles */}
            {mobileActivityTab === 'titles' && (
              <>
                {savedTitles.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-[#8F9BB3] font-mono italic">
                    No Optimized Titles found in vault. Complete a optimization scan to archive.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedTitles.slice(0, 4).map((itemOnIdx: any) => {
                      const id = itemOnIdx.id;
                      const isFavorited = favorites.includes(id);
                      return (
                        <div 
                          key={id}
                          className="flex items-center justify-between p-3 bg-[#111827] border border-white/5 rounded-xl text-left"
                        >
                          <div className="truncate pr-2 space-y-0.5">
                            <p className="text-xs font-bold text-[#F4F1EA] truncate max-w-[180px]">
                              {itemOnIdx.optimizedTitle}
                            </p>
                            <p className="text-[9px] text-[#8F9BB3] font-mono">Original: {itemOnIdx.originalTitle}</p>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button 
                              onClick={(e) => toggleFavorite(id, e)}
                              className={`p-2 rounded-lg transition-all ${
                                isFavorited ? 'text-[#EF4444]' : 'text-[#8F9BB3] hover:text-white'
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-[#EF4444]' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteActivityItem(id, 'title', e)}
                              disabled={isDeletingId === id}
                              className="p-2 text-[#8F9BB3] hover:text-white transition disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 text-[#EF4444]/80" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </div>
        </section>

      </div>
    </>
  );
}

