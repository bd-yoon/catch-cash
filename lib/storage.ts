const ls = () => (typeof window !== 'undefined' ? window.localStorage : null);

export const getItem = (key: string): string | null => ls()?.getItem(key) ?? null;
export const setItem = (key: string, value: string): void => { ls()?.setItem(key, value); };
export const removeItem = (key: string): void => { ls()?.removeItem(key); };

// 익명 유저 ID (UUID v4 간이 생성)
export const getUserId = (): string => {
  const existing = getItem('catch-cash-user-id');
  if (existing) return existing;
  const id = 'user-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  setItem('catch-cash-user-id', id);
  return id;
};
