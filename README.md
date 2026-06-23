<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Virlo — YouTube Thumbnail Analyzer & Content Intelligence Suite

Three AI-powered tools for YouTube creators, all backed by Gemini:

- **Thumbnail Analyzer** — upload or link a thumbnail, get a scored CTR breakdown with strengths/weaknesses/improvements.
- **Viral Topic Finder** — generate 20 high-potential video concepts for a niche/query.
- **Title Optimizer** — score a raw title and generate 20 optimized alternatives across 5 psychological trigger categories.

## Architecture

This app is a **Vite + React** frontend paired with **native Vercel Serverless Functions** (no Express). Every route under `/api/*` is a standalone function file in `api/`:

```
api/
  _lib/
    store.ts                  # Redis-backed persistence (Upstash), in-memory fallback
    password.ts               # scrypt password hashing
    gemini.ts                 # Gemini client + fallback-key resolution
    fallback-generators.ts    # deterministic simulators used when Gemini is unavailable
  auth/
    me.ts  register.ts  login.ts
  thumbnail/
    analyze.ts  history.ts  delete/[id].ts
  topics/
    generate.ts  save.ts  saved.ts  saved/[id].ts
  titles/
    optimize.ts  save.ts  saved.ts  saved/[id].ts
```

Each function returns JSON only, with proper HTTP status codes — never an HTML error page — even on validation failures, auth failures, or unhandled exceptions (see `withJsonHandler` in `api/_lib/http.ts`).

## Persistence

Vercel's filesystem is read-only outside `/tmp`, and `/tmp` isn't shared across invocations — so this app cannot use a local JSON file as a database (the original local-dev version did, via Express + `fs`). Instead, `api/_lib/store.ts` talks to **Upstash Redis** (the standard Vercel Marketplace KV store; `@vercel/kv` itself is deprecated).

If no Redis credentials are present, the app still runs — it falls back to an in-memory store scoped to a single function instance. This is fine for local testing and demos, but **data will not persist** across deploys or cold starts. You'll see a console warning when this happens.

To get real persistence:

```bash
vercel install
# choose a Redis provider (e.g. Upstash) from the Marketplace prompt
```

This provisions the database and automatically injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` into your project's environment variables — no code changes needed.

## Run locally

**Prerequisites:** Node.js 18+, the [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`, or just use `npx vercel`).

```bash
npm install
cp .env.example .env.local   # fill in GEMINI_API_KEY at minimum
npm run dev                  # runs `vercel dev` — serves the SPA AND /api/* together
```

`vercel dev` is required (not `vite dev` alone) because it's what actually executes the `api/*.ts` files as serverless functions locally, matching production behavior.

The first time you run it, the CLI will ask you to link the directory to a Vercel project — say yes, this is required for `vercel dev` to know which environment variables to load.

Without `GEMINI_API_KEY` set, all three AI features automatically fall back to a built-in deterministic simulator, so the app is fully clickable end-to-end even with zero API keys configured.

## Deploy to Vercel

```bash
vercel        # preview deployment
vercel --prod # production deployment
```

Or connect the repo in the Vercel dashboard and let it auto-deploy on push — Vercel will detect the Vite frontend and the `api/` functions automatically; no special build settings are required beyond what's already in `vercel.json`.

### Environment variables to set in the Vercel dashboard

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Recommended | Server-side Gemini calls. Without it, all AI features use the built-in simulator. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) | Recommended | Persistent storage for users, history, and saved items. Without it, data resets on every cold start. |

See `.env.example` for the full annotated list.

## Security notes

- Passwords are hashed with `scrypt` + per-user salt (`api/_lib/password.ts`), not stored in plaintext.
- `GEMINI_API_KEY` is read server-side only inside `api/` functions — it is never bundled into the client.
- If you ever commit a real API key to a file that gets shared or uploaded anywhere, treat it as compromised and rotate it immediately, even if you remove it afterward.
