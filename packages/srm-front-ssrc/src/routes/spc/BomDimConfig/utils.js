import React from 'react';
import { Menu } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from './index.less';

export const renderHistoryVersion = (versionList, viewHistory) => {
    return (
      <div className={styles['history-wrapper']}>
        <Menu>
          {versionList.map((item) => {
                    const { bomTemplateId, versionNum, creationName, creationDate } = item;
                    return (
                      <Menu.Item onClick={() => viewHistory(item)} key={bomTemplateId}>
                        <div className={styles['history-version']}>
                          {`${intl.get('spc.bomDimConfig.model.bomDimConfig.version').d('版本')}v${versionNum}`}
                        </div>
                        <div className={styles['history-creation']}>
                          <span style={{ paddingRight: '8px' }}> {creationName}</span>
                          {creationDate}
                        </div>
                      </Menu.Item>
                    );
                })}
        </Menu>
      </div>
    );
};
