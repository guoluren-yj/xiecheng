import React from 'react';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import intl from 'hzero-front/lib/utils/intl';
import styles from '../index.less';

const ExportUnits = observer<any>(({ checkedRecords, onUnCheckTreeRecord }) => {
  return (
    <>
      <div className={styles['right-title']}>
        {!checkedRecords.length ? (
          intl.get('hpfm.individual.view.title.needSelectTpl').d('请在左侧选择需要导出的模板')
        ) : (
          <>
            {intl.get('hpfm.individual.view.title.chosen').d('已选择')}
            <span>{checkedRecords.length}</span>
            {intl.get('hpfm.individual.view.title.chosenTplNumber').d('个模板')}
          </>
        )}
      </div>
      <div className={styles['right-list']}>
        {checkedRecords.length > 0 &&
          checkedRecords.map(record => (
            <div className={styles['right-list-item']} key={record.nodeKey}>
              <div className={styles['right-list-item-header']}>
                <div className={styles['right-list-item-name']}>{record.nodeName}</div>
                <div>
                  <Icon
                    type="close"
                    className={styles['right-list-item-icon']}
                    onClick={() => onUnCheckTreeRecord(record.nodeKey)}
                  />
                </div>
              </div>
              <div className={styles['right-list-item-footer']}>{record.templateCode}</div>
            </div>
          ))}
      </div>
    </>
  );
});

export default ExportUnits;
