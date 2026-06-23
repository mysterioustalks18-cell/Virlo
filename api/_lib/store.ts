/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Persistence layer.
 *
 * IMPORTANT — why this file exists:
 * The original server.ts persisted everything (users, reports, saved topics,
 * saved titles) to a JSON file on local disk (`data/db.json`) using
 * fs.readFileSync / fs.writeFileSync. That pattern cannot work on Vercel:
 *
 *   1. Vercel's serverless filesystem is read-only outside of /tmp.
 *   2. Each invocation may run in a brand-new container, so even /tmp is not
 *      guaranteed to persist between requests.
 *   3. Multiple concurrent invocations do not share memory or disk, so two
 *      requests hitting two different instances would each have their own
 *      "database" and silently diverge/overwrite each other.
 *
 * This module replaces local-disk JSON storage with Upstash Redis (the
 * Vercel-recommended Marketplace KV store; @vercel/kv itself is deprecated).
 * If no Redis credentials are configured, it falls back to an in-memory
 * store scoped to a single warm function instance — enough to demo the app
 * end-to-end, but data will NOT persist across deploys or cold starts.
 * A console warning is emitted once so this is never a silent surprise.
 *
 * To get real persistence in production:
 *   vercel install → choose a Redis provider (e.g. Upstash) from the
 *   Marketplace. This auto-injects KV_REST_API_URL / KV_REST_API_TOKEN
 *   (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) into your
 *   project's environment variables — no code changes needed.
 */

import { Redis } from '@upstash/redis';

export interface LocalUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  token: string;
  createdAt: string;
}

export interface ThumbnailReport {
  id: string;
  userId: string | null;
  title: string;
  imageUrl: string;
  overallScore: number;
  ctrPrediction: string;
  curiosity: number;
  emotionalImpact: number;
  readability: number;
  mobileVisibility: number;
  colorContrast: number;
  subjectFocus: number;
  textEffectiveness: number;
  branding: number;
  audienceMatch: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  suggestedTitle: string;
  suggestedHook: string;
  detailedExplanation?: string;
  createdAt: string;
}

export interface SavedTopicRecord {
  id: string;
  userId: string | null;
  topic: any;
  createdAt: string;
}

export interface SavedTitleRecord {
  id: string;
  userId: string | null;
  originalTitle: string;
  optimizedTitle: string;
  category: string;
  score: number;
  triggerType: string;
  ctrUplift: string;
  explanation: string;
  createdAt: string;
}

