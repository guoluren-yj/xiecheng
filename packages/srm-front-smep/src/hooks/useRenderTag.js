import { useMemo } from 'react';

import { colorMap } from '@/utils/constant';

export function useRenderTag(list = [], value = '') {
  const styles = useMemo(() => {
    const initStyle = {};
    const newList = list
      .map((i) => {
        if (i.matchList.includes(value)) {
          return { ...initStyle, ...colorMap[i?.colorType] };
        }
        return undefined;
      })
      .find((item) => !!item);
    return newList;
  }, []);

  return styles;
}
