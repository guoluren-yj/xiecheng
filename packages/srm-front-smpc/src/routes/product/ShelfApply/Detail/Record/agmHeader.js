import React from 'react';
import intl from 'utils/intl';
import styles from './index.less';

// 240px
export default function lineRender({ record }) {
  const iconMap = {
    NEW: 'add',
    SAVE: 'save',
    SUBMIT: 'check',
    REJECT: 'authorize',
    APPROVED: 'authorize',
    CANCELED: 'reply',
  };
  const {
    operationUserName,
    operationTime,
    operationCode,
    operationCodeMeaning,
    remark,
    applyCode,
  } = record.get([
    'operationCode',
    'operationTime',
    'operationCodeMeaning',
    'remark',
    'operationUserName',
    'applyCode',
  ]);
  return {
    icon: iconMap[operationCode],
    time: operationTime,
    header: (
      <div className={styles['operate-action']}>
        {intl
          .getHTML('sagm.common.view.message.actionRecord', {
            name: operationUserName,
            action: operationCodeMeaning,
            destination: applyCode,
          })
          .d(
            <div className="operate-wrapper">
              <span className="operate-name">{operationUserName}</span>
              <span className="operate-action">{operationCodeMeaning}了</span>
              <span className="operate-text">
                【<span className="record-text">{applyCode}</span>】
              </span>
            </div>
          )}
      </div>
    ),
    content: remark,
  };
}
