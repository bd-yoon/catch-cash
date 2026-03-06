/**
 * 단어 스케줄 시드 스크립트
 *
 * 사용법:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx ts-node scripts/seed-rounds.ts
 *
 * 또는 .env.local 로드:
 *   npx dotenv -e .env.local -- ts-node scripts/seed-rounds.ts
 *
 * 기능:
 *   - 오늘부터 N일치 라운드(24개/일)를 rounds 테이블에 upsert
 *   - 중복 실행 안전 (ON CONFLICT DO NOTHING)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ================================================================
// 정답 단어 풀 (꼬맨틀 스타일: 일상적인 한국어 명사)
// 실제 서비스 전 data/words/[word].json 유사도 파일 필수
// ================================================================
const WORD_POOL = [
  '사과', '바나나', '포도', '딸기', '수박', '복숭아', '망고', '레몬',
  '오렌지', '키위', '파인애플', '체리', '블루베리', '라즈베리', '멜론',
  '하늘', '구름', '바람', '비', '눈', '태양', '달', '별', '무지개',
  '바다', '산', '강', '숲', '꽃', '나무', '풀', '돌',
  '고양이', '강아지', '토끼', '곰', '사자', '호랑이', '코끼리', '기린',
  '행복', '사랑', '희망', '꿈', '자유', '평화', '용기', '지혜',
  '커피', '차', '물', '우유', '주스', '맥주', '와인', '콜라',
  '빵', '밥', '국수', '케이크', '피자', '햄버거', '초콜릿', '사탕',
  '책', '음악', '영화', '게임', '여행', '운동', '요리', '그림',
  '봄', '여름', '가을', '겨울', '아침', '점심', '저녁', '밤',
  '도시', '마을', '집', '학교', '회사', '병원', '공원', '시장',
  '자동차', '기차', '비행기', '배', '자전거', '버스', '지하철', '택시',
  '컴퓨터', '스마트폰', '카메라', '텔레비전', '냉장고', '세탁기', '에어컨', '시계',
  '빨간색', '파란색', '노란색', '초록색', '보라색', '주황색', '흰색', '검은색',
];

// ================================================================
// KST 기준 라운드 ID 생성 (YYYYMMDDHH)
// ================================================================
function getRoundId(date: Date, hour: number): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kst.toISOString().slice(0, 4);
  const mm   = kst.toISOString().slice(5, 7);
  const dd   = kst.toISOString().slice(8, 10);
  const hh   = String(hour).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}`;
}

// ================================================================
// 결정론적 단어 선택 (roundId → 단어 인덱스)
// 같은 roundId는 항상 같은 단어 → 서버 재시작해도 일관성 유지
// ================================================================
function pickWord(roundId: string): string {
  let hash = 0;
  for (let i = 0; i < roundId.length; i++) {
    hash = ((hash << 5) - hash + roundId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % WORD_POOL.length;
  return WORD_POOL[idx];
}

// ================================================================
// 메인 시드 실행
// ================================================================
async function seed(daysAhead = 7) {
  const rows: { id: string; answer_word: string; points: number }[] = [];

  const now = new Date();
  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);

    for (let h = 0; h < 24; h++) {
      const id = getRoundId(day, h);
      const answer_word = pickWord(id);
      // 포인트: 기본 100, 자정~새벽 프리미엄
      const points = h >= 0 && h < 6 ? 200 : 100;
      rows.push({ id, answer_word, points });
    }
  }

  console.log(`Seeding ${rows.length} rounds (${daysAhead} days × 24h)...`);

  // upsert (중복 실행 안전)
  const { error } = await supabase
    .from('rounds')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log('✓ Seed complete');

  // 확인: 오늘 라운드 샘플 출력
  const today = getRoundId(new Date(), new Date(Date.now() + 9*3600*1000).getUTCHours());
  const { data } = await supabase
    .from('rounds')
    .select('id, answer_word, points')
    .eq('id', today)
    .single();
  console.log('Current round:', data);
}

seed(7).catch(console.error);
