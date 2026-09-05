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

### 2026-09-05

**Step 1 — Dead code:** none found. Checked every export added since the last
pass — the Stripe/billing integration (`lib/stripe.ts`, `lib/subscription.ts`,
`app/billing/actions.ts`, `app/api/webhooks/stripe/route.ts`,
`scripts/stripe-setup.ts`), the landing page + `/pricing`/`/terms`/`/stats`
pages and their `app/components/billing`/`app/components/marketing`
components, and the forgot/reset-password flow (`lib/email.ts`,
`app/api/forgot-password`, `app/api/reset-password`,
`app/components/auth/ResetPasswordForm.tsx`) — all trace to a real call site.
No action taken.

**Step 2 — Duplicate utilities:** one found and fixed. The landing page
(`app/page.tsx`) and `/pricing` (`app/pricing/page.tsx`) each hardcoded
identical `PricingCard` plan data (name/price/priceSuffix/features) for both
the Free and Pro tiers. Consolidated into `FREE_PLAN`/`PRO_PLAN` (plus a named
`PRO_PLAN_PRICE_USD`) in `lib/subscription.ts`; both pages now spread the
shared object into `PricingCard` and only keep their page-specific `cta`
inline. The `$5` mention in `app/terms/page.tsx` was left inline — it's legal
prose copy, not structural data, so it's exempt per CLAUDE.md. The
`TaskCard.tsx` date-formatting repetition flagged in the last two runs is
unchanged, still left as-is per prior user choice.

**Step 3 — File structure check:** significant drift found — CLAUDE.md's File
Structure section predated this session's landing page, Stripe/billing
integration, and forgot/reset-password flow entirely. Missing: `app/billing`,
`app/pricing`, `app/terms`, `app/stats`, `app/forgot-password`,
`app/reset-password`, `app/components/billing`, `app/components/marketing`,
`lib/email.ts`, `lib/stripe.ts`, `lib/subscription.ts`, `lib/backup.ts` (the
shared export logic, distinct from the `scripts/backup.ts` entry point),
`scripts/stripe-setup.ts`, and `app/api/webhooks/stripe`. Also,
`app/components/auth`'s description was stale (didn't mention
`ResetPasswordForm.tsx`).

**Step 4 — Update CLAUDE.md:** rewrote the File Structure section to cover
all of the above with one-line descriptions, and broadened the
`app/components/auth` description to include reset-password.
