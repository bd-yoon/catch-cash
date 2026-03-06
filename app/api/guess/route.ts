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

// 단어 유사도 데이터 캐시 (서버리스 인스턴스 재사용 시 유효)
const wordCache: Record<string, Record<string, number>> = {};

// 라운드 정보 캐시 (1시간마다 변경)
const roundCache: Record<string, { answer_word: string; winner_user_id: string | null; points: number; cachedAt: number }> = {};

function getCachedRound(roundId: string) {
  const cached = roundCache[roundId];
  if (cached && Date.now() - cached.cachedAt < 3_600_000) return cached;
  return null;
}

function normalize(s: string): string {
  return s.trim().normalize('NFC');
}

function getWordScore(answerWord: string, guessWord: string): number {
  const cleanGuess = normalize(guessWord);
  const cleanAnswer = normalize(answerWord);

  if (cleanGuess === cleanAnswer) return 100;

  if (!wordCache[cleanAnswer]) {
    try {
      const filePath = join(process.cwd(), 'data', 'words', `${cleanAnswer}.json`);
      const raw = readFileSync(filePath, 'utf-8');
      wordCache[cleanAnswer] = JSON.parse(raw);
    } catch {
      // 파일 없음 → 낮은 랜덤 점수 (0은 게임성 해침)
      return Math.floor(Math.random() * 10) + 1;
    }
  }

  const score = wordCache[cleanAnswer][cleanGuess];
  if (score === undefined) {
    // WORD_POOL에 없는 단어 → 낮은 랜덤 점수
    return Math.floor(Math.random() * 15) + 1;
  }
  return score;
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const word = (body.word as string)?.trim();
  const { roundId, userId, attemptCount } = body;

  if (!word || !roundId || !userId) {
    return NextResponse.json({ message: '필수 파라미터가 없어요' }, { status: 400 });
  }

  const oneMinAgo = new Date(Date.now() - 60_000).toISOString();

  // rate limit + round 정보 병렬 조회
  const cachedRound = getCachedRound(roundId);
  const [rateLimitResult, roundResult] = await Promise.all([
    supabase
      .from('guess_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('round_id', roundId)
      .gte('created_at', oneMinAgo),
    cachedRound
      ? Promise.resolve({ data: cachedRound, error: null })
      : supabase.from('rounds').select('answer_word, winner_user_id, points').eq('id', roundId).single(),
  ]);

  if ((rateLimitResult.count ?? 0) >= 30) {
    return NextResponse.json({ message: '너무 빠르게 시도하고 있어요' }, { status: 429 });
  }

  const round = roundResult.data as { answer_word: string; winner_user_id: string | null; points: number } | null;
  if (!round) {
    return NextResponse.json({ message: '라운드 정보를 찾을 수 없어요' }, { status: 404 });
  }

  // 캐시 저장 (위너 없을 때만)
  if (!round.winner_user_id && !cachedRound) {
    roundCache[roundId] = { ...round, cachedAt: Date.now() };
  }

  if (round.winner_user_id) {
    return NextResponse.json({ message: '이미 위너가 있어요', score: 0, isWinner: false });
  }

  const score = getWordScore(round.answer_word, word);
  const isWinner = score === 100;

  // guess_log 기록 (비동기 — 응답 지연 최소화를 위해 await하지 않고 fire-and-forget)
  const insertPromise = supabase.from('guess_log').insert({
    round_id: roundId,
    user_id: userId,
    word,
    score,
  });

  if (!isWinner) {
    await insertPromise;
    return NextResponse.json({ score, isWinner: false, points: 0 });
  }

  // 위너 처리 (삽입 완료 후)
  await insertPromise;

  // rounds 테이블 위너 업데이트 → Realtime으로 전파
  const winnerAttempts = typeof attemptCount === 'number' ? attemptCount : 1;

  // 캐시 무효화
  delete roundCache[roundId];

  await Promise.all([
    supabase.from('rounds').update({
      winner_user_id: userId,
      winner_nick: userId.slice(0, 8),
      winner_at: new Date().toISOString(),
      winner_attempts: winnerAttempts,
    }).eq('id', roundId),
    supabase.from('leaderboard').insert({
      round_id: roundId,
      user_id: userId,
      points: round.points ?? 100,
    }),
  ]);

  return NextResponse.json({ score: 100, isWinner: true, points: round.points ?? 100 });
}
