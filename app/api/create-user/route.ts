export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Roles permitidas no sistema
const VALID_ROLES = ['admin', 'colaborador'] as const;
type ValidRole = typeof VALID_ROLES[number];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password, username, cargo, role, avatar_url } = body;

    // Validar role
    if (!role || !VALID_ROLES.includes(role as ValidRole)) {
      return NextResponse.json(
        { error: `Role inválida. Use: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar campos obrigatórios
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, senha e nome de usuário são obrigatórios' },
        { status: 400 }
      );
    }

    const { data: userData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error(authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const user = userData.user;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          username,
          email,
          cargo: cargo || null,
          role: role as ValidRole,
          avatar_url: avatar_url || null,
        },
      ]);

    if (profileError) {
      console.error(profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Erro interno ao criar usuário' },
      { status: 500 }
    );
  }
}
