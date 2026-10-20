import React from 'react';
import intl from 'utils/intl';

import { ReactComponent as NoDataSvg } from '@/assets/no-data.svg';
import styles from './index.less';

export default () => {
  return (
    <>
      <div className={styles['noData-container']}>
        <div className={styles['noData-container-content']}>
          <div className={styles['noData-container-img']}>
            <NoDataSvg />
          </div>
          <div className={styles['noData-container-text']}>
            {intl.get('hzero.common.message.data.none').d('暂无数据')}
          </div>
        </div>
      </div>
    </>
  );
};