const SEED_REPORTS: ThumbnailReport[] = [
  {
    id: 'seed-report-1',
    userId: null,
    title: 'Tech Unboxing: Next-Gen Smartphone',
    imageUrl:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60',
    overallScore: 84,
    ctrPrediction: '8.4% - Excellent Potential',
    curiosity: 88,
    emotionalImpact: 76,
    readability: 92,
    mobileVisibility: 85,
    colorContrast: 90,
    subjectFocus: 95,
    textEffectiveness: 80,
    branding: 75,
    audienceMatch: 82,
    strengths: [
      'Razor-sharp focus on the primary smartphone product subject',
      'Exceptional contrast between the teal product glowing edges and the deep dark backdrop',
      'Clean text readability with balanced spacing and high accessibility',
    ],
    weaknesses: [
      'The tech brand logo in the upper corner could be covered by the YouTube timer on mobile',
      'Slightly lower emotional response; lacks human facial expressiveness',
    ],
    improvements: [
      'Relocate key logos/branding away from the bottom-right and top-right sections to avoid Youtube overlay conflicts.',
      'Add a highly expressive, high-contrast face reacting to the product on the left third of the canvas.',
      'Increase key typography size by 15% to guarantee impact on mobile displays.',
      'Inject a dramatic yellow drop shadow behind the main subject to create more depth.',
      'Modify the background hue to a warm contrasting complementary color for greater scroll-stopping grip.',
    ],
    suggestedTitle: 'I Tested the Phone of the Future (Wait...)',
    suggestedHook: 'This smartphone has one feature that changes everything.',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'seed-report-2',
    userId: null,
    title: 'Solo Travel: 24 Hours in Tokyo',
    imageUrl:
      'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=600&auto=format&fit=crop&q=60',
    overallScore: 91,
    ctrPrediction: '11.8% - Outstanding CTR Potential',
    curiosity: 94,
    emotionalImpact: 92,
    readability: 88,
    mobileVisibility: 90,
    colorContrast: 86,
    subjectFocus: 89,
    textEffectiveness: 95,
    branding: 80,
    audienceMatch: 95,
    strengths: [
      'Extremely compelling human face expressing deep excitement & adventure',
      'Vivid color palette matching Tokyo neon aesthetics (magenta/cyan theme)',
      'Powerful, short keyword text setup ("TOKYO SOLO") that hooks wanderlust audiences immediately',
    ],
    weaknesses: [
      'Neon details in the back are beautiful but slightly clutter background readability',
      'Text border is slightly thin; could get lost in low-brightness devices',
    ],
    improvements: [
      'Add a dark translucent gradient vignette/gradient shield behind the text container to maximize legibility.',
      'Scale down the text width key slightly to increase structural margins around Tokyo street scenes.',
      'Inject a subtle high-contrast outline on the human subject to cleanly segregate them from the neon streets.',
      'Enhance saturation of the sky/street lights to maximize organic search list dominance.',
      'Consider utilizing a secondary title format testing curiosity hooks over raw descriptions.',
    ],
    suggestedTitle: 'I Spent 24 Hours Alone in Tokyo’s Secret Ward!',
    suggestedHook: 'You should never visit Tokyo without knowing this one rule...',
    createdAt: new Date(Date.now() - 4 * 3605 * 1000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Backend selection
// ---------------------------------------------------------------------------

function getRedisUrl(): string | undefined {
  return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
}

function getRedisToken(): string | undefined {
  return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
}

const redisUrl = getRedisUrl();
const redisToken = getRedisToken();

export const hasRedis = Boolean(redisUrl && redisToken);

let redis: Redis | null = null;
if (hasRedis) {
  redis = new Redis({ url: redisUrl!, token: redisToken! });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[store] No Redis credentials found (KV_REST_API_URL/KV_REST_API_TOKEN or ' +
      'UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN). Falling back to an ' +
      'in-memory store for this invocation only. Data will NOT persist across ' +
      'deployments or cold starts. Install a Redis integration from the Vercel ' +
      'Marketplace to enable real persistence.'
  );
}

// In-memory fallback (best-effort only, scoped to a single warm lambda).
const memory = {
  users: [] as LocalUser[],
  reports: [...SEED_REPORTS] as ThumbnailReport[],
  savedTopics: [] as SavedTopicRecord[],
  savedTitles: [] as SavedTitleRecord[],
  seeded: true,
};

const KEYS = {
  users: 'virlo:users',
  reports: 'virlo:reports',
  savedTopics: 'virlo:savedTopics',
  savedTitles: 'virlo:savedTitles',
  seeded: 'virlo:seeded',
};

async function redisGetList<T>(key: string): Promise<T[]> {
  const data = await redis!.get<T[]>(key);
  return data || [];
}

async function ensureSeeded(): Promise<void> {
  if (!redis) return;
  const seeded = await redis.get<boolean>(KEYS.seeded);
  if (!seeded) {
    const existing = await redisGetList<ThumbnailReport>(KEYS.reports);
    if (existing.length === 0) {
      await redis.set(KEYS.reports, SEED_REPORTS);
    }
    await redis.set(KEYS.seeded, true);
  }
}

// ---------------------------------------------------------------------------
// Public API — every function is async so callers work identically
// regardless of which backend is active.
// ---------------------------------------------------------------------------

export async function getUsers(): Promise<LocalUser[]> {
  if (redis) return redisGetList<LocalUser>(KEYS.users);
  return memory.users;
}

export async function saveUsers(users: LocalUser[]): Promise<void> {
  if (redis) {
    await redis.set(KEYS.users, users);
    return;
  }
  memory.users = users;
}

export async function getReports(): Promise<ThumbnailReport[]> {
  if (redis) {
    await ensureSeeded();
    return redisGetList<ThumbnailReport>(KEYS.reports);
  }
  return memory.reports;
}

export async function saveReports(reports: ThumbnailReport[]): Promise<void> {
  if (redis) {
    await redis.set(KEYS.reports, reports);
    return;
  }
  memory.reports = reports;
}

export async function getSavedTopics(): Promise<SavedTopicRecord[]> {
  if (redis) return redisGetList<SavedTopicRecord>(KEYS.savedTopics);
  return memory.savedTopics;
}

export async function saveSavedTopics(items: SavedTopicRecord[]): Promise<void> {
  if (redis) {
    await redis.set(KEYS.savedTopics, items);
    return;
  }
  memory.savedTopics = items;
}

export async function getSavedTitles(): Promise<SavedTitleRecord[]> {
  if (redis) return redisGetList<SavedTitleRecord>(KEYS.savedTitles);
  return memory.savedTitles;
}

export async function saveSavedTitles(items: SavedTitleRecord[]): Promise<void> {
  if (redis) {
    await redis.set(KEYS.savedTitles, items);
    return;
  }
  memory.savedTitles = items;
}

export async function findUserByToken(token: string): Promise<LocalUser | null> {
  const users = await getUsers();
  return users.find((u) => u.token === token) || null;
}
