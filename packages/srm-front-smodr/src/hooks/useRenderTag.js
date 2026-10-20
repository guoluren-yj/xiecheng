import { useMemo } from 'react';

import { colorMap } from '@/utils/constant';

export function useRenderTag(list = [], value = '') {
  const initStyle = { border: 'none' };
  const color = useMemo(() => {
    const newList = list
      .map((i) => {
        if (i.matchList.includes(value)) {
          return colorMap[i?.colorType];
        } if (i.matchList.length === 0) {
          return colorMap[i?.colorType];
        }
        return undefined;
      })
      .find((item) => !!item);
    return newList;
  }, [value]);

  return { color, initStyle };
}
