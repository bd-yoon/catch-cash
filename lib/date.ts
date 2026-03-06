// KST = UTC+9
export const getKSTDate = (): Date =>
  new Date(Date.now() + 9 * 60 * 60 * 1000);

export const getKSTDateStr = (): string =>
  getKSTDate().toISOString().slice(0, 10);

// 현재 라운드 ID: YYYYMMDDHH (KST 기준)
export const getCurrentRoundId = (): string => {
  const kst = getKSTDate();
  const yyyy = kst.toISOString().slice(0, 4);
  const mm   = kst.toISOString().slice(5, 7);
  const dd   = kst.toISOString().slice(8, 10);
  const hh   = kst.toISOString().slice(11, 13);
  return `${yyyy}${mm}${dd}${hh}`;
};

// 다음 정각까지 남은 밀리초
export const getMsUntilNextHour = (): number => {
  const now = Date.now();
  const nextHour = Math.ceil(now / 3_600_000) * 3_600_000;
  return nextHour - now;
};

// MM:SS 포맷
export const formatMMSS = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
