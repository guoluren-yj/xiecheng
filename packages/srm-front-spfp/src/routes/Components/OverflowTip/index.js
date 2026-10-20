import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';

import styles from './index.less';

const OverflowContainer = ({
  children,
  className,
  style,
  placement = 'top',
  lines = 1,
  lineHeight = 18,
}) => {
  const dom = useRef();
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (dom.current) {
      const { clientWidth, scrollWidth, scrollHeight } = dom.current;
      if (scrollWidth > clientWidth || scrollHeight > lines * lineHeight) {
        setIsOverflow(true);
      }
    }
  }, [children]);

  const overflowStyle = useMemo(() => {
    if (lines < 2) {
      return {
        whiteSpace: 'nowrap',
      };
    }
    return {
      maxHeight: `${lines * lineHeight}px`,
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical',
      lineHeight: `${lineHeight}px`,
    };
  }, [lines]);

  return (
    <Tooltip title={isOverflow ? children : null} placement={placement}>
      <div
        ref={dom}
        style={{ ...(style || {}), ...overflowStyle }}
        className={classNames({ [className]: true, [styles['overflow-container']]: true })}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export default OverflowContainer;
