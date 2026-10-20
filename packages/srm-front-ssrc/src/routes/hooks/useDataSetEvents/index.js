import { useCallback, useEffect, useRef } from 'react';
import { isArray, isString } from 'lodash';

/**
 * 单个或批量监听 ds 事件
 * 1. 监听单个 useDataSetEvents(ds,'update',()=>{XXX})
 * 2. 监听多个 useDataSetEvents(ds,['select','unSelect'],[()=>{XXX},()=>{XXX}])
 * 3. 一个回调监听多个 useDataSetEvents(ds,['select','unSelect'],()=>{XXX})
 * 4. 监听一次 useDataSetEvents(ds,'select','unSelect',()=>{XXX},{once:true})
 * @param dataSet
 * @param eventNames
 * @param handler
 * @param options
 */
function useDataSetEvents(dataSet, eventNames, handler, options) {
  const handlerRef = useRef();
  handlerRef.current = isArray(handler) ? handler : [handler];

  const eventListener = useCallback((index = 0) => {
    return (event) => handlerRef.current && handlerRef.current[index](event);
  }, []);

  const handleEventListener = useCallback(
    (isAdd) => {
      const listener = (eventName, index) => {
        const _eventListener = eventListener(isArray(handler) ? index : 0);
        if (isAdd && dataSet.events) {
          dataSet.addEventListener(eventName, _eventListener, {
            capture: options?.capture,
            once: options?.once,
            passive: options?.passive,
          });
        } else {
          dataSet.removeEventListener(eventName, _eventListener, {
            capture: options?.capture,
          });
        }
      };

      if (isArray(eventNames)) {
        eventNames.forEach((eventName, index) => {
          listener(eventName, index);
        });
      } else if (isString(eventNames)) {
        listener(eventNames);
      }
    },
    [dataSet, options]
  );

  useEffect(() => {
    handleEventListener(true);
    return () => {
      handleEventListener(false);
    };
  }, [eventNames.toString(), options?.capture, options?.once, options?.passive, dataSet]);
}

export default useDataSetEvents;
