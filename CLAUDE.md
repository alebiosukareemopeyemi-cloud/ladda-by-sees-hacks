# CLAUDE.md — Ladda

Read `LADDA_BUILD_SPEC.md` before writing code. It is the source of truth; this file is the standing rules.

## What this is

Ladda maps a student's skill gap against a target role, builds a roadmap cited to the real public career trajectories of people already in that job, coaches them through it, and issues a cryptographically signed credential an employer can verify. Three-day hackathon build, team of three.

## Stack — do not substitute

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · shadcn/ui (rethemed) · Framer Motion · Supabase (Postgres + Auth) · Prisma · Vercel AI SDK + Anthropic · @noble/ed25519

If a task seems to need a library that isn't here, say so and wait — don't add one.

## Non-negotiables

1. **`lib/contracts.ts` is frozen.** Every shared type lives there. Never redefine a type locally, never widen one to `any` to make an error go away. If a contract is genuinely wrong, stop and say so.
2. **No free-text parsing of model output.** Anything that reaches the database comes from a tool call with a strict schema (spec §7). No regex over prose, no `JSON.parse` on a raw completion.
3. **Every roadmap step cites `trajectoryIds`, and the array is never empty.** Validate ids against the seeded corpus server-side; drop steps citing unknown ids and log it.
4. **System prompts live in `lib/ai/prompts/*.md`**, imported as files. Never inline a prompt string in a `.ts` file.
5. **Secrets come from env.** Never hardcode a model id, an API key, or the issuer private key. The model is `process.env.ANTHROPIC_MODEL`.
6. **`/api/verify/[credentialId]` and `/verify/[credentialId]` are public.** No auth guard, ever — an employer must not need an account.
7. **Colors come from tokens only.** No literal hex outside `app/globals.css`. `growth` = progress, `verified` = credentials, `gap` = warnings only.
8. **Every animation respects `useReducedMotion()`** and has a correct static resting state. Nothing is parked at `opacity: 0` waiting on an observer.

## Lane boundaries

Three people are working in parallel. Stay inside the lane the prompt names.

| Lane | Owns |
|---|---|
| AI (Kareem) | `lib/ai/**`, `app/api/intake/**`, `app/api/roadmap/generate/**` |
| Backend (Divine) | `prisma/**`, `lib/db.ts`, `lib/credential/**`, all other `app/api/**` |
| Frontend (Bello) | `app/globals.css`, `components/**`, all `page.tsx` files |

`lib/contracts.ts` and `lib/fixtures/**` are shared — changing either requires saying so explicitly in your response so the other two know.

## Conventions

- Server components by default; `"use client"` only where interaction or motion requires it.
- Route handlers return `{ ok: true, data }` or `{ ok: false, error: { code, message } }`. Streaming routes return an AI SDK stream.
- Errors are typed and user-readable. No `catch {}` that swallows.
- `tabular-nums` on every number that sits in a column or counts.
- Radius scale: `6px` controls, `12px` cards, `999px` pills. Elevation only on interactive surfaces.
- Empty states name the next action. Never ship `"No data"`.

## Working style

- Small, verifiable steps. After each one, say what changed and what to check.
- When the spec and a request conflict, follow the spec and flag the conflict.
- Don't refactor code outside the current task, even if it's tempting.
- Don't add features that aren't in the golden path (spec §12) unless asked. Spec §14 lists what is deliberately out of scope — if a request drifts into that list, say so before building.

## Golden path — the definition of done

Landing → one-tap demo login → intake chat (skills populate live) → pick target role → gap score + roadmap spine → open a step, see cited trajectories → complete an assessment, skill flips to Verified → issue credential → scan QR → public verify page shows a valid signature.

A stranger must be able to run all of it on a phone without help.
