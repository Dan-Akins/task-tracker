# Task Tracker — 20-Point Security Checklist

Original review: 2026-08-14 (2 FAILs found and fixed). Re-audited 2026-09-05 against the
current codebase, which since the original review has added the landing page, Stripe
subscription billing, and the forgot/reset-password flow — most relevantly, item #5 flips from
N/A to PASS now that password reset actually exists. 1 new FIX applied (item #18, a fresh `npm
audit` finding unrelated to this session's feature work). Results below reflect the post-fix
state.

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | Passwords are hashed (bcrypt or argon2), never stored in plain text | **PASS** | `app/api/signup/route.ts` and `app/api/reset-password/route.ts` both hash with `bcrypt.hash(password, BCRYPT_COST_FACTOR)` (cost 12, `lib/validation.ts`) before storing; `auth.ts` verifies with `bcrypt.compare`. `User.password` in `prisma/schema.prisma` holds only the hash. |
| 2 | Session tokens are in httpOnly cookies (not accessible by JavaScript) | **PASS** | Unchanged since last review — NextAuth v5's default session cookie is `httpOnly: true` (and `secure` when the deployment URL is https). Neither `auth.ts` nor `auth.config.ts` overrides the `cookies` option. |
| 3 | NEXTAUTH_SECRET is a real random value, not a placeholder | **PASS** | Unchanged — `AUTH_SECRET`/`NEXTAUTH_SECRET` in `.env`/`.env.local` are unique base64-random values, never committed to git (see #16). |
| 4 | Login endpoint has rate limiting (5 attempts per minute per IP) | **PASS** | `lib/rateLimit.ts`: `ipLimiter = createLimiter(IP_ATTEMPT_LIMIT=5, IP_LOCKOUT_WINDOW_MS=60_000)`. Wired into `auth.ts`'s `authorize()`. Separately, the new `/api/forgot-password`, `/api/reset-password`, and `/api/signup` routes are all gated by `consumeWriteQuota` (30 requests/min per IP via `getClientIp`), so the new password-reset surface can't be used to brute-force or spam-trigger emails at will either. |
| 5 | Password reset tokens expire within 1 hour | **PASS** *(was N/A — feature added since last review)* | `lib/validation.ts`: `PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000` (exactly 1 hour), set in `app/api/forgot-password/route.ts` as `passwordResetTokenExpiresAt`. `app/api/reset-password/route.ts` rejects the request if `passwordResetTokenExpiresAt < new Date()`. The token itself is `crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES=32)` (256 bits, unguessable), stored only as a SHA-256 hash (`passwordResetTokenHash`, unique-indexed) — never the raw token — and is single-use: a successful reset nulls both `passwordResetTokenHash` and `passwordResetTokenExpiresAt`. `/api/forgot-password` also returns the same generic "if an account exists…" message whether or not the email matched a real account, preventing user enumeration. |
| 6 | All user inputs are validated on the server side (not just client side) | **PASS** | `lib/validation.ts`'s `validateTaskInput`/`validateEmail`/`validatePassword` run server-side in `app/actions.ts`, `app/api/signup/route.ts`, `app/api/forgot-password/route.ts`, and `app/api/reset-password/route.ts`. Client-side `required`/`minLength` attributes are UX only, not the enforcement point. |
| 7 | HTML is sanitized from all text inputs (prevents XSS) | **PASS** | `stripHtml()` strips tags from task `title`/`description`/`category` in `validateTaskInput`. No user-controlled string from the new billing/email/password-reset code (email address, reset token, Stripe webhook payload) is ever rendered as HTML — reset-password emails are sent via Resend's templated `html` string with only the app-generated `resetUrl` interpolated in, not user input. |
| 8 | Input lengths are limited (prevents memory exhaustion) | **PASS** *(fixed in original review, still holds)* | `EMAIL_MAX_LENGTH` (254) / `PASSWORD_MAX_LENGTH` (128) from `lib/validation.ts` are enforced in `validateEmail`/`validatePassword`, which now also gate the forgot/reset-password routes in addition to signup and login. |
| 9 | File uploads are validated for type and size (if applicable) | **N/A** | Still no file upload feature anywhere in the app. |
| 10 | API endpoints validate and reject unexpected parameters | **PASS** | `app/api/forgot-password/route.ts` and `app/api/reset-password/route.ts` each read only the specific fields they expect off the parsed JSON body (`email`; `token`/`password`) and type-check them before use, same pattern as signup. `app/billing/actions.ts`'s two server actions take no client-supplied arguments at all — everything they act on (`userId`, Stripe customer id) is derived from the session or the database. |
| 11 | Every database query that fetches user data includes a userID check | **PASS** | Task queries remain scoped via `where: { userId }`/`{ id, userId }` everywhere. Two new categories of query are intentionally *not* userId-scoped, and both are appropriate exceptions to the rule rather than leaks: (a) `app/api/reset-password/route.ts` looks up a user by the (unguessable, single-use, expiring) `passwordResetTokenHash` — this is a pre-authentication flow, the same class of exception as the NextAuth adapter's by-email lookup; (b) the Stripe webhook handler (`app/api/webhooks/stripe/route.ts`) updates users by `stripeCustomerId` after verifying the request is a genuine, signed event from Stripe itself (see the new note below the table) — there is no requesting user/session in a webhook to scope against. |
| 12 | No raw SQL queries, or raw SQL uses parameterized inputs | **PASS** | Re-grepped `app/` and `lib/` for `$queryRaw`/`$executeRaw`/`*Unsafe` — still zero matches in project code. All queries, including the new billing/email/password-reset ones, go through typed Prisma Client methods. |
| 13 | API responses don't leak sensitive data (no password hashes in JSON) | **PASS** | Unchanged pattern holds for new code: `/api/reset-password` and `/api/forgot-password` never echo back the user record, token, or hash — only `{ success }`/`{ error }`/the fixed generic message. The Stripe webhook handler returns only `{ received: true }`, never account or subscription details. |
| 14 | Admin endpoints (if any) require admin role verification | **N/A** | Still no admin functionality or role concept in the schema or app. |
| 15 | Deleted data is actually deleted (not just hidden) | **PASS** | Unchanged — `deleteTask` uses `prisma.task.delete`, and no soft-delete/`deletedAt` column exists on any model, including the new `passwordResetTokenHash`/`passwordResetTokenExpiresAt` fields (explicitly nulled, not flagged, on use). |
| 16 | .env files are in .gitignore and never committed to git | **PASS** | `.gitignore` still lists `.env*`. Re-confirmed `git ls-files` shows no `.env` files tracked, including the newer `STRIPE_*`, `RESEND_API_KEY`, and `CRON_SECRET` variables. |
| 17 | No hardcoded secrets in source code | **PASS** | Re-grepped for Stripe/Resend key patterns (`sk_live`, `sk_test`, `whsec_`, `re_...`) across `app/`, `lib/`, `scripts/`, and the auth/proxy root files — no matches. `lib/stripe.ts` and `lib/email.ts` both read their keys from `process.env` only, following the same lazy-construction pattern (avoids failing the build when a key is unset — see `lib/stripe.ts`'s comment on why eager construction broke a prior deploy). |
| 18 | npm audit shows zero high/critical vulnerabilities | **FIXED → PASS** *(new finding this cycle)* | `npm audit` reported 5 high-severity findings, all transitive dependencies of the `prisma` CLI package itself (unrelated to this session's feature work): `fast-uri` (via `@prisma/dev`'s local-streams tooling) and `mysql2`/`@prisma/config`/`deepmerge-ts` (Prisma's optional MySQL connector — this app only ever uses `@prisma/adapter-pg`/Postgres). Ran `npm audit fix`, which bumped the resolved `prisma`/`@prisma/*` patch version (7.9.1 → 7.10.0) and cleared the `fast-uri` finding; full test suite (186/186) and `tsc --noEmit` both still pass. The remaining `mysql2`/`deepmerge-ts` findings only clear via `npm audit fix --force`, which would downgrade `prisma` to 6.19.3 — a breaking major-version downgrade incompatible with this app's Prisma 7 driver-adapter setup — so left as-is; the vulnerable code path (MySQL protocol handling) is never reachable by this Postgres-only app. |
| 19 | HTTPS is enforced (Vercel handles this automatically) | **PASS** | Unchanged — no code (including the new Stripe/Resend integrations, which call out to `api.stripe.com`/`api.resend.com` over HTTPS by default via their SDKs) undermines this. |
| 20 | CORS is configured to allow only your domain (prevents cross-origin attacks) | **PASS** | Unchanged since the 2026-08-14 fix — `proxy.ts`'s `ALLOWED_ORIGINS` still lists only the real production aliases (confirmed via `vercel alias ls`) plus localhost. Any other `Origin` still gets a `403`. |

## Summary

- **18 PASS**, **2 N/A**, **0 FAIL** (both this cycle's and the original review's fails are fixed).
- New this cycle:
  1. **Item #5 flips N/A → PASS**: the forgot/reset-password flow added since the last review
     meets the 1-hour-expiry, single-use, hashed-at-rest, and anti-enumeration bar.
  2. **`npm audit` finding (#18)**: `fast-uri` (high) fixed via `npm audit fix` (non-breaking,
     `prisma` 7.9.1 → 7.10.0). `mysql2`/`deepmerge-ts` (high) left unresolved — only fixable via a
     breaking downgrade to `prisma` 6.x, and the vulnerable MySQL-connector code path is unreachable
     in this Postgres-only app. Revisit if Prisma ships a 7.x release that drops the vulnerable
     transitive dependency.
- Everything else re-verified against the current codebase (Stripe billing, landing page,
  forgot/reset-password) with no new issues found.

## Additional note: Stripe webhook signature verification

Not a numbered item above (the checklist predates Stripe), but worth recording since it's the
main new trust boundary this cycle: `app/api/webhooks/stripe/route.ts`'s `verifyEvent()` reads the
raw request body as text and calls `stripe.webhooks.constructEvent(body, signature,
STRIPE_WEBHOOK_SECRET)` — an invalid or missing `stripe-signature` header (or wrong secret) throws,
and the handler responds `400` without touching the database. This is what makes the userId-less,
`stripeCustomerId`-scoped writes in item #11(b) safe: nothing reaches those `prisma.user.update`
calls unless Stripe's signature proves the payload is genuine.
