import { vi } from 'vitest';
import { createVNode, renderElement } from '../lib';
import { QuestionView } from '../components/QuestionView';
import { CARDS } from '../domain/content';
import { makeQuestion } from '../domain/question';
import { lessonReducer } from '../stores/lessonStore';

vi.mock('../components/Mascot', () => ({ Mascot: () => null }));
vi.mock('../services/lessonService', () => ({ usesTiles: () => true, pickTile: vi.fn(), unpickTile: vi.fn(), selectChoice: vi.fn(), setInputMode: vi.fn(), showHint: vi.fn(), typeAnswer: vi.fn(), check: vi.fn() }));

it('터치용 조각 화면에 대표 오답과 복습 규칙이 표시된다', () => {
  for (const [id, expected] of [['j1', 'A'], ['c6', '1']]) {
    const q = makeQuestion(CARDS.find(c => c.id === id)!, CARDS);
    const session = lessonReducer(null, { type: 'START', lessonId: null, queue: [q] })!;
    const root = document.createElement('div');
    renderElement(<QuestionView q={q} session={session} />, root);
    const tiles = [...root.querySelectorAll('.tile-bank button')].map(el => el.textContent);
    expect(tiles).toContain(expected);
    if (id === 'c6') expect(tiles.filter(t => t === '1')).toHaveLength(3);
    expect(root.textContent).toContain('힌트 없이 첫 시도');
  }
});

it('상황형 문제와 모든 선택지가 실제 컴포넌트에 표시된다', () => {
  const q = makeQuestion(CARDS.find(c => c.id === 'x-sym')!, CARDS);
  const session = lessonReducer(null, { type: 'START', lessonId: 'sec-4', queue: [q] })!;
  const root = document.createElement('div');
  renderElement(<QuestionView q={q} session={session} />, root);
  expect(root.textContent).toContain('동일한 비밀키');
  expect(root.querySelectorAll('.choice')).toHaveLength(4);
  expect(root.textContent).not.toContain('IDS');
});
