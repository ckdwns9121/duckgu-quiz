/**
 * 이벤트 위임.
 * 핸들러는 엘리먼트별로 WeakMap에 저장하고, 실제 리스너는 루트에 타입마다 하나씩만 단다.
 */
type Handler = (event: Event) => void;

const eventHandlers = new WeakMap<Element, Record<string, Handler[]>>();
const delegatedEvents = new Set<string>();
const boundRoots = new WeakMap<Element, Set<string>>();

export function setupEventListeners(root: Element): void {
  const bound = boundRoots.get(root) ?? new Set<string>();
  delegatedEvents.forEach((eventType) => {
    if (bound.has(eventType)) return;
    root.addEventListener(eventType, handleEvent);
    bound.add(eventType);
  });
  boundRoots.set(root, bound);
}

/** 이벤트가 난 곳에서 루트까지 올라가며, 처음 만난 핸들러만 실행한다 */
function handleEvent(event: Event): void {
  const root = event.currentTarget as Element;
  let target = event.target as Element | null;

  while (target) {
    const handlers = eventHandlers.get(target)?.[event.type];
    if (handlers && handlers.length > 0) {
      handlers.forEach((handler) => handler(event));
      return;
    }
    if (target === root) break;
    target = target.parentElement;
  }
}

export function addEvent(element: Element, eventType: string, handler: Handler): void {
  const map = eventHandlers.get(element) ?? {};
  const list = map[eventType] ?? [];
  if (!list.includes(handler)) list.push(handler);
  map[eventType] = list;
  eventHandlers.set(element, map);
  delegatedEvents.add(eventType);
}

export function removeEvent(element: Element, eventType: string, handler: Handler): void {
  const list = eventHandlers.get(element)?.[eventType];
  if (!list) return;
  const index = list.indexOf(handler);
  if (index > -1) list.splice(index, 1);
}
