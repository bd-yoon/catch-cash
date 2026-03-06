/**
 * 개발용 Mock 유사도 데이터 생성 스크립트
 * FastText 없이 로컬 테스트 가능하도록 임시 데이터 생성
 *
 * 사용법:
 *   npx ts-node scripts/generate-mock-similarity.ts
 *
 * 출력:
 *   data/words/{단어}.json — 랜덤 유사도 점수 (실제 의미 없음, 개발 전용)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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

// 카테고리별 그룹 (같은 그룹 내 단어는 높은 유사도)
const GROUPS: string[][] = [
  ['사과', '바나나', '포도', '딸기', '수박', '복숭아', '망고', '레몬', '오렌지', '키위', '파인애플', '체리', '블루베리', '라즈베리', '멜론'],
  ['하늘', '구름', '바람', '비', '눈', '태양', '달', '별', '무지개'],
  ['바다', '산', '강', '숲', '꽃', '나무', '풀', '돌'],
  ['고양이', '강아지', '토끼', '곰', '사자', '호랑이', '코끼리', '기린'],
  ['행복', '사랑', '희망', '꿈', '자유', '평화', '용기', '지혜'],
  ['커피', '차', '물', '우유', '주스', '맥주', '와인', '콜라'],
  ['빵', '밥', '국수', '케이크', '피자', '햄버거', '초콜릿', '사탕'],
  ['책', '음악', '영화', '게임', '여행', '운동', '요리', '그림'],
  ['봄', '여름', '가을', '겨울', '아침', '점심', '저녁', '밤'],
  ['도시', '마을', '집', '학교', '회사', '병원', '공원', '시장'],
  ['자동차', '기차', '비행기', '배', '자전거', '버스', '지하철', '택시'],
  ['컴퓨터', '스마트폰', '카메라', '텔레비전', '냉장고', '세탁기', '에어컨', '시계'],
  ['빨간색', '파란색', '노란색', '초록색', '보라색', '주황색', '흰색', '검은색'],
];

function getGroup(word: string): number {
  return GROUPS.findIndex(g => g.includes(word));
}

function mockScore(answerWord: string, guessWord: string): number {
  if (answerWord === guessWord) return 100;
  const ag = getGroup(answerWord);
  const gg = getGroup(guessWord);
  if (ag !== -1 && ag === gg) {
    // 같은 카테고리: 60-95 랜덤
    return 60 + Math.floor(Math.random() * 36);
  }
  // 다른 카테고리: 1-40 랜덤
  return 1 + Math.floor(Math.random() * 40);
}

const outdir = join(process.cwd(), 'data', 'words');
mkdirSync(outdir, { recursive: true });

for (const answer of WORD_POOL) {
  const scores: Record<string, number> = {};
  for (const other of WORD_POOL) {
    if (other === answer) continue;
    scores[other] = mockScore(answer, other);
  }
  const path = join(outdir, `${answer}.json`);
  writeFileSync(path, JSON.stringify(scores, null, 0), 'utf-8');
  console.log(`✓ ${answer}.json`);
}

console.log(`\nMock similarity data written to ${outdir}/`);
console.log('NOTE: 이 데이터는 개발 전용입니다. 실제 서비스에는 FastText 기반 데이터를 사용하세요.');
