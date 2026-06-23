/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Globe,
  Flame,
  Award,
  Clock,
  BookOpen,
  Film,
  Star,
  Bookmark,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Trophy,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { ViralTopic, SavedTopic } from '../types';

interface ViralTopicsProps {
  token: string | null;
  onShowAuth: () => void;
}

async function safeParseJSON(res: Response): Promise<any> {
  const url = res.url;
  const status = res.status;
  const contentType = res.headers.get('content-type') || '';
  
  console.log(`[ViralTopics Fetch Debug] Response from ${url} | Status: ${status} | Content-Type: ${contentType}`);
  
  const text = await res.text();
  
  if (!contentType.includes('application/json')) {
    console.error(`[ViralTopics Fetch Debug Error] Expected JSON but received Content-Type: "${contentType}" from ${url}. Body Preview:`, text.slice(0, 1000));
    throw new Error(`Response is not valid JSON format (received: ${contentType || 'blank'}). Status: ${status}`);
  }
  
  try {
    if (!text.trim()) {
      throw new Error('Empty response body received');
    }
    return JSON.parse(text);
  } catch (err: any) {
    console.error(`[ViralTopics Fetch Debug Error] Failed to parse JSON from ${url}. Text length: ${text.length}. Body Preview:`, text.slice(0, 1000), err);
    throw new Error(`Response body was empty or corrupted JSON. Status: ${status}`);
  }
}

