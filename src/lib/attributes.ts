import { addEvent, removeEvent } from './eventManager';
import type { Props } from './types';

const BOOLEAN_PROPS = ['checked', 'disabled', 'selected', 'readOnly', 'hidden', 'autofocus'] as const;
const SKIP = new Set(['children', 'key', 'innerHTML']);

/**
 * 이전 props와 새 props를 비교해 엘리먼트에 반영한다. 처음 만들 때는 oldProps를 빈 객체로 넘긴다.
 * - onClick → click 위임 이벤트
 * - className → class
 * - boolean 속성, value는 DOM 프로퍼티로 직접 설정
 * - innerHTML은 문자열이 바뀌었을 때만 다시 넣는다 (노트의 해설 HTML을 그대로 보여 줄 때 사용)
 */
export function updateAttributes(el: Element, newProps: Props, oldProps: Props): void {
  for (const [key, value] of Object.entries(oldProps)) {
    if (SKIP.has(key)) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      removeEvent(el, eventName(key), value as (e: Event) => void);
    } else if (!(key in newProps)) {
      removeProp(el, key);
    }
  }

  for (const [key, value] of Object.entries(newProps)) {
    if (SKIP.has(key)) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      addEvent(el, eventName(key), value as (e: Event) => void);
    } else if (oldProps[key] !== value || key === 'value') {
      setProp(el, key, value);
    }
  }

  if (newProps.innerHTML !== oldProps.innerHTML) {
    el.innerHTML = typeof newProps.innerHTML === 'string' ? newProps.innerHTML : '';
  }
}

function eventName(key: string): string {
  return key.slice(2).toLowerCase();
}

function setProp(el: Element, key: string, value: unknown): void {
  if ((BOOLEAN_PROPS as readonly string[]).includes(key)) {
    (el as unknown as Record<string, boolean>)[key] = Boolean(value);
    return;
  }
  if (key === 'value') {
    const input = el as HTMLInputElement;
    const next = value === null || value === undefined ? '' : String(value);
    if (input.value !== next) input.value = next;
    return;
  }
  if (key === 'style' && value && typeof value === 'object') {
    el.removeAttribute('style');
    Object.assign((el as HTMLElement).style, value);
    return;
  }
  if (value === null || value === undefined || value === false) {
    removeProp(el, key);
    return;
  }
  el.setAttribute(key === 'className' ? 'class' : key, String(value));
}

function removeProp(el: Element, key: string): void {
  if ((BOOLEAN_PROPS as readonly string[]).includes(key)) {
    (el as unknown as Record<string, boolean>)[key] = false;
  }
  el.removeAttribute(key === 'className' ? 'class' : key);
}
