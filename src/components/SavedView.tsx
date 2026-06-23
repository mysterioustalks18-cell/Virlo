/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bookmark, Trash2, Copy, Check, RefreshCw, Flame, Award, 
  Target, Key, Clock, AlertCircle, TrendingUp, HelpCircle
} from 'lucide-react';
import { SavedTopic } from '../types';

interface SavedTitle {
  id: string;
  userId: string;
  originalTitle: string;
  optimizedTitle: string;
  category: string;
  score: number;
  triggerType: string;
  ctrUplift: string;
  explanation: string;
  createdAt: string;
}

interface SavedViewProps {
  token: string | null;
  onShowAuth: () => void;
  savedTopics: SavedTopic[];
  onDeleteTopic: (id: string) => Promise<void>;
  onRefreshTopics: () => Promise<void>;
  savedTitles: SavedTitle[];
  onDeleteTitle: (id: string) => Promise<void>;
  onRefreshTitles: () => Promise<void>;
}

export default function SavedView({
  token,
  onShowAuth,
  savedTopics,
  onDeleteTopic,
  onRefreshTopics,
  savedTitles,
  onDeleteTitle,
  onRefreshTitles
}: SavedViewProps) {
  const [activeTab, setActiveTab] = useState<'topics' | 'titles'>('topics');
  
  // Saved Titles states
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [isDeletingTitle, setIsDeletingTitle] = useState<string | null>(null);
  
  // UI helpers
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (token) {
      triggerRefreshTitles();
    }
  }, [token]);

  const triggerRefreshTitles = async () => {
    setIsLoadingTitles(true);
    setErrorText('');
    try {
      await onRefreshTitles();
    } catch (err: any) {
      console.error('Saved titles fetch failure:', err);
      setErrorText(err.message || 'Connecting to saved copy archives failed.');
    } finally {
      setIsLoadingTitles(false);
    }
  };

  const handleDeleteTitle = async (id: string) => {
    setIsDeletingTitle(id);
    setErrorText('');
    try {
      await onDeleteTitle(id);
    } catch (err: any) {
      setErrorText(err.message || 'Delete operation missed cloud callback.');
    } finally {
      setIsDeletingTitle(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
    if (score >= 70) return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
    return 'text-brand-warning bg-brand-warning/10 border-brand-warning/20';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* 1. Header & Switcher Tab */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border pb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F1EA] tracking-tight flex items-center space-x-2">
            <Bookmark className="h-6 w-6 text-brand-primary" />
            <span>Saved <span className="text-brand-primary">Creative Vault</span></span>
          </h2>
          <p className="text-xs text-[#7B8FA8] mt-1 max-w-2xl leading-relaxed font-sans">
            Synchronized vault hosting your prioritized topic Blueprints and psychological title variants compiled with CTR boosts.
          </p>
        </div>

        {/* Tab switcher design */}
        <div className="flex bg-brand-bg p-1.5 rounded-lg border border-brand-border self-start md:self-center shrink-0">
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition font-mono ${
              activeTab === 'topics'
                ? 'bg-brand-primary text-brand-bg'
                : 'text-[#7B8FA8] hover:text-[#F4F1EA]'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Saved Topics ({savedTopics.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition font-mono relative ${
              activeTab === 'titles'
                ? 'bg-brand-primary text-brand-bg'
                : 'text-[#7B8FA8] hover:text-[#F4F1EA]'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Saved Titles ({savedTitles.length})</span>
          </button>
        </div>
      </div>

      {/* Error block */}
      {errorText && (
        <div className="flex items-start space-x-2.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 p-3.5 text-xs text-brand-danger">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorText}</span>
        </div>
      )}

      {/* 2. TAB: SAVED TOPICS LAYOUT */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#7B8FA8] uppercase tracking-widest border-b border-brand-border pb-2">
            <span>SAVED BLUETRACKERS ({savedTopics.length} RECORDS)</span>
            <button
              onClick={onRefreshTopics}
              className="flex items-center space-x-1.5 text-brand-primary hover:underline font-bold"
            >
              <RefreshCw className="h-3 w-3" />
              <span>SYNC ARCHIVES</span>
            </button>
          </div>

          {savedTopics.length === 0 ? (
            <div className="rounded-lg border border-brand-border bg-brand-surface p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg border border-brand-border text-brand-primary">
                <Flame className="h-5 w-5 text-brand-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[#F4F1EA] text-sm font-semibold font-display">SaaS Topics Board is Empty</h4>
                <p className="text-xs text-[#7B8FA8] max-w-xs mx-auto leading-relaxed font-sans">
                  Brainstorm topics inside Daily Viral Topic Finder and hit save to preserve research models!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
              {savedTopics.map((item) => {
                const topic = item.topic;
                return (
                  <div 
                    key={item.id}
                    className="group relative rounded-lg border border-brand-border bg-brand-surface p-5 hover:border-brand-primary/40 transition flex flex-col justify-between h-full"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 rounded">
                          {topic.viralityScore}% Virality Score
                        </span>
                        
                        {/* Delete trigger button */}
                        <button
                          onClick={() => onDeleteTopic(item.id)}
                          className="p-1 rounded text-[#7B8FA8] hover:bg-brand-danger/10 hover:text-brand-danger transition shrink-0"
                          title="Delete saved item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-[#F4F1EA] tracking-wide leading-tight font-display">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-[#7B8FA8] leading-relaxed">
                          {topic.reason}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-brand-border pt-3.5 mt-4 flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#4D5C73] uppercase tracking-widest">
                        Niche: {topic.competition} Comp
                      </span>
                      
                      <button
                        onClick={() => handleCopyText(topic.title, item.id)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-[#7B8FA8] hover:text-[#F4F1EA] transition rounded-lg border border-brand-border bg-brand-bg font-mono text-[10px]"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3 w-3 text-brand-success" />
                            <span className="text-brand-success text-[10px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span className="text-[10px]">Copy Idea</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: SAVED OPTIMIZED TITLES LAYOUT */}
      {activeTab === 'titles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#7B8FA8] uppercase tracking-widest border-b border-brand-border pb-2">
            <span>SAVED HIGH-CLICK COPIES ({savedTitles.length} Blueprints)</span>
            <button
              onClick={triggerRefreshTitles}
              disabled={isLoadingTitles}
              className="flex items-center space-x-1.5 text-brand-primary hover:underline font-bold"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingTitles ? 'animate-spin' : ''}`} />
              <span>SYNC ARCHIVES</span>
            </button>
          </div>

          {isLoadingTitles ? (
            <div className="text-center py-20 text-xs text-[#7B8FA8] font-mono">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand-primary mb-2" />
              <span>Sinking saved records from cloud vault...</span>
            </div>
          ) : savedTitles.length === 0 ? (
            <div className="rounded-lg border border-brand-border bg-brand-surface p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg border border-brand-border text-brand-primary">
                <Target className="h-5 w-5 text-brand-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[#F4F1EA] text-sm font-semibold font-display">Saved Titles File is Empty</h4>
                <p className="text-xs text-[#7B8FA8] max-w-xs mx-auto leading-relaxed font-sans">
                  Optimize concept video titles inside Title Optimizer and hit Save on options you favor!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {savedTitles.map((t) => (
                <div 
                  key={t.id}
                  className="group relative rounded-lg border border-brand-border bg-brand-surface p-5 hover:border-brand-primary/40 transition flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4"
                >
                  <div className="space-y-2 flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-mono font-bold bg-[#1C2842] border border-brand-border text-brand-primary rounded px-2 py-0.5 tracking-wider uppercase">
                        {t.triggerType}
                      </span>
                      <span className="text-[10px] font-mono font-black text-brand-success">
                        {t.ctrUplift}
                      </span>
                      <span className="text-[9px] font-mono text-[#7B8FA8]">
                        {t.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#F4F1EA] tracking-wide leading-tight pt-0.5 font-display text-base">
                      {t.optimizedTitle}
                    </h4>

                    <p className="text-[11px] text-[#7B8FA8] leading-relaxed max-w-2xl font-sans">
                      {t.explanation}
                    </p>

                    <p className="text-[9px] font-mono text-[#4D5C73] pt-1">
                      Original Concept: "{t.originalTitle}"
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center md:flex-col gap-2.5 self-end md:self-center font-mono text-[10px]">
                    {/* Score badge */}
                    <span className={`font-mono text-xs font-bold rounded-md px-2.5 py-1 border shrink-0 ${getScoreColor(t.score)}`}>
                      {t.score}/100 Score
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Copy code button */}
                      <button
                        onClick={() => handleCopyText(t.optimizedTitle, t.id)}
                        className="flex items-center space-x-1.5 rounded-lg border border-brand-border bg-brand-bg px-3.5 py-1.5 font-bold text-[#7B8FA8] hover:text-[#F4F1EA] hover:border-brand-primary transition"
                      >
                        {copiedId === t.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-brand-success" />
                            <span className="text-brand-success">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteTitle(t.id)}
                        disabled={isDeletingTitle === t.id}
                        className="p-1.5 rounded-lg border border-brand-border bg-brand-bg hover:bg-brand-danger/10 text-[#7B8FA8] hover:text-brand-danger transition shrink-0"
                      >
                        {isDeletingTitle === t.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
