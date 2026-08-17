import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baDir = resolve(__dirname, 'node_modules/better-auth');

// Bypass the exports map by using file:// URLs for internal better-auth modules
const { getMigrations } = await import(
  pathToFileURL(resolve(baDir, 'dist/db/get-migration.mjs')).href
);
const { betterAuth } = await import(
  pathToFileURL(resolve(baDir, 'dist/index.mjs')).href
);

// Resolve pg via CJS require from better-auth's location (ba depends on pg)
const { Pool } = createRequire(resolve(baDir, 'package.json'))('pg');

const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: { enabled: true },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
});

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();
console.log('[migrate] better-auth migrations complete');
process.exit(0);
