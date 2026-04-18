export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password, username, cargo, role } = body;

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
          cargo,
          role,
        },
      ]);

    if (profileError) {
      console.error(profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
