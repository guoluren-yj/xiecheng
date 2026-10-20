import { useState, useCallback, useMemo } from 'react';
import { isNumber, sum } from 'lodash';

export const useSetState = initialState => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    newState => {
      set(prevState => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return { state, setState };
};

export const useScrollX = columns =>
  useMemo(() => sum(columns.map(n => (isNumber(n.width) ? n.width : 100))), [columns.length]);
