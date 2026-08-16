import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
          <span className="font-sans text-xl font-black text-black">dr</span>
        </div>
        <span className="font-sans text-2xl font-semibold text-text-primary">datreserve</span>
      </div>
      <h1 className="mb-4 max-w-sm text-center font-serif text-4xl leading-tight text-text-primary">
        Your booking page, simplified.
      </h1>
      <p className="mb-10 max-w-sm text-center text-sm leading-relaxed text-text-secondary">
        Share a single link. Let clients book your time — no accounts, no friction.
      </p>
      <div className="flex gap-3">
        <Link href="/register"
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover">
          Get started free
        </Link>
        <Link href="/login"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent hover:text-text-primary">
          Sign in
        </Link>
      </div>
    </main>
  );
}
