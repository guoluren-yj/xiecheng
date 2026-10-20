import React, { useEffect, useState } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import refresh from '@/assets/icons/refresh.svg';
import packUp from '@/assets/icons/packUp.svg';
import styles from './index.less';

export default function Tool(props) {
  const { formDs, onSearch, showFilterFlag, onShowFilterFlag } = props;

  const [resetFlag, setResetFlag] = useState(false);

  useEffect(() => {
    formDs.addEventListener('update', handleFilterChange);
    formDs.addEventListener('reset', handleResetFlag);
  }, []);

  const handleResetFlag = () => {
    setResetFlag(false);
  };

  const handleFilterChange = () => {
    setResetFlag(true);
  };

  const handleDsReset = () => {
    formDs.reset();
    onSearch();
  };

  const handleRefresh = () => {
    onSearch();
  };

  const handleFlag = () => {
    onShowFilterFlag();
  };

  return (
    <div className={styles.tool}>
      <div className={styles['tool-filter']}>
        <Icon type="filter_list" />
        <span style={{ fontSize: 13 }}>
          {intl.get('hitf.common.default.filter').d('默认筛选器')}
        </span>
      </div>
      {resetFlag && (
        <Button onClick={handleDsReset}>{intl.get('hitf.common.reset').d('重置')}</Button>
      )}
      <span className={styles['vertical-divider']}>|</span>
      <Tooltip theme="light" title={intl.get('hitf.common.refresh').d('刷新')}>
        <div className={styles['action-icon']} onClick={handleRefresh}>
          <img src={refresh} alt="" />
        </div>
      </Tooltip>
      <Tooltip
        theme="light"
        title={
          showFilterFlag
            ? intl.get('hitf.common.pack.up').d('收起')
            : intl.get('hitf.common.expand').d('展开')
        }
      >
        <div className={styles['action-icon']} onClick={handleFlag}>
          <img src={packUp} alt="" style={{ transform: showFilterFlag ? '' : 'rotate(180deg)' }} />
        </div>
      </Tooltip>
    </div>
  );
}
