/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ThumbnailAnalysis {
  id: string;
  userId: string | null; // Can be anonymous
  title: string;
  imageUrl: string; // Dynamic base64 or file path
  overallScore: number;
  ctrPrediction: string; // e.g., "7.5% - High Potential"
  
  // Specific scores (0 - 100)
  curiosity: number;
  emotionalImpact: number;
  readability: number;
  mobileVisibility: number;
  colorContrast: number;
  subjectFocus: number;
  textEffectiveness: number;
  branding: number;
  audienceMatch: number;

  // Key feedback lists
  strengths: string[];
  weaknesses: string[];
  improvements: string[]; // prioritized five improvements

  // Creative optimizations
  suggestedTitle: string;
  suggestedHook: string;
  detailedExplanation?: string;

  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface ViralTopic {
  id: string;
  title: string;
  hook: string;
  reason: string;
  viralityScore: number;
  competition: 'Low' | 'Medium' | 'High';
  searchIntent: string;
  audienceType: string;
  suggestedThumbnail: string;
  uploadTime: string;
  videoLength: string;
  followUps: string[];
  originalityScore: number;
  evergreenScore: number;
  whyViewersClick: string;
  whyCreatorsMake: string;
  publishingFormat: string;
}

export interface SavedTopic {
  id: string;
  userId: string | null;
  topic: ViralTopic;
  createdAt: string;
}
