import { updateAttributes } from './attributes';
import { createElement } from './createElement';
import type { NormalizedNode } from './types';

/**
 * 이전 가상 노드와 새 가상 노드를 비교해 바뀐 부분만 실제 DOM에 반영한다.
 * 같은 자리(index)끼리 비교하는 단순한 방식이다 (key 비교는 하지 않는다).
 */
export function updateElement(
  parent: Node,
  newNode: NormalizedNode | undefined,
  oldNode: NormalizedNode | undefined,
  index = 0,
  isSvg = false,
): void {
  const current = parent.childNodes[index];

  if (oldNode === undefined) {
    if (newNode !== undefined) parent.appendChild(createElement(newNode, isSvg));
    return;
  }
  if (!current) return;
  if (newNode === undefined) {
    parent.removeChild(current);
    return;
  }

  if (typeof newNode === 'string' || typeof oldNode === 'string') {
    if (typeof newNode === 'string' && typeof oldNode === 'string') {
      if (newNode !== oldNode) current.textContent = newNode;
    } else {
      parent.replaceChild(createElement(newNode, isSvg), current);
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    parent.replaceChild(createElement(newNode, isSvg), current);
    return;
  }

  const el = current as Element;
  const svg = isSvg || newNode.type === 'svg';
  updateAttributes(el, newNode.props, oldNode.props);

  // innerHTML로 채운 노드는 자식을 직접 비교하지 않는다
  if (typeof newNode.props.innerHTML === 'string') return;
  if (typeof oldNode.props.innerHTML === 'string') {
    el.textContent = '';
    newNode.children.forEach((child) => el.appendChild(createElement(child, svg)));
    return;
  }

  const newChildren = newNode.children;
  const oldChildren = oldNode.children;
  const common = Math.min(newChildren.length, oldChildren.length);
  for (let i = 0; i < common; i++) updateElement(el, newChildren[i], oldChildren[i], i, svg);
  // 줄어든 자식은 뒤에서부터 지워야 index가 밀리지 않는다
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    const extra = el.childNodes[i];
    if (extra) el.removeChild(extra);
  }
  for (let i = common; i < newChildren.length; i++) el.appendChild(createElement(newChildren[i], svg));
}
