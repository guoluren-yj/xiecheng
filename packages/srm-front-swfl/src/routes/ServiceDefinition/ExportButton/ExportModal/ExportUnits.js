import React, { memo } from 'react';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'srm-front-boot/lib/utils/intl';

import styles from '../index.less';
import { PRIMARY_FIELD, TEXT_FIELD, tagRenderer } from '../store';

function ExportUnits({ checkedRecords, onUnCheckTreeRecord }) {
  return (
    <>
      <div className={styles['right-title']}>
        {!checkedRecords.length ? (
          intl
            .get('srm.common.view.title.needSelectServiceDefinition')
            .d('请在左侧选择需要导出的服务定义')
        ) : (
          <>
            {intl.get('srm.common.view.title.chosen').d('已选择')}
            <span>{checkedRecords.length}</span>
            {intl.get('srm.common.view.title.chosenServiceDefinition').d('个服务定义')}
          </>
        )}
      </div>
      <div className={styles['right-list']}>
        {checkedRecords.length > 0 &&
          checkedRecords.map((record) => (
            <div className={styles['right-list-item']} key={record[PRIMARY_FIELD]}>
              <div className={styles['right-list-item-header']}>
                <div className={styles['right-list-item-name']}>
                  {tagRenderer(record.serviceType, record.serviceTypeMeaning)}
                  {record[TEXT_FIELD]}
                </div>
                <div>
                  <Icon
                    type="close"
                    className={styles['right-list-item-icon']}
                    onClick={() => onUnCheckTreeRecord(record[PRIMARY_FIELD])}
                  />
                </div>
              </div>
              <div className={styles['right-list-item-footer']}>{record.code}</div>
            </div>
          ))}
      </div>
    </>
  );
}

export default memo(observer(ExportUnits));
