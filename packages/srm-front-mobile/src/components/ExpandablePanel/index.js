import React, { useState } from 'react';
import intl from 'utils/intl';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import styles from './index.less';

const Expandable = ({ children, onToggleExpend }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    if (onToggleExpend && typeof onToggleExpend === 'function') {
      onToggleExpend(!isExpanded);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles['expandable-container']} style={{ width: isExpanded ? '100%' : '0' }}>
      <div className={isExpanded ? styles.expanded : styles.collapsed}>{children}</div>
      <Tooltip
        title={
          isExpanded
            ? intl.get('hzero.common.button.up').d('收起')
            : intl.get('hzero.common.button.expand').d('展开')
        }
      >
        <div className={styles['ellipse-button']} onClick={toggleExpand}>
          {isExpanded ? <Icon type="baseline-arrow_left" /> : <Icon type="baseline-arrow_right" />}
        </div>
      </Tooltip>
    </div>
  );
};

export default Expandable;
