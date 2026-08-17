import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const isProd = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  advanced: {
    // Allow the session cookie to be sent to the API on a different subdomain.
    // SameSite=None + Secure is required for cross-origin credentialed requests.
    defaultCookieAttributes: isProd
      ? { sameSite: 'none', secure: true }
      : {},
    // Railway terminates TLS via a proxy and forwards the real client IP here.
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for'],
      trustedProxies: ['0.0.0.0/0'],
    },
  },
});

export type Session = typeof auth.$Infer.Session;
