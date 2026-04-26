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

  const { data: { user } } = await supabase.auth.getUser();

  // Não logado → login
  if (!user) {
    if (!request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Busca role do perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role;
  const path = request.nextUrl.pathname;

  // Colaborador tentando acessar /dashboard → redireciona
  if (role === 'colaborador' && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/colaborador', request.url));
  }

  // Admin tentando acessar /colaborador → redireciona
  if (role === 'admin' && path.startsWith('/colaborador')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/colaborador/:path*'],
};