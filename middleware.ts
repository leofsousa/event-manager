import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  console.log('>>> MIDDLEWARE PATH:', request.nextUrl.pathname);
  console.log('>>> USER:', user?.id ?? 'null');
  console.log('>>> USER ERROR:', userError?.message ?? 'none');

  if (!user) {
    if (!request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('>>> PROFILE:', profile);
  console.log('>>> PROFILE ERROR:', profileError?.message ?? 'none');

  const role = profile?.role;
  const path = request.nextUrl.pathname;

  if (role === 'colaborador' && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/colaborador', request.url));
  }

  if (role === 'admin' && path.startsWith('/colaborador')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/colaborador/:path*'],
};