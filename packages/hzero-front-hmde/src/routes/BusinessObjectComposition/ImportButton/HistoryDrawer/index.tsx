import React, { FC, useCallback, useMemo, useEffect, useState, memo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';

import styles from './index.less';
import RecordList from './RecordList';
import RecordDetail from './RecordDetail';

const HistoryDrawer: FC = () => {
  const [currentRecord, setCurrentRecord] = useState<any>();

  return (
    <div className={styles['drawer-container']}>
      <div className={styles['drawer-container-left']}>
        <div className={styles['left-title']}>
          {intl.get('srm.common.view.title.importRecord').d('导入记录')}
        </div>
        <RecordList currentRecord={currentRecord} setCurrentRecord={setCurrentRecord} />
      </div>
      <div className={styles['drawer-container-right']}>
        <div className={styles['right-title']}>
          {intl.get('srm.common.view.title.importDetail').d('导入明细')}
        </div>
        <RecordDetail currentRecord={currentRecord} />
      </div>
    </div>
  );
};

export default memo(HistoryDrawer);