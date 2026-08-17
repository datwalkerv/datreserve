import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve better-auth from node_modules next to this script.
// Using file:// URL bypasses the package exports map restriction so we can
// reach the internal get-migration.mjs that isn't in the public exports.
const baDir = resolve(__dirname, 'node_modules/better-auth');
const { getMigrations } = await import(
  pathToFileURL(resolve(baDir, 'dist/db/get-migration.mjs')).href
);

const { betterAuth } = await import(
  pathToFileURL(resolve(baDir, 'dist/index.mjs')).href
);

import pkg from 'pg';
const { Pool } = pkg;

const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();
console.log('[migrate] better-auth migrations complete');
process.exit(0);
