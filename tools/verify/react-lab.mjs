import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><div id="root"></div>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document, navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, MouseEvent: dom.window.MouseEvent, Event: dom.window.Event });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { act, useState, useEffect, useLayoutEffect, useRef, useMemo, memo, createContext, useContext, StrictMode, Component } = React;
const h = React.createElement;
console.error = () => {}; // 경고 숨김

async function run(name, element, after) {
  const log = [];
  globalThis.log = (m) => { log.push(m); };
  const el = document.createElement('div'); document.body.append(el);
  const root = createRoot(el);
  await act(async () => root.render(typeof element === 'function' ? element() : element));
  if (after) await after(el, root);
  await act(async () => root.unmount());
  console.log(name.padEnd(22), '→', log.join(' | '));
}
const click = async (el, sel = 'button') => act(async () => el.querySelector(sel).dispatchEvent(new MouseEvent('click', { bubbles: true })));

// R1 부모·자식 렌더와 effect 순서
{ function Child() { log('child render'); useEffect(() => log('child effect')); return null; }
  function Parent() { log('parent render'); useEffect(() => log('parent effect')); return h(Child); }
  await run('R1 parent-child', h(Parent)); }

// R2 layoutEffect vs effect, 업데이트 시 cleanup 순서
{ function C() { const [n, setN] = useState(0);
    useLayoutEffect(() => { log('layout ' + n); return () => log('layout cleanup ' + n); }, [n]);
    useEffect(() => { log('effect ' + n); return () => log('effect cleanup ' + n); }, [n]);
    return h('button', { onClick: () => setN(1) }, n); }
  await run('R2 layout/effect', h(C), async (el) => { log('--click--'); await click(el); log('--unmount--'); }); }

// R4 같은 값으로 set하면 다시 렌더링?
{ function C() { const [n, setN] = useState(0); log('render ' + n); return h('button', { onClick: () => setN(0) }); }
  await run('R4 same value', h(C), async (el) => { await click(el); await click(el); }); }

// R5 key가 바뀌면 state 초기화
{ function Counter() { const [n, setN] = useState(0); return h('button', { onClick: () => setN(n + 1) }, n); }
  function App() { const [id, setId] = useState('a'); globalThis.setId = setId; return h(Counter, { key: id }); }
  await run('R5 key reset', h(App), async (el) => { await click(el); await click(el); log('before ' + el.textContent); await act(async () => setId('b')); log('after ' + el.textContent); }); }

// R6 같은 위치의 같은 컴포넌트는 state 유지 (삼항)
{ function Counter({ label }) { const [n, setN] = useState(0); return h('button', { onClick: () => setN(n + 1) }, label + n); }
  function App() { const [f, setF] = useState(true); globalThis.setF = setF; return f ? h(Counter, { label: 'A' }) : h(Counter, { label: 'B' }); }
  await run('R6 same position', h(App), async (el) => { await click(el); await click(el); log(el.textContent); await act(async () => setF(false)); log(el.textContent); }); }

// R6b 다른 타입이면 초기화
{ function Counter({ label }) { const [n, setN] = useState(0); return h('button', { onClick: () => setN(n + 1) }, label + n); }
  function App() { const [f, setF] = useState(true); globalThis.setF = setF; return f ? h('div', null, h(Counter, { label: 'A' })) : h('section', null, h(Counter, { label: 'B' })); }
  await run('R6b diff parent', h(App), async (el) => { await click(el); await click(el); log(el.textContent); await act(async () => setF(false)); log(el.textContent); }); }

// R7 컴포넌트 안에서 컴포넌트를 정의하면
{ function App() { const [t, setT] = useState(0); globalThis.setT = setT;
    function Input() { const [v, setV] = useState(''); return h('button', { onClick: () => setV(v + 'x') }, 'v=' + v); }
    return h('div', null, h(Input), 't=' + t); }
  await run('R7 inner component', h(App), async (el) => { await click(el); await click(el); log(el.textContent); await act(async () => setT(1)); log(el.textContent); }); }

// R8 useState 초기값 계산 횟수
{ let calls = 0; const init = () => { calls++; return 0; };
  function A() { const [n, setN] = useState(init()); return h('button', { onClick: () => setN(n + 1) }); }
  await run('R8a useState(init())', h(A), async (el) => { await click(el); await click(el); log('calls ' + calls); });
  calls = 0;
  function B() { const [n, setN] = useState(init); return h('button', { onClick: () => setN(n + 1) }); }
  await run('R8b useState(init)', h(B), async (el) => { await click(el); await click(el); log('calls ' + calls); }); }

