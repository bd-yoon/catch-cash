import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function GET() {
  const supabase = getSupabase();
  // 오늘(KST) 라운드 ID 패턴
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayPrefix =
    kst.toISOString().slice(0, 4) +
    kst.toISOString().slice(5, 7) +
    kst.toISOString().slice(8, 10);

  const { data, error } = await supabase
    .from('leaderboard')
    .select('round_id, user_id, points, created_at')
    .like('round_id', `${todayPrefix}%`)
    .order('created_at', { ascending: true })
    .limit(24);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leaderboard: data ?? [] });
}
