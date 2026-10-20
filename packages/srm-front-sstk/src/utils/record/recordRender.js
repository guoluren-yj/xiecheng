import React from 'react';

import intl from 'utils/intl';
import styles from './index.less';

export function strategyRecordRender({ record }, strategyName) {
  const iconMap = {
    NEW: 'add',
    SAVE: 'mode_edit',
    RELEASE: 'publish',
    CANCEL: 'cancel',
  };
  const {
    operator,
    operationCodeMeaning,
    operationCode,
    operatedTime,
    operatedRemarkMeaning,
  } = record.get([
    'operator',
    'operationCodeMeaning',
    'operationCode',
    'operatedTime',
    'operatedRemarkMeaning',
  ]);

  return {
    icon: iconMap[operationCode],
    time: operatedTime,
    header: (
      <div className={styles['operate-action']}>
        <div className="operate-wrapper">
          <span className="operate-name">{operator}</span>
          <span className="operate-action">
            {operationCodeMeaning}
            {intl.get('sagm.common.view.le').d('了')}
          </span>
          <span className="operate-text">
            【<span className="record-text">{strategyName}</span>】
          </span>
        </div>
      </div>
    ),
    content: (
      <div className="operate-content">
        <div hidden={!operatedRemarkMeaning} className='operate-content-reason'>
          <span>{intl.get('sstk.common.model.remark').d('备注')}：</span>
          <span>{operatedRemarkMeaning}</span>
        </div>
      </div>
    ),
  };
}
