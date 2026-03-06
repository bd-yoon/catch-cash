export type ScoreColor = { bar: string; text: string; label: string };

export function getScoreColor(score: number): ScoreColor {
  if (score === 100) return { bar: '#FFD700', text: '#FFD700', label: '정답!' };
  if (score >= 91)  return { bar: '#E83D3D', text: '#E83D3D', label: '거의 다 왔어요!!' };
  if (score >= 61)  return { bar: '#FF8C42', text: '#FF8C42', label: '많이 가까워요!' };
  if (score >= 31)  return { bar: '#F5C842', text: '#F5C842', label: '조금 가까워요' };
  return              { bar: '#4A90E2', text: '#4A90E2', label: '멀었어요' };
}

export function getToastMessage(score: number): string | null {
  if (score >= 96) return '손에 닿을 것 같았는데...! 🤏';
  if (score >= 91) return '거의 다 왔어요! 조금만 더! 🔥';
  if (score >= 80) return '뜨거워지고 있어요 🔥';
  return null;
}
