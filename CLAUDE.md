# Task Tracker

A personal task management app built with Next.js, TypeScript, Tailwind CSS, and SQLite (via Prisma).

## Stack
- Next.js (App Router, Server Components
- TypeScript
- Tailwind CSS
- Prisma with SQLite
- NextAuth.js (credentials provider)

## Rules
- Use server components by default, client components only when needed
- All database queries go through Prisma (no raw SQL)
- Tasks are always scoped to the authenticated user
- Use Tailwind for all styling, no CSS modules

## Design
Follow design-system.md for all styling decisions.  Do not deviate from the defined colors, spacing, or components styles without explicit instruction.

## File Structure
- app/: pages and layouts only
- app/components/ui: generic reusable components
- app/components/tasks: task-specific components
- app/components/account: account-specific components
- app/components/providers: context/session providers
- lib/: utilities and shared logic
- types/: TypeScript type definitions
- app/actions.ts: server actions for database operations
- prisma/schema.prisma: database schema
