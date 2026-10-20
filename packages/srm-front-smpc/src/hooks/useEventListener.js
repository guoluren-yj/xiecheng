import { useEffect } from 'react';
import useLatest from './useLatest';

export default function useEventListener(eventName, handler = (e) => e, options) {
  const handlerRef = useLatest(handler);
  const { target, once } = options;
  useEffect(() => {
    if (!target || !target.addEventListener) return;
    const eventListener = (e) => handlerRef.current(e);
    target.addEventListener(eventName, eventListener, { once });
    return () => {
      target.removeEventListener(eventName, eventListener);
    };
  }, [target, once]);
}
