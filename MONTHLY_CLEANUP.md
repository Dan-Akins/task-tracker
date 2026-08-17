# Monthly Cleanup

A recurring maintenance pass for this repo. Run in order; show findings for
each step before making any change, and get confirmation before deleting or
merging anything.

## Steps

1. **Dead code** — find exports/files with no remaining references (excluding
   `app/generated/prisma/**`, test files, and Next.js convention exports like
   page/layout/route handlers) and delete only the ones confirmed unused.
2. **Duplicate utilities** — find near-identical helper functions or logic
   duplicated across files and consolidate into a single shared version in
   `lib/` or the relevant `app/components/*` feature folder.
3. **File structure check** — compare the actual `app/`, `lib/`, `types/`
   layout against the "File Structure" section of `CLAUDE.md` and flag any
   drift (new top-level areas, misplaced files, stale descriptions).
4. **Update CLAUDE.md** — reconcile `CLAUDE.md` with what steps 1–3 found
   (file structure section, any newly-centralized utilities worth naming).

## Log

Each run gets a dated entry below summarizing what was found and what action
was taken.

### 2026-08-16

**Step 1 — Dead code:** none found. Checked every exported symbol in `app/`,
`lib/`, `types/`, and root files (`auth.ts`, `auth.config.ts`, `proxy.ts`,
`scripts/backup.ts`, `test/pglite-test-db.ts`) for import sites; no
commented-out code blocks either. No action taken.

**Step 2 — Duplicate utilities:** two candidates found.
- `RATE_LIMIT_MESSAGE` was redeclared locally in `app/actions.ts` with
  drifted wording instead of importing the existing export from
  `lib/rateLimit.ts` — fixed: `app/actions.ts` now imports it, and
  `app/actions.test.ts` was updated to import/assert the shared constant
  instead of a hardcoded copy of the string.
- Repeated `{ month: "short", day: "numeric" }` date formatting (x3) in
  `app/components/tasks/TaskCard.tsx` — flagged but left as-is per user
  choice (not worth a shared helper yet, only one file uses this pattern).
- `STATUS_META`/`PRIORITY_META`, session checks, `validateTaskInput`, and
  `formData` parsing were checked and are already properly centralized.

**Step 3 — File structure check:** `app/components/*`, `lib/`, `types/`,
`app/actions.ts`, and `prisma/schema.prisma` all matched CLAUDE.md. Drift
found: four real source files/dirs weren't documented — `auth.ts` +
`auth.config.ts` (NextAuth setup), `proxy.ts` (CORS middleware),
`scripts/backup.ts` (manual backup script), `test/pglite-test-db.ts`
(shared integration-test DB helper). `app/generated/prisma/**` correctly
excluded as generated code; `dev.db` at root is git-ignored, not clutter.

**Step 4 — Update CLAUDE.md:** added the four files above to the File
Structure section with one-line descriptions.
