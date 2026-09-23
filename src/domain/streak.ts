export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const previousDayKey = (d: Date = new Date()) => {
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  return dayKey(prev);
};

/** 오늘 처음 레슨을 끝냈을 때 새 스트릭. 어제도 했으면 +1, 하루라도 비었으면 1부터 */
export function nextStreak(streak: number, lastDay: string | null, now: Date = new Date()): number {
  if (lastDay === dayKey(now)) return streak;
  return (lastDay === previousDayKey(now) ? streak : 0) + 1;
}

/** 화면에 보여 줄 스트릭. 어제까지 이어졌으면 오늘 아직 안 했어도 유지, 그보다 오래됐으면 0 */
export function visibleStreak(streak: number, lastDay: string | null, now: Date = new Date()): number {
  return lastDay === dayKey(now) || lastDay === previousDayKey(now) ? streak : 0;
}

/** 레슨 보상: 기본 10, 한 번도 안 틀리면 +5, 처음 깬 레슨이면 +5 */
export function lessonXp({ mistakes, firstClear }: { mistakes: number; firstClear: boolean }): number {
  return 10 + (mistakes === 0 ? 5 : 0) + (firstClear ? 5 : 0);
}
