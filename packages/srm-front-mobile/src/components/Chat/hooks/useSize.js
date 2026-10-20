/**
 * 监听 DOM 节点尺寸变化的 Hook。
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/21
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import { useState, useLayoutEffect, useCallback } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

const useSize = (target) => {
  const [size, setSize] = useState(() => {
    const el = target?.current;
    return {
      width: el?.offsetWidth,
      height: el?.offsetHeight,
    };
  });

  const callback = useCallback((entries) => {
    const { contentRect } = entries[0];
    setSize({
      width: contentRect.width,
      height: contentRect.height,
    });
  }, []);

  useLayoutEffect(() => {
    if (!target.current) {
      return;
    }
    const observer = new ResizeObserver(callback);
    observer.observe(target.current);
    return () => observer.disconnect();
  }, [target, callback]);

  return size;
};

export default useSize;
