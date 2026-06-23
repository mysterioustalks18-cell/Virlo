/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Key, Trophy, Copy, Check, Bookmark, 
  RefreshCw, Trash2, ShieldAlert, AlertCircle, HelpCircle,
  Lightbulb, HelpCircle as HelpIcon, ArrowRight, Zap, Target
} from 'lucide-react';

interface TitleSuggestion {
  id: string;
  title: string;
  score: number;
  triggerType: string;
  ctrUplift: string;
  explanation: string;
}

interface TitleAnalysisResult {
  score: number;
  ctrPrediction: string;
  emotionalScore: number;
  clarityScore: number;
  seoScore: number;
  analysis: string;
  suggestions: TitleSuggestion[];
}

interface TitleOptimizerProps {
  token: string | null;
  onShowAuth: () => void;
  onSaveTitle: (titleObj: any) => Promise<void>;
  isSavedTitleChecked: (optTitle: string) => boolean;
}

export default function TitleOptimizer({
  token,
  onShowAuth,
  onSaveTitle,
  isSavedTitleChecked
}: TitleOptimizerProps) {
  const [rawTitle, setRawTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Educational');
  const [activeTriggerFilter, setActiveTriggerFilter] = useState('All');
  
  // Results structures
  const [result, setResult] = useState<TitleAnalysisResult | null>(null);
  
  // UI States
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIdList, setSavedIdList] = useState<Record<string, boolean>>({});

  const presetTemplates = [
    'How to build a SaaS application with artificial intelligence step by step',
    'Solo travel trip to Tokyo Japan on a really cheap budget which shocked me',
    'I tried eating only organic raw foods for 30 days and this happened to my body',
    'Why traditional physical keyboards are completely dead in 2026'
  ];

  const handleOptimize = async (e?: React.FormEvent, customValue?: string) => {
    if (e) e.preventDefault();
    const queryTitle = customValue || rawTitle;
    if (!queryTitle.trim()) {
      setErrorText('Please enter a raw title concept first.');
      return;
    }

    setErrorText('');
    setIsOptimizing(true);
    setResult(null);

    try {
      const customKey = localStorage.getItem('custom_gemini_api_key') || '';
      console.log(`[TitleOptimizer API Debug] Sending POST request to /api/titles/optimize`);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (customKey) {
        headers['X-Gemini-API-Key'] = customKey;
      }

      const res = await fetch('/api/titles/optimize', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: queryTitle.trim(),
          category: selectedCategory
        })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      console.log(`[TitleOptimizer API Debug] Response from /api/titles/optimize | Status: ${res.status} | Content-Type: ${contentType}`);

      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error('[TitleOptimizer API Error] Failed to parse JSON:', text);
          throw new Error('Title optimizer analysis failed: corrupted JSON returned.');
        }
      } else {
        console.error('[TitleOptimizer API Error] Non-JSON payload received. Body Preview:', text.slice(0, 1000));
        if (!res.ok) {
          throw new Error('Title optimizer analysis encountered an internal server error.');
        } else {
          throw new Error('Server returned an unexpected response format.');
        }
      }

      if (!res.ok) {
        throw new Error(data.error || 'Title optimizer analysis failed.');
      }

      setResult(data);
    } catch (err: any) {
      setErrorText(err.message || 'Connecting to copywriting metrics server failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const executeCopy = (title: string, id: string) => {
    navigator.clipboard.writeText(title);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerSave = async (suggestion: TitleSuggestion) => {
    try {
      setErrorText('');
      await onSaveTitle({
        originalTitle: rawTitle || 'Concept raw title',
        optimizedTitle: suggestion.title,
        category: selectedCategory,
        score: suggestion.score,
        triggerType: suggestion.triggerType,
        ctrUplift: suggestion.ctrUplift,
        explanation: suggestion.explanation
      });
      setSavedIdList(prev => ({
        ...prev,
        [suggestion.title]: true
      }));
    } catch (err: any) {
      setErrorText(err.message || 'Saved title sync failed.');
    }
  };

  const getMeterColor = (score: number) => {
    if (score >= 85) return 'bg-[#22C55E]';
    if (score >= 70) return 'bg-brand-primary';
    if (score >= 55) return 'bg-brand-warning';
    return 'bg-brand-danger';
  };

  const getMeterText = (score: number) => {
    if (score >= 85) return 'text-[#22C55E]';
    if (score >= 70) return 'text-brand-primary';
    if (score >= 55) return 'text-brand-warning';
    return 'text-brand-danger';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* 1. Header description */}
      <div className="border-b border-brand-border pb-6">
        <div className="inline-flex items-center space-x-2 rounded-md bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-brand-primary mb-2 font-mono">
          <Zap className="h-3 w-3 text-brand-primary" strokeWidth={3} />
          <span>SEO COPYWRITING ENGINE active</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F1EA] tracking-tight">
          Transmission <span className="text-brand-primary">Optimizer</span>
        </h2>
        <p className="text-xs text-[#7B8FA8] mt-1 max-w-2xl leading-relaxed font-sans">
          Inject heavy cognitive triggers into raw titles. Evaluate click metrics instantly and generate high CTR alternate copies structured for recommendations feeds.
        </p>
      </div>

      {/* 2. Main interactive submit panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input deck box */}
        <div className="lg:col-span-5 rounded-lg border border-brand-border bg-brand-surface p-6 space-y-6">
          <form onSubmit={handleOptimize} className="space-y-5">
            
            {/* Enter Raw Concept Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono">
                Your Concept Title
              </label>
              <div className="relative">
                <textarea
                  value={rawTitle}
                  onChange={(e) => setRawTitle(e.target.value)}
                  placeholder="e.g. My video of Solo Travelling Tokyo on a Super Cheap Budget..."
                  rows={3}
                  maxLength={150}
                  disabled={isOptimizing}
                  className="w-full rounded-lg border border-brand-border bg-brand-bg py-3 px-3.5 text-xs text-[#F4F1EA] placeholder-[#4D5C73] focus:border-brand-primary focus:outline-none transition resize-none leading-relaxed font-sans"
                />
                
                {/* Character Counter */}
                <span className="absolute bottom-3 right-3 font-mono text-[9px] text-[#4D5C73] font-semibold select-none">
                  {rawTitle.length}/150
                </span>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono">
                Content Focus Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3.5 py-2.5 text-xs text-[#F4F1EA] focus:border-brand-primary focus:outline-none transition font-sans"
              >
                <option value="Educational">🎓 Educational / Tutorial</option>
                <option value="Entertainment">🍿 Entertainment / Hype</option>
                <option value="Review & Tech">💻 Review & Product Tech</option>
                <option value="Business & Wealth">📈 Finance & Business Growth</option>
                <option value="Vlog & Travel">✈️ Vlog & Cinematic Narrative</option>
              </select>
            </div>

            {/* Trigger Button */}
            <button
              type="submit"
              disabled={isOptimizing || !rawTitle.trim()}
              className="w-full flex items-center justify-center space-x-2.5 rounded-lg bg-brand-primary p-3.5 text-xs font-bold text-brand-bg hover:opacity-95 transition active:scale-95 disabled:opacity-40 disabled:scale-100 uppercase tracking-wider font-mono"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-brand-bg" />
                  <span>DECRYPTING PSYCHOLOGIC LABELS...</span>
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 text-brand-bg" />
                  <span>OPTIMIZE THIS TITLE</span>
                </>
              )}
            </button>
          </form>

             {/* Quick presets helper */}
          <div className="space-y-2.5 pt-4 border-t border-brand-border">
            <span className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest font-mono">OR LOAD A DEMO CONCEPT</span>
            
            <div className="space-y-2">
              {presetTemplates.slice(0, 3).map((pres, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRawTitle(pres);
                    handleOptimize(undefined, pres);
                  }}
                  className="w-full text-left p-3 rounded-lg bg-brand-bg/45 hover:bg-brand-bg border border-brand-border hover:border-brand-primary text-[11px] text-[#7B8FA8] hover:text-[#F4F1EA] truncate transition-all font-medium font-sans"
                >
                  "{pres}"
                </button>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {errorText && (
            <div className="flex items-start space-x-2.5 rounded-lg bg-brand-danger/10 border border-brand-danger/25 p-3.5 text-xs text-brand-danger">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

        </div>

        {/* Right Outputs section */}
        <div className="lg:col-span-7 space-y-6">
          
          {isOptimizing ? (
            <div className="rounded-lg border border-brand-border bg-brand-surface p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg border border-brand-border text-brand-primary">
                <RefreshCw className="h-5 w-5 animate-spin text-brand-primary" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-semibold text-[#F4F1EA] font-display">Mining Intent Loops</h4>
                <p className="text-xs text-[#7B8FA8] leading-relaxed font-sans">
                  The artificial model is analyzing your variables, parsing competitor weaknesses, and drafting high CTR copies...
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Score Readout Card */}
              <div className="rounded-lg border border-brand-border bg-brand-surface p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border pb-4.5 gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#7B8FA8] uppercase tracking-widest">EVALUATION METRICS</span>
                    <h3 className="text-base font-bold text-[#F4F1EA] font-display pt-0.5 truncate">"{rawTitle}"</h3>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className={`text-xl font-black font-mono tracking-tighter ${getMeterText(result.score)}`}>
                      {result.score}/100
                    </span>
                    <p className="text-[9px] font-mono font-semibold text-[#7B8FA8] uppercase tracking-wider">{result.ctrPrediction}</p>
                  </div>
                </div>

                {/* Submetrics meters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Emotional Impact */}
                  <div className="p-3.5 rounded-lg border border-brand-border bg-brand-bg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7B8FA8] font-bold font-mono text-[9px] uppercase tracking-wider">Emotional Hook</span>
                      <span className="font-semibold text-[#F4F1EA] font-mono">{result.emotionalScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden mt-2">
                      <div className={`h-full rounded-full ${getMeterColor(result.emotionalScore)}`} style={{ width: `${result.emotionalScore}%` }} />
                    </div>
                  </div>
                  {/* Clarity */}
                  <div className="p-3.5 rounded-lg border border-brand-border bg-brand-bg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7B8FA8] font-bold font-mono text-[9px] uppercase tracking-wider">Formatting Clarity</span>
                      <span className="font-semibold text-[#F4F1EA] font-mono">{result.clarityScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden mt-2">
                      <div className={`h-full rounded-full ${getMeterColor(result.clarityScore)}`} style={{ width: `${result.clarityScore}%` }} />
                    </div>
                  </div>
                  {/* SEO value */}
                  <div className="p-3.5 rounded-lg border border-brand-border bg-brand-bg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7B8FA8] font-bold font-mono text-[9px] uppercase tracking-wider">SEO Keywords</span>
                      <span className="font-semibold text-[#F4F1EA] font-mono">{result.seoScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden mt-2">
                      <div className={`h-full rounded-full ${getMeterColor(result.seoScore)}`} style={{ width: `${result.seoScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Score Critique */}
                <div className="p-4 rounded-lg border border-brand-border bg-brand-surface text-xs text-[#7B8FA8] leading-relaxed font-sans">
                  <span className="font-bold text-brand-primary uppercase font-mono tracking-wider block text-[10px] mb-1">PSYCHOLOGICAL FEEDBACK REPORT</span>
                  {result.analysis}
                </div>

                {/* Low Confidence Warning block */}
                {result.lowConfidence && (
                  <div className="flex items-start space-x-3 rounded-lg bg-brand-warning/10 border border-brand-warning/35 px-4 py-3 text-xs text-brand-warning font-sans">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-widest text-[9px] font-mono text-brand-warning">Topical Confidence Indicator: Low</p>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{result.confidenceWarning || 'Input has too few descriptors. Strategic copywriting optimization relies heavily on contextual keywords.'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Spotlight Best Chosen Title Card */}
              {result.bestTitle && (
                <div className="rounded-lg border-2 border-brand-primary bg-gradient-to-br from-brand-primary/10 via-brand-surface to-brand-surface p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 gap-3">
                    <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest flex items-center space-x-1.5">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>OFFICIAL EXPERT SELECTION - Strategic Masterpiece</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-brand-primary text-brand-bg rounded-md px-2.5 py-0.5 uppercase tracking-wider">
                      {result.bestTitle.triggerType}
                    </span>
                  </div>
                  
                  <div className="space-y-2 font-sans">
                    <h3 className="text-lg font-bold text-[#F4F1EA] tracking-wide font-display text-base leading-snug">
                      {result.bestTitle.title}
                    </h3>
                    <div className="p-3.5 rounded-lg border border-brand-primary/10 bg-brand-bg/50 text-[11px] text-[#7B8FA8] leading-relaxed">
                      <span className="font-bold text-brand-primary block uppercase font-mono text-[9px] tracking-wider mb-1">Strategic Consulting Insights</span>
                      {result.bestTitle.strategicExplanation}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3.5 pt-1 font-mono text-[10px]">
                    <button
                      onClick={() => executeCopy(result.bestTitle.title, 'spotlight-copy')}
                      className="flex items-center space-x-1.5 rounded-lg border border-brand-border bg-brand-bg px-3.5 py-1.5 text-xs font-bold font-mono text-[#7B8FA8] hover:text-[#F4F1EA] hover:border-brand-primary transition"
                    >
                      {copiedId === 'spotlight-copy' ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-brand-success" />
                          <span className="text-brand-success">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Masterpiece</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleTriggerSave({
                        id: 'spotlight-save',
                        title: result.bestTitle.title,
                        score: 98,
                        triggerType: result.bestTitle.triggerType,
                        ctrUplift: '+5.2% Potential',
                        explanation: 'Ultimate hand-selected strategic copywriting blueprint variant.'
                      })}
                      disabled={isSavedTitleChecked(result.bestTitle.title) || !!savedIdList[result.bestTitle.title]}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold border font-mono text-xs transition ${
                        isSavedTitleChecked(result.bestTitle.title) || !!savedIdList[result.bestTitle.title]
                          ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                          : 'bg-brand-primary border-brand-primary text-brand-bg hover:opacity-90'
                      }`}
                    >
                      {isSavedTitleChecked(result.bestTitle.title) || !!savedIdList[result.bestTitle.title] ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-3.5 w-3.5" />
                          <span>Save Masterpiece</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Optimizations alternatives */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border pb-3 gap-3">
                  <span className="text-[10px] font-bold text-[#7B8FA8] uppercase tracking-widest block font-mono">
                    COGNITIVE TRIGGER CLASSIFICATION
                  </span>
                  
                  {/* Active filters display */}
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    {activeTriggerFilter === 'All' ? 'Showing all 20 formulas' : `Showing trigger: ${activeTriggerFilter}`}
                  </span>
                </div>

                {/* Filter Trigger Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 rounded-lg border border-brand-border bg-brand-bg/50">
                  {['All', 'Curiosity Gap', 'High Stakes', 'Value Promise', 'Contrarian / Threat', 'Ultra-Short Focus'].map((triggerType) => (
                    <button
                      key={triggerType}
                      type="button"
                      onClick={() => setActiveTriggerFilter(triggerType)}
                      className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase font-mono tracking-wider transition ${
                        activeTriggerFilter === triggerType
                          ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-bold'
                          : 'text-[#7B8FA8] hover:text-[#F4F1EA] hover:bg-brand-bg/30'
                      }`}
                    >
                      {triggerType}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 font-sans">
                  {result.suggestions
                    .filter(s => activeTriggerFilter === 'All' || s.triggerType === activeTriggerFilter)
                    .map((s) => {
                      const isSaved = isSavedTitleChecked(s.title) || !!savedIdList[s.title];
                      return (
                        <div 
                          key={s.id}
                          className="group relative rounded-lg border border-brand-border bg-brand-surface p-5 hover:border-brand-primary/40 transition flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4"
                        >
                          <div className="space-y-1.5 flex-1 pr-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] font-mono font-bold bg-[#1C2842] border border-brand-border text-brand-primary rounded-md px-2 py-0.5 tracking-wider uppercase">
                                {s.triggerType}
                              </span>
                              <span className="text-[10px] font-mono font-black text-brand-success">
                                {s.ctrUplift}
                              </span>
                            </div>
                            
                            <h4 className="text-sm font-bold text-[#F4F1EA] tracking-wide leading-tight pt-0.5 font-display text-base">
                              {s.title}
                            </h4>
                            
                            <p className="text-[11px] text-[#7B8FA8] leading-relaxed max-w-xl font-sans">
                              {s.explanation}
                            </p>
                          </div>

                          {/* Copy / Preserve Action triggers */}
                          <div className="shrink-0 flex items-center md:flex-col gap-2 self-end md:self-center font-mono text-[10px]">
                            
                            {/* Copy code button */}
                            <button
                              onClick={() => executeCopy(s.title, s.id)}
                              type="button"
                              className="flex items-center space-x-1.5 rounded-lg border border-brand-border bg-brand-bg px-3.5 py-1.5 font-bold text-[#7B8FA8] hover:text-[#F4F1EA] hover:border-brand-primary transition"
                            >
                              {copiedId === s.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-brand-success" />
                                  <span className="text-brand-success">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Copy Headline</span>
                                </>
                              )}
                            </button>

                            {/* Favorite preserve button */}
                            <button
                              onClick={() => handleTriggerSave(s)}
                              type="button"
                              disabled={isSaved}
                              className={`flex items-center justify-center space-x-1 px-3.5 py-1.5 rounded-lg font-bold border transition w-full ${
                                isSaved
                                  ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                                  : 'bg-brand-primary border-brand-primary text-brand-bg hover:opacity-90'
                              }`}
                            >
                              {isSaved ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Saved</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="h-3.5 w-3.5" />
                                  <span>Save Title</span>
                                </>
                              )}
                            </button>

                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-lg border border-brand-border bg-brand-surface/10 py-20 px-4 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface border border-brand-border text-brand-primary">
                <Target className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[#F4F1EA] text-sm font-[#7B8FA8] font-display uppercase tracking-wider">No Optimization Run Yet</h4>
                <p className="text-[#7B8FA8] max-w-sm mx-auto text-xs leading-relaxed font-sans">
                  Enter your raw keyword idea on the left and trigger optimization inside the copy engine.
                </p>
              </div>
              <button
                onClick={() => {
                  setRawTitle('How to start coding and make a full stack website in 24 hours');
                  handleOptimize(undefined, 'How to start coding and make a full stack website in 24 hours');
                }}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-brand-primary/25 bg-brand-primary/15 hover:bg-brand-primary/25 text-xs font-bold text-brand-primary px-4 py-2 transition font-mono uppercase tracking-wider text-[10px]"
              >
                <span>Try Demo Query</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