// R9 StrictMode에서 effect
{ function C() { useEffect(() => { log('mount'); return () => log('cleanup'); }, []); return null; }
  await run('R9 strict effect', h(StrictMode, null, h(C))); }

// R9b StrictMode에서 render 횟수
{ let renders = 0; function C() { renders++; return null; }
  await run('R9b strict render', h(StrictMode, null, h(C)), async () => log('renders ' + renders)); }

// R10 setTimeout 안의 여러 set → 렌더 횟수
{ function C() { const [a, setA] = useState(0); const [b, setB] = useState(0); log(`render a${a} b${b}`);
    return h('button', { onClick: () => setTimeout(() => { setA(1); setB(1); }, 0) }); }
  await run('R10 batch in timeout', h(C), async (el) => { await click(el); await act(async () => new Promise((r) => setTimeout(r, 5))); }); }

// R11 flushSync
{ function C() { const [a, setA] = useState(0); const ref = useRef(); log('render ' + a);
    return h('button', { ref, onClick: () => { flushSync(() => setA(1)); log('dom ' + ref.current.textContent); } }, a); }
  await run('R11 flushSync', h(C), async (el) => { await click(el); }); }

// R14 children으로 받은 요소는 부모 state 변경에 다시 렌더링 안 됨
{ function Expensive() { log('expensive render'); return null; }
  function Wrapper({ children }) { const [n, setN] = useState(0); return h('button', { onClick: () => setN(n + 1) }, children); }
  await run('R14 children', h(Wrapper, null, h(Expensive)), async (el) => { await click(el); await click(el); }); }

// R14b 직접 렌더하면
{ function Expensive() { log('expensive render'); return null; }
  function Wrapper() { const [n, setN] = useState(0); return h('button', { onClick: () => setN(n + 1) }, h(Expensive)); }
  await run('R14b direct', h(Wrapper), async (el) => { await click(el); await click(el); }); }

// R13 context 값이 매번 새 객체면 memo 자식도 다시 렌더링
{ const Ctx = createContext(null);
  const Child = memo(function Child() { useContext(Ctx); log('child render'); return null; });
  function App() { const [n, setN] = useState(0); return h(Ctx.Provider, { value: { theme: 'dark' } }, h('button', { onClick: () => setN(n + 1) }), h(Child)); }
  await run('R13 ctx new obj', h(App), async (el) => { await click(el); await click(el); }); }

// R12 memo + 객체 prop
{ const Child = memo(function Child({ style }) { log('child render'); return null; });
  function App() { const [n, setN] = useState(0); return h('div', null, h('button', { onClick: () => setN(n + 1) }), h(Child, { style: { color: 'red' } })); }
  await run('R12 memo obj prop', h(App), async (el) => { await click(el); await click(el); }); }

// R16 React 19: ref를 일반 prop으로
{ function MyInput({ ref }) { return h('input', { ref }); }
  function App() { const r = useRef(null); useEffect(() => log('tag ' + r.current?.tagName)); return h(MyInput, { ref: r }); }
  await run('R16 ref as prop', h(App)); }

// R21 에러 바운더리는 이벤트 핸들러 에러를 못 잡는다
{ class EB extends Component { state = { err: false }; static getDerivedStateFromError() { return { err: true }; } render() { return this.state.err ? h('p', null, 'fallback') : this.props.children; } }
  function Bomb() { return h('button', { onClick: () => { throw new Error('boom'); } }, 'ok'); }
  await run('R21 EB event', h(EB, null, h(Bomb)), async (el) => {
    dom.window.addEventListener('error', (e) => e.preventDefault());
    try { await click(el); } catch (e) { log('thrown: ' + e.message); }
    log('screen ' + el.textContent); });
  function Bomb2() { throw new Error('render boom'); }
  await run('R21b EB render', h(EB, null, h(Bomb2)), async (el) => log('screen ' + el.textContent)); }

// R24 useEffect cleanup이 dep 바뀔 때 먼저 (race 관련)
{ function C() { const [id, setId] = useState(1); globalThis.setId = setId;
    useEffect(() => { let ignore = false; log('start ' + id); Promise.resolve().then(() => { if (!ignore) log('set ' + id); else log('ignored ' + id); }); return () => { ignore = true; }; }, [id]);
    return null; }
  await run('R24 ignore flag', h(C), async () => { await act(async () => { globalThis.setId(2); }); }); }

console.log('exports', ['useEffectEvent', 'use', 'useActionState', 'useOptimistic', 'Activity'].map((k) => k + ':' + (k in React)).join(' '));
