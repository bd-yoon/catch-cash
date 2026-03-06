export type ScoreColor = { bar: string; text: string; label: string };

export function getScoreColor(score: number): ScoreColor {
  if (score === 100) return { bar: '#FFD700', text: '#FFD700', label: '정답! 황금 획득!' };
  if (score >= 91)  return { bar: '#FF2D2D', text: '#FF2D2D', label: '거의 다 왔어요!!' };
  if (score >= 61)  return { bar: '#FF6B1A', text: '#FF6B1A', label: '뜨거워지고 있어요!' };
  if (score >= 31)  return { bar: '#FFD700', text: '#FFD700', label: '조금 가까워요' };
  return              { bar: '#6BBFFF', text: '#6BBFFF', label: '아직 멀었어요' };
}

export function getToastMessage(score: number): string | null {
  if (score >= 96) return '손에 닿을 것 같은데...! 🤏';
  if (score >= 91) return '거의 다 왔어요! 조금만 더! 🔥';
  if (score >= 80) return '뜨거워지고 있어요 🔥';
  return null;
}
