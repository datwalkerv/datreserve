export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm'
    ? { box: 'h-6 w-6', text: 'text-xs', label: 'text-sm' }
    : { box: 'h-8 w-8', text: 'text-sm', label: 'text-base' };
  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${s.box} items-center justify-center rounded-md bg-accent`}>
        <span className={`font-sans ${s.text} font-black text-black`}>dr</span>
      </div>
      <span className={`font-sans ${s.label} font-semibold text-text-primary`}>datreserve</span>
    </div>
  );
}
