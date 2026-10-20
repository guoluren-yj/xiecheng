import React, { memo } from 'react';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'srm-front-boot/lib/utils/intl';

import styles from '../index.less';
import { ITreeNodeData, PRIMARY_FIELD, TEXT_FIELD } from './store';

interface IExportUnits {
  checkedRecords: ITreeNodeData[];
  onUnCheckTreeRecord: (unCheckKey: string | number) => void;
}

function ExportUnits({ checkedRecords, onUnCheckTreeRecord }: IExportUnits) {

  return (
    <>
      <div className={styles['right-title']}>
        {!checkedRecords.length ? (
          intl.get('srm.common.view.title.needSelectTemplate').d('请在左侧选择需要导出的模板')
        ) : (
          <>
            {intl.get('srm.common.view.title.chosen').d('已选择')}
            <span>{checkedRecords.length}</span>
            {intl.get('srm.common.view.title.chosenTemplateNumber').d('个模板')}
          </>
        )}
      </div>
      <div className={styles['right-list']}>
        {checkedRecords.length > 0 &&
          checkedRecords.map(record => (
            <div className={styles['right-list-item']} key={record[PRIMARY_FIELD]}>
              <div className={styles['right-list-item-header']}>
                <div className={styles['right-list-item-name']}>{record[TEXT_FIELD]}</div>
                <div>
                  <Icon
                    type="close"
                    className={styles['right-list-item-icon']}
                    onClick={() => onUnCheckTreeRecord(record[PRIMARY_FIELD])}
                  />
                </div>
              </div>
              <div className={styles['right-list-item-footer']}>{record.reportCode}</div>
            </div>
          ))}
      </div>
    </>
  );
}

export default memo(observer(ExportUnits));
