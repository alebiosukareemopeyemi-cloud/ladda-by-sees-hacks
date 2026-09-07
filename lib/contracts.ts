/**
 * lib/contracts.ts — ★ FROZEN Day 0.
 *
 * Every shared type in Ladda lives here. Nobody redefines a type locally,
 * nobody widens one to `any` to silence an error. If a contract is genuinely
 * wrong, stop and say so — do not edit it silently.
 *
 * Layout:
 *   1. Enumerations (string-literal unions that mirror the seeded string columns)
 *   2. JSON sub-shapes (the typed contents of Prisma `Json` columns)
 *   3. Entity types (one per model in LADDA_BUILD_SPEC.md §5)
 *   4. Transport types (the API envelope from §6, the AI tool payloads from §7)
 *
 * Entity types mirror `prisma/schema.prisma` field-for-field. `DateTime`
 * columns are represented as `string` (ISO-8601) because that is what crosses
 * the wire and comes back from `JSON.parse`; server code that holds a live
 * Prisma result can treat those fields as `Date` structurally.
 */

/* ------------------------------------------------------------------ */
/* 1. Enumerations                                                     */
/* ------------------------------------------------------------------ */

/** `Skill.category` */
export type SkillCategory = "TECHNICAL" | "TOOL" | "DOMAIN" | "HUMAN";

/** `RoleSkill.proofType` */
export type ProofType = "PROJECT" | "CERT" | "INTERNSHIP";

/** `UserSkill.source` */
export type SkillSource = "SELF" | "ASSESSED";

/** `RoadmapStep.kind` and `TrajectoryStep.kind` */
export type StepKind =
  | "SKILL"
  | "CERT"
  | "INTERNSHIP"
  | "PROJECT"
  | "FOLLOW";

/** `RoadmapStep.status` */
export type StepStatus = "TODO" | "DOING" | "DONE";

/** `MentorMessage.role` */
export type MentorRole = "user" | "assistant";

/** `ConsentRecord.scopes[]` */
export type ConsentScope = "PROFILE" | "ASSESSMENT" | "AGGREGATE_INSIGHTS";

/* ------------------------------------------------------------------ */
/* 2. JSON sub-shapes                                                  */
/* ------------------------------------------------------------------ */

/**
 * One observed move in a real person's public career history.
 * Stored as `Trajectory.steps: Json` — an array of these.
 */
export interface TrajectoryStep {
  order: number;
  kind: StepKind;
  title: string;
  /** course/cert provider, when the step is a CERT */
  provider?: string;
  /** employer, when the step is an INTERNSHIP or a role change */
  company?: string;
  /** where on the public profile this was observed ("listed as top skill") */
  evidence?: string;
}

/**
 * One rubric line from the examiner (§7.4).
 * Stored as `Assessment.rubricScores: Json` — an array of these.
 */
export interface CriterionScore {
  name: string;
  /** 0–4 */
  score: number;
  /** must be quoted verbatim from the submission */
  evidenceQuote: string;
  improvement: string;
}

/** One skill claim inside a signed credential (§8). */
export interface CredentialSkillClaim {
  slug: string;
  /** 0–4, the assessed level at issue time */
  level: number;
  /** ISO-8601 timestamp of the passing assessment */
  assessedAt: string;
}

/**
 * The exact object that gets canonicalized and signed (§8).
 * Stored verbatim as `Credential.payload: Json`.
 */
export interface CredentialPayload {
  /** schema version */
  v: 1;
  /** issuer, always "ladda.app" */
  iss: string;
  /** subject — the userId */
  sub: string;
  /** JWT-style id — the credentialId */
  jti: string;
  /** issued-at, unix seconds */
  iat: number;
  skills: CredentialSkillClaim[];
}

/* ------------------------------------------------------------------ */
/* 3. Entity types — one per model in §5                               */
/* ------------------------------------------------------------------ */

export interface User {
  id: string;
  email: string | null;
  name: string;
  /** Nigerian state — powers the impact map */
  state: string | null;
  educationLevel: string | null;
  targetRoleId: string | null;
  isDemo: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  /** e.g. "data-analyst" */
  slug: string;
  title: string;
  sector: string;
  /** 0–100, seeded, drives the "in demand" badge */
  demandIndex: number;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: SkillCategory;
}

export interface RoleSkill {
  roleId: string;
  skillId: string;
  /** 1–5, how central the skill is to the role */
  weight: number;
  proofType: ProofType;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  /** 0–4 */
  level: number;
  source: SkillSource;
  /** 0–1, from the extractor */
  confidence: number;
  /** ★ the learner's own words — explainability. Null once ASSESSED with no quote. */
  quote: string | null;
  verifiedAt: string | null;
}

