import { createElement } from './createElement';
import { setupEventListeners } from './eventManager';
import { normalizeVNode } from './normalizeVNode';
import type { NormalizedNode, VChild } from './types';
import { updateElement } from './updateElement';

const previousVNodes = new WeakMap<Element, NormalizedNode>();

/** 처음에는 DOM을 새로 만들고, 그다음부터는 이전 가상 DOM과 비교해서 고친다 */
export function renderElement(vNode: VChild, container: Element): void {
  const normalized = normalizeVNode(vNode);
  const next: NormalizedNode = Array.isArray(normalized) ? { type: 'div', props: {}, children: normalized } : normalized;
  const previous = previousVNodes.get(container);

  if (previous && container.firstChild) updateElement(container, next, previous, 0);
  else {
    container.textContent = '';
    container.appendChild(createElement(next));
  }

  previousVNodes.set(container, next);
  setupEventListeners(container);
}
