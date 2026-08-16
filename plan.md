# datreserve — Implementation Plan

Link-in-bio online reservation platform for service providers (barbers, consultants, nail artists, etc.)

## 1. Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: NestJS (REST API), TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Auth**: BetterAuth
- **File storage**: Cloudinary for profile/cover images
- **Calendar export**: `ics` npm package for `.ics` generation
- **Deployment target**: Railway

### Fonts & Style

- Primary font: **Inter** (Google Fonts)
- Secondary font: **Instrument Serif** (Google Fonts) — used for display/headline moments
- Palette: dark neutral background (e.g. `#0A0A0A`/`#121212` neutrals), neon green accent (e.g. `#39FF6A` / tune exact hex during design)
- Logo: neon green square/rounded background, bold black Inter "dr" mark

---

## 2. Monorepo Structure

```
datreserve/
├── apps/
│   ├── web/          # Next.js app
│   └── api/           # NestJS app
├── packages/
│   ├── shared-types/   # DTOs/enums shared between web & api
│   └── config/         # eslint/tsconfig shared config
├── plan.md
└── idea.md
```

Use npm/pnpm workspaces (pnpm recommended) with Turborepo for build orchestration (optional but recommended for two-app monorepo).

---

## 3. Data Model (TypeORM entities)

### User (app profile — extends BetterAuth's user record via 1:1 link on userId)
- id (uuid)
- userId (FK to BetterAuth user table, unique)
- firstName, lastName
- companyName
- slug (unique, used in `/book/:slug`)
- country (ISO code)
- phoneNumber
- currency (defaults from country, overridable in Settings)
- timezone (derived from country)
- avatarUrl
- coverImageUrl
- niche/icon key (enum: barber, nail-artist, consultant, ... + "other")
- hasLocation (bool)
- locationText (nullable)
- description (about you)
- socials (jsonb: { instagram, facebook, tiktok, website, ... })
- theme (enum: 6 premade themes)
- bookingWindowDays (int, default 30) — how far in advance bookable
- bookingCutoffHours (int, default 3) — minimum lead time
- onboardingStage (int, tracks progress 0-4/complete)
- createdAt, updatedAt

### WorkingHours
- id
- userId (FK)
- weekday (0-6)
- isOpen (bool)
- startTime, endTime
- slotIntervalMinutes (default 30)
- (allow free-text override validated against HH:mm format)

