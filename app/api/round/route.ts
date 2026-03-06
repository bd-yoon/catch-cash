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
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // KST
  const roundId =
    now.toISOString().slice(0, 4) +
    now.toISOString().slice(5, 7) +
    now.toISOString().slice(8, 10) +
    now.toISOString().slice(11, 13);

  const nextHourMs =
    Math.ceil((Date.now()) / 3_600_000) * 3_600_000;
  const remainingSec = Math.floor((nextHourMs - Date.now()) / 1000);

  const { data: round } = await supabase
    .from('rounds')
    .select('id, winner_user_id, winner_nick, winner_attempts, points')
    .eq('id', roundId)
    .single();

  return NextResponse.json({
    roundId,
    remainingSec,
    hasWinner: !!round?.winner_user_id,
    winnerNick: round?.winner_nick ?? null,
    winnerAttempts: round?.winner_attempts ?? null,
    points: round?.points ?? 100,
  });
}
