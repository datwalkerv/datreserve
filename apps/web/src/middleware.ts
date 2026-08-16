import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/book') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // BetterAuth sets a session cookie; check its presence for quick guard.
  // Full session verification happens in protected server components/routes.
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token');

  const isAuthed = Boolean(sessionCookie?.value);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (!isAuthed && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthed && pathname.startsWith('/admin')) {
    const onboardingStage = request.cookies.get('onboarding_stage')?.value;
    if (onboardingStage !== 'complete') {
      return NextResponse.redirect(new URL('/onboarding/stage-1', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
