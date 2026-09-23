/** localStorage를 감싼다. 사생활 보호 모드처럼 저장이 막힌 환경에서도 앱이 죽지 않게 한다 */
export const createStorage = <T>(key: string, storage: Storage | undefined = globalThis.localStorage) => {
  const get = (): T | null => {
    try {
      const item = storage?.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  };
  const set = (value: T) => {
    try {
      storage?.setItem(key, JSON.stringify(value));
    } catch {
      /* 저장 실패는 무시한다: 이번 방문 동안은 메모리 상태로 계속 쓴다 */
    }
  };
  const reset = () => {
    try {
      storage?.removeItem(key);
    } catch {
      /* 무시 */
    }
  };
  return { get, set, reset };
};
