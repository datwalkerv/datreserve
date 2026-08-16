'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Upload, User, ImageIcon } from 'lucide-react';

type UploadSign = {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
};

async function uploadToCloudinary(file: File, sign: UploadSign): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('signature', sign.signature);
  form.append('timestamp', String(sign.timestamp));
  form.append('api_key', sign.apiKey);
  form.append('folder', sign.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: 'POST', body: form },
  );
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return data.secure_url as string;
}

export default function OnboardingStage2() {
  const router = useRouter();
  const [avatarFile, setAvatarFile]     = useState<File | null>(null);
  const [coverFile, setCoverFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef  = useRef<HTMLInputElement>(null);

  function pickFile(file: File, type: 'avatar' | 'cover') {
    const url = URL.createObjectURL(file);
    if (type === 'avatar') { setAvatarFile(file); setAvatarPreview(url); }
    else                    { setCoverFile(file);  setCoverPreview(url);  }
  }

  async function handleContinue() {
    setLoading(true);
    setError('');
    try {
      let avatarUrl = '';
      let coverImageUrl = '';

      if (avatarFile || coverFile) {
        const sign: UploadSign = await api.post('uploads/sign').json();
        if (avatarFile) avatarUrl     = await uploadToCloudinary(avatarFile, sign);
        if (coverFile)  coverImageUrl = await uploadToCloudinary(coverFile,  sign);
      }

      await api.patch('me/onboarding/stage2', { json: { avatarUrl, coverImageUrl } });
      router.push('/onboarding/stage-3');
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    setLoading(true);
    try {
      await api.patch('me/onboarding/stage2', { json: {} });
      router.push('/onboarding/stage-3');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-medium text-accent">Step 2 of 4</span>
      </div>
      <h1 className="mb-1 font-serif text-2xl text-text-primary">Add your photos</h1>
      <p className="mb-8 text-sm text-text-secondary">A profile photo and cover make your page feel personal.</p>

      <div className="mb-6 space-y-4">
        {/* Cover photo */}
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Cover photo</label>
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface transition-colors hover:border-accent/50"
          >
            {coverPreview
              ? <img src={coverPreview} alt="cover" className="h-full w-full object-cover" />
              : <div className="flex flex-col items-center gap-2 text-text-muted">
                  <ImageIcon size={24} />
                  <span className="text-sm">Click to upload cover</span>
                </div>
            }
            {coverPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                <Upload size={20} className="text-white" />
              </div>
            )}
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && pickFile(e.target.files[0], 'cover')} />
        </div>

        {/* Avatar */}
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Profile photo</label>
          <button
            type="button"
            onClick={() => avatarRef.current?.click()}
            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-surface transition-colors hover:border-accent/50"
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
              : <div className="flex flex-col items-center gap-1 text-text-muted">
                  <User size={20} />
                  <span className="text-[10px]">Upload</span>
                </div>
            }
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && pickFile(e.target.files[0], 'avatar')} />
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleSkip} disabled={loading}
          className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-text-secondary hover:border-accent hover:text-text-primary disabled:opacity-60">
          Skip for now
        </button>
        <button onClick={handleContinue} disabled={loading}
          className="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60">
          {loading ? 'Uploading…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
