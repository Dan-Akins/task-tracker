# Untested Functions

Regenerated from a Vitest + `@vitest/coverage-v8` run (`npm run coverage`) on 2026-09-05 — 186
tests across 22 test files, now covering the landing page, Stripe/billing integration, and
forgot/reset-password flow added since the last pass.

**Overall: 58.89% statements / 56.19% branches / 50% functions / 58.91% lines.** Everything below
has zero test coverage (or, where noted, one specific uncovered function alongside otherwise-tested
ones), grouped by file. Full HTML report: `coverage/index.html`.

## auth.ts
- `authorize` (L25) — Credentials provider callback: rate-limit check, user lookup, bcrypt compare.
- `jwt` (L60) — attaches `user.id` onto the JWT.
- `session` (L64) — attaches token id onto `session.user.id`.

## proxy.ts
- `corsHeaders` (L15), `applyApiCors` (L25), and the default-exported `proxy` (L61) — the combined
  API-CORS-allowlist + NextAuth session-redirect middleware is entirely untested (0% statements).

## app/layout.tsx
- `RootLayout` (L22)

## app/loading.tsx
- `Loading` (L3)

## app/global-error.tsx
- `GlobalError` (L9), its `useEffect` callback (L16), and the "Try again" button's `onClick` arrow
  (L41) calling `reset()`.

## app/page.tsx (public landing page)
- `LandingPage` (L31) and the `FEATURES.map` render callback (L79).

## app/account/page.tsx
- `AccountPage` (L11) — plan badge, upgrade/manage-billing button branch, delete-account section.

## app/dashboard/page.tsx
- `DashboardPage` (L17), the `allTasks.filter` status-filter callback (L34), and `handleSignOut`
  (L40).

## app/login/page.tsx
- `LoginPage` (L12), `handleSubmit` (L17), and its `startTransition` async callback (L22) — calls
  `signIn("credentials", …)`, sets error state, redirects on success.

## app/signup/page.tsx
- `SignupPage` (L12), `handleSubmit` (L17), and its `startTransition` async callback (L24) — posts
  to `/api/signup`, then signs in and redirects.

## app/forgot-password/page.tsx
- `ForgotPasswordPage` (L8), `handleSubmit` (L13), and its `startTransition` async callback (L18).

## app/reset-password/page.tsx
- `ResetPasswordPage` (L7) — branches on whether a `?token=` search param is present.

## app/pricing/page.tsx
- `PricingPage` (L13) — session/subscription-derived CTA branching for both plan cards.

## app/stats/page.tsx
- `StatsPage` (L11), `handleSignOut` (L27), and the `STATUS_ORDER.map` render callback (L68).

## app/terms/page.tsx
- `TermsPage` (L7) — static content page.

## app/api/signup/route.ts (partially covered — 50% funcs)
- The `.catch(() => null)` fallback on `req.json()` (L13) is never exercised (malformed-JSON path).
  `POST` itself is otherwise well covered.

## app/api/forgot-password/route.ts (partially covered — 80% funcs)
- The `.catch(() => null)` fallback on `req.json()` (L34) is never exercised. `hashToken`,
  `getOrigin`, `genericResponse`, and `POST` are all covered.

## app/api/reset-password/route.ts (partially covered — 66.66% funcs)
- The `.catch(() => null)` fallback on `req.json()` (L18) is never exercised. `hashToken` and
  `POST` are covered.

## app/components/auth/AuthEmailField.tsx
- `AuthEmailField` (L1)

## app/components/auth/AuthPasswordField.tsx
- `AuthPasswordField` (L7)

## app/components/auth/AuthFormError.tsx
- `AuthFormError` (L5)

## app/components/auth/ResetPasswordForm.tsx
- `ResetPasswordForm` (L13), `handleSubmit` (L18), and its `startTransition` async callback (L23).

## app/components/billing/PricingCard.tsx
- `PricingCard` (L13) and the `features.map` render callback (L34).

## app/components/billing/UpgradeButton.tsx
- `UpgradeButton` (L6), `handleClick` (L10), and its `startTransition` async callback (L12).

## app/components/billing/ManageBillingButton.tsx
- `ManageBillingButton` (L6), `handleClick` (L10), and its `startTransition` async callback (L12).

## app/components/billing/UpgradePrompt.tsx
- `UpgradePrompt` (L4)

## app/components/marketing/AppPreview.tsx
- `AppPreview` (L13) and the `PREVIEW_TASKS.map` render callback (L26).

## app/components/providers/AuthProvider.tsx
- `AuthProvider` (L5)

## app/components/tasks/TaskCardSkeleton.tsx
- `TaskCardSkeleton` (L1)

## app/components/tasks/TaskCard.tsx (partially covered — 91.66% stmts / 33.33% funcs)
- `handleCycle` (L32) and its `startTransition` callback (L33) — the status-cycle button handler.
  `TaskCard` itself is covered via `TaskCard.test.tsx`.

## app/components/tasks/TaskCardActions.tsx (partially covered — 50% stmts / 50% funcs)
- The delete button's `onClick` arrow (L27) — the `window.confirm` guard.

## app/components/ui/ThemeToggle.tsx
- `ThemeToggle` (L5), its `useEffect` callback (L8) — syncs `dark` state from the `<html>` class on
  mount — and `toggle` (L12) — toggles the `dark` class and persists to `localStorage`.

## lib/prisma.ts
- `makePrisma` (L4) — constructs the `PrismaPg` adapter + `PrismaClient` singleton.

## lib/stripe.ts
- `makeStripe` (L3), `getStripe` (L10), and the lazy-construction `Proxy`'s `get` trap (L26).

## lib/email.ts
- `getResend` (L12) and `sendPasswordResetEmail` (L17) — both untested; no test mocks the Resend
  client or exercises the reset-email send path directly (only indirectly via
  `app/api/forgot-password/route.test.ts`'s mock of the whole module).

## lib/session.ts (partially covered — 50% funcs)
- `requireSession` (L11) — only called from page components (`app/dashboard`, `app/account`,
  `app/stats`), none of which render in the unit test suite. `requireUserId` (L5) is covered
  transitively via `app/actions.ts`'s tests.

---

**Fully covered** (100% functions): `auth.config.ts`, `app/actions.ts`, `app/error.tsx`,
`app/not-found.tsx`, `app/api/auth/[...nextauth]/route.ts`, `app/api/cron/backup/route.ts`,
`app/api/webhooks/stripe/route.ts`, `app/billing/actions.ts`, `app/privacy/page.tsx`,
`app/components/account/DeleteAccountButton.tsx`, `app/components/tasks/NewTaskDetailsFields.tsx`,
`app/components/tasks/NewTaskForm.tsx`, `app/components/tasks/NewTaskMetaFields.tsx`,
`app/components/tasks/StatusFilter.tsx`, `app/components/tasks/TaskCardHeader.tsx`,
`app/components/tasks/TaskCardMeta.tsx`, `app/components/tasks/TaskList.tsx`,
`app/components/tasks/TaskSection.tsx`, `lib/backup.ts`, `lib/rateLimit.ts`, `lib/subscription.ts`,
`lib/taskMeta.ts`, `lib/validation.ts`.
