import { Suspense } from 'react';
import CheckoutContent from './CheckoutContent';

export default function CheckoutPage({ params }: { params: { slug: string; serviceId: string } }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-text-muted text-sm">Loading…</div>}>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
