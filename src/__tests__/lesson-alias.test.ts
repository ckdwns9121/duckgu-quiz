import { vi } from 'vitest';
import { router } from '../router';
import { startLesson } from '../services/lessonService';
import { lessonStore } from '../stores/lessonStore';

vi.mock('../router', () => ({ router: { push: vi.fn(), params: {}, route: null } }));

it('이전판 레슨 주소는 세션을 시작하기 전에 개정판 주소로 바꾼다', () => {
  const previous = lessonStore.getState();
  startLesson('saa-day-15-1');
  expect(router.push).toHaveBeenCalledWith('/lesson/saa-r2-day-15-1', { replace: true });
  expect(lessonStore.getState()).toBe(previous);
});
