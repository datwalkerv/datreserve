export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
          <span className="font-sans text-sm font-black text-black">dr</span>
        </div>
        <span className="font-sans text-lg font-semibold text-text-primary">datreserve</span>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
