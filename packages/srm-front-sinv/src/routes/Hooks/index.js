import { useState, useCallback } from 'react';
import { isFunction } from 'lodash';

const useSetState = (initialState) => {
  const [state, setState] = useState(initialState);
  const setMergeState = useCallback((patch) => {
    setState((prevState) => {
      const newState = isFunction(patch) ? patch(prevState) : patch;
      return newState ? { ...prevState, ...newState } : prevState;
    });
  }, []);
  return [state, setMergeState];
};

export { useSetState };
