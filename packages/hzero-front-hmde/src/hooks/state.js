/**
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2020/2/18
 * @copyright HAND ® 2019
 */
import { useState, useCallback } from 'react';

/**
 * 对基础值的封装
 * @param {boolean} [initial = false] - 初始bool值
 * @return {[boolean, { setTrue: () => any, resetBool: () => any, setBool: React.Dispatch<React.SetStateAction<boolean>>, toggleBool: () => any, setFalse: () => any }]} - [值, { 各种辅助方法 }]
 */
const useBoolState = (initial = false) => {
  const [bool, setBool] = useState(false);
  const toggleBool = useCallback(() => {
    setBool(!bool);
  }, [bool]);
  const setTrue = useCallback(() => {
    setBool(true);
  }, []);
  const setFalse = useCallback(() => {
    setBool(false);
  }, []);
  const resetBool = useCallback(() => {
    setBool(initial);
  }, []);
  return [
    bool,
    {
      resetBool,
      setBool,
      toggleBool,
      setFalse,
      setTrue,
    },
  ];
};

export { useBoolState };
