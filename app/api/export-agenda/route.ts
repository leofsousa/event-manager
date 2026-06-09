import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';

// Supabase client (service_role) – uses env vars defined in .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/export-agenda?month=YYYY-MM
 * Returns an XLSX file with events for the requested month.
 * Only users with role "admin" are allowed.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get('month');
  if (!monthParam) {
    return NextResponse.json({ error: 'Missing month param (YYYY-MM)' }, { status: 400 });
  }

  // ---- Authenticate user (use JWT from cookies) ----
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  // Verify admin role – we assume a "role" column in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
  }

  // Calculate start/end of month
  const [year, month] = monthParam.split('-');
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(parseInt(year), parseInt(month), 0) // last day of month
    .toISOString()
    .slice(0, 10);

  // Fetch events for the month (including channel name)
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select(`
      nome, tipo, data, local, observacoes, hora_inicio, hora_fim, channel_id, channels ( nome )
    `)
    .gte('data', startDate)
    .lte('data', endDate);

  if (eventsError) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }

  // Build workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Agenda');

  // Header row (exclude id, created_by)
  sheet.columns = [
    { header: 'Nome', key: 'nome', width: 30 },
    { header: 'Tipo', key: 'tipo', width: 20 },
    { header: 'Data', key: 'data', width: 12 },
    { header: 'Local', key: 'local', width: 20 },
    { header: 'Observações', key: 'observacoes', width: 30 },
    { header: 'Hora Início', key: 'hora_inicio', width: 12 },
    { header: 'Hora Fim', key: 'hora_fim', width: 12 },
    { header: 'Canal', key: 'canal', width: 20 },
  ];

  // Populate rows
  events?.forEach((ev: any) => {
    sheet.addRow({
      nome: ev.nome,
      tipo: ev.tipo,
      data: ev.data,
      local: ev.local,
      observacoes: ev.observacoes,
      hora_inicio: ev.hora_inicio,
      hora_fim: ev.hora_fim,
      canal: ev.channels?.nome ?? '',
    });
  });

  // Prepare buffer
  const buffer = await workbook.xlsx.writeBuffer();

  const filename = `agenda-${monthParam}.xlsx`;
  const headers = new Headers();
  headers.set('Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);

  return new Response(buffer, { status: 200, headers });
}
