/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Trash2, Calendar, Award, Star, ArrowUpRight, PlayCircle } from 'lucide-react';
import { ThumbnailAnalysis } from '../types';

interface HistoryGalleryProps {
  reports: ThumbnailAnalysis[];
  onSelectReport: (report: ThumbnailAnalysis) => void;
  onDeleteReport: (id: string, e: React.MouseEvent) => void;
  isLoadingHistory: boolean;
}

export default function HistoryGallery({
  reports,
  onSelectReport,
  onDeleteReport,
  isLoadingHistory
}: HistoryGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'average' | 'critical'>('all');

  // Filter historical items
  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (scoreFilter === 'high') return matchesSearch && r.overallScore >= 85;
    if (scoreFilter === 'average') return matchesSearch && r.overallScore >= 70 && r.overallScore < 85;
    if (scoreFilter === 'critical') return matchesSearch && r.overallScore < 70;
    
    return matchesSearch;
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/10';
    return 'text-rose-450 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6" id="history-gallery-panel">
      {/* Selector Filters header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-100 uppercase tracking-wide flex items-center space-x-2">
            <Award className="h-5 w-5 text-indigo-400" />
            <span>Analysis Archives & Portfolio</span>
          </h3>
          <p className="text-xs text-slate-400">
            Search, filter, or re-evaluate past thumbnail click-through diagnostic reports.
          </p>
        </div>

        {/* Dynamic filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Text search */}
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-505">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search past scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition"
              id="gallery-search-input"
            />
          </div>

          {/* Rating filter dropdown */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as any)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none transition"
            id="gallery-score-filter"
          >
            <option value="all">Sectors: All Scores</option>
            <option value="high">Outstanding (85+)</option>
            <option value="average">Good (70-84)</option>
            <option value="critical">Underperforming (&lt;70)</option>
          </select>
        </div>
      </div>

      {isLoadingHistory ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          <p className="text-xs text-slate-550 font-mono">Syncing archive database...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-slate-850 bg-slate-900/5 py-12 px-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-850 text-slate-605">
            <Search className="h-5 w-5" />
          </div>
          <p className="text-slate-300 mt-4 text-sm font-semibold">No historical reports match criteria</p>
          <p className="text-slate-500 mt-1 text-xs">
            Try correcting your search input query or upload a new thumbnail to evaluate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="history-grid">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/10 hover:bg-slate-900/20 hover:border-slate-700 transition duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Floating score pill card */}
                <div className={`absolute top-3 left-3 flex items-center space-x-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${getScoreColor(report.overallScore)}`}>
                  <Star className="h-3 w-3 fill-current shrink-0" />
                  <span>{report.overallScore} SCORE</span>
                </div>

                {/* Cover play simulation icon */}
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-951/40 flex items-center justify-center transition">
                  <PlayCircle className="h-10 w-10 text-white/0 group-hover:text-white/80 scale-90 group-hover:scale-100 transition duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="flex flex-1 flex-col justify-between p-4.5 space-y-3">
                <div className="space-y-1">
                  <h4 className="font-display text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-white group-hover:underline transition">
                    {report.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic font-light">
                    "{report.suggestedTitle || 'Creative Title Suggestion'}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 pt-3">
                  <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-semibold uppercase font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Delete action */}
                    {!report.id.startsWith('seed-报告-') && (
                      <button
                        onClick={(e) => onDeleteReport(report.id, e)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                        title="Delete evaluation report"
                        id={`btn-del-report-${report.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div className="flex items-center space-x-1 text-slate-300 font-semibold text-xs group-hover:text-indigo-400 transition">
                      <span>Diagnostics</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
