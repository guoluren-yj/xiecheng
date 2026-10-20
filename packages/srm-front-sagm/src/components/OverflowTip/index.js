import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';

import styles from './index.less';

const OverflowContainer = ({ children, className, style, overflow2 = false }) => {
  const dom = useRef();
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (dom.current) {
      const { clientWidth, scrollWidth, scrollHeight, clientHeight } = dom.current;
      if (scrollWidth > clientWidth) {
        setIsOverflow(true);
      }
      if (overflow2) {
        setIsOverflow(scrollHeight > clientHeight);
      }
    }
  }, [children]);

  return (
    <Tooltip title={isOverflow ? children : null} placement="left">
      <div
        ref={dom}
        style={style}
        className={classNames({
          [className]: true,
          [styles['overflow-container']]: true,
          [styles['tips-overflow-2']]: overflow2,
        })}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export default OverflowContainer;
