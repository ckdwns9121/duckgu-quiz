/**
 * 렌더가 끝난 뒤 실행할 일을 모아 둔다 (포커스 주기, 스크롤, 폭죽 같은 DOM 작업).
 * 컴포넌트는 렌더 중에 등록만 하고, render()가 DOM 반영을 마친 뒤 한 번에 실행한다.
 */
const queue: Array<() => void> = [];

export const afterRender = (fn: () => void) => {
  queue.push(fn);
};

export const flushAfterRender = () => {
  const jobs = queue.splice(0);
  jobs.forEach((job) => job());
};
