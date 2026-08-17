import { readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// pg lives under node_modules/.pnpm/pg@<version>/node_modules/pg in the standalone output
const pnpmDir = resolve(__dirname, 'node_modules/.pnpm');
const pgEntry = readdirSync(pnpmDir).find(d => /^pg@\d/.test(d));
if (!pgEntry) throw new Error('Cannot find pg in ' + pnpmDir);
const { default: pg } = await import(
  pathToFileURL(resolve(pnpmDir, pgEntry, 'node_modules/pg/lib/index.js')).href
);
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS "user" (
    "id"             TEXT PRIMARY KEY,
    "name"           TEXT NOT NULL,
    "email"          TEXT NOT NULL UNIQUE,
    "emailVerified"  BOOLEAN NOT NULL DEFAULT false,
    "image"          TEXT,
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "session" (
    "id"          TEXT PRIMARY KEY,
    "expiresAt"   TIMESTAMPTZ NOT NULL,
    "token"       TEXT NOT NULL UNIQUE,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ipAddress"   TEXT,
    "userAgent"   TEXT,
    "userId"      TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "account" (
    "id"                     TEXT PRIMARY KEY,
    "accountId"              TEXT NOT NULL,
    "providerId"             TEXT NOT NULL,
    "userId"                 TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "accessToken"            TEXT,
    "refreshToken"           TEXT,
    "idToken"                TEXT,
    "accessTokenExpiresAt"   TIMESTAMPTZ,
    "refreshTokenExpiresAt"  TIMESTAMPTZ,
    "scope"                  TEXT,
    "password"               TEXT,
    "createdAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "verification" (
    "id"          TEXT PRIMARY KEY,
    "identifier"  TEXT NOT NULL,
    "value"       TEXT NOT NULL,
    "expiresAt"   TIMESTAMPTZ NOT NULL,
    "createdAt"   TIMESTAMPTZ,
    "updatedAt"   TIMESTAMPTZ
  );
`);

await client.end();
console.log('[migrate] better-auth tables ready');
process.exit(0);
