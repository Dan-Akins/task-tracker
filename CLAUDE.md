# Task Tracker

A personal task management app built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL (via Prisma).

## Stack
- Next.js (App Router, Server Components)
- TypeScript
- Tailwind CSS
- Prisma with PostgreSQL
- NextAuth.js (credentials provider)

## Rules
- Use server components by default, client components only when needed
- All database queries go through Prisma (no raw SQL)
- Tasks are always scoped to the authenticated user
- Use Tailwind for all styling, no CSS modules
- Group components by feature under app/components/ (ui, tasks, account, auth, providers); split any component over ~100 lines into focused subcomponents by role, not arbitrary line cuts
- Centralize shared enum metadata and business defaults in lib/ (e.g. lib/taskMeta.ts) and auth checks in lib/session.ts (requireSession for pages, requireUserId for server actions) instead of duplicating them per file
- Name magic numbers and business-relevant constants (rate limits, security parameters, defaults) instead of inlining them; UI copy and Tailwind classes are exempt
- Use the @/ path alias for cross-directory imports; relative imports are reserved for a test importing its own subject and CSS side-effect imports

## Design
Follow DESIGN-SYSTEM.md for all styling decisions. Do not deviate from the defined colors, spacing, or component styles without explicit instruction. Status/priority colors are also centralized in lib/taskMeta.ts — keep the two in sync.

## File Structure
- app/: pages, layouts, and route handlers (app/api/)
- app/dashboard: authenticated task list (moved here from "/", which is now the public landing page)
- app/billing: server actions for Stripe Checkout/Billing Portal session creation
- app/pricing, app/terms, app/privacy, app/stats: static/account-derived marketing and info pages
- app/forgot-password, app/reset-password: emailed password-reset flow pages
- app/components/ui: generic reusable components
- app/components/tasks: task-specific components
- app/components/account: account-specific components
- app/components/auth: shared login/signup/reset-password form fields
- app/components/billing: pricing card and upgrade/manage-billing buttons
- app/components/marketing: landing-page-only components (e.g. app preview)
- app/components/providers: context/session providers
- lib/: utilities, shared constants, and auth guards
- lib/stripe.ts: lazily-constructed Stripe client
- lib/subscription.ts: plan data/limits and Stripe status mapping (keep in sync with app/components/billing)
- lib/email.ts: lazily-constructed Resend client (password-reset emails)
- lib/backup.ts: shared DB export logic used by both the cron route and scripts/backup.ts
- types/: TypeScript type definitions
- app/actions.ts: server actions for database operations
- prisma/schema.prisma: database schema
- auth.ts, auth.config.ts: NextAuth setup (credentials provider, rate-limit-gated login)
- proxy.ts: middleware (CORS allowlist)
- scripts/backup.ts: manual local DB backup script (`npm run backup`)
- scripts/stripe-setup.ts: one-off script to provision Stripe product/price/webhook (`npm run stripe:setup`)
- app/api/webhooks/stripe: Stripe webhook handler (subscription status sync)
- test/pglite-test-db.ts: shared in-memory Postgres test database used by integration tests
