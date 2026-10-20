import React from 'react';
import intl from 'utils/intl';

import styles from './styles.less';

const recordLineRender = ({ record }) => {
  const codeMap = {
    CREATE: {
      icon: 'add',
    },
    ENABLE: {
      icon: 'finished',
      color: '#47b883',
    },
    DISABLE: {
      icon: 'not_interested',
      color: '#f56649',
    },
    MODIFY: {
      icon: 'mode_edit',
    },
  };
  const {
    operatedByMeaning,
    operationType,
    operationTypeMeaning,
    operatedTime,
    operationDescription,
  } = record.get([
    'operatedTime',
    'operationDescription',
    'operatedByMeaning',
    'operationType',
    'operationTypeMeaning',
  ]);
  const { icon, color } = codeMap[operationType];
  return {
    icon,
    color,
    time: operatedTime,
    header: (
      <div className={styles['operate-action']}>
        {operationType === 'MODIFY'
          ? intl
              .getHTML('sigl.integral.view.message.actionRecord', {
                name: operatedByMeaning,
                action: operationTypeMeaning,
                destination: operationDescription,
              })
              .d(
                <div className="operate-wrapper">
                  <span className="operate-name">{operatedByMeaning}</span>
                  <span className="operate-action">{operationTypeMeaning}</span>
                  <span className="operate-text">
                    【<span className="record-text">{operationDescription}</span>】
                  </span>
                </div>
              )
          : intl
              .getHTML('sagm.common.view.message.actionRecord', {
                name: operatedByMeaning,
                action: operationTypeMeaning,
                destination: operationDescription,
              })
              .d(
                <div className="operate-wrapper">
                  <span className="operate-name">{operatedByMeaning}</span>
                  <span className="operate-action">{operationTypeMeaning}了</span>
                  <span className="operate-text">
                    【<span className="record-text">{operationDescription}</span>】
                  </span>
                </div>
              )}
      </div>
    ),
    // content: remarkMeaning || remark,
  };
};

export { recordLineRender };
