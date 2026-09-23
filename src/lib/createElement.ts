import { updateAttributes } from './attributes';
import type { NormalizedNode } from './types';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * 정규화된 노드를 실제 DOM으로 만든다.
 * <svg> 아래는 createElementNS로 만들어야 브라우저가 도형으로 그린다 (그냥 만들면 빈 태그가 된다).
 */
export function createElement(node: NormalizedNode | NormalizedNode[], isSvg = false): Node {
  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment();
    node.forEach((child) => fragment.appendChild(createElement(child, isSvg)));
    return fragment;
  }
  if (typeof node === 'string') return document.createTextNode(node);

  const svg = isSvg || node.type === 'svg';
  const el = svg ? document.createElementNS(SVG_NS, node.type) : document.createElement(node.type);
  updateAttributes(el, node.props, {});
  if (typeof node.props.innerHTML !== 'string') {
    node.children.forEach((child) => el.appendChild(createElement(child, svg)));
  }
  return el;
}
