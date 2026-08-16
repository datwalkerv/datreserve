'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Scissors, Sparkles, Briefcase, Hand, Dumbbell, Stethoscope,
  Camera, Palette, Wrench, Car, Utensils, Music, Flower2,
  Shirt, Dog, Laptop, GraduationCap, Home, Bike, HeartPulse,
} from 'lucide-react';

const ICONS: { key: string; label: string; icon: React.ElementType }[] = [
  { key: 'Scissors',      label: 'Barber / Hair',     icon: Scissors      },
  { key: 'Sparkles',      label: 'Nail Artist',        icon: Sparkles      },
  { key: 'Briefcase',     label: 'Consultant',         icon: Briefcase     },
  { key: 'Hand',          label: 'Massage',            icon: Hand          },
  { key: 'Dumbbell',      label: 'Personal Trainer',   icon: Dumbbell      },
  { key: 'Stethoscope',   label: 'Healthcare',         icon: Stethoscope   },
  { key: 'Camera',        label: 'Photographer',       icon: Camera        },
  { key: 'Palette',       label: 'Artist / Designer',  icon: Palette       },
  { key: 'Wrench',        label: 'Repair / Tech',      icon: Wrench        },
  { key: 'Car',           label: 'Auto Services',      icon: Car           },
  { key: 'Utensils',      label: 'Chef / Catering',    icon: Utensils      },
  { key: 'Music',         label: 'Music / DJ',         icon: Music         },
  { key: 'Flower2',       label: 'Florist / Spa',      icon: Flower2       },
  { key: 'Shirt',         label: 'Tailor / Fashion',   icon: Shirt         },
  { key: 'Dog',           label: 'Pet Services',       icon: Dog           },
  { key: 'Laptop',        label: 'IT / Software',      icon: Laptop        },
  { key: 'GraduationCap', label: 'Tutor / Coach',      icon: GraduationCap },
  { key: 'Home',          label: 'Home Services',      icon: Home          },
  { key: 'Bike',          label: 'Sports / Cycling',   icon: Bike          },
  { key: 'HeartPulse',    label: 'Wellness',           icon: HeartPulse    },
];

const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', HU: 'HUF', RO: 'RON',
  PL: 'PLN', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', FI: 'EUR', PT: 'EUR',
  GR: 'EUR', CZ: 'CZK', SK: 'EUR', HR: 'EUR', RS: 'RSD', UA: 'UAH',
  TR: 'TRY', CA: 'CAD', AU: 'AUD', NZ: 'NZD', AE: 'AED', SG: 'SGD',
};

const COUNTRIES: { code: string; name: string; prefix: string }[] = [
  { code: 'US', name: 'United States',   prefix: '+1'   },
  { code: 'GB', name: 'United Kingdom',  prefix: '+44'  },
  { code: 'DE', name: 'Germany',         prefix: '+49'  },
  { code: 'FR', name: 'France',          prefix: '+33'  },
  { code: 'HU', name: 'Hungary',         prefix: '+36'  },
  { code: 'RO', name: 'Romania',         prefix: '+40'  },
  { code: 'PL', name: 'Poland',          prefix: '+48'  },
  { code: 'IT', name: 'Italy',           prefix: '+39'  },
  { code: 'ES', name: 'Spain',           prefix: '+34'  },
  { code: 'NL', name: 'Netherlands',     prefix: '+31'  },
  { code: 'BE', name: 'Belgium',         prefix: '+32'  },
  { code: 'AT', name: 'Austria',         prefix: '+43'  },
  { code: 'CH', name: 'Switzerland',     prefix: '+41'  },
  { code: 'SE', name: 'Sweden',          prefix: '+46'  },
  { code: 'NO', name: 'Norway',          prefix: '+47'  },
  { code: 'DK', name: 'Denmark',         prefix: '+45'  },
  { code: 'FI', name: 'Finland',         prefix: '+358' },
  { code: 'PT', name: 'Portugal',        prefix: '+351' },
  { code: 'GR', name: 'Greece',          prefix: '+30'  },
  { code: 'CZ', name: 'Czech Republic',  prefix: '+420' },
  { code: 'SK', name: 'Slovakia',        prefix: '+421' },
  { code: 'HR', name: 'Croatia',         prefix: '+385' },
  { code: 'RS', name: 'Serbia',          prefix: '+381' },
  { code: 'UA', name: 'Ukraine',         prefix: '+380' },
  { code: 'TR', name: 'Turkey',          prefix: '+90'  },
  { code: 'CA', name: 'Canada',          prefix: '+1'   },
  { code: 'AU', name: 'Australia',       prefix: '+61'  },
  { code: 'NZ', name: 'New Zealand',     prefix: '+64'  },
  { code: 'AE', name: 'UAE',             prefix: '+971' },
  { code: 'SG', name: 'Singapore',       prefix: '+65'  },
];

export default function OnboardingStage1() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', companyName: '',
    slug: '', country: '', phonePrefix: '', phoneLocal: '', niche: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleCountryChange(code: string) {
    const country = COUNTRIES.find(c => c.code === code);
    setForm(f => ({ ...f, country: code, phonePrefix: country?.prefix ?? '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const phoneNumber = form.phonePrefix
        ? `${form.phonePrefix}${form.phoneLocal}`
        : form.phoneLocal;
      await api.patch('me/onboarding/stage1', {
        json: {
          firstName: form.firstName,
          lastName: form.lastName,
          companyName: form.companyName,
          slug: form.slug,
          country: form.country,
          currency: COUNTRY_CURRENCY[form.country] ?? '',
          phoneNumber,
          niche: form.niche,
        },
      });
      router.push('/onboarding/stage-2');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium text-accent">Step 1 of 4</span>
        </div>
        <h1 className="mb-1 font-serif text-2xl text-text-primary">Tell us about yourself</h1>
        <p className="mb-8 text-sm text-text-secondary">This info powers your public booking page.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">First name</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} required
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Last name</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} required
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Business name (optional)</label>
            <input value={form.companyName} onChange={e => set('companyName', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Your booking URL</label>
            <div className="flex items-center rounded-lg border border-border bg-surface">
              <span className="border-r border-border px-3 py-3 text-sm text-text-muted">datreserve.com/book/</span>
              <input value={form.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required placeholder="your-name"
                className="flex-1 bg-transparent px-3 py-3 text-sm text-text-primary outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Select an icon that represents your job</label>
            <select value={form.niche} onChange={e => set('niche', e.target.value)} required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent">
              <option value="">Choose a service type…</option>
              {ICONS.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Country</label>
            <select value={form.country} onChange={e => handleCountryChange(e.target.value)} required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent">
              <option value="">Select your country</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Phone number</label>
            <div className="flex items-center rounded-lg border border-border bg-surface">
              {form.phonePrefix && (
                <span className="border-r border-border px-3 py-3 text-sm text-text-muted">{form.phonePrefix}</span>
              )}
              <input
                value={form.phoneLocal}
                onChange={e => set('phoneLocal', e.target.value)}
                required
                placeholder={form.phonePrefix ? '555 000 0000' : 'Select a country first'}
                disabled={!form.country}
                className="flex-1 bg-transparent px-3 py-3 text-sm text-text-primary outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-60">
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
  );
}
