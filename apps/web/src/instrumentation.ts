export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getMigrations } = await import('better-auth/db');
    const { auth } = await import('./lib/auth');
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
  }
}
