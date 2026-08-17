export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { auth } = await import('./lib/auth');
    await auth.$migrate();
  }
}
