<div align="center">

<img src="apps/web/public/favicon.svg" width="10%" alt="datreserve" style="border-radius: 20%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);" />

# datreserve

**Your booking page, simplified.**

Let clients book your time — no back-and-forth, no friction.

</div>

## ✨ Key Features

- **📅 Weekly Calendar Dashboard**: Visual week-view admin calendar overlaying your working hours with live appointment blocks and status indicators.
- **🌐 Public Booking Pages**: Shareable, slug-based profile pages with avatar, cover image, bio, social links, and a full service catalogue.
- **⏰ Timezone-Aware Scheduling**: Slot availability calculated in the provider's local timezone using IANA rules — no offset surprises for international clients.
- **🛠️ Service Management**: Create and configure services with custom pricing, currency, duration, location, and description.
- **👥 Client Management**: Built-in client directory with per-client detail pages and appointment history.
- **📋 3-Step Checkout Flow**: Guided booking experience — details → review → confirmed — with validated inputs on both client and server.
- **🎟️ iCal Export**: Confirmed bookings generate a downloadable `.ics` file so clients can add them to any calendar app.
- **🎨 6 Built-in Themes**: Live-preview theme switcher with Obsidian, Forest, Midnight, Mono, Slate, and Carbon palettes applied instantly across the admin panel and public page.
- **⚙️ Booking Rules**: Configurable booking window (how far ahead clients can book) and cutoff (minimum notice required).
- **🔒 Secure Authentication**: Email/password auth via better-auth with cross-domain Bearer token strategy for Railway-hosted deployments.
- **🧙 Guided Onboarding**: 4-stage setup wizard — niche selection from 20+ categories, country & currency, profile details, and working hours.

## 🛠️ Technology Stack

**Frontend**
- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/) with standalone output
- **Runtime**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS-level custom theme tokens
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [ky](https://github.com/sindresorhus/ky)
- **Auth Client**: [better-auth](https://better-auth.dev/)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) (Body) & [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (Headings)

**Backend**
- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Validation**: [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer)

**Infrastructure**
- **Monorepo**: [pnpm](https://pnpm.io/) workspaces + [Turborepo](https://turbo.build/)
- **Shared Types**: `@datreserve/shared-types` internal package
- **Deployment**: [Railway](https://railway.app/) via multi-stage Dockerfiles

**Made with focus for freelancers. ⚡**  
*Built to get out of the way and let you do your work.*
