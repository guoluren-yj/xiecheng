import { useCallback, useEffect, useMemo, useState } from 'react';

import request from 'hzero-front/lib/utils/request';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { DEBOUNCE_TIME } from 'hzero-front/lib/utils/constants';

/**
 * 使用 前三个参数调用 request, 之后调用 useFetchWithRequest
 * @param {string} url - 请求的地址
 * @param {Object} options - request 第二个参数
 * @param {Object} customOptions - request 的第三个参数(高级)
 * @param inputs
 * @return {(unknown|{hasError: boolean, loading: boolean, errorData: unknown})[]}
 */
const useFetch = (url, options, customOptions, inputs = []) => useFetchWithRequest(() => request(url, options, customOptions), inputs);

/**
 * 请求 request 的hook
 * @param {function(): Promise} requestFn - 调用后返回调用request的结果
 * @param {any[]} inputs - 控制是否重新发起请求(类似 useEffect)
 * @return {[unknown, {hasError: boolean, loading: boolean, errorData: unknown}]} - [返回的数据, { loading: 初次为true 请求成功后置为false, hasError: 初次为false, 请求失败后为true, errorData: 返回的错误信息 }]
 */
const useFetchWithRequest = (requestFn, inputs) => {
  const [fetchLoading, setFetchLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorData, setErrorData] = useState();
  const [data, setData] = useState(undefined);
  // 如果组件已经卸载了, 不要 setState
  const setStateFn = useCallback((setFn, nextState) => {
    if (globalState.status === 'unmount') {
      return;
    }
    setFn(nextState);
  }, []);
  // 该组件的全局数据
  const globalState = useMemo(
    () => ({
      // 请求id, 在每次请求时 作为同一请求的回调
      id: 1,
      // timer句柄, 在开始执行方法时置为null;
      timer: null,
      // 状态,组件卸载后置为 unmount
      status: 'init',
    }),
    []
  );
  // 如果 inputs 发生变化, 则重新请求
  useEffect(() => {
    setStateFn(setFetchLoading, true);
    if (globalState.timer) {
      clearTimeout(globalState.timer);
    }
    globalState.id += 1;
    const curId = globalState.id;
    globalState.timer = setTimeout(() => {
      globalState.timer = null;
      requestFn().then(
        oriData => {
          if (globalState.id !== curId) {
            // 防止调用太快
            return;
          }
          const responseData = getResponse(oriData);
          if (responseData) {
            // 成功
            setStateFn(setData, responseData);
            // setStateFn(setFetchLoading, false);
            setStateFn(setHasError, false);
            setStateFn(setErrorData, undefined);
          } else {
            setStateFn(setHasError, true);
            setStateFn(setErrorData, oriData);
          }
        },
        error => {
          setStateFn(setHasError, true);
          setStateFn(setErrorData, error);
        }
      ).finally(()=>{
        setStateFn(setFetchLoading, false);
      });
    }, DEBOUNCE_TIME);
  }, [...inputs]);
  // 组件卸载后 设置 status 为 unmount
  useEffect(() => () => {
      globalState.status = 'unmount';
    }, []);
  return [
    data,
    {
      loading: fetchLoading,
      hasError,
      errorData,
    },
  ];
};

export { useFetchWithRequest, useFetch };
