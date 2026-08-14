# Task Tracker — 20-Point Security Checklist

Audited against the codebase as of this review. 2 FAILs found and fixed; results below reflect the post-fix state.

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | Passwords are hashed (bcrypt or argon2), never stored in plain text | **PASS** | `app/api/signup/route.ts` hashes with `bcrypt.hash(password, 12)` before storing; `auth.ts` verifies with `bcrypt.compare`. `User.password` in `prisma/schema.prisma` holds only the hash. |
| 2 | Session tokens are in httpOnly cookies (not accessible by JavaScript) | **PASS** | NextAuth v5's default session cookie is `httpOnly: true` (and `secure` when the deployment URL is https). Neither `auth.ts` nor `auth.config.ts` overrides the `cookies` option, so the secure default applies. |
| 3 | NEXTAUTH_SECRET is a real random value, not a placeholder | **PASS** | `AUTH_SECRET`/`NEXTAUTH_SECRET` in `.env`/`.env.local` are unique base64-random values, not placeholders like `changeme`. Never committed to git (see #16). |
| 4 | Login endpoint has rate limiting (5 attempts per minute per IP) | **PASS** | `lib/rateLimit.ts`: `ipLimiter = createLimiter(5, 60 * 1000)` — exactly 5/min. Wired into `auth.ts`'s `authorize()` via `isIpRateLimited`/`recordIpFailure`, keyed on `x-forwarded-for`/`x-real-ip`. |
| 5 | Password reset tokens expire within 1 hour | **N/A** | No password-reset/forgot-password feature exists anywhere in the app (no route, no token model in `schema.prisma`). |
| 6 | All user inputs are validated on the server side (not just client side) | **PASS** | `lib/validation.ts`'s `validateTaskInput`/`validateEmail` run server-side in `app/actions.ts` (Server Actions) and `app/api/signup/route.ts`. Client-side `maxLength`/`required` attributes are UX only, not the enforcement point. |
| 7 | HTML is sanitized from all text inputs (prevents XSS) | **PASS** | `stripHtml()` strips tags from task `title`/`description`/`category` in `validateTaskInput`. Signup's email/password are never rendered as HTML. |
| 8 | Input lengths are limited (prevents memory exhaustion) | **FIXED → PASS** | Task fields already had `TASK_TITLE_MAX_LENGTH`/`TASK_DESCRIPTION_MAX_LENGTH`/`TASK_CATEGORY_MAX_LENGTH`, but signup/login **email and password had no upper bound** — an attacker could submit a multi-megabyte email or password. Added `EMAIL_MAX_LENGTH` (254, RFC 5321) and `PASSWORD_MAX_LENGTH` (128) to `lib/validation.ts`, enforced in `validateEmail`, signup's `validatePassword`, and `auth.ts`'s `authorize()` (rejected before the DB lookup/bcrypt compare). |
| 9 | File uploads are validated for type and size (if applicable) | **N/A** | No file upload feature exists anywhere in the app. |
| 10 | API endpoints validate and reject unexpected parameters | **PASS** | `app/api/signup/route.ts` reads only `body.email`/`body.password` from the parsed JSON and passes only those two fields to `prisma.user.create` — extra fields are silently ignored, never reflected or mass-assigned. Tasks aren't exposed as a JSON API at all (Server Actions only), so there's no separate task endpoint to probe. |
| 11 | Every database query that fetches user data includes a userID check | **PASS** | `app/actions.ts` (`createTask`/`deleteTask`/`cycleStatus`), `app/page.tsx`, and `app/dashboard/page.tsx` all scope task queries with `where: { userId }` or `{ id, userId }`. `lib/authAdapter.ts`'s `getUser`/`getUserByEmail` intentionally look up by `id`/`email` directly — that's the NextAuth adapter contract (a system-level auth lookup, not user-facing data access), so it's expected and not a leak. |
| 12 | No raw SQL queries, or raw SQL uses parameterized inputs | **PASS** | Grepped `app/` and `lib/` for `$queryRaw`/`$executeRaw`/`*Unsafe` variants — zero matches in project code (only in vendored skill docs under `.agents/`). All queries go through typed Prisma Client methods. |
| 13 | API responses don't leak sensitive data (no password hashes in JSON) | **PASS** | `authAdapter.ts`'s `toAdapterUser()` strips `password` before returning user objects to NextAuth. `auth.ts`'s `authorize()` returns only `{ id, email }`. Signup's response is `{ success: true }` — never the created user record. |
| 14 | Admin endpoints (if any) require admin role verification | **N/A** | No admin functionality or role concept exists anywhere in the schema or app. |
| 15 | Deleted data is actually deleted (not just hidden) | **PASS** | `deleteTask` uses `prisma.task.delete` — a hard delete. `schema.prisma` has no soft-delete/`deletedAt` column on any model. |
| 16 | .env files are in .gitignore and never committed to git | **PASS** | `.gitignore` lists `.env*`. Confirmed `git ls-files` shows no `.env` files tracked, and `git log --all --full-history -- "*.env*"` returns no history of one ever being committed. |
| 17 | No hardcoded secrets in source code | **PASS** | Grepped `.ts`/`.tsx` files for common secret patterns (API keys, hardcoded credentials) — no matches. All secrets are loaded from environment variables. |
| 18 | npm audit shows zero high/critical vulnerabilities | **FIXED → PASS** | `npm audit` reported 1 **high** severity vulnerability (`nanoid` — indefinite-loop generator bug, GHSA-2v37-7h3g-55p8). Ran `npm audit fix`; `npm audit` now reports **0 vulnerabilities**. |
| 19 | HTTPS is enforced (Vercel handles this automatically) | **PASS** | No code in the app undermines this (no hardcoded `http://` API calls, no insecure-cookie overrides). HTTPS/HSTS enforcement is delegated to Vercel per the checklist's own note. |
| 20 | CORS is configured to allow only your domain (prevents cross-origin attacks) | **PASS** | `proxy.ts`'s `applyApiCors()` only allows `ALLOWED_ORIGINS = ["https://task-tracker.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000"]` for `/api/*` routes; any other `Origin` gets a `403`. |

## Summary

- **18 PASS**, **2 N/A**, **0 FAIL** (2 originally failed, both fixed during this review)
- Fixes applied:
  1. **Unbounded email/password length** (#8) — added `EMAIL_MAX_LENGTH`/`PASSWORD_MAX_LENGTH` caps in `lib/validation.ts`, enforced at signup and login.
  2. **`nanoid` high-severity vulnerability** (#18) — resolved via `npm audit fix`; 0 vulnerabilities remain.
- Regression tests added: `lib/validation.test.ts` (email length boundary), `app/api/signup/route.test.ts` (new file — password/email length rejection).
- Full test suite: 108/108 passing after all fixes.