### Service
- id
- userId (FK)
- name
- price (decimal)
- currency (nullable — falls back to user.currency)
- locationText (nullable — falls back to "Online" or user location)
- notes
- description
- durationValue (int)
- durationUnit (enum: minutes, hours)
- iconKey (defaults to user's niche icon)
- createdAt, updatedAt

### Client
- id
- userId (FK) — owner/provider
- name
- email
- phoneNumber
- birthDate (nullable)
- notes
- createdAt, updatedAt
- (computed via query, not stored: lastAppointment, bookingsCount)

### Appointment (Booking)
- id
- userId (FK, provider)
- serviceId (FK)
- clientId (FK, nullable if guest-booking creates Client on the fly)
- clientName, clientEmail, clientPhone, clientNotes (snapshot at booking time)
- startAt (timestamptz, stored in provider's country timezone context)
- endAt (timestamptz)
- status (enum: confirmed, cancelled, completed, no-show)
- icsUid (for calendar file regeneration)
- createdAt, updatedAt

BetterAuth manages its own `user`/`session`/`account`/`verification` tables (auto-migrated via its CLI); the app-specific `User` (profile) entity above links 1:1 via `userId`.

---

## 4. Auth Flow (BetterAuth)

1. BetterAuth mounted in the Next.js app (`apps/web`) as the auth server — email/password provider enabled; NestJS API validates the BetterAuth session cookie/JWT on incoming requests (via BetterAuth's JWT plugin or a shared-secret session verification call).
2. Register → creates BetterAuth user + app `User` profile row with `onboardingStage = 0`.
3. Login → BetterAuth session (httpOnly cookie). Next.js middleware reads the session for route protection; NestJS guards verify the same session/JWT on API calls.
4. Guard: if `onboardingStage < 4`, all admin routes redirect to `/onboarding`.
5. Public booking pages (`/book/:slug`) require no auth.

---

## 5. NestJS API Modules

- `AuthModule` — BetterAuth session verification guard/strategy (no local register/login/refresh endpoints; those are handled by BetterAuth's own routes in the Next.js app)
- `UsersModule` — profile CRUD, onboarding steps, settings (profile/display/working-time/rules)
- `ServicesModule` — CRUD for services, scoped to authenticated user
- `ClientsModule` — CRUD for clients + aggregated stats (last appointment, bookings count)
- `AppointmentsModule` —
  - Provider-side: list/calendar view, cancel, mark completed
  - Public-side: `GET /public/:slug` (profile+services), `GET /public/:slug/availability?serviceId=&date=` (computed free slots), `POST /public/:slug/book` (create booking)
- `UploadsModule` — generates Cloudinary signed upload params (server-side signature) for avatar/cover image uploads
- `IcsModule` — generate `.ics` file for a given appointment

### Key endpoints

```
GET    /me
PATCH  /me/onboarding/stage1
PATCH  /me/onboarding/stage2
PATCH  /me/onboarding/stage3
PATCH  /me/onboarding/stage4

GET    /settings/profile
PATCH  /settings/profile
GET    /settings/display
PATCH  /settings/display
GET    /settings/working-hours
PUT    /settings/working-hours
GET    /settings/rules
PATCH  /settings/rules

GET    /services
POST   /services
GET    /services/:id
PATCH  /services/:id
DELETE /services/:id

GET    /clients
POST   /clients
GET    /clients/:id
PATCH  /clients/:id
DELETE /clients/:id

GET    /appointments            (calendar view, date range query)
PATCH  /appointments/:id/status
GET    /appointments/:id/ics

GET    /public/:slug
GET    /public/:slug/availability?serviceId&date
POST   /public/:slug/book
```

### Availability computation logic
1. Load provider WorkingHours for the requested weekday.
2. Load existing Appointments overlapping that day.
3. Generate candidate slots at `slotIntervalMinutes` steps between start/end.
4. Filter out slots that:
   - overlap an existing appointment (given service duration)
   - fall before `now + bookingCutoffHours`
   - fall beyond `now + bookingWindowDays`
5. Return available slot list to frontend.

---

## 6. Next.js App Structure (App Router)

```
apps/web/app/
├── (auth)/
│   ├── register/page.tsx
│   └── login/page.tsx
├── onboarding/
│   ├── stage-1/page.tsx
│   ├── stage-2/page.tsx
│   ├── stage-3/page.tsx
│   └── stage-4/page.tsx
├── admin/
│   ├── layout.tsx            # sidebar shell
│   ├── page.tsx               # "Your reservation page" preview link
│   ├── calendar/page.tsx
│   ├── settings/
│   │   ├── profile/page.tsx
│   │   ├── display/page.tsx
│   │   ├── working-time/page.tsx
│   │   └── rules/page.tsx
│   ├── services/
│   │   ├── page.tsx
│   │   └── new/page.tsx
│   │   └── [id]/page.tsx
│   └── clients/
│       ├── page.tsx
│       └── [id]/page.tsx
└── book/
    └── [slug]/
        ├── page.tsx            # profile card + services list
        ├── [serviceId]/page.tsx # calendar + time selection
        └── [serviceId]/checkout/page.tsx # details form + overview + confirm
```

### Admin Sidebar
- Top: "Your reservation page" (link out, styled distinctly)
- Calendar
- Settings (Profile / Display / Working time / Rules — nested nav)
- Services
- Clients
- Bottom: avatar + name, Logout

### Booking flow (public page) — client state machine
1. **Profile view**: banner + avatar (Twitter-style overlap) + name + description + social icons + service list
2. **Service selected**: service header (icon/name/length/company) + calendar (month/day picker left, time slots right) + Back/Continue
3. **Details form**: name, email, phone (country selector + number), notes
4. **Overview**: summary of service, time, price, contact info + Confirm button
5. **Confirmation**: success state + "Add to calendar" button triggering `.ics` download

---

## 7. Themes (Display settings)

Define 6 preset themes as Tailwind config tokens / CSS variable sets (e.g. `theme-obsidian`, `theme-forest`, `theme-midnight`, `theme-mono`, `theme-slate`, `theme-carbon`) — all dark-neutral bases with slight variation in surface tones, all pairing with the neon green accent. Store selection as enum on User, applied via a `data-theme` attribute + CSS variables at the root of the public booking page.

---

## 8. Shared Types Package

`packages/shared-types` exports:
- Enums: `Niche`, `Theme`, `DurationUnit`, `AppointmentStatus`
- DTOs: `OnboardingStage1Dto`, `ServiceDto`, `ClientDto`, `AppointmentDto`, `AvailabilitySlot`
- Used by both Nest (validation via `class-validator`) and Next (type-safe API client)

---

## 9. Build Phases

**Phase 0 — Scaffolding**
- pnpm workspace + Turborepo setup
- Next.js app w/ Tailwind, Inter + Instrument Serif via `next/font`
- NestJS app w/ TypeORM + Postgres connection, base modules
- Shared types package
- Docker Compose for local Postgres

**Phase 1 — Auth & Onboarding**
- Register/login/JWT
- Onboarding stages 1–4 (forms + persistence + Cloudinary image upload for stage 2)
- Redirect guard until onboarding complete

**Phase 2 — Admin Core**
- Sidebar layout
- Settings: Profile, Display (themes), Working time, Rules
- Services CRUD
- Clients CRUD + table with computed stats

**Phase 3 — Booking Engine**
- Working-hours → availability computation endpoint
- Calendar/day/time-slot picker UI
- Booking creation (guest → auto-create/match Client)
- Admin Calendar view of appointments

**Phase 4 — Public Booking Page**
- `/book/:slug` profile card + services
- Multi-step booking flow (service → time → details → overview → confirm)
- `.ics` generation + download button

**Phase 5 — Polish**
- 6 themes fully styled
- Responsive/mobile pass
- Empty states, loading states, validation errors
- Timezone/currency correctness pass per country

---

## 10. Confirmed Scope Decisions
- **Auth**: BetterAuth (email/password), session-based; NestJS API validates BetterAuth sessions.
- **Images**: Cloudinary for avatar/cover image storage and delivery.
- **Deployment**: Railway (both `apps/web` and `apps/api` + Postgres).
- **Payments**: not included — booking only, no payment collection in this version.
- **Notifications**: none in this version — only the generated `.ics` file on confirmation.
- **Accounts**: single-provider-per-account only (no multi-staff/team support).
- **Icons**: Lucide icon set for niche icons and service icons.
