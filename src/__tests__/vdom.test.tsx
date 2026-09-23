import { createVNode, Fragment, renderElement } from '../lib';

describe('가상 DOM', () => {
  it('컴포넌트와 Fragment를 풀어서 그린다', () => {
    const Item = ({ label }: { label: string }) => <li>{label}</li>;
    const root = document.createElement('div');
    renderElement(<ul><>{['a', 'b'].map((x) => <Item label={x} />)}</></ul>, root);
    expect(root.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  it('다시 그릴 때 같은 엘리먼트를 재사용한다 (입력칸 포커스가 안 날아간다)', () => {
    const root = document.createElement('div');
    renderElement(<div><input value="a" /><p>1</p></div>, root);
    const input = root.querySelector('input');
    renderElement(<div><input value="ab" /><p>2</p></div>, root);
    expect(root.querySelector('input')).toBe(input);
    expect(input!.value).toBe('ab');
    expect(root.querySelector('p')!.textContent).toBe('2');
  });

  it('자식이 줄면 남는 노드를 지운다', () => {
    const root = document.createElement('div');
    renderElement(<ul><li>1</li><li>2</li><li>3</li></ul>, root);
    renderElement(<ul><li>1</li></ul>, root);
    expect(root.querySelectorAll('li')).toHaveLength(1);
  });

  it('SVG는 SVG 네임스페이스로 만든다', () => {
    const root = document.createElement('div');
    renderElement(<svg viewBox="0 0 10 10"><circle r="3" /></svg>, root);
    expect(root.querySelector('circle')!.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('이벤트는 루트에 위임되고, 다시 그리면 새 핸들러로 바뀐다', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const calls: string[] = [];
    renderElement(<button onClick={() => calls.push('first')}>x</button>, root);
    renderElement(<button onClick={() => calls.push('second')}>x</button>, root);
    root.querySelector('button')!.click();
    expect(calls).toEqual(['second']);
    root.remove();
  });

  it('innerHTML prop으로 해설 HTML을 넣는다', () => {
    const root = document.createElement('div');
    renderElement(<div innerHTML="<b>굵게</b>" />, root);
    expect(root.querySelector('b')!.textContent).toBe('굵게');
  });
});