export interface Trajectory {
  /** stable, human-authored id cited by the AI, e.g. "traj_data_analyst_01" */
  id: string;
  roleId: string;
  currentTitle: string;
  company: string;
  publicProfileUrl: string;
  /** provenance, e.g. "public LinkedIn profile, read 2026-09-03" */
  sourceNote: string;
  steps: TrajectoryStep[];
}

export interface Roadmap {
  id: string;
  userId: string;
  roleId: string;
  /** 0–100 */
  gapScore: number;
  gapRationale: string;
  generatedAt: string;
  steps: RoadmapStep[];
}

export interface RoadmapStep {
  id: string;
  roadmapId: string;
  order: number;
  kind: StepKind;
  title: string;
  provider: string | null;
  url: string | null;
  estWeeks: number | null;
  /** one sentence, shown in the UI, addressed to the learner */
  why: string;
  /** ★ ids of the trajectories that justify this step. Never empty — enforced in code. */
  trajectoryIds: string[];
  status: StepStatus;
}

export interface Assessment {
  id: string;
  userId: string;
  skillId: string;
  taskId: string;
  submission: string;
  rubricScores: CriterionScore[];
  /** 0–100 */
  overall: number;
  passed: boolean;
  feedback: string;
  createdAt: string;
}

export interface Credential {
  id: string;
  userId: string;
  skillSlugs: string[];
  /** exactly what was signed */
  payload: CredentialPayload;
  /** ed25519, hex */
  signature: string;
  issuedAt: string;
  revokedAt: string | null;
}

export interface MentorMessage {
  id: string;
  userId: string;
  role: MentorRole;
  content: string;
  createdAt: string;
}

export interface ConsentRecord {
  userId: string;
  scopes: ConsentScope[];
  grantedAt: string;
}

/* ------------------------------------------------------------------ */
/* 4. Transport types                                                  */
/* ------------------------------------------------------------------ */

/** Typed, user-readable error. Never a bare string, never a swallowed catch. */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * Every non-streaming route handler returns this shape (§6).
 * Streaming routes return an AI SDK stream instead.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

/* ---- AI tool-call payloads (§7) --------------------------------- */
/*
 * These mirror the frozen `input_schema` of each tool exactly, including
 * snake_case, because they are the raw shape the model emits. Route handlers
 * map them onto the camelCase entity types above before persisting. No code
 * anywhere parses free text into these — they only ever come from a tool call.
 */

/** `record_skills` — extractor, §7.1 */
export interface RecordSkillsInput {
  skills: Array<{
    /** must exist in the provided skill catalogue */
    slug: string;
    /** 0–4 */
    level: number;
    /** 0–1 */
    confidence: number;
    /** the learner's own words supporting this */
    quote: string;
  }>;
  next_question?: string;
  intake_complete: boolean;
}

/** `emit_roadmap` — cartographer, §7.2 */
export interface EmitRoadmapInput {
  /** 0–100 */
  gap_score: number;
  gap_rationale: string;
  steps: Array<{
    order: number;
    kind: StepKind;
    title: string;
    provider?: string;
    url?: string;
    est_weeks?: number;
    /** one sentence, addressed to the learner */
    why: string;
    /** ids of the trajectories that justify this step; minItems 1. Never invented. */
    trajectory_ids: string[];
  }>;
}

/** `score_submission` — examiner, §7.4 */
export interface ScoreSubmissionInput {
  criteria: Array<{
    name: string;
    /** 0–4 */
    score: number;
    /** quoted from the submission */
    evidence_quote: string;
    improvement: string;
  }>;
  /** 0–100 */
  overall: number;
  passed: boolean;
  feedback: string;
}

/* ---- API response bodies that aren't a bare entity -------------- */

/** `POST /api/credentials/issue` */
export interface IssueCredentialResult {
  credentialId: string;
  /** PNG data URI of the verify-page QR */
  qrDataUri: string;
}

/** `GET /api/verify/[credentialId]` — public, no auth */
export interface VerifyCredentialResult {
  valid: boolean;
  payload: CredentialPayload;
  issuedAt: string;
  revokedAt: string | null;
}

/** One row of `GET /api/insights/regions` — aggregate only, no PII */
export interface RegionInsight {
  state: string;
  learners: number;
  topGaps: string[];
}