export default function ViralTopics({ token, onShowAuth }: ViralTopicsProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');

  // Parameters
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Worldwide');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedFormFactor, setSelectedFormFactor] = useState<'Long-form' | 'Shorts'>('Long-form');
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Advanced'>('Beginner');
  const [selectedCategory, setSelectedCategory] = useState<'Educational' | 'Entertainment'>('Educational');

  // List arrays
  const [topics, setTopics] = useState<ViralTopic[]>([]);
  const [savedList, setSavedList] = useState<SavedTopic[]>([]);

  // UI status helpers
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState<string | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState<string | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'title' | 'hook' | null>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Preset search click helpers
  const quickSearches = ['AI Solutions', 'Web3 Finance', 'Cyberpunk History', 'Football Tactics', 'Stoic Motivation', 'Quantum Space'];

  // Initialize and load saved topics
  useEffect(() => {
    fetchSavedTopics();
  }, [token]);

  const fetchSavedTopics = async () => {
    setIsLoadingSaved(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/topics/saved', { headers });
      if (res.ok) {
        const data = await safeParseJSON(res);
        setSavedList(data.saved || []);
      }
    } catch (err) {
      console.error('Failed to load saved topics archive files:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsGenerating(true);
    setTopics([]);

    try {
      const customKey = localStorage.getItem('custom_gemini_api_key') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (customKey) {
        headers['X-Gemini-API-Key'] = customKey;
      }

      const res = await fetch('/api/topics/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: query.trim() || 'General Trends',
          filters: {
            country: selectedCountry,
            language: selectedLanguage,
            formFactor: selectedFormFactor,
            level: selectedLevel,
            category: selectedCategory
          }
        })
      });

      let data: any = {};
      try {
        data = await safeParseJSON(res);
      } catch (parseErr) {
        if (!res.ok) {
          throw new Error('Server encountered an issue generating content insights.');
        } else {
          throw parseErr;
        }
      }

      if (!res.ok) {
        throw new Error(data.error || 'Server encountered an issue generating content insights.');
      }

      setTopics(data.topics || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try launching your campaign request again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTopic = async (topic: ViralTopic, favoriteOnly = false) => {
    setErrorMessage('');
    setIsSavingRecord(topic.title);

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
        // Update local saved list
        setSavedList(prev => {
          if (prev.some(item => item.id === savedItem.id)) return prev;
          return [savedItem, ...prev];
        });
      } else {
        const errData = await safeParseJSON(res);
        throw new Error(errData.error || 'Error saving topic.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not save topic.');
    } finally {
      setIsSavingRecord(null);
    }
  };

  const handleDeleteSaved = async (savedId: string) => {
    setErrorMessage('');
    setIsDeletingRecord(savedId);

    try {
      const res = await fetch(`/api/topics/saved/${savedId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        setSavedList(prev => prev.filter(item => item.id !== savedId));
      } else {
        const errData = await safeParseJSON(res);
        throw new Error(errData.error || 'Error deleting topic.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not delete the saved topic.');
    } finally {
      setIsDeletingRecord(null);
    }
  };

  const executeCopyText = (id: string, text: string, type: 'title' | 'hook') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedTopicId(expandedTopicId === id ? null : id);
  };

  const getScoreColorHex = (score: number) => {
    if (score >= 90) return 'from-teal-400 to-emerald-500 text-emerald-400';
    if (score >= 80) return 'from-indigo-400 to-indigo-600 text-indigo-400';
    if (score >= 70) return 'from-amber-400 to-orange-500 text-amber-400';
    return 'from-rose-400 to-pink-500 text-rose-450';
  };

  const getCompBadgeColor = (comp: string) => {
    switch (comp) {
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-350 border-slate-700';
    }
  };

  // Check if topic title is already saved
  const isTopicSaved = (title: string) => {
    return savedList.some(item => item.topic.title.toLowerCase() === title.toLowerCase());
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="viral-topics-view">
      
      {/* Title & Toggle Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-md bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-brand-primary mb-2 font-mono">
            <Flame className="h-3 w-3 text-brand-primary" />
            <span>AI Brainstorm Engine Active</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F1EA] tracking-tight">
            Daily Viral <span className="text-brand-primary">Topic Finder</span>
          </h2>
          <p className="text-xs text-[#7B8FA8] mt-1 max-w-2xl leading-relaxed font-sans">
            Instantly map high-potential video recommendations tailored to custom audience intent models, backed by structural CTR forecasts.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-brand-bg p-1.5 rounded-lg border border-brand-border self-start md:self-center shrink-0">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition font-mono ${
              activeTab === 'generate'
                ? 'bg-brand-primary text-brand-bg'
                : 'text-[#7B8FA8] hover:text-[#F4F1EA]'
            }`}
            id="tab-btn-generate"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Finder Tools</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition font-mono relative ${
              activeTab === 'saved'
                ? 'bg-brand-primary text-brand-bg font-bold'
                : 'text-[#7B8FA8] hover:text-[#F4F1EA]'
            }`}
            id="tab-btn-saved"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved Archive</span>
            {savedList.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-brand-bg ring-1 ring-brand-border">
                {savedList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Output block */}
      {errorMessage && (
        <div className="flex items-start space-x-3 rounded-lg bg-brand-danger/10 border border-brand-danger/25 px-4 py-3 text-xs sm:text-sm text-brand-danger">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="flex-grow">
            <p className="font-bold uppercase tracking-widest text-[9px] font-mono">Execution Issue Detected</p>
            <p className="text-slate-400 text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FINDER / GENERATE */}
      {activeTab === 'generate' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Main search and parameters panel */}
          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 sm:p-6 space-y-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* Keyword Query Search Bar */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono" htmlFor="niche-search-input">
                  Enter Niche, Keyword, or Video Topic Concept
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#4D5C73]">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    id="niche-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search e.g. Space, AI, Finance, History, Football, Motivation..."
                    className="w-full rounded-lg border border-brand-border bg-brand-bg py-3.5 pl-11 pr-4 text-xs text-[#F4F1EA] placeholder-[#4D5C73] focus:border-brand-primary focus:outline-none transition leading-relaxed font-sans"
                  />
                  
                  {/* Dynamic generation trigger */}
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="absolute right-2 top-2 bottom-2 flex items-center space-x-1.5 rounded-lg bg-brand-primary px-4.5 text-xs font-bold text-brand-bg hover:opacity-95 transition active:scale-95 disabled:opacity-40 disabled:scale-100 font-mono uppercase tracking-wider text-[11px]"
                    id="btn-submit-generate"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-bg" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 text-brand-bg" />
                        <span>Scan Niche</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                  <span className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest self-center mr-1">Suggested:</span>
                  {quickSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        setTimeout(() => {
                          const btn = document.getElementById('btn-submit-generate');
                          if (btn) btn.click();
                        }, 50);
                      }}
                      className="rounded bg-brand-bg border border-brand-border px-2.5 py-1 text-[10px] text-[#7B8FA8] hover:text-[#F4F1EA] hover:border-brand-primary transition font-bold"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-brand-border text-xs">
                
                {/* 1. Country Selection */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono">
                    Country Target
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg px-3.5 py-2.5 text-xs text-[#F4F1EA] focus:border-brand-primary focus:outline-none transition"
                    id="select-country"
                  >
                    <option value="Worldwide">🌎 Worldwide</option>
                    <option value="United States">🇺🇸 United States</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="Australia">🇦🇺 Australia</option>
                  </select>
                </div>

                {/* 2. Language Selection */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono">
                    Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg px-3.5 py-2.5 text-xs text-[#F4F1EA] focus:border-brand-primary focus:outline-none transition"
                    id="select-language"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Hindi">Hindi</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>

                {/* 3. Form Factor (Long vs Shorts) */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono">
                    Form Factor
                  </label>
                  <select
                    value={selectedFormFactor}
                    onChange={(e) => setSelectedFormFactor(e.target.value as any)}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg px-3.5 py-2.5 text-xs text-[#F4F1EA] focus:border-brand-primary focus:outline-none transition"
                    id="select-form-factor"
                  >
                    <option value="Long-form">📺 Long-form Videos</option>
                    <option value="Shorts">📱 YouTube Shorts</option>
                  </select>
                </div>

                {/* 4. Audience Level */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono">
                    Audience Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as any)}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg px-3.5 py-2.5 text-xs text-[#F4F1EA] focus:border-brand-primary focus:outline-none transition"
                    id="select-level"
                  >
                    <option value="Beginner">Beginner (Broad Appeal)</option>
                    <option value="Advanced">Advanced (Elite Niche)</option>
                  </select>
                </div>

                {/* 5. Category/Tone */}
                <div className="space-y-1.5 col-span-2 md:col-span-1 font-sans">
                  <label className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono">
                    Content Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg px-3.5 py-2.5 text-xs text-[#F4F1EA] focus:border-brand-primary focus:outline-none transition"
                    id="select-category"
                  >
                    <option value="Educational">🎓 Educational / Tutorial</option>
                    <option value="Entertainment">🍿 Entertainment / Hype</option>
                  </select>
                </div>

              </div>

            </form>
          </div>

          {/* SKELETON LOADING OR RESULTS */}
          {isGenerating ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-[#7B8FA8] text-xs font-mono">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                <span className="animate-pulse font-mono uppercase text-[10px] tracking-widest text-[#7B8FA8]">Parsing virality models for "{query || 'General Trends'}"...</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="rounded-lg border border-brand-border bg-brand-surface p-5 space-y-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 rounded bg-brand-border" />
                      <div className="h-4 w-24 rounded bg-brand-border" />
                    </div>
                    <div className="h-4 w-3/4 rounded bg-brand-border" />
                    <div className="h-3 w-full rounded bg-brand-border" />
                    <div className="h-10 w-full rounded bg-brand-border" />
                  </div>
                ))}
              </div>
            </div>
          ) : topics.length === 0 ? (
            <div className="rounded-lg border border-brand-border bg-brand-surface/10 py-16 px-4 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface border border-brand-border text-brand-primary">
                <Trophy className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-[#F4F1EA] text-sm font-semibold font-display">Unleash Next-Gen Ideas</h4>
                <p className="text-[#7B8FA8] mt-1 max-w-sm mx-auto text-xs leading-relaxed font-sans">
                  Submit a topic parameter above to generate 20 actionable and high-potential content topics instantly.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuery('Space Exploration');
                  setTimeout(() => handleGenerate(), 50);
                }}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-brand-primary/25 bg-brand-primary/10 hover:bg-brand-primary/20 text-xs font-bold text-brand-primary px-4 py-2 transition font-mono uppercase tracking-wider text-[10px]"
              >
                <span>Run Demo Setup ("Space Exploration")</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Analytics Summary */}
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="text-xs text-[#7B8FA8] font-mono uppercase tracking-wider text-[10px]">
                  Analysis completed: <strong className="text-brand-primary font-bold">{topics.length} Opportunities</strong> loaded for "{query || 'General Trends'}"
                </span>
                
                <button
                  onClick={() => handleGenerate()}
                  className="flex items-center space-x-1 text-xs text-brand-primary hover:underline font-bold font-mono tracking-wider text-[10px]"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate Deck</span>
                </button>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans" id="generated-topics-grid">
                {topics.map((topic, i) => {
                  const isSaved = isTopicSaved(topic.title);
                  const isSaving = isSavingRecord === topic.title;

                  return (
                    <div
                      key={topic.id || i}
                      className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border transition-all duration-300 bg-brand-surface/20 hover:bg-brand-surface ${
                        isSaved ? 'border-brand-primary shadow-lg shadow-brand-primary/5' : 'border-brand-border'
                      }`}
                    >
                      {/* Top Header Badge Row */}
                      <div className="p-5 pb-3">
                        <div className="flex items-center justify-between gap-3 mb-3.5">
                          {/* Virality Score Progress pill */}
                          <div className={`flex items-center space-x-1.5 rounded bg-brand-bg px-2.5 py-1 border border-brand-border font-mono text-[10px] font-bold ${getScoreColorHex(topic.viralityScore)}`}>
                            <Flame className="h-3.5 w-3.5 shrink-0" />
                            <span>{topic.viralityScore}% VIRAL</span>
                          </div>

                          {/* Competition badge */}
                          <div className="flex items-center space-x-2 font-mono">
                            <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${getCompBadgeColor(topic.competition)}`}>
                              {topic.competition} Comp
                            </span>
                          </div>
                        </div>

                        {/* Title block */}
                        <div className="space-y-2">
                          <h3 className="font-display text-base font-semibold text-[#F4F1EA] group-hover:text-brand-primary transition leading-snug">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-[#E8C77C] italic font-medium leading-relaxed font-serif">
                            "{topic.hook}"
                          </p>
                        </div>

                        {/* Reason / Why it works */}
                        <p className="text-xs text-[#7B8FA8] mt-3 leading-relaxed border-t border-brand-border pt-3">
                          {topic.reason}
                        </p>

                        {/* Expandable Technical Playbook details */}
                        {expandedTopicId === topic.id ? (
                          <div className="mt-4 pt-4 border-t border-brand-border space-y-4 animate-slide-down">
                            
                            {/* Technical Metrics Header */}
                            <div className="grid grid-cols-2 gap-4 border-b border-brand-border/40 pb-3">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider flex justify-between">
                                  <span>Originality Rating</span>
                                  <span className="text-brand-primary">{topic.originalityScore || 85}%</span>
                                </span>
                                <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-border/30">
                                  <div 
                                    className="h-full bg-gradient-to-r from-brand-primary/65 to-brand-primary rounded-full animate-pulse" 
                                    style={{ width: `${topic.originalityScore || 85}%` }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider flex justify-between">
                                  <span>Evergreen Duration</span>
                                  <span className="text-teal-400">{topic.evergreenScore || 90}%</span>
                                </span>
                                <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-border/30">
                                  <div 
                                    className="h-full bg-gradient-to-r from-teal-500/60 to-emerald-400 rounded-full" 
                                    style={{ width: `${topic.evergreenScore || 90}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 text-[11px] font-sans text-[#7B8FA8]">
                              
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider">Search Intent Match</span>
                                <p className="text-[#F4F1EA] font-medium leading-relaxed">{topic.searchIntent}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider">Target Profile</span>
                                <p className="text-[#F4F1EA] font-medium leading-relaxed">{topic.audienceType}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider">Thumbnail Blueprint</span>
                                <p className="text-[#F4F1EA] font-medium leading-relaxed">{topic.suggestedThumbnail}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider">Publish Protocol</span>
                                <p className="text-[#F4F1EA] font-medium leading-relaxed">
                                  Format: <strong className="text-brand-primary font-bold">{topic.publishingFormat || 'Standard Video'}</strong><br/>
                                  Time: <strong className="text-teal-400 font-bold">{topic.uploadTime}</strong><br/>
                                  Length: <strong className="text-[#E8C77C] font-bold">{topic.videoLength}</strong>
                                </p>
                              </div>

                            </div>

                            {/* Why & ROI Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-brand-border/40">
                              <div className="rounded border border-brand-border bg-brand-bg/40 p-2.5 space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-brand-primary tracking-wider flex items-center space-x-1">
                                  <Zap className="h-3 w-3 text-brand-primary" />
                                  <span>Viewer Click Trigger Analysis</span>
                                </span>
                                <p className="text-[11px] text-[#7B8FA8] leading-relaxed font-sans">
                                  {topic.whyViewersClick || 'Immediate curiosity vector and dopamine story loop activation.'}
                                </p>
                              </div>

                              <div className="rounded border border-brand-border bg-brand-bg/40 p-2.5 space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center space-x-1">
                                  <Trophy className="h-3 w-3 text-emerald-400" />
                                  <span>Creator Strategic ROI</span>
                                </span>
                                <p className="text-[11px] text-[#7B8FA8] leading-relaxed font-sans">
                                  {topic.whyCreatorsMake || 'High commercial CPM, fast scale, and powerful niche authority building blocks.'}
                                </p>
                              </div>
                            </div>

                            {/* Following consecutive video ideas */}
                            <div className="rounded border border-brand-border bg-brand-surface p-3 space-y-2">
                              <span className="text-[9px] font-mono font-bold uppercase text-brand-primary tracking-wider flex items-center space-x-1">
                                <Award className="h-3 w-3 text-brand-primary" />
                                <span>Subscriber Retention Sequel Ideas</span>
                              </span>
                              <ol className="list-decimal pl-4.5 text-[11px] text-[#7B8FA8] space-y-1 font-sans">
                                {topic.followUps?.map((idea, idx) => (
                                  <li key={idx} className="leading-snug">{idea}</li>
                                ))}
                              </ol>
                            </div>

                          </div>
                        ) : null}

                      </div>

                      {/* Footer Actions row */}
                      <div className="border-t border-brand-border bg-brand-surface/35 px-5 py-3.5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        
                        {/* More detail switch */}
                        <button
                          onClick={() => toggleExpand(topic.id)}
                          className="flex items-center space-x-1 text-[11px] font-bold text-[#7B8FA8] hover:text-[#F4F1EA] transition text-left self-start font-mono uppercase tracking-wider"
                        >
                          <span>{expandedTopicId === topic.id ? 'Collapse Playbook' : 'Inspect Playbook'}</span>
                          {expandedTopicId === topic.id ? (
                            <ChevronUp className="h-3.5 w-3.5 text-brand-primary" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-brand-primary" />
                          )}
                        </button>

                        {/* Copy / Action Deck */}
                        <div className="flex flex-wrap items-center gap-2">
                          
                          {/* Copy Title Button */}
                          <button
                            onClick={() => executeCopyText(topic.id, topic.title, 'title')}
                            className="flex items-center space-x-1 rounded border border-brand-border hover:border-[#F4F1EA]/20 bg-brand-bg px-2.5 py-1.5 text-xs font-bold font-mono text-[#7B8FA8] hover:text-[#F4F1EA] transition"
                            title="Copy Title to Clipboard"
                          >
                            {copiedId === topic.id && copiedType === 'title' ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Title Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Title</span>
                              </>
                            )}
                          </button>

                          {/* Copy Hook Button */}
                          <button
                            onClick={() => executeCopyText(topic.id, topic.hook, 'hook')}
                            className="flex items-center space-x-1 rounded border border-brand-border hover:border-[#F4F1EA]/20 bg-brand-bg px-2.5 py-1.5 text-xs font-bold font-mono text-[#7B8FA8] hover:text-[#F4F1EA] transition"
                            title="Copy Hook Lines"
                          >
                            {copiedId === topic.id && copiedType === 'hook' ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Hook Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Hook</span>
                              </>
                            )}
                          </button>

                          {/* Save / Favorite Action Buttons */}
                          <button
                            onClick={() => handleSaveTopic(topic)}
                            disabled={isSaving || isSaved}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold font-mono uppercase tracking-wider border transition ${
                              isSaved
                                ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                                : 'bg-brand-primary border-brand-primary text-brand-bg hover:opacity-90'
                            }`}
                            title={isSaved ? 'Saved to Archives' : 'Save to Board List'}
                          >
                            {isSaving ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : isSaved ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-3.5 w-3.5" />
                                <span>Save Topic</span>
                              </>
                            )}
                          </button>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: SAVED ARCHIVES */}
      {activeTab === 'saved' && (
        <div className="space-y-6 animate-fade-in">
          
          {isLoadingSaved ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
              <p className="text-xs text-[#7B8FA8] font-mono uppercase tracking-wider text-[10px]">Loading saved topic blueprints from secure storage...</p>
            </div>
          ) : savedList.length === 0 ? (
            <div className="rounded-lg border border-brand-border bg-brand-surface/10 py-16 px-4 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface border border-brand-border text-brand-primary">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-[#F4F1EA] text-sm font-semibold font-display">Archive is Empty</h4>
                <p className="text-[#7B8FA8] mt-1 max-w-sm mx-auto text-xs leading-relaxed font-sans">
                  You haven't preserved any high-potential opportunities yet. Find stellar recommendations under the Finder tab and save them!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('generate')}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-brand-primary/25 bg-brand-primary/10 hover:bg-brand-primary/20 text-xs font-bold text-brand-primary px-4.5 py-2.5 transition font-mono uppercase tracking-wider text-[10px]"
              >
                <span>Navigate to Finder Tools</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="text-xs text-[#7B8FA8] font-mono uppercase tracking-wider text-[10px]">
                  Preserved Vault: <strong className="text-brand-primary font-bold">{savedList.length} blueprinted metrics</strong>
                </span>
                
                <button
                  onClick={() => fetchSavedTopics()}
                  className="flex items-center space-x-1 text-xs text-brand-primary hover:underline font-bold font-mono tracking-wider text-[10px]"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Sync Server Records</span>
                </button>
              </div>

              {/* Saved Deck Cards Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="saved-topics-grid">
                {savedList.map((item) => {
                  const topic = item.topic;
                  const isDeleting = isDeletingRecord === item.id;

                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-brand-border bg-brand-surface/20"
                    >
                      {/* Top Header Badge Row */}
                      <div className="p-5 pb-3">
                        <div className="flex items-center justify-between gap-3 mb-3.5">
                          {/* Virality Score */}
                          <div className={`flex items-center space-x-1.5 rounded bg-brand-bg px-2.5 py-1 border border-brand-border font-mono text-[10px] font-bold ${getScoreColorHex(topic.viralityScore)}`}>
                            <Flame className="h-3.5 w-3.5 shrink-0" />
                            <span>{topic.viralityScore}% VIRAL</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`rounded border px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase ${getCompBadgeColor(topic.competition)}`}>
                              {topic.competition} Comp
                            </span>
                            
                            {/* Delete archives capability */}
                            <button
                              onClick={() => handleDeleteSaved(item.id)}
                              disabled={isDeleting}
                              className="rounded p-1 text-[#7B8FA8] hover:bg-brand-danger/10 hover:text-brand-danger transition"
                              title="Delete saved topic"
                              id={`btn-del-saved-${item.id}`}
                            >
                              {isDeleting ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Title block */}
                        <div className="space-y-1.5">
                          <h3 className="font-display text-base font-semibold text-[#F4F1EA] group-hover:text-brand-primary transition leading-snug">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-[#E8C77C] italic font-medium leading-relaxed font-serif">
                            "{topic.hook}"
                          </p>
                        </div>

                        {/* Reason why it works */}
                        <p className="text-xs text-[#7B8FA8] mt-3 leading-relaxed border-t border-brand-border pt-3">
                          {topic.reason}
                        </p>

                        {/* Expandable Blueprint specs */}
                        {expandedTopicId === item.id ? (
                          <div className="mt-4 pt-4 border-t border-brand-border space-y-4 animate-slide-down">
                            
                            {/* Technical Metrics Header */}
                            <div className="grid grid-cols-2 gap-4 border-b border-brand-border/40 pb-3 font-sans">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider flex justify-between">
                                  <span>Originality Rating</span>
                                  <span className="text-brand-primary">{topic.originalityScore || 85}%</span>
                                </span>
                                <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-border/30">
                                  <div 
                                    className="h-full bg-gradient-to-r from-brand-primary/65 to-brand-primary rounded-full animate-pulse" 
                                    style={{ width: `${topic.originalityScore || 85}%` }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider flex justify-between">
                                  <span>Evergreen Duration</span>
                                  <span className="text-teal-400">{topic.evergreenScore || 90}%</span>
                                </span>
                                <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-border/30">
                                  <div 
                                    className="h-full bg-gradient-to-r from-teal-500/60 to-emerald-400 rounded-full" 
                                    style={{ width: `${topic.evergreenScore || 90}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 text-[11px] font-sans text-[#7B8FA8]">
                              
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider">Search Intent Match</span>
                                <p className="text-[#F4F1EA] font-medium leading-relaxed">{topic.searchIntent}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider">Target Profile</span>
                                <p className="text-[#F4F1EA] font-medium leading-relaxed">{topic.audienceType}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider">Thumbnail Blueprint</span>
                                <p className="text-[#F4F1EA] font-medium leading-relaxed">{topic.suggestedThumbnail}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-[#4D5C73] tracking-wider">Publish Protocol</span>
                                <p className="text-[#F4F1EA] font-medium leading-relaxed">
                                  Format: <strong className="text-brand-primary font-bold">{topic.publishingFormat || 'Standard Video'}</strong><br/>
                                  Time: <strong className="text-teal-400 font-bold">{topic.uploadTime}</strong><br/>
                                  Length: <strong className="text-[#E8C77C] font-bold">{topic.videoLength}</strong>
                                </p>
                              </div>

                            </div>

                            {/* Why & ROI Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-brand-border/40 font-sans">
                              <div className="rounded border border-brand-border bg-brand-bg/40 p-2.5 space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-brand-primary tracking-wider flex items-center space-x-1">
                                  <Zap className="h-3 w-3 text-brand-primary" />
                                  <span>Viewer Click Trigger Analysis</span>
                                </span>
                                <p className="text-[11px] text-[#7B8FA8] leading-relaxed font-sans">
                                  {topic.whyViewersClick || 'Immediate curiosity vector and dopamine story loop activation.'}
                                </p>
                              </div>

                              <div className="rounded border border-brand-border bg-brand-bg/40 p-2.5 space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center space-x-1">
                                  <Trophy className="h-3 w-3 text-emerald-400" />
                                  <span>Creator Strategic ROI</span>
                                </span>
                                <p className="text-[11px] text-[#7B8FA8] leading-relaxed font-sans">
                                  {topic.whyCreatorsMake || 'High commercial CPM, fast scale, and powerful niche authority building blocks.'}
                                </p>
                              </div>
                            </div>

                            {/* Following consecutive video ideas */}
                            <div className="rounded border border-brand-border bg-brand-surface p-3 space-y-2">
                              <span className="text-[9px] font-mono font-bold uppercase text-brand-primary tracking-wider flex items-center space-x-1 font-sans">
                                <Award className="h-3 w-3 text-brand-primary" />
                                <span>Subscriber Retention Sequel Ideas</span>
                              </span>
                              <ol className="list-decimal pl-4.5 text-[11px] text-[#7B8FA8] space-y-1 font-sans">
                                {topic.followUps?.map((idea, idx) => (
                                  <li key={idx} className="leading-snug">{idea}</li>
                                ))}
                              </ol>
                            </div>

                          </div>
                        ) : null}

                      </div>

                      {/* Footer Actions Row */}
                      <div className="border-t border-brand-border bg-brand-surface/35 px-5 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        
                        {/* More detail switch */}
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="flex items-center space-x-1 text-[11px] font-bold text-[#7B8FA8] hover:text-[#F4F1EA] transition text-left self-start font-mono uppercase tracking-wider"
                        >
                          <span>{expandedTopicId === item.id ? 'Collapse Blueprint' : 'Inspect Blueprint'}</span>
                          {expandedTopicId === item.id ? (
                            <ChevronUp className="h-3.5 w-3.5 text-brand-primary" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-brand-primary" />
                          )}
                        </button>

                        {/* Copy buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          
                          <button
                            onClick={() => executeCopyText(item.id, topic.title, 'title')}
                            className="flex items-center space-x-1 rounded border border-brand-border hover:border-[#F4F1EA]/20 bg-brand-bg px-2.5 py-1.5 text-xs font-bold font-mono text-[#7B8FA8] hover:text-[#F4F1EA] transition"
                          >
                            {copiedId === item.id && copiedType === 'title' ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Title Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Title</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => executeCopyText(item.id, topic.hook, 'hook')}
                            className="flex items-center space-x-1 rounded border border-brand-border hover:border-[#F4F1EA]/20 bg-brand-bg px-2.5 py-1.5 text-xs font-bold font-mono text-[#7B8FA8] hover:text-[#F4F1EA] transition"
                          >
                            {copiedId === item.id && copiedType === 'hook' ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Hook Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Hook</span>
                              </>
                            )}
                          </button>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Secure footer guidelines badge */}
      <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-4 text-center">
        <p className="text-[10px] font-mono text-slate-500 leading-relaxed max-w-2xl mx-auto uppercase">
          ⚡ Automated indexing algorithms utilize Google Gemini intelligence combined with click-through forecasting parameters to model retention and search authority levels.
        </p>
      </div>

    </div>
  );
}
