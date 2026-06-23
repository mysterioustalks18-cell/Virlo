/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link2, AlertCircle, Sparkles } from 'lucide-react';

interface DragDropUploadProps {
  onAnalyze: (payload: { base64Data?: string; imageUrl?: string; mimeType?: string; title: string }) => void;
  isLoading: boolean;
}

export default function DragDropUpload({ onAnalyze, isLoading }: DragDropUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError('');
    
    // Validate file size (max 8MB for seamless Base64 transport)
    if (file.size > 8 * 1024 * 1024) {
      setError('Please select an image smaller than 8MB.');
      return;
    }

    // Validate MIME types
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Extract raw base64 data and mimeType
        const commaIndex = result.indexOf(',');
        const base64Data = result.substring(commaIndex + 1);
        onAnalyze({
          base64Data,
          mimeType: file.type,
          title: videoTitle.trim() || file.name.substring(0, file.name.lastIndexOf('.')) || 'Uploaded Thumbnail'
        });
      }
    };
    reader.onerror = () => {
      setError('Could not read the uploaded file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const url = imageUrlInput.trim();
    if (!url) {
      setError('Please provide a valid image webpage link.');
      return;
    }

    // Basic URL pattern check
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Image URL must start with http:// or https://');
      return;
    }

    onAnalyze({
      imageUrl: url,
      title: videoTitle.trim() || 'Remote Thumbnail Link'
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Title block */}
      <div className="mb-8 text-center" id="upload-intro-block">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F4F1EA]">
          Survive the Scroll with{' '}
          <span className="text-brand-primary">
            Optics Analysis
          </span>
        </h2>
        <p className="mt-2 text-xs text-[#7B8FA8] max-w-lg mx-auto font-sans leading-relaxed">
          Measure contrast layers, focal clarity, text legibility, and emotional read at scroll dimensions.
        </p>
      </div>

      <div className="space-y-6 rounded-lg border border-brand-border bg-brand-surface p-6">
        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-brand-danger/10 border border-brand-danger/25 p-3 text-xs text-brand-danger" id="upload-error-indicator">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Video Title Context */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold font-mono text-[#7B8FA8] uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="h-3 w-3 text-brand-primary animate-pulse" />
            <span>Title Context (Highly recommended for deep vision metrics)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Why Nobody Explained Planet Nine Correctly..."
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-brand-border bg-brand-bg py-2.5 px-3.5 text-xs text-[#F4F1EA] placeholder-[#4D5C73] focus:border-brand-primary focus:outline-none transition disabled:opacity-50 font-sans"
            id="upload-video-title-input"
          />
        </div>

        {/* Drag & Drop Canvas */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition cursor-pointer ${
            isDragActive
              ? 'border-brand-primary bg-brand-card'
              : 'border-brand-border hover:border-brand-primary hover:bg-[#111B2E]/30'
          } ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}
          id="upload-drag-zone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isLoading}
          />
          
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-bg text-[#7B8FA8] border border-brand-border group-hover:text-brand-primary group-hover:scale-105 transition duration-150">
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </div>
          
          <div className="mt-4 space-y-1">
            <p className="text-sm font-semibold text-[#F4F1EA]">
              {isLoading ? 'Decrypting Visual Vectors...' : 'Drag your thumbnail file here'}
            </p>
            <p className="text-xs text-[#7B8FA8] font-mono uppercase tracking-wider text-[10px]">
              Supports PNG, JPG, WEBP, or AVIF (Up to 8MB)
            </p>
          </div>
          
          <button
            type="button"
            disabled={isLoading}
            className="mt-4 rounded-lg border border-brand-border bg-brand-bg px-3.5 py-1.5 text-xs font-bold text-[#7B8FA8] hover:text-[#F4F1EA] hover:border-brand-primary transition font-mono uppercase tracking-wider text-[10px]"
          >
            Choose Image File
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-brand-border"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-[#4D5C73] uppercase tracking-wider font-mono">or paste webpage link</span>
          <div className="flex-grow border-t border-brand-border"></div>
        </div>

        {/* URL Link Input */}
        <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-2" id="upload-url-form">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#4D5C73]">
              <Link2 className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-brand-border bg-brand-bg py-2.5 pl-10 pr-4 text-xs text-[#F4F1EA] placeholder-[#4D5C73] focus:border-brand-primary focus:outline-none transition disabled:opacity-50 font-sans"
              id="upload-url-input-field"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !imageUrlInput}
            className="rounded-lg bg-brand-primary hover:opacity-90 px-5 py-2.5 text-xs font-bold text-brand-bg active:scale-98 transition disabled:opacity-40 shrink-0"
            id="upload-url-btn"
          >
            {isLoading ? 'Scanning...' : 'Analyze URL'}
          </button>
        </form>
      </div>
    </div>
  );
}
