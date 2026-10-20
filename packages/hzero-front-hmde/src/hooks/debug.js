/**
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2020/2/18
 * @copyright HAND ® 2019
 */
import { useState, useCallback, useMemo } from 'react';

/**
 * 自己内部维护一个 int 值 State, 每次调用返回方法会自增1
 * 会维护一个 useMemo(存储类全局变量), useState(存储改变的值), useCallback(存储方法)
 * @return {function(): void} - 返回一个不会变的方法
 */
const useForceUpdate = () => {
  const globalState = useMemo(() => ({ forceUpdateCount: 0 }), []);
  const [, setForceUpdateCount] = useState(0);
  return useCallback(() => {
    globalState.forceUpdateCount += 1;
    setForceUpdateCount(globalState.forceUpdateCount);
  }, []);
};

export { useForceUpdate };
