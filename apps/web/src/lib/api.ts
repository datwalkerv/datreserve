import ky from 'ky';

let _tokenPromise: Promise<string | null> | null = null;

function getSessionToken(): Promise<string | null> {
  if (!_tokenPromise) {
    _tokenPromise = fetch('/api/session-token')
      .then(r => r.ok ? r.json() : { token: null })
      .then(d => d.token as string | null)
      .catch(() => null);
  }
  return _tokenPromise;
}

export function clearSessionToken() {
  _tokenPromise = null;
}

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  hooks: {
    beforeRequest: [
      async request => {
        const token = await getSessionToken();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
  },
});
