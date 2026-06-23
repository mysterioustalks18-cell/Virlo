/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, AlertCircle, Copy, Check, Eye, 
  Smartphone, Monitor, Tablet, ArrowLeft, Key, Sparkles, BookOpen, Share2 
} from 'lucide-react';
import { ThumbnailAnalysis } from '../types';
import MetricDial from './MetricDial';

interface ReportViewProps {
  report: ThumbnailAnalysis;
  onBack: () => void;
}

export default function ReportView({ report, onBack }: ReportViewProps) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const [activePreviewMode, setActivePreviewMode] = useState<'desktop' | 'sidebar' | 'mobile'>('desktop');
  const [checkedImprovements, setCheckedImprovements] = useState<Record<number, boolean>>({});

  const handleCopyText = (text: string, isTitle: boolean) => {
    navigator.clipboard.writeText(text);
    if (isTitle) {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedHook(true);
      setTimeout(() => setCopiedHook(false), 2000);
    }
  };

  const getPreviewClasses = () => {
    switch(activePreviewMode) {
      case 'mobile':
        return 'w-[280px] h-[158px] border-slate-700 max-w-full';
      case 'sidebar':
        return 'w-[168px] h-[95px] border-slate-700 max-w-full';
      default:
        return 'w-full max-w-[500px] aspect-video border-slate-700';
    }
  };

  const getPreviewContainerLabel = () => {
    switch(activePreviewMode) {
      case 'mobile':
        return 'YouTube Mobile Feed Size (1.8-inch Phone View)';
      case 'sidebar':
        return 'YouTube Sidebar Recommended Size (Right Menu View)';
      default:
        return 'YouTube Desktop Home / Search List View';
    }
  };

  const toggleCheckedImprovement = (index: number) => {
    setCheckedImprovements(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Helper for rendering submetric bar meters
  const renderSubRating = (label: string, value: number, desc: string) => {
    const getBarColor = (val: number) => {
      if (val >= 85) return 'bg-emerald-500';
      if (val >= 70) return 'bg-indigo-500';
      if (val >= 50) return 'bg-amber-500';
      return 'bg-rose-500';
    };

    const getTextColor = (val: number) => {
      if (val >= 85) return 'text-emerald-400';
      if (val >= 70) return 'text-indigo-400';
      if (val >= 50) return 'text-amber-400';
      return 'text-rose-450';
    };

    return (
      <div className="space-y-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/40 hover:border-slate-800 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">{label}</span>
          <span className={`font-mono text-xs font-bold ${getTextColor(value)}`}>{value}/100</span>
        </div>
        <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${getBarColor(value)}`}
            style={{ width: `${value}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1 first-letter:uppercase">{desc}</p>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="report-view-container">
      {/* Report Header Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850 pb-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition active:scale-95"
            id="report-back-btn"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-white sm:text-2xl truncate max-w-[280px] sm:max-w-[450px]">
              {report.title}
            </h1>
            <p className="font-mono text-[9px] text-indigo-400 uppercase tracking-widest mt-0.5">
              REPORT REF • {report.id}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-slate-500">Evaluated on:</span>
          <span className="font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            {new Date(report.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Hero Section: Score metric + Safe-zone simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Core Conversion Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/20 p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />
          
          <div className="relative">
            <h3 className="font-display text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Eye className="h-4 w-4 text-indigo-400" />
              <span>Conversion Score</span>
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated clickability rating based on our predictive multi-layer neural inspection.
            </p>
          </div>

          <div className="my-6">
            <MetricDial score={report.overallScore} size={150} title="Overall Potential" />
          </div>

          <div className="rounded-xl border border-indigo-500/15 bg-indigo-600/5 p-4 text-center mt-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              Estimated CTR Potential
            </span>
            <p className="font-display text-lg font-bold text-white mt-1 bg-gradient-to-r from-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              {report.ctrPrediction}
            </p>
          </div>
        </div>

        {/* Thumbnail Preview Safe-Zone Simulator */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/20 p-6 flex flex-col justify-between relative">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-indigo-400" />
                  <span>Viewport Safe-Zone Tester</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluate real-world scaling and verify if key elements are obscured by the time overlay.
                </p>
              </div>

              {/* Viewport controls */}
              <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-850 self-start space-x-1" id="safe-zone-controls">
                <button
                  onClick={() => setActivePreviewMode('desktop')}
                  className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    activePreviewMode === 'desktop'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="tab-desktop"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setActivePreviewMode('mobile')}
                  className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    activePreviewMode === 'mobile'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="tab-mobile"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mobile Feed</span>
                </button>
                <button
                  onClick={() => setActivePreviewMode('sidebar')}
                  className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    activePreviewMode === 'sidebar'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="tab-sidebar"
                >
                  <Tablet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sidebar List</span>
                </button>
              </div>
            </div>
            
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
              {getPreviewContainerLabel()}
            </p>
          </div>

          {/* Interactive simulator preview vessel */}
          <div className="bg-slate-950 rounded-xl border border-slate-850 p-8 flex items-center justify-center min-h-[220px]">
            <div className={`relative overflow-hidden rounded-lg shadow-2xl border transition-all duration-300 ${getPreviewClasses()}`} id="simulator-canvas">
              {/* Image source */}
              <img 
                src={report.imageUrl} 
                alt="Thumbnail evaluate" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Simulated video duration tag (crucial Safe-Zone overlap validator) */}
              <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white font-mono font-bold px-1.5 py-0.5 rounded text-[10px] tracking-tight selection:bg-transparent">
                12:45
              </span>

              {/* Subtle hover overlay play badge */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition selection:bg-transparent">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg">
                  <Monitor className="h-5 w-5 fill-white pl-0.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start space-x-2 text-xs text-slate-500">
            <AlertCircle className="h-4 w-4 text-amber-500/80 shrink-0 mt-0.5" />
            <span>
              <strong>Attention Safe-Zones:</strong> Ensure you do not position essential keywords, text banners, or small logos on the <strong>bottom-right</strong> margins as the duration timer will render them unreadable on search feeds.
            </span>
          </div>
        </div>
      </div>

      {/* Creative Director's Executive Audit Memo */}
      {report.detailedExplanation && (
        <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-950 p-6 space-y-4" id="executive-critique">
          <div className="flex items-center space-x-2.5 border-b border-indigo-500/10 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
            <span className="font-display text-sm font-extrabold text-white uppercase tracking-wider">
              CREATIVE DIRECTOR'S EXECUTIVE MEMORANDUM
            </span>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] text-indigo-300 font-mono font-bold uppercase tracking-widest">
              Subject: Strategic Composition, Emotional Hook, and Mobile Feasibility Audit
            </p>
            <p className="text-xs text-slate-300 sm:text-sm leading-relaxed whitespace-pre-line font-sans italic selection:bg-slate-800">
              "{report.detailedExplanation}"
            </p>
          </div>
        </section>
      )}

      {/* Metrics Grid */}
      <section className="space-y-4" id="report-ratings">
        <div className="border-l-2 border-indigo-500 pl-3">
          <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">Rating Matrix Breakdown</h2>
          <p className="text-xs text-slate-400">Detailed metric categorization scored by our specialized YouTube evaluation model.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderSubRating('Curiosity Pull', report.curiosity, 'Measures click-bait balance; ability to trigger emotional/cognitive open loops.')}
          {renderSubRating('Emotional Resonance', report.emotionalImpact, 'Faces, saturation intensity, and color-driven triggers representing organic focus.')}
          {renderSubRating('Typography Readability', report.readability, 'Text scale, outlines, font visibility, contrast layout matching dark feed backgrounds.')}
          {renderSubRating('Mobile Scale Optimization', report.mobileVisibility, 'Effectiveness of key entities when rendered down to standard cell formats.')}
          {renderSubRating('Color Contrast & Harmony', report.colorContrast, 'Backdrop pop-out against native web themes to guarantee scroll-stopping presence.')}
          {renderSubRating('Subject Focal Weight', report.subjectFocus, 'Isolation density of primary face or key object subjects; lacks visual noise.')}
          {renderSubRating('Text Layout Efficiency', report.textEffectiveness, 'Positioning safety from YouTube overlapping elements and timer zones.')}
          {renderSubRating('Branding Consistency', report.branding, 'Presence of unique identity colors, signature text strokes, avatar logos, etc.')}
          {renderSubRating('Viral vs Niche Fit', report.audienceMatch, 'Clarity of the core subject; whether it appeals to broader trends or a specific niche.')}
        </div>
      </section>

      {/* Side-by-Side Pros/Cons and Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Pros & Cons panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-l-2 border-indigo-500 pl-3">
            <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">Diagnostic Report</h2>
            <p className="text-xs text-slate-400">Actionable critique breakdown highlighting positive visual features and flaws.</p>
          </div>

          <div className="space-y-4">
            {/* Strengths card */}
            <div className="rounded-xl border border-emerald-500/10 bg-[#052e16]/5 p-5">
              <h4 className="flex items-center space-x-2 text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>3 Core Strengths</span>
              </h4>
              <ul className="space-y-3">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 mt-1.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses card */}
            <div className="rounded-xl border border-rose-500/10 bg-[#4c0519]/5 p-5">
              <h4 className="flex items-center space-x-2 text-sm font-bold text-rose-400 uppercase tracking-wider mb-3">
                <XCircle className="h-4.5 w-4.5 shrink-0" />
                <span>2 Focal Flaws</span>
              </h4>
              <ul className="space-y-3">
                {report.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400 mt-1.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Five prioritized optimizations checklist */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-l-2 border-indigo-500 pl-3">
            <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">Optimization Action Plan</h2>
            <p className="text-xs text-slate-400">Implement these 5 itemized recommendations to directly maximize click throughput.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/10 overflow-hidden separation-y divide-y divide-slate-850">
            {report.improvements.map((imp, idx) => (
              <div 
                key={idx} 
                onClick={() => toggleCheckedImprovement(idx)}
                className={`flex items-start space-x-3.5 p-4 transition-colors cursor-pointer select-none ${
                  checkedImprovements[idx] 
                    ? 'bg-slate-950/40 text-slate-500' 
                    : 'hover:bg-slate-900/30 text-slate-200'
                }`}
                id={`plan-item-${idx}`}
              >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  checkedImprovements[idx] 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                    : 'border-slate-700 bg-slate-950 text-transparent'
                }`}>
                  <CheckCircle2 className="h-3.5 w-3.5 fill-current" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      checkedImprovements[idx] 
                        ? 'bg-slate-900 text-slate-600' 
                        : 'bg-indigo-650/20 text-indigo-400'
                    }`}>
                      PRIORITY {idx + 1}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${checkedImprovements[idx] ? 'line-through text-slate-500' : ''}`}>
                    {imp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copywriting Creative optimization labs (Title & Hook) */}
      <section className="space-y-4" id="creative-lab">
        <div className="border-l-2 border-indigo-500 pl-3">
          <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">AI Hook & Title Forge</h2>
          <p className="text-xs text-slate-400">Companion text elements generated specifically to sync with and reinforce your thumbnail theme.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-xl border border-slate-800 bg-slate-900/30 p-5">
            <h4 className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Optimized Title Suggestion</span>
            </h4>
            <p className="font-display text-base font-bold text-indigo-200 pr-10">
              "{report.suggestedTitle}"
            </p>
            <button
              onClick={() => handleCopyText(report.suggestedTitle, true)}
              className="absolute top-4 right-4 rounded-lg bg-slate-950 hover:bg-slate-800 p-2 text-slate-400 hover:text-white transition"
              title="Copy Title"
              id="copy-title-btn"
            >
              {copiedTitle ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative rounded-xl border border-slate-800 bg-slate-900/30 p-5">
            <h4 className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <Key className="h-4 w-4 text-indigo-400" />
              <span>High-Retention Intro Hook Lines</span>
            </h4>
            <p className="text-xs text-slate-300 italic pr-10 leading-relaxed">
              "{report.suggestedHook}"
            </p>
            <button
              onClick={() => handleCopyText(report.suggestedHook, false)}
              className="absolute top-4 right-4 rounded-lg bg-slate-950 hover:bg-slate-800 p-2 text-slate-400 hover:text-white transition"
              title="Copy Hook"
              id="copy-hook-btn"
            >
              {copiedHook ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
