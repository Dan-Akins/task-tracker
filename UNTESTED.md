# Untested Functions

Generated from a Vitest + `@vitest/coverage-v8` run (`npm run coverage`) after standing up the
project's first test suite (44 tests across 6 files — `lib/rateLimit.ts`, `lib/authAdapter.ts`,
`auth.config.ts`, `app/actions.ts`, `app/components/StatusFilter.tsx`, `app/components/TaskCard.tsx`).

**Overall: 33.84% statements / 32.25% functions covered.** Everything below has zero test coverage,
grouped by file. Full HTML report: `coverage/index.html`.

## auth.ts
- `authorize` (L16) — Credentials provider callback: rate-limit check, user lookup, bcrypt compare.
- `jwt` (L41) — attaches `user.id` onto the JWT.
- `session` (L45) — attaches token id onto `session.user.id`.

## proxy.ts
- Default export (`NextAuth(authConfig).auth`) — the auth middleware itself is untested (0% statements).

## app/page.tsx
- `Home` (L15) — server component: session check/redirect, task fetch, status filtering.
- `handleSignOut` (L33) — inline server action bound to the sign-out form.

## app/layout.tsx
- `RootLayout` (L22)

## app/loading.tsx
- `Loading` (L3)

## app/dashboard/page.tsx
- `Dashboard` (L18)
- `handleSignOut` (L36)
- anonymous callback (L77) — likely a `.map`/render callback inside the page.

## app/login/page.tsx
- `LoginPage` (L8)
- `handleSubmit` (L13) — calls `signIn("credentials", …)`, sets error state, redirects on success.

## app/signup/page.tsx
- `SignupPage` (L8)
- `handleSubmit` (L13)

## app/api/signup/route.ts
- `validatePassword` (L5) — length/uppercase/lowercase/number/special-char checks.
- `POST` (L14) — request parsing, validation, duplicate-email check, user creation.

## app/api/auth/[...nextauth]/route.ts
- No functions of its own (re-exports `GET`/`POST` from `auth.ts`'s `handlers`); covered transitively
  once `auth.ts` is tested.

## app/components/AuthProvider.tsx
- `AuthProvider` (L5)

## app/components/NewTaskForm.tsx
- `NewTaskForm` (L6)
- `handleSubmit` (L10) — wraps `createTask` in a transition and resets the form.

## app/components/TaskCardSkeleton.tsx
- `TaskCardSkeleton` (L1)

## app/components/TaskList.tsx
- `TaskList` (L22) — empty states are untested along with the priority-sort/group-by-status logic
  (the `byPriority` comparator and the `in_progress`/`todo`/`done` `.filter().sort()` callbacks, L48-51,
  and the three `.map()` render callbacks, L62/86/110).

## app/components/TaskRow.tsx
- `TaskRow` (L33)
- `handleCycle` (L36)

## app/components/ThemeToggle.tsx
- `ThemeToggle` (L5)
- effect callback (L8) — syncs `dark` state from the `<html>` class on mount.
- `toggle` (L12) — toggles the `dark` class and persists the choice to `localStorage`.

## app/components/TaskCard.tsx (partially covered — 75% stmts / 25% funcs)
- `handleCycle` (L66) and its transition callback (L67) — the status-cycle button handler.
- delete-confirm callback (L142) — the `window.confirm` guard on the delete button.

## lib/prisma.ts
- `makePrisma` (L4) — constructs the `PrismaPg` adapter + `PrismaClient` singleton.

---

**Fully covered** (100% functions): `lib/rateLimit.ts`, `lib/authAdapter.ts`, `auth.config.ts`,
`app/actions.ts`, `app/components/StatusFilter.tsx`.
