import { createClient } from '@/lib/supabase-server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId, password } = await req.json();

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'Faltam dados obrigatórios (userId, password)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // 1. Obter o cliente do usuário logado e verificar se é admin
    const clientSupabase = await createClient();
    const { data: { user }, error: userError } = await clientSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await clientSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem redefinir senhas.' },
        { status: 403 }
      );
    }

    // 2. Inicializar o cliente com a SERVICE_ROLE para alterar a senha
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: resetError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { password }
    );

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir a senha' },
      { status: 500 }
    );
  }
}
