import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from '../common.less';

/**
 * 单/行切换
 * @object props
 * */
export function rightBarRenderer(props) {
  const { hdKey = 'ALL', useHdChange = (e) => e } = props;
  return (
    <div
      className={styles['toggle-key']}
    >
      <div
        onClick={() => useHdChange('ALL')}
        className={styles[hdKey === 'ALL' ? 'activity' : 'toggle-key-btn']}
      >
        <Tooltip
          placement="topLeft"
          title={intl.get('hzero.common.tab.receiptsbtn').d('按单')}
        >
          <span className={styles['toggle-btn']}>
            {intl.get('hzero.common.tab.receiptsbtn').d('按单')}
          </span>
        </Tooltip>
      </div>
      <div
        onClick={() => useHdChange('LINEALL')}
        className={styles[hdKey === 'LINEALL' ? 'activity' : 'toggle-key-btn']}
      >
        <Tooltip
          placement="topRight"
          title={intl.get('hzero.common.tab.linebtn').d('按行')}
        >
          <span>{intl.get('hzero.common.tab.linebtn').d('按行')}</span>
        </Tooltip>
      </div>
    </div>
  );
};
