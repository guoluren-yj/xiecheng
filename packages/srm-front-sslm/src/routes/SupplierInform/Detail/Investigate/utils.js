import { useState, useCallback } from 'react';

import { pick, isEqual, compose, partialRight, uniqBy, map } from 'lodash';

export const useSetState = initialState => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    newState => {
      set(prevState => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

export const pickEquals = pickarry =>
  compose(
    compose(
      partialRight(isEqual, { length: 1 }),
      partialRight(pick, 'length'),
      partialRight(uniqBy, isEqual)
    ),
    partialRight(map, partialRight(pick, pickarry))
  );
