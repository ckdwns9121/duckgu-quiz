import { createObserver } from './createObserver';

export type Reducer<S, A> = (state: S, action: A) => S;

/** Redux 방식 스토어. 리듀서가 새 객체를 돌려줄 때만 구독자에게 알린다 */
export const createStore = <S, A>(reducer: Reducer<S, A>, initialState: S) => {
  const { subscribe, notify } = createObserver();
  let state = initialState;

  const getState = () => state;
  const dispatch = (action: A) => {
    const next = reducer(state, action);
    if (next !== state) {
      state = next;
      notify();
    }
  };

  return { getState, dispatch, subscribe };
};
