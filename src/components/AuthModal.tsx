/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (token: string, user: User) => void;
}

export default function AuthModal({ onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required credentials.');
      return;
    }

    if (isSignUp && !name) {
      setError('Please provide a user name.');
      return;
    }

    setLoading(true);
    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const body = isSignUp ? { name, email, password } : { email, password };

    try {
      console.log(`[Auth API Debug] Sending POST request to ${endpoint}`);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      console.log(`[Auth API Debug] Response from ${endpoint} | Status: ${res.status} | Content-Type: ${contentType}`);

      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error(`[Auth API Debug Error] Failed to parse JSON from ${endpoint}. Body:`, text);
          throw new Error('Authentication process encountered an internal server issue parsing JSON.');
        }
      } else {
        console.error(`[Auth API Debug Error] Non-JSON response received from ${endpoint}. Body Preview:`, text.slice(0, 1000));
        if (!res.ok) {
          throw new Error('Authentication process encountered an internal server error.');
        } else {
          throw new Error('Server returned an unexpected response format.');
        }
      }

      if (!res.ok) {
        throw new Error(data.error || 'Authentication process encountered an issue.');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      console.error('[Auth API Exception]:', err);
      setError(err.message || 'Network connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-all"
        id="auth-modal-vessel"
      >
        {/* Absolute Background Orbs */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display text-lg font-bold text-white">
              {isSignUp ? 'Create SaaS Account' : 'Welcome to ThumbScore'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            id="auth-modal-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 rounded-lg bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-400" id="auth-error-banner">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Display Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input 
                  type="text"
                  placeholder="e.g. Creator John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                  required={isSignUp}
                  id="auth-input-name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input 
                type="email"
                placeholder="creator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                required
                id="auth-input-email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                required
                id="auth-input-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-98 transition disabled:opacity-50"
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-1.5">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Synchronizing Account...</span>
              </span>
            ) : (
              <span>{isSignUp ? 'Get Instant Premium Access' : 'Enter Private Dashboard'}</span>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-slate-500">
            {isSignUp ? 'Already have an advisor account?' : "Don't have an advisor account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-400 hover:underline hover:text-indigo-300 font-medium"
              id="auth-switch-mode"
            >
              {isSignUp ? 'Log in here' : 'Sign up for free'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
