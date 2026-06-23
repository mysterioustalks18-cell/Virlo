/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, User, Key, Shield, Sliders, Bell, Globe, 
  HelpCircle, Trash2, Check, Sparkles, RefreshCw, AlertCircle,
  Eye, EyeOff
} from 'lucide-react';

interface SettingsViewProps {
  user: any;
  onOpenAuth: () => void;
}

export default function SettingsView({ user, onOpenAuth }: SettingsViewProps) {
  const [toneFilter, setToneFilter] = useState<'hype' | 'academic' | 'hybrid'>('hybrid');
  const [targetAudience, setTargetAudience] = useState<'broad' | 'niche'>('broad');
  const [safeZoneSimulation, setSafeZoneSimulation] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  
  // Custom client-side Gemini API key config state
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });
  const [showKey, setShowKey] = useState(false);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Securely persist API key to local storage
    localStorage.setItem('custom_gemini_api_key', customApiKey.trim());
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedNotification(true);
      setTimeout(() => {
        setShowSavedNotification(false);
        // Force fully reload page context so all components pull the new active key instantly
        window.location.reload();
      }, 1000);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="border-b border-brand-border pb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <Settings className="h-6.5 w-6.5 text-brand-primary animate-spin-slow" />
          <span>Workspace <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Settings</span></span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
          Manage your personal creator presets, neural prompt tone filters, Safe-Zone parameters, and general subscription configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Links list */}
        <div className="md:col-span-4 rounded-xl border border-brand-border bg-brand-surface p-3 space-y-1">
          <button className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-slate-800/60 border-l-2 border-brand-primary flex items-center space-x-2.5">
            <Sliders className="h-4 w-4 text-brand-primary" />
            <span>Tone Filters & Bias</span>
          </button>
          <button className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-2.5">
            <User className="h-4 w-4" />
            <span>Account Profile</span>
          </button>
          <button className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-2.5">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </button>
          <button className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-2.5">
            <Globe className="h-4 w-4" />
            <span>Connected Channels</span>
          </button>
        </div>

        {/* Right Details form */}
        <div className="md:col-span-8 rounded-xl border border-brand-border bg-brand-surface p-6 space-y-6">
          <form onSubmit={handleSaveConfigs} className="space-y-6">
            
            {/* Custom client-side Gemini API Key Config */}
            <div className="bg-brand-bg/50 border border-brand-border/80 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Key className="h-4 w-4 text-brand-primary animate-pulse" />
                    <span>Gemini API Integration</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">
                    To power advanced multimodal image analysis, viral topics indexing, and title copywriting optimizations, provide your custom Gemini API key here.
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider shrink-0 ${
                  customApiKey.trim().startsWith('AIzaSy') || customApiKey.trim().startsWith('AQ.')
                    ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {customApiKey.trim().startsWith('AIzaSy') || customApiKey.trim().startsWith('AQ.') ? 'CUSTOM KEY ACTIVE' : 'SEED SIMULATOR FALLBACK'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  Personal Gemini API Key (AIzaSy / AQ...)
                </label>
                <div className="relative rounded-xl border border-brand-border bg-brand-bg focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-mono text-xs">
                    KEY
                  </span>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="Enter your AIzaSy... or AQ... API key"
                    className="w-full bg-transparent pl-12 pr-10 py-3 text-xs text-[#F4F1EA] placeholder-slate-600 focus:outline-none focus:ring-0 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex items-start space-x-1.5 text-[10px] text-slate-500 leading-normal">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>Stored safely in your local browser storage. Used directly to authorize your requests. Click "Register Presets" below to lock and refresh values.</span>
                </div>
              </div>
            </div>

            {/* Tone Filter selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                Neural Copywriting Tone Filter
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setToneFilter('hype')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                    toneFilter === 'hype'
                      ? 'border-brand-primary bg-brand-primary/10 text-white'
                      : 'border-brand-border bg-brand-bg/40 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold">Hype Filter</span>
                  <span className="text-[9px] font-medium leading-normal opacity-80">High virality index</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToneFilter('academic')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                    toneFilter === 'academic'
                      ? 'border-brand-primary bg-brand-primary/10 text-white'
                      : 'border-brand-border bg-brand-bg/40 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold">Intellectual</span>
                  <span className="text-[9px] font-medium leading-normal opacity-80">Professional SEO focus</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToneFilter('hybrid')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                    toneFilter === 'hybrid'
                      ? 'border-brand-primary bg-brand-primary/10 text-white'
                      : 'border-brand-border bg-brand-bg/40 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold">Hybrid Vibe</span>
                  <span className="text-[9px] font-medium leading-normal opacity-80">Apple & Linear style</span>
                </button>
              </div>
            </div>

            {/* Target Audience selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                Primary Target Audience Appeal
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3.5 py-3 text-xs text-slate-350 focus:border-brand-primary focus:outline-none transition"
              >
                <option value="broad">Broad Appeal (Recommended tabs, front page discovery loops)</option>
                <option value="niche">Advanced Niche (High intent, search list & keyword lookup loops)</option>
              </select>
            </div>

            {/* Simulated options toggles */}
            <div className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                Thumbnail parameters
              </span>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[rgba(255,255,255,0.03)] bg-brand-bg/60">
                <div className="space-y-0.5 max-w-sm">
                  <p className="text-xs font-bold text-white">Automate YouTube Overlay Safes</p>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Exposures on edges which collide with YouTube duration time stamps. Set under Report Simulation canvas.
                  </p>
                </div>

                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    checked={safeZoneSimulation}
                    onChange={(e) => setSafeZoneSimulation(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-brand-border bg-brand-bg text-brand-primary focus:ring-brand-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Submit save button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <div className="flex-1">
                {showSavedNotification && (
                  <div className="flex items-center space-x-2 text-[#22C55E] text-xs font-bold animate-fade-in">
                    <Check className="h-4 w-4" />
                    <span>PRESETS REGISTERED SUCCESSFULLY</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center space-x-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-extrabold text-white px-5 py-3 transition active:scale-95 shrink-0"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Register Presets</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
