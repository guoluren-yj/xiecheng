/**
 * 用来处理防抖函数的 Hook。
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/21
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import { useRef, useCallback, useEffect } from 'react';

const useDebounceFn = (fn, delay = 500) => {
  const cacheRef = useRef({ fn, timer: null });

  const clear = () => {
    clearTimeout(cacheRef.current.timer);
  };

  const debouncedFn = useCallback(
    (...args) => {
      clear();
      cacheRef.current.timer = setTimeout(() => {
        cacheRef.current.fn.apply(this, args);
      }, delay);
    },
    [fn, delay]
  );

  useEffect(() => {
    cacheRef.current.fn = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return debouncedFn;
};

export default useDebounceFn;
