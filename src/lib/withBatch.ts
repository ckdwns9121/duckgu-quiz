/** 같은 틱에 여러 번 불려도 마지막에 한 번만 실행한다 (스토어 여러 개가 동시에 바뀔 때 렌더를 한 번으로) */
export const withBatch = <T extends unknown[]>(fn: (...args: T) => void) => {
  let scheduled = false;
  return (...args: T) => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      fn(...args);
    });
  };
};
