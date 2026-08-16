import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
        <span className="font-sans text-xl font-black text-black">dr</span>
      </div>
      <h1 className="mb-2 font-serif text-2xl text-text-primary">Page not found</h1>
      <p className="mb-8 text-sm text-text-secondary">This booking page doesn&apos;t exist or has been removed.</p>
      <Link href="/" className="text-sm text-accent hover:underline">Go home</Link>
    </div>
  );
}
