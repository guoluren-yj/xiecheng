import React, { useEffect, useState } from 'react';
// import { Button } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import { isNil } from 'lodash';
import intl from 'utils/intl';

import refresh from '@/assets/refresh.svg';
import packUp from '@/assets/packUp.svg';
import styles from './index.less';

export default function Tool(props) {
  const { formDs, onSearch, showFilterFlag, onShowFilterFlag, clearButton, omitFields } = props;

  const [resetFlag, setResetFlag] = useState(clearButton || false);

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
    if (omitFields && formDs.current) {
      const formData = formDs.toData()[0] || {};
      const reserveData = {};
      omitFields.forEach((f) => {
        if (!isNil(formData[f])) {
          reserveData[f] = formData[f];
        }
      });
      formDs.loadData([reserveData]);
    }
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
      {/* <div className={styles['tool-filter']}>
        <Icon type="filter_list" />
        <span>{intl.get('hwfp.common.view.title.default.filter').d('默认筛选')}</span>
      </div> */}
      <span className={styles['vertical-divider']}>|</span>
      {resetFlag && (
        // <Button onClick={handleDsReset}>{intl.get('hzero.common.status.reset').d('重置')}</Button>
        <Tooltip title={intl.get('hzero.common.button.clear').d('清空')}>
          <div className={styles['action-icon']}>
            <Icon onClick={handleDsReset} type="cleaning_services" style={{ fontSize: '14px' }} />
          </div>
        </Tooltip>
      )}
      <Tooltip title={intl.get('hzero.common.button.refresh').d('刷新')}>
        <div className={styles['action-icon']} onClick={handleRefresh}>
          <img src={refresh} alt="" />
        </div>
      </Tooltip>
      <Tooltip
        title={
          showFilterFlag
            ? intl.get('hzero.common.button.up').d('收起')
            : intl.get('hzero.common.button.expand').d('展开')
        }
      >
        <div className={styles['action-icon']} onClick={handleFlag}>
          <img src={packUp} alt="" style={{ transform: showFilterFlag ? '' : 'rotate(180deg)' }} />
        </div>
      </Tooltip>
    </div>
  );
}
