/**
 * prisma/seed.ts — loads everything in lib/fixtures into the database.
 *
 * NOT IMPLEMENTED YET. This is a Backend-lane (Divine) deliverable — see
 * LADDA_BUILD_SPEC.md §13 prompt P2 ("Write prisma/seed.ts loading every file
 * in lib/fixtures"). The file exists now only so the repo matches the §4
 * layout and `npm run seed` is wired.
 *
 * When implemented it must:
 *   - upsert skills.json, then roles.json (+ nested roleSkills), then
 *     trajectories.json (resolving roleSlug → Role.id), then assessments.json,
 *     then demo-users.json (+ nested UserSkill and ConsentRecord).
 *   - be idempotent (safe to re-run).
 */

async function main() {
  throw new Error(
    "prisma/seed.ts is not implemented yet — see LADDA_BUILD_SPEC.md §13 (P2).",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
