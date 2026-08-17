export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { auth } = await import('./lib/auth');
    // @ts-ignore – getMigrations is not in the public type exports but exists at runtime
    const { getMigrations } = await import('better-auth/dist/db/get-migration.mjs');
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
  }
}
