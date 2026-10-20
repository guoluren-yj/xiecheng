import React from 'react';

import intl from 'utils/intl';
import styles from './index.less';

// 240px
export default function lineRender({ record }, modal, callBack) {
  // const iconMap = {
  //   NEW: 'add',
  //   SAVE: 'save',
  //   SUBMIT: 'check',
  //   REJECT: 'authorize',
  //   APPROVED: 'authorize',
  //   CANCELED: 'reply',
  // };
  const {
    realName,
    submitDate,
    // operationCode,
    agreementName,
    agreementId,
    versionNum,
    // remark,
  } = record.get([
    'operationCode',
    'submitDate',
    'agreementName',
    'agreementId',
    // 'remark',
    'realName',
    'versionNum',
  ]);

  const viewDetail = () => {
    modal.close();
    callBack(agreementId, versionNum);
  };

  return {
    icon: 'check',
    time: submitDate,
    header: (
      <div className={styles['operate-action']}>
        {intl
          .getHTML('sagm.common.view.message.AgRecord', {
            name: realName,
            // action: intl.get().d('提交'),
            destination: agreementName,
          })
          .d(
            <div className="operate-wrapper">
              <span className="operate-name">{realName}</span>
              <span className="operate-action">
                {intl.get('sagm.protocolManagement.view.opAction').d('提交了')}
              </span>
              <span className="operate-text">
                【<span className="record-text">{agreementName}</span>】
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
          <a onClick={viewDetail}>{intl.get('hzero.common.button.viewDetail').d('查看详情')}</a>
        </span>
      </div>
    ),
  };
}
