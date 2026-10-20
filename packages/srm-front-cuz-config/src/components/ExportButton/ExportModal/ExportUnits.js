import React, { useCallback } from 'react';
import { Tag, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { unitTypeColorMap } from '@/utils/constConfig.js';
import styles from '../index.less';
import { PRIMARY_KEY } from '../store';

const ExportUnits = observer(({ checkedRecords, unitTypeObj, onUnCheckTreeRecord }) => {
  const tagRenderer = useCallback(
    value => (!value ? null : <Tag color={unitTypeColorMap[value]}>{unitTypeObj[value]}</Tag>),
    [unitTypeObj]
  );

  return (
    <>
      <div className={styles['right-title']}>
        {!checkedRecords.length ? (
          intl.get('hpfm.individual.view.title.needSelectUnit').d('请在左侧选择需要导出的单元')
        ) : (
          <>
            {intl.get('hpfm.individual.view.title.chosen').d('已选择')}
            <span>{checkedRecords.length}</span>
            {intl.get('hpfm.individual.view.title.chosenUnitNumber').d('个单元')}
          </>
        )}
      </div>
      <div className={styles['right-list']}>
        {checkedRecords.length > 0 &&
          checkedRecords.map(record => (
            <div className={styles['right-list-item']} key={record[PRIMARY_KEY]}>
              <div className={styles['right-list-item-header']}>
                {tagRenderer(record.unitType)}
                <div className={styles['right-list-item-name']}>{record.unitName}</div>
                <div>
                  <Icon
                    type="close"
                    className={styles['right-list-item-icon']}
                    onClick={() => onUnCheckTreeRecord(record[PRIMARY_KEY])}
                  />
                </div>
              </div>
              <div className={styles['right-list-item-footer']}>{record[PRIMARY_KEY]}</div>
            </div>
          ))}
      </div>
    </>
  );
});

export default ExportUnits;
