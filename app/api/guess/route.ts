import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

// 단어 유사도 데이터 캐시
const wordCache: Record<string, Record<string, number>> = {};

function getWordScore(answerWord: string, guessWord: string): number {
  if (guessWord === answerWord) return 100;

  if (!wordCache[answerWord]) {
    try {
      const filePath = join(process.cwd(), 'data', 'words', `${answerWord}.json`);
      const raw = readFileSync(filePath, 'utf-8');
      wordCache[answerWord] = JSON.parse(raw);
    } catch {
      return 0;
    }
  }

  return wordCache[answerWord][guessWord] ?? 0;
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { word, roundId, userId } = await req.json();

  if (!word || !roundId || !userId) {
    return NextResponse.json({ message: '필수 파라미터가 없어요' }, { status: 400 });
  }

  // Rate limit: 1분에 30회
  const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase
    .from('guess_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('round_id', roundId)
    .gte('created_at', oneMinAgo);

  if ((count ?? 0) >= 30) {
    return NextResponse.json({ message: '너무 빠르게 시도하고 있어요' }, { status: 429 });
  }

  // 현재 라운드 정답 조회
  const { data: round } = await supabase
    .from('rounds')
    .select('answer_word, winner_user_id, points')
    .eq('id', roundId)
    .single();

  if (!round) {
    return NextResponse.json({ message: '라운드 정보를 찾을 수 없어요' }, { status: 404 });
  }

  if (round.winner_user_id) {
    return NextResponse.json({ message: '이미 위너가 있어요', score: 0, isWinner: false });
  }

  const score = getWordScore(round.answer_word, word);
  const isWinner = score === 100;

  // guess_log 기록
  await supabase.from('guess_log').insert({
    round_id: roundId,
    user_id: userId,
    word,
    score,
  });

  if (isWinner) {
    // rounds 테이블 위너 업데이트 → Realtime으로 전파
    const attempts = await supabase
      .from('guess_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('round_id', roundId);

    await supabase.from('rounds').update({
      winner_user_id: userId,
      winner_nick: userId.slice(0, 8), // 익명 닉네임
      winner_at: new Date().toISOString(),
      winner_attempts: attempts.count ?? 1,
    }).eq('id', roundId);

    // leaderboard 기록
    await supabase.from('leaderboard').insert({
      round_id: roundId,
      user_id: userId,
      points: round.points ?? 100,
    });
  }

  return NextResponse.json({ score, isWinner, points: isWinner ? round.points : 0 });
}
