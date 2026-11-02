/** 아침 알림과 앱이 같은 한국 날짜의 같은 레슨을 가리킨다. */
export const koreanDate = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

export function dailyLessonIndex(date: string, count: number): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) || count < 1) throw new Error('Invalid daily lesson');
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000) % count;
}
