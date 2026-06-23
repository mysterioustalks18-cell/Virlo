/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Gemini client helpers — ported as-is from the original server.ts.
 * The model name, prompt construction, and schema definitions are
 * intentionally unchanged; only how the request reaches this code differs
 * (native Vercel function instead of Express route).
 */

import { GoogleGenAI } from '@google/genai';
import type { VercelRequest } from '@vercel/node';

const apiKey = process.env.GEMINI_API_KEY;

export const systemAi: GoogleGenAI | null = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'WARNING: GEMINI_API_KEY environment variable is not set. Thumbnail ' +
      'evaluations will utilize seed fallback simulation.'
  );
}

/**
 * Resolves which Gemini client to use for a given request: a client-supplied
 * key (via the X-Gemini-Api-Key header, or a Bearer token that looks like a
 * Gemini key) takes priority, falling back to the server's GEMINI_API_KEY.
 */
export function getGoogleAI(req: VercelRequest): GoogleGenAI | null {
  const customKey = req.headers['x-gemini-api-key'];
  const authHeader = req.headers['authorization'];

  if (customKey && typeof customKey === 'string' && customKey.trim().length > 5) {
    return new GoogleGenAI({
      apiKey: customKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  if (authHeader && typeof authHeader === 'string') {
    let keyToUse = authHeader.trim();
    if (keyToUse.startsWith('Bearer ')) {
      keyToUse = keyToUse.substring(7).trim();
    }
    if (keyToUse.startsWith('AIzaSy') || keyToUse.startsWith('AQ.')) {
      return new GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  return systemAi;
}

/**
 * Executes a Gemini task with the resolved client, automatically retrying
 * once against the server's environment-variable key if a client-supplied
 * key fails (and the two keys are actually different).
 */
export async function runWithGeminiFallback<T>(
  req: VercelRequest,
  task: (client: GoogleGenAI) => Promise<T>
): Promise<T> {
  const customAi = getGoogleAI(req);
  const customKey = req.headers['x-gemini-api-key'];
  const hasCustomKey = !!(customKey && typeof customKey === 'string' && customKey.trim().length > 5);

  if (!customAi) {
    throw new Error('No active Gemini API key or simulator fallback configured.');
  }

  try {
    console.log('[Gemini SDK] Executing request task with primary API Client.');
    return await task(customAi);
  } catch (err: any) {
    console.error('[Gemini SDK] Primary call failed:', err.message || err);

    if (hasCustomKey && systemAi && customAi !== systemAi) {
      console.warn('[Gemini SDK] Retrying task immediately with server environmental API Key fallback...');
      try {
        return await task(systemAi);
      } catch (fallbackErr: any) {
        console.error('[Gemini SDK] Fallback environment key also failed:', fallbackErr.message || fallbackErr);
        throw new Error(
          `Both primary key and system fallback keys failed. Primary: ${err.message || err}. Fallback: ${fallbackErr.message || fallbackErr}`
        );
      }
    }
    throw err;
  }
}

/** Parses JSON text from a Gemini response, stripping markdown code fences if present. */
export function parseCleanJSON(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();
  }
  return JSON.parse(cleaned);
}
