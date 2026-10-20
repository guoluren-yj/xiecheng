/**
 * 使用 hook 实现防抖
 */
import { useState, useEffect } from 'react';

/**
 * 每次输入新的值 会销毁上一次的 hook，产生新的 hook，重新计时
 * @param value 输入的值
 * @param delay 延时
 * @returns
 */
function useDebounce(value, delay = 200) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounceValue;
}

export default useDebounce;
