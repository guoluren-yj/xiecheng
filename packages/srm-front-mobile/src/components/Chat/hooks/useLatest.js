/**
 * 返回当前最新值的 Hook，可以避免闭包问题。
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/21
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import { useRef, useEffect } from 'react';

const useLatest = (value) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};

export default useLatest;
