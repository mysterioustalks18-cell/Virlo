/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared HTTP helpers for Vercel serverless functions.
 *
 * The #1 symptom reported ("API server returned an error page",
 * "Unexpected token", JSON.parse failures on the client) happens whenever a
 * request reaches something that returns HTML instead of JSON — e.g. a
 * platform-level 404/500 page, or an uncaught exception that Vercel renders
 * as its own error page rather than your code's response.
 *
 * `withJsonHandler` guarantees that no matter what throws inside a handler,
 * the client always receives a JSON body with a real HTTP status code.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

/** Wraps a handler so any thrown/rejected error becomes a clean JSON 500 instead of an HTML error page. */
export function withJsonHandler(handler: Handler): Handler {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (err: any) {
      console.error('[Unhandled API Error]', err);
      if (!res.headersSent) {
        res.status(500).json({
          error: err?.message || 'An unexpected server error occurred.',
        });
      }
    }
  };
}

/** Rejects any method not in `allowed`, responding with JSON 405 + an Allow header. */
export function requireMethod(req: VercelRequest, res: VercelResponse, allowed: string[]): boolean {
  if (!req.method || !allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    res.status(405).json({ error: `Method ${req.method} not allowed on this endpoint.` });
    return false;
  }
  return true;
}

/** Extracts and validates the Bearer token from the Authorization header, returning null if absent/malformed. */
export function getBearerToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
