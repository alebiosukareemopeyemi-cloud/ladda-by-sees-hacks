# Ladda — Build Spec

Team Sees-Hacks · Tobams × Access Hackathon · AI Career & Workforce Innovations
Build window: 3 days · Team of 3

---

## 0. How to use this document

This is the single source of truth for the build. Drop it in the repo root next to `CLAUDE.md`.

When working with Claude Code, **never paste this whole file as a prompt.** Instead:

1. Commit `LADDA_BUILD_SPEC.md` and `CLAUDE.md` to the repo root.
2. Start each session with the phase prompt from §13 — each one references the spec sections it needs.
3. Claude Code reads `CLAUDE.md` automatically on every turn, so conventions stay enforced without you repeating them.

Rule for the whole build: **the contract comes first, the implementation second.** Section 5 (data model), §6 (API), and §7 (tool schemas) are frozen at the end of Day 0. All three lanes then build in parallel against fixtures without blocking each other. This is the single most important scheduling decision in a 3-day build.

---

## 1. Product in one paragraph

A student tells Ladda what they know in a short chat. Ladda maps that against a target role, then builds a roadmap from **precedent** — the real, public career trajectories of people already doing that job at established companies. Every step on the roadmap cites the trajectories it came from. The student works the roadmap with an always-on mentor that speaks their register, proves skills through practical assessments scored against a rubric, and walks away with a cryptographically signed credential an employer can verify in one click.

---

## 2. The flywheel — why this is one system, not three features

Everything reads and writes one object: the user's **skill graph**.

```
  intake chat ──writes──▶  ┌───────────────┐
                           │  SKILL GRAPH  │ ◀──reads── mentor chat
  assessment ──verifies──▶ │  (UserSkill)  │
                           └───────┬───────┘
                                   │ reads
                                   ▼
                          roadmap generation
                        (diff vs. RoleBlueprint,
                         cited to Trajectories)
                                   │
                                   ▼
                        verified skills only
                                   │
                                   ▼
                        signed credential ──▶ public verify page
```

Say this out loud in the pitch: *the mapper feeds the mentor, the mentor feeds the credential, the credential feeds the job.* The architecture is the pitch.

---

## 3. Stack — decisions and rejected alternatives

