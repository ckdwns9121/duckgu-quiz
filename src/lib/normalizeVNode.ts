import type { NormalizedNode, VChild, VElement } from './types';

/**
 * 함수형 컴포넌트를 끝까지 실행하고, 배열(Fragment)은 부모의 자식 목록에 펼친다.
 * 결과에는 문자열과 태그 노드만 남는다.
 */
export function normalizeVNode(vNode: VChild): NormalizedNode | NormalizedNode[] {
  if (vNode === null || vNode === undefined || typeof vNode === 'boolean') return '';
  if (typeof vNode === 'string' || typeof vNode === 'number') return String(vNode);
  if (Array.isArray(vNode)) return flatten(vNode);

  if (typeof vNode.type === 'function') {
    const props = { ...(vNode.props ?? {}), children: vNode.children };
    return normalizeVNode(vNode.type(props));
  }

  const element: VElement = {
    type: vNode.type,
    props: vNode.props ?? {},
    children: flatten(vNode.children).filter((child) => child !== ''),
  };
  return element;
}

function flatten(children: VChild[]): NormalizedNode[] {
  return children.flatMap((child) => {
    const normalized = normalizeVNode(child);
    return Array.isArray(normalized) ? normalized : [normalized];
  });
}
