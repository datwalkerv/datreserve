# datreserve — Handoff

## Status: not started

No code exists yet. Only `idea.md` (raw product spec from the user) and `plan.md` (the derived implementation plan) exist in this directory. There is no git repo initialized, no package.json, no scaffolding of any kind.

## What this project is

A link-in-bio online reservation page for solo service providers (barbers, consultants, nail artists, etc.). Provider signs up, completes a 4-stage onboarding, then manages bookings from an admin dashboard. Clients book via a public page at `datreserve.vercel.app/book/:slug` with no auth required.

## Read these first, in order

1. `idea.md` — the original product spec in the user's own words. Source of truth for UX/flow details (exact onboarding stages, exact sidebar menu structure, exact booking flow steps).
2. `plan.md` — the full technical plan derived from idea.md, refined with the user's stack decisions below. This is the primary reference for entities, API endpoints, page structure, and build phases.

Do not re-derive the plan from idea.md alone — plan.md already incorporates decisions the user made in conversation that aren't in idea.md (see below).

## Stack (locked in — do not deviate without asking)

- Next.js (App Router) + TypeScript + Tailwind CSS
- NestJS (REST API) + TypeORM + PostgreSQL
- **Auth: BetterAuth** (not raw JWT/Passport — this overrides anything about custom JWT auth you might assume is standard for a Nest app)
- **Images: Cloudinary** (not S3) — avatar + cover image upload
- **Deployment: Railway** for both apps + Postgres
- **Icons: Lucide** for niche/service icons
- `.ics` generation via the `ics` npm package
- Fonts: Inter (primary) + Instrument Serif (secondary), both via Google Fonts / `next/font`
- Style: dark neutral palette + neon green accent; logo = neon green bg, bold black Inter "dr"

## Explicitly out of scope for this version

- No payment collection — booking only.
- No notifications (no confirmation emails, no reminders) — the only post-booking artifact is the generated `.ics` file with an "add to calendar" button.
- No multi-staff/team accounts — single-provider-per-account only.

If asked to add any of the above, treat it as a scope change and confirm with the user first rather than assuming it fits "naturally" into the existing plan.

## Key structural decisions from plan.md (don't relitigate these)

- Monorepo: `apps/web` (Next), `apps/api` (Nest), `packages/shared-types`, `packages/config`. pnpm + Turborepo.
- BetterAuth is mounted in `apps/web` (it's a Next.js-native library); NestJS validates BetterAuth sessions rather than issuing its own JWTs. The app-specific `User` profile entity in Postgres links 1:1 to BetterAuth's own `user` table via `userId` — do not merge these into one table.
- 6 preset dark themes (Display settings) implemented as CSS variable sets + `data-theme` attribute, all pairing with the same neon green accent.
- Availability computation is a pure server-side function: WorkingHours for the weekday → subtract existing Appointments → filter by `bookingCutoffHours` (default 3) and `bookingWindowDays` (default 30) → return open slots. See plan.md §5 "Availability computation logic" for the exact algorithm — implement it exactly as specified, it's already been thought through.
- Full data model (7 entities: User, WorkingHours, Service, Client, Appointment, plus BetterAuth's own tables) is in plan.md §3 — use it as-is unless a real implementation blocker forces a change.
- Full endpoint list is in plan.md §5. Full page/route tree is in plan.md §6.

## Suggested next step

Start at **Phase 0** in plan.md §9 (Scaffolding): pnpm workspace + Turborepo, Next.js app with Tailwind and fonts wired up, NestJS app with TypeORM/Postgres connection, shared-types package, Docker Compose for local Postgres. Confirm the scaffolding boots (both apps run, DB connects) before moving into Phase 1 (BetterAuth + onboarding).

## Open items to flag to the user if they come up

- Exact hex values for the neon green accent and dark neutral tones haven't been picked — idea.md only describes them qualitatively. Ask before finalizing a design token file, or propose values and confirm.
- The 6 preset theme names/exact variations are placeholders (`theme-obsidian`, `theme-forest`, etc.) — not confirmed with the user, just a reasonable starting set.
