import { useState, useCallback } from 'react';

interface UseSetStateFunc {
  (initialValue: object): [Record<string, any>, (next: object | Function) => void];
}
export const useSetState: UseSetStateFunc = (initialState) => {
  const [state, mergeState] = useState(initialState || {});
  const setState = useCallback((next) => {
    mergeState(prevState => {
      const nextState = typeof next === "function" ? next(prevState) : next;
      return ({ ...prevState, ...nextState });
    });
  }, []);
  return [state, setState];
};