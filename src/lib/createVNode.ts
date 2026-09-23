import type { Component, Props, VChild, VNode } from './types';

/**
 * JSX가 호출하는 팩토리 (tsconfig의 jsxFactory).
 * 자식은 한 줄로 펴고, 조건부 렌더링으로 생긴 null·undefined·false는 미리 걸러 낸다.
 */
export function createVNode(type: string | Component<any>, props: Props | null, ...children: VChild[]): VNode {
  const flatChildren = (children as unknown[])
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false) as VChild[];
  return { type, props, children: flatChildren };
}

/** <>...</> 는 자식 배열을 그대로 돌려준다. normalizeVNode가 부모 자식 목록에 펼쳐 넣는다 */
export const Fragment = ({ children }: { children?: VChild[] }): VChild => children ?? [];
