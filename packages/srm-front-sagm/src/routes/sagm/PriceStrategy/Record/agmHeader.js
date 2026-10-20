import React from 'react';

import intl from 'utils/intl';
import styles from './index.less';

// 240px
export default function recordRender({ record }, viewHistory = (e) => e, strategyCode) {
  const { createdBy, lastUpdateDate, strategyName, versionNum, priceStrategyId } = record.get([
    'lastUpdateDate',
    'strategyName',
    'createdBy',
    'versionNum',
    'priceStrategyId',
  ]);

  return {
    icon: 'check',
    time: lastUpdateDate,
    header: (
      <div className={styles['operate-action']}>
        {intl
          .getHTML('sagm.common.view.message.AgRecord', {
            name: createdBy,
            // action: intl.get().d('提交'),
            destination: strategyName,
          })
          .d(
            <div className="operate-wrapper">
              <span className="operate-name">{createdBy}</span>
              <span className="operate-action">
                {intl.get('sagm.protocolManagement.view.opAction').d('提交了')}
              </span>
              <span className="operate-text">
                【<span className="record-text">{strategyName}</span>】
              </span>
            </div>
          )}
      </div>
    ),
    content: (
      <div className={styles['operation-content']}>
        <span className={styles['operation-prefix']}>
          {intl
            .get('sagm.protocolManagement.view.opAction.content.prefix', {
              value: versionNum,
            })
            .d(`版本号为 ${versionNum}`)}
        </span>
        <span>
          <a onClick={() => viewHistory(priceStrategyId, strategyCode, true)}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        </span>
      </div>
    ),
  };
}
