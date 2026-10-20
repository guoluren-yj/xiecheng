/**
 * 监听目标元素外的点击事件。
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/21
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import { useEffect } from 'react';
import _ from 'lodash';

const useClickAway = (onClickAway, domRef) => {
  useEffect(() => {
    const listener = (event) => {
      if (!domRef.current) {
        return;
      }
      if (domRef.current instanceof HTMLElement && domRef.current.contains(event.target)) {
        return;
      }
      if (Array.isArray(domRef.current)) {
        const isInsideClick = domRef.current.some((element) => element.contains(event.target));
        if (isInsideClick) {
          return;
        }
      }
      if (_.isFunction(onClickAway)) {
        onClickAway(event);
      }
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [onClickAway, domRef]);

  return domRef;
};

export default useClickAway;
