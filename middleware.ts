import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set(name, value, options as CookieOptions);
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