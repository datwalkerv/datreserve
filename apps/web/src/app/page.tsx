export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <span className="font-sans text-lg font-black text-black">dr</span>
        </div>
        <span className="font-sans text-xl font-semibold text-text-primary">datreserve</span>
      </div>
      <p className="mt-4 text-text-secondary">Your booking page, simplified.</p>
    </main>
  );
}
