// 프론트엔드 코스 출력값 문제: 여기 코드를 그대로 실행한 결과를 정답으로 쓴다
export const CASES = {
  'fe-js-hoist': `console.log(a);
var a = 1;
console.log(a);`,
  'fe-js-closure': `function makeCounter() {
  let n = 0;
  return () => ++n;
}
const c1 = makeCounter();
const c2 = makeCounter();
console.log(c1(), c1(), c2());`,
  'fe-js-varloop': `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}`,
  'fe-js-letloop': `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}`,
  'fe-js-call': `const obj = {
  name: 'A',
  hi() { return this.name; },
};
console.log(obj.hi());
console.log(obj.hi.call({ name: 'B' }));`,
  'fe-js-equal': `console.log(0 == '0');
console.log(0 === '0');
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN === NaN);`,
  'fe-js-typeof': `console.log(typeof null);
console.log(typeof []);
console.log(typeof undefined);
console.log(typeof function () {});`,
  'fe-js-shallow': `const a = { x: 1, inner: { y: 1 } };
const b = { ...a };
b.x = 2;
b.inner.y = 2;
console.log(a.x, a.inner.y);`,
  'fe-js-truthy': `console.log(Boolean(''));
console.log(Boolean('0'));
console.log(Boolean([]));
console.log(Boolean(0));`,
  'fe-js-nullish': `const u = { n: 0 };
console.log(u.n || 5);
console.log(u.n ?? 5);
console.log(u.x?.y);`,
  'fe-as-order': `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
  'fe-as-micro': `setTimeout(() => console.log('t'), 0);
queueMicrotask(() => console.log('m'));
console.log('s');`,
  'fe-as-await': `async function f() {
  console.log('a');
  await null;
  console.log('b');
}
f();
console.log('c');`,
  'fe-as-nested': `Promise.resolve()
  .then(() => {
    console.log(1);
    setTimeout(() => console.log(2));
  })
  .then(() => console.log(3));
setTimeout(() => console.log(4));`,
  'fe-as-executor': `new Promise((resolve) => {
  console.log('p');
  resolve();
}).then(() => console.log('then'));
console.log('end');`,
  'fe-js-this2': `const user = {
  nick: 'kim',
  hi() { return this.nick; },
  bye: () => this.nick,
};
console.log(user.hi());
console.log(user.bye());`,
  'fe-js-sort': `const nums = [10, 1, 2];
nums.sort();
console.log(...nums);`,
  'fe-as-mix': `console.log('A');
setTimeout(() => console.log('B'));
(async () => {
  console.log('C');
  await null;
  console.log('D');
})();
Promise.resolve().then(() => console.log('E'));
console.log('F');`,
  'fe-as-return': `async function getN() {
  return 1;
}
getN().then((n) => console.log(n));
console.log(2);`,
  'fe-as-foreach': `const wait = (ms) =>
  new Promise((r) => setTimeout(r, ms));

async function main() {
  [30, 10].forEach(async (ms) => {
    await wait(ms);
    console.log(ms);
  });
  console.log('done');
}
main();`,
  'fe-as-catch': `Promise.reject(new Error('x'))
  .then(() => console.log(1))
  .catch(() => console.log(2))
  .then(() => console.log(3));`,
};
