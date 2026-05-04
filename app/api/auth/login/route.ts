import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[LOGIN API] 1. Requisição recebida');
    
    const { email, password } = await request.json()
    console.log('[LOGIN API] 2. Email recebido:', email);

    if (!email || !password) {
      console.log('[LOGIN API] 3. Validação falhou');
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    console.log('[LOGIN API] 4. Cookie store obtido');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions)
            )
          },
        },
      }
    )
    console.log('[LOGIN API] 5. Supabase client criado');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('[LOGIN API] 6. Sign in respondido', { error: error?.message, userId: data?.user?.id });

    if (error) {
      console.error('[LOGIN API] 7. Erro de autenticação:', error)
      return NextResponse.json(
        { error: error.message || 'Erro ao autenticar' },
        { status: 400 }
      )
    }

    if (!data.user) {
      console.log('[LOGIN API] 8. User não encontrado');
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 400 }
      )
    }

    console.log('[LOGIN API] 9. Buscando profile para user:', data.user.id);

    // Fetch user role from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    console.log('[LOGIN API] 10. Profile data:', { profileData, error: profileError?.message });

    if (profileError) {
      console.error('[LOGIN API] 11. Erro ao buscar perfil:', profileError)
      return NextResponse.json(
        { error: 'Erro ao buscar dados do usuário' },
        { status: 400 }
      )
    }

    if (!profileData) {
      console.log('[LOGIN API] 12. Profile data vazio');
      return NextResponse.json(
        { error: 'Perfil do usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log('[LOGIN API] 13. Login bem-sucedido, retornando resposta');

    const response = NextResponse.json(
      {
        success: true,
        role: profileData.role,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      { status: 200 }
    )

    return response
  } catch (error) {
    console.error('[LOGIN API] ERRO:', error)
    return NextResponse.json(
      { error: 'Erro interno ao fazer login' },
      { status: 500 }
    )
  }
}
