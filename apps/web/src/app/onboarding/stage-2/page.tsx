'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function OnboardingStage2() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSkip() {
    setLoading(true);
    try {
      await api.patch('me/onboarding/stage2', { json: {} });
    } finally {
      setLoading(false);
    }
    router.push('/onboarding/stage-3');
  }

  function handleContinue() {
    router.push('/onboarding/stage-3');
  }

  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-medium text-accent">Step 2 of 4</span>
      </div>
      <h1 className="mb-1 font-serif text-2xl text-text-primary">Add your photos</h1>
      <p className="mb-8 text-sm text-text-secondary">A profile photo and cover make your page feel personal.</p>

      <div className="mb-6 space-y-4">
        <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface text-text-muted">
          <div className="text-center">
            <p className="text-sm">Cover photo</p>
            <p className="mt-1 text-xs text-text-muted">Cloudinary upload — coming soon</p>
          </div>
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border bg-surface text-text-muted">
          <span className="text-xs">Avatar</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSkip} disabled={loading}
          className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-text-secondary hover:border-accent hover:text-text-primary">
          Skip for now
        </button>
        <button onClick={handleContinue}
          className="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-black hover:bg-accent-hover">
          Continue
        </button>
      </div>
    </div>
  );
}
