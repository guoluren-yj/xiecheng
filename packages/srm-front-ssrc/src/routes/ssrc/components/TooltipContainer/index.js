import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';

import styles from './index.less';

const OverflowContainer = ({ children, className, style, placement, title }) => {
  const dom = useRef();
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (dom.current) {
      const { clientWidth, scrollWidth } = dom.current;
      if (scrollWidth > clientWidth) {
        setIsOverflow(true);
      }
    }
  }, [children]);

  return (
    <Tooltip title={isOverflow ? title || children : null} placement={placement || 'top'}>
      <div
        ref={dom}
        style={style}
        className={classNames({ [className]: true, [styles['overflow-container']]: true })}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export default OverflowContainer;
