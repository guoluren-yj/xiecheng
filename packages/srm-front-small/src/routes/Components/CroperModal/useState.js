import { useState, useCallback, useEffect, useRef } from 'react';

// 通用state
export default function useSetState(initialState = {}) {
  const [state, set] = useState(initialState);
  const isUpdate = useRef();
  const setState = useCallback(
    (nextState, callback) => {
      if (typeof callback === 'function') {
        isUpdate.current = callback;
      }
      if (typeof nextState === 'function') {
        set(prevState => ({ ...prevState, ...nextState(prevState) }));
      } else {
        set(prevState => ({ ...prevState, ...nextState }));
      }
    },
    [set]
  );

  useEffect(() => {
    if (isUpdate.current) {
      isUpdate.current(state);
    }
  }, [state]);

  return [state, setState];
}