| Layer | Choice | Why | Rejected |
|---|---|---|---|
| App | **Next.js 15, App Router, TypeScript** | One repo, one deploy. Route handlers *are* the backend — no second service to deploy in 3 days. | Separate FastAPI service (costs half a day of CORS/deploy/env plumbing) |
| Hosting | **Vercel** | Already in use for the landing page. Preview URL per PR. | Render, Railway |
| Styling | **Tailwind CSS v4** + custom token layer | Fast, and v4's `@theme` keeps tokens in one place | Plain CSS modules (too slow at this pace) |
| Components | **shadcn/ui**, retheme aggressively | Accessible primitives free. **Must** be restyled — default shadcn is instantly recognizable to judges | MUI, Chakra (heavier, more opinionated) |
| Motion | **Framer Motion** (`motion/react`) | Shared-layout transitions and springs are the whole design concept | GSAP — use only if a scroll-driven moment demands it |
| DB + Auth | **Supabase** (Postgres + Auth) | Kills the auth day. Magic link + a demo account is enough. Postgres means real SQL for Divine | Neon + custom auth (auth eats a day you don't have) |
| ORM | **Prisma** | Schema file doubles as documentation; `prisma db seed` is the fixture loader | Drizzle (fine, but Prisma's seed story is faster here) |
| AI | **Claude API** via **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`) | Streaming UI for free; tool calling gives structured output | Raw fetch (you'd rebuild streaming by hand) |
| Similarity | **In-memory cosine over a seeded JSON corpus** | The trajectory corpus is ~50 records. A vector DB is over-engineering at this size | pgvector — note it as the scale story, don't build it |
| Crypto | **`@noble/ed25519`** | Real signatures, ~1 hour of work, demos beautifully | Blockchain anything (days of work, zero added trust for a demo) |
| QR | **`qrcode`** | Server-side to a data URI, no client dependency | — |

**Pin the model with an env var, not a literal.** Set `ANTHROPIC_MODEL` in `.env` and read it everywhere; check the current Sonnet-class model id at `docs.claude.com/en/docs/about-claude/models` before you start.

```
# .env.local
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LADDA_ISSUER_PRIVATE_KEY=   # ed25519, hex, generated once by scripts/gen-issuer-key.ts
NEXT_PUBLIC_LADDA_ISSUER_PUBLIC_KEY=
```

---

## 4. Repo layout

```
ladda/
├── CLAUDE.md                     # conventions — Claude Code reads this every turn
├── LADDA_BUILD_SPEC.md           # this file
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # loads everything in lib/fixtures
├── scripts/
│   └── gen-issuer-key.ts         # one-off ed25519 keypair generator
├── lib/
│   ├── contracts.ts              # ★ every shared type. Frozen Day 0.
│   ├── fixtures/
│   │   ├── roles.json
│   │   ├── skills.json
│   │   ├── trajectories.json     # ★ the Career Twin corpus — 40–60 records
│   │   ├── assessments.json
│   │   └── demo-users.json
│   ├── ai/
│   │   ├── client.ts             # anthropic client + model from env
│   │   ├── extractor.ts          # intake  → UserSkill[]
│   │   ├── cartographer.ts       # graph + trajectories → Roadmap
│   │   ├── mentor.ts             # streaming chat
│   │   ├── examiner.ts           # submission → rubric scores
│   │   └── prompts/*.md          # system prompts, versioned as files
│   ├── credential/
│   │   ├── canonical.ts          # deterministic JSON serialization
│   │   ├── sign.ts
│   │   └── verify.ts
│   └── db.ts
├── app/
│   ├── (marketing)/page.tsx      # landing + "Try as Amara"
│   ├── (app)/
│   │   ├── intake/page.tsx
│   │   ├── roadmap/page.tsx
│   │   ├── roadmap/[stepId]/page.tsx
│   │   ├── mentor/page.tsx
│   │   ├── assess/[taskId]/page.tsx
│   │   └── credentials/page.tsx
│   ├── verify/[credentialId]/page.tsx    # PUBLIC — no auth
│   ├── insights/page.tsx                 # regional impact map
│   └── api/
│       ├── intake/turn/route.ts
│       ├── roadmap/generate/route.ts
│       ├── roadmap/[id]/route.ts
│       ├── mentor/chat/route.ts
│       ├── assessment/[taskId]/submit/route.ts
│       ├── credentials/issue/route.ts
│       ├── verify/[credentialId]/route.ts
│       └── insights/regions/route.ts
├── components/
│   ├── ui/                       # shadcn primitives, rethemed
│   ├── roadmap/RoadmapSpine.tsx  # ★ the signature component
│   ├── roadmap/StepCard.tsx
│   ├── roadmap/WhyThisStep.tsx   # the explainability popover
│   ├── intake/ChatIntake.tsx
│   ├── intake/SkillRail.tsx      # skills populate live as you talk
│   ├── credential/BadgeCard.tsx
│   └── charts/GapScore.tsx
└── app/globals.css               # @theme tokens
```

`lib/contracts.ts` is the load-bearing file. Everyone imports from it. Nobody redefines a type locally.

---

## 5. Data model

```prisma
model User {
  id             String   @id @default(cuid())
  email          String?  @unique
  name           String
  state          String?          // Nigerian state — powers the impact map
  educationLevel String?
  targetRoleId   String?
  isDemo         Boolean  @default(false)
  createdAt      DateTime @default(now())
  skills         UserSkill[]
  roadmaps       Roadmap[]
  assessments    Assessment[]
  credentials    Credential[]
  messages       MentorMessage[]
  consent        ConsentRecord?
}

model Role {
  id          String  @id @default(cuid())
  slug        String  @unique       // "data-analyst"
  title       String
  sector      String
  demandIndex Int                    // 0–100, seeded, drives "in demand" badge
  roleSkills  RoleSkill[]
  trajectories Trajectory[]
}

model Skill {
  id       String @id @default(cuid())
  slug     String @unique
  name     String
  category String                     // TECHNICAL | TOOL | DOMAIN | HUMAN
}

model RoleSkill {
  roleId    String
  skillId   String
  weight    Int                       // 1–5, how central to the role
  proofType String                    // PROJECT | CERT | INTERNSHIP
  @@id([roleId, skillId])
}

model UserSkill {
  id         String   @id @default(cuid())
  userId     String
  skillId    String
  level      Int                      // 0–4
  source     String                   // SELF | ASSESSED
  confidence Float                    // 0–1, from the extractor
  quote      String?                  // ★ the learner's own words. Explainability.
  verifiedAt DateTime?
  @@unique([userId, skillId])
}

model Trajectory {
  id               String @id            // "traj_data_analyst_01" — stable, cited by the AI
  roleId           String
  currentTitle     String
  company          String
  publicProfileUrl String
  sourceNote       String                // "public LinkedIn profile, read 2026-09-03"
  steps            Json                  // TrajectoryStep[]
}

model Roadmap {
  id            String   @id @default(cuid())
  userId        String
  roleId        String
  gapScore      Int                      // 0–100
  gapRationale  String
  generatedAt   DateTime @default(now())
  steps         RoadmapStep[]
}

model RoadmapStep {
  id            String  @id @default(cuid())
  roadmapId     String
  order         Int
  kind          String                   // SKILL | CERT | INTERNSHIP | PROJECT | FOLLOW
  title         String
  provider      String?
  url           String?
  estWeeks      Int?
  why           String                   // one sentence, shown in the UI
  trajectoryIds String[]                 // ★ never empty. Enforced in code.
  status        String  @default("TODO") // TODO | DOING | DONE
}

model Assessment {
  id           String   @id @default(cuid())
  userId       String
  skillId      String
  taskId       String
  submission   String   @db.Text
  rubricScores Json                      // CriterionScore[]
  overall      Int
  passed       Boolean
  feedback     String   @db.Text
  createdAt    DateTime @default(now())
}

model Credential {
  id          String   @id @default(cuid())
  userId      String
  skillSlugs  String[]
  payload     Json                       // exactly what was signed
  signature   String                     // ed25519, hex
  issuedAt    DateTime @default(now())
  revokedAt   DateTime?
}

model MentorMessage {
  id        String   @id @default(cuid())
  userId    String
  role      String                       // user | assistant
  content   String   @db.Text
  createdAt DateTime @default(now())
}

model ConsentRecord {
  userId    String   @id
  scopes    String[]                     // PROFILE | ASSESSMENT | AGGREGATE_INSIGHTS
  grantedAt DateTime @default(now())
}
```

---

## 6. API contracts

All routes return `{ ok: true, data }` or `{ ok: false, error: { code, message } }`. Streaming routes return an AI SDK stream.

| Method | Route | Body → Response |
|---|---|---|
| POST | `/api/intake/turn` | `{ userId, messages }` → **stream** + `record_skills` tool result persisted server-side |
| POST | `/api/roadmap/generate` | `{ userId, roleSlug }` → `Roadmap` (with steps, each citing `trajectoryIds`) |
| GET | `/api/roadmap/[id]` | → `Roadmap` |
| PATCH | `/api/roadmap/[id]` | `{ stepId, status }` → `RoadmapStep` |
| POST | `/api/mentor/chat` | `{ userId, messages }` → **stream** |
| POST | `/api/assessment/[taskId]/submit` | `{ userId, submission }` → `Assessment` (and flips `UserSkill.source` to `ASSESSED`) |
| POST | `/api/credentials/issue` | `{ userId }` → `{ credentialId, qrDataUri }` — **only verified skills are eligible** |
| GET | `/api/verify/[credentialId]` | → `{ valid, payload, issuedAt, revokedAt }` — **public, no auth** |
| GET | `/api/insights/regions` | → `{ state, learners, topGaps[] }[]` — aggregate only, no PII |

---

## 7. The AI layer — four agents, one rule

**The rule: no free-text parsing anywhere.** Every agent that produces data uses a tool with a strict schema. If it isn't a tool call, it doesn't reach the database.

### 7.1 `extractor` — intake chat → skill graph

Asks one question at a time, extracts skills from what the learner actually said.

```ts
{
  name: "record_skills",
  description: "Record skills the learner has stated. Only record what they actually said — never infer a skill they did not mention.",
  input_schema: {
    type: "object",
    properties: {
      skills: {
        type: "array",
        items: {
          type: "object",
          properties: {
            slug:       { type: "string", description: "must exist in the provided skill catalogue" },
            level:      { type: "integer", minimum: 0, maximum: 4 },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            quote:      { type: "string", description: "the learner's own words supporting this" }
          },
          required: ["slug", "level", "confidence", "quote"]
        }
      },
      next_question:   { type: "string" },
      intake_complete: { type: "boolean" }
    },
    required: ["skills", "intake_complete"]
  }
}
```

`quote` is not decoration — it's what the UI shows when a learner asks "why do you think I know SQL?" Explainability costs one schema field.

### 7.2 `cartographer` — the flagship

Input: the user's skill graph, the target `Role`, its `RoleSkill[]`, and the top-N `Trajectory` records for that role. Output: a roadmap where **every step cites precedent**.

```ts
{
  name: "emit_roadmap",
  input_schema: {
    type: "object",
    properties: {
      gap_score:     { type: "integer", minimum: 0, maximum: 100 },
      gap_rationale: { type: "string" },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            order:          { type: "integer" },
            kind:           { type: "string", enum: ["SKILL","CERT","INTERNSHIP","PROJECT","FOLLOW"] },
            title:          { type: "string" },
            provider:       { type: "string" },
            url:            { type: "string" },
            est_weeks:      { type: "integer" },
            why:            { type: "string", description: "one sentence, addressed to the learner" },
            trajectory_ids: {
              type: "array",
              minItems: 1,
              items: { type: "string" },
              description: "ids of the trajectories that justify this step. Never invent an id."
            }
          },
          required: ["order","kind","title","why","trajectory_ids"]
        }
      }
    },
    required: ["gap_score","gap_rationale","steps"]
  }
}
```

**Validate `trajectory_ids` server-side against the seeded corpus and drop any step with an unknown id.** That one check is your hallucination guard, and it's three lines.

This is also where the explainability UI comes from for free: `WhyThisStep.tsx` renders *"4 of 6 people now doing this job took this step"* with the real profile links behind it.

### 7.3 `mentor` — streaming chat

System prompt carries: the skill graph, the active roadmap, the next incomplete step. Register: warm, direct, Nigerian English with natural Pidgin where it fits — **never a caricature**. It should sound like a smart senior colleague from Lagos, not a costume.

Hard rules in the system prompt: never invent a deadline or a scholarship; if it doesn't know, say so; always tie advice back to a step on the learner's actual roadmap.

### 7.4 `examiner` — rubric scoring

```ts
{
  name: "score_submission",
  input_schema: {
    type: "object",
    properties: {
      criteria: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name:           { type: "string" },
            score:          { type: "integer", minimum: 0, maximum: 4 },
            evidence_quote: { type: "string", description: "quoted from the submission" },
            improvement:    { type: "string" }
          },
          required: ["name","score","evidence_quote","improvement"]
        }
      },
      overall:  { type: "integer", minimum: 0, maximum: 100 },
      passed:   { type: "boolean" },
      feedback: { type: "string" }
    },
    required: ["criteria","overall","passed","feedback"]
  }
}
```

`evidence_quote` must come from the submission. If it doesn't appear in the text, reject the score and retry once — cheap guard, real integrity.

---

## 8. Credentials — real crypto, one hour

```ts
// lib/credential/canonical.ts — deterministic, sorted keys, no whitespace
export function canonicalize(payload: CredentialPayload): string

// payload shape
{
  v: 1,
  iss: "ladda.app",
  sub: userId,
  jti: credentialId,
  iat: 1756944000,
  skills: [{ slug: "sql", level: 3, assessedAt: "2026-09-05T..." }]
}

// sign:   ed25519.sign(sha256(canonicalize(payload)), LADDA_ISSUER_PRIVATE_KEY)
// verify: recompute hash, check signature against the public key
```

Publish the public key at `app/.well-known/ladda-issuer.json/route.ts`. The verify page is public, works on a phone, and shows: skills, issue date, and a green **Signature valid** state computed live.

Demo line: *"Change one character in this payload and the check goes red. That's the difference between a certificate and a credential."*

---

## 9. Design system

The look to aim for: a calm, confident product — think Linear's restraint with warmth added. Not a dashboard, not a bootcamp landing page.

**Concept: the climb.** One vertical motif runs through the product — the roadmap spine. It's the navigation, the progress indicator, and the hero visual. Every other screen defers to it.

### Tokens

```css
@theme {
  /* neutrals — sage-biased, never pure grey */
  --color-paper:        #F4F6F2;
  --color-surface:      #FFFFFF;
  --color-line:         #DFE4DB;
  --color-ink:          #101613;
  --color-ink-muted:    #5C6B62;

  /* semantic accents — two, with meaning */
  --color-growth:       #0F6E5C;   /* progress, roadmap, primary CTA */
  --color-growth-soft:  #DDEDE8;
  --color-verified:     #3B4CC0;   /* credentials, verification, trust */
  --color-verified-soft:#E2E5F7;
  --color-gap:          #A8730F;   /* gaps and warnings ONLY */
  --color-gap-soft:     #F6EBD4;
}

/* dark */
--color-paper: #0D1210;  --color-surface: #151C18;  --color-line: #253029;
--color-ink: #E7EDE8;    --color-ink-muted: #93A398;
--color-growth: #3FBFA3; --color-growth-soft: #14312A;
--color-verified: #8B9AF5; --color-verified-soft: #1B2140;
--color-gap: #DFA83C;    --color-gap-soft: #2E2410;
```

Two accents with fixed jobs — green means *growth*, indigo means *verified* — so color carries information instead of decoration. Amber appears only on a gap.

### Type

```
Display  Bricolage Grotesque  600  — headings, the gap score, step titles
Body     Instrument Sans      400/500
Data     JetBrains Mono       400  — labels, scores, credential ids, eyebrows
```

Scale: `12 · 14 · 16 · 20 · 26 · 34 · 46`. Body copy caps at 68ch. `font-variant-numeric: tabular-nums` on every score, count, and table column.

### Motion — the spec, not vibes

| Moment | Behavior |
|---|---|
| Page enter | fade + 8px rise, 320ms, `cubic-bezier(0.16, 1, 0.3, 1)` |
| List stagger | 40ms per child, capped at 6 children then instant |
| Roadmap spine | SVG `pathLength` 0→1 over 900ms on mount; nodes pop in at 60% |
| Step open | Framer `layoutId` shared element — card morphs into the detail panel. **This is the moment judges remember.** |
| Gap score | count-up 0→N over 800ms, easing out; jumps straight to N under `prefers-reduced-motion` |
| Skill rail | new skill chip springs in `{ stiffness: 380, damping: 32 }` as the AI extracts it mid-conversation |
| Streaming text | opacity fade per chunk, no artificial typewriter delay |
| Hover (cards) | `scale(1.008)` + shadow lift, 160ms |
| Verify success | single checkmark path-draw, 500ms, no confetti |

Wrap everything in `useReducedMotion()`. Every animation has a static resting state that is already correct — the page must be readable with JS disabled mid-load.

### Discipline rules

- Elevation only on interactive surfaces. Static blocks get a line, not a shadow.
- One radius scale: `6px` controls, `12px` cards, `999px` pills. No exceptions.
- Empty states are designed, not `"No data"`. Each one names the next action.
- Every async surface has three designed states: skeleton, content, error-with-a-retry.

---

## 10. Seed data — the Career Twin corpus

This is the highest-leverage two hours of the whole build, and it is **research, not code**. Do it Day 0 while the repo is being set up.

Target: **6 roles × 7–10 trajectories each = ~50 records.**

Suggested roles: `data-analyst`, `frontend-engineer`, `product-designer`, `digital-marketer`, `cloud-support-engineer`, `agritech-field-analyst`.

```json
{
  "id": "traj_data_analyst_01",
  "roleSlug": "data-analyst",
  "currentTitle": "Data Analyst",
  "company": "Flutterwave",
  "publicProfileUrl": "https://www.linkedin.com/in/…",
  "sourceNote": "public profile, read 2026-09-03",
  "steps": [
    { "order": 1, "kind": "SKILL",      "title": "SQL fundamentals",                   "evidence": "listed as top skill" },
    { "order": 2, "kind": "CERT",       "title": "Google Data Analytics Certificate",  "provider": "Coursera" },
    { "order": 3, "kind": "INTERNSHIP", "title": "Data intern",                        "company": "Andela" },
    { "order": 4, "kind": "PROJECT",    "title": "Public dashboard portfolio",         "evidence": "featured section" }
  ]
}
```

**Data ethics — read this, it is also a pitch point.** Use only publicly visible profile information. Record the profile URL and the observed steps, nothing more — no emails, no phone numbers, no scraping at volume. Attribute every trajectory in the UI with a link back. When a judge asks where the data comes from, the answer *"public profiles, cited and linked, ~50 hand-verified records, no bulk scraping"* is stronger than any scraper you could build in three days.

---

## 11. The 3-day plan

### Day 0 — 2 hours, all three in one room (or one call)

Nobody writes a feature until this is done.

- [ ] `create-next-app` + Tailwind + shadcn init, push to the existing repo
- [ ] Vercel project linked, env vars set, a "hello" deploy is green
- [ ] Supabase project, `prisma db push`
- [ ] **`lib/contracts.ts` written and frozen** (§5 types)
- [ ] `lib/fixtures/*.json` stubbed with at least 2 roles and 10 trajectories so lanes can start
- [ ] `scripts/gen-issuer-key.ts` run once, keys in env
- [ ] Kareem starts the trajectory research in the background — it runs all of Day 0

### Day 1 — parallel lanes, no cross-dependencies

**Kareem (AI)** — `lib/ai/*`
- `extractor` + `/api/intake/turn` streaming, persisting `UserSkill` with `quote`
- `cartographer` + `/api/roadmap/generate`, including the `trajectory_ids` validation guard
- Finish the trajectory corpus to 50 records

**Divine (Backend)** — `prisma/`, `app/api/*`
- Full schema + `seed.ts` loading every fixture
- Supabase auth: magic link + **`isDemo` accounts with one-tap sign-in**
- `GET/PATCH /api/roadmap/[id]`, skill-graph read/write helpers in `lib/db.ts`

**Bello (Frontend)** — `app/globals.css`, `components/`
- Token layer + type scale + shadcn retheme
- App shell, nav, the three async states as reusable components
- `ChatIntake` + `SkillRail` against fixtures
- First pass at `RoadmapSpine` (SVG path draw)

**End of day: each lane demos its own slice against fixtures.** No integration yet — that's deliberate.

### Day 2

**Kareem** — `mentor` streaming with graph context; `examiner` + rubric; wire explainability payloads into the roadmap response
**Divine** — assessment submit → persist → flip skill to `ASSESSED`; credential sign + `/api/verify/[credentialId]`; `/api/insights/regions` aggregate
**Bello** — `StepCard` → detail `layoutId` transition; `WhyThisStep` popover; `BadgeCard` + QR; `GapScore` count-up; the public verify page

**18:00 — Integration checkpoint (hard stop, all three).** Swap fixtures for live APIs. Run the golden path (§12) end to end once. Whatever breaks here is Day 3's first job, and nothing new gets started tonight.

### Day 3

**Morning** — polish: motion pass, empty states, mobile at 360px, consent screen. Build the three Tier-3 screens as **static, clearly-labeled mockups**: impact map, employer portal, streaks. Don't wire them.
**Midday** — seed demo accounts, deploy to production, **record the backup demo video**. Non-negotiable — a wifi failure on stage must not cost you the win.
**Afternoon** — rehearse the pitch three times against a clock. Write the README and submission text. Leave the last two hours empty as breakage buffer. Do not add features in this window.

---

## 12. The golden path — your 90-second demo, and your definition of done

Build toward this exact sequence. If a feature isn't on it, it's Tier 2 or Tier 3.

1. Landing page → **"Try as Amara"** (one tap, no signup)
2. Intake chat, 4 turns — skill chips spring into the rail live as she talks
3. Pick target role **Data Analyst** → gap score counts up to **62**, the spine draws itself
4. Open step 3 → the card morphs into detail → *"4 of 6 people now doing this job took this step"* with three real, clickable profiles
5. Complete the assessment task → the examiner scores it live against the rubric with quoted evidence → the skill flips to **Verified** (green → indigo)
6. Issue credential → QR appears → **a judge scans it on their own phone** → public verify page: signature valid ✓

Step 6 with a judge's own phone is the close. Rehearse it until it's boring.

**Definition of done for the whole build: a stranger can run steps 1–6 on a phone, on hotel wifi, without you touching the keyboard.**

---

## 13. Claude Code phase prompts

Paste these one at a time. Each assumes the repo, `CLAUDE.md`, and `LADDA_BUILD_SPEC.md` are committed.

**P0 — scaffold**
> Read LADDA_BUILD_SPEC.md §3–§5. Scaffold the Next.js 15 App Router + TypeScript + Tailwind v4 project exactly to the repo layout in §4. Write `lib/contracts.ts` with every type in §5 and `prisma/schema.prisma` to match. Create empty fixture files with correct shapes. Do not implement any route handlers or components yet. Stop and show me `contracts.ts` for approval before doing anything else.

**P1 — AI layer** *(Kareem)*
> Read §7 and §10. Implement `lib/ai/client.ts`, `extractor.ts` and `cartographer.ts` using the Vercel AI SDK with the Anthropic provider, model from `process.env.ANTHROPIC_MODEL`. Use the exact tool schemas in §7. Put system prompts in `lib/ai/prompts/*.md` and import them — do not inline prompt strings in TypeScript. In the cartographer, validate every returned `trajectory_id` against the seeded corpus and drop steps citing unknown ids, logging what was dropped. Then implement `/api/intake/turn` and `/api/roadmap/generate` per §6.

**P2 — data layer** *(Divine)*
> Read §5, §6 and §8. Write `prisma/seed.ts` loading every file in `lib/fixtures`. Implement Supabase auth with magic link plus one-tap demo sign-in for users where `isDemo` is true. Implement the roadmap GET/PATCH, assessment submit, and the credential issue + public verify routes. For credentials follow §8 exactly: canonical JSON with sorted keys, sha256, ed25519 via @noble/ed25519, public key served from `/.well-known/ladda-issuer.json`. The verify route must not require auth.

**P3 — design system** *(Bello)*
> Read §9. Set up the token layer in `app/globals.css` using Tailwind v4 `@theme` with the exact hex values given, including the dark variants. Wire the three fonts from Google Fonts. Retheme the shadcn primitives to these tokens — I do not want the default shadcn look. Build the app shell and the three reusable async states (skeleton, content, error-with-retry). Show me a single page using all of it before you build any feature screens.

**P4 — signature interactions** *(Bello)*
> Read §9 motion table. Build `RoadmapSpine`, `StepCard`, and the step detail view. The spine is an SVG whose path draws on mount over 900ms; nodes pop in at 60% of that. Opening a step must use a Framer Motion `layoutId` shared-element transition from card to detail panel. Add `WhyThisStep`, which renders the cited trajectories as "N of M people now doing this job took this step" with links. Everything must respect `useReducedMotion()` and have a correct static resting state.

**P5 — integration**
> Replace every fixture import in the client with live API calls per §6. Then run the golden path in §12 end to end and report exactly which of the six steps fail and why. Fix only what's broken on that path — do not refactor anything else.

**P6 — polish**
> Read §9 discipline rules and §12. Audit every screen at 360px width and in dark mode. Design every empty state so it names the next action. Add the NDPR consent screen per §5 `ConsentRecord`. Then build static, clearly-labeled mockups for the impact map, employer portal, and streaks screens — mark them "Preview" in the UI. Do not wire them to real data.

---

## 14. Scope discipline — what you are NOT building

Say these out loud as "next build" in the pitch. Do not open a branch for any of them.

- Live LinkedIn scraping (the corpus is hand-curated and cited — this is a feature, not a shortcut)
- WhatsApp Business integration
- Offline-first service worker caching
- Voice / Pidgin speech-to-text
- A real employer portal with its own auth
- pgvector or any vector database
- Blockchain credentialing

Every one of these is a *good* idea and a *bad* three-day decision. The team that ships six working steps beats the team that ships twenty broken ones.
