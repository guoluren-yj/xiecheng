import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';

export default function useChangeSize(setFourthLastIndex) {
  const [size, setSize] = useState(document.documentElement.clientWidth);

  const onReSize = useCallback(() => {
    setFourthLastIndex(undefined);
    setSize(document.documentElement.clientWidth);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', debounce(onReSize, 300, { trailing: true }));
    return () => {
      window.removeEventListener('resize', onReSize);
    };
  }, []);

  return { size, collapsed: window.dvaApp?._store?.getState?.()?.global?.collapsed?.collapsed };
}
