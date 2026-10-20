import React from 'react';
import { Icon, Text } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import styles from '../index.less';
import { PRIMARY_KEY } from '../store';

const ExportUnits = observer(({ checkedRecords, onUnCheckTreeRecord }
: {
  checkedRecords: any[],
  // eslint-disable-next-line no-unused-vars
  onUnCheckTreeRecord: (key: any) => void;
}) => {

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
            <div className={styles['right-list-item']} key={record[PRIMARY_KEY]}>
              <div className={styles['right-list-item-header']}>
                <div className={styles['right-list-item-name']}><Text>{record.templateName}</Text></div>
                <div>
                  <Icon
                    type="close"
                    className={styles['right-list-item-icon']}
                    onClick={() => onUnCheckTreeRecord(record[PRIMARY_KEY])}
                  />
                </div>
              </div>
              <div className={styles['right-list-item-footer']}><Text>{record.templateCode}</Text></div>
            </div>
          ))}
      </div>
    </>
  );
});

export default ExportUnits;
