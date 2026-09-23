export type Props = Record<string, unknown>;

export type Component<P = Props> = (props: P & { children?: VChild[] }) => VChild;

export interface VNode {
  type: string | Component<any>;
  props: Props | null;
  children: VChild[];
}

export type VChild = VNode | string | number | boolean | null | undefined | VChild[];

/** normalizeVNode를 거친 뒤의 노드: 함수형 컴포넌트가 모두 풀리고 문자열 또는 태그만 남는다 */
export interface VElement {
  type: string;
  props: Props;
  children: NormalizedNode[];
}

export type NormalizedNode = VElement | string;
