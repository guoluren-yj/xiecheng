import React from 'react';
import intl from 'utils/intl';

import './index.less';

const getActionProps = (actionCode) => {
  const _propsMap = {
    NEW: {
      icon: 'add',
    },
    UPGRADE: {
      icon: 'arrow_circle_up-o',
    },
    DELETED: {
      icon: 'delete',
    },
    PUBLISHED: {
      icon: 'publish2',
    },
    CANCEL_PUBLISHED: {
      icon: 'publish_cancel',
    },
    REJECT: {
      icon: 'authorize',
      classNames: ['color-red'],
      iconColor: '#f56649',
    },
    APPROVED: {
      icon: 'authorize',
      classNames: ['color-green'],
      iconColor: '#47b883',
    },
    // 工作流审批通过
    WFL_APPROVED: {
      icon: 'authorize',
      colors: ['#47b883', '#F56349'],
      classNames: ['color-green', 'pointer'],
      iconColor: '#47b883',
    },
    WFL_REJECTED: {
      icon: 'authorize',
      colors: ['#f56649', '#F56349'],
      classNames: ['color-red', 'pointer'],
      iconColor: '#f56649',
    },
    // 工作流撤回
    WFL_REVERTED: {
      icon: 'authorize',
      colors: ['#F56349', '#F56349'],
    },
    SUBMITTED: {
      icon: 'check',
    },
    DISABLED: {
      icon: 'cancel_presentation',
    },
    TERMINATED: {
      icon: 'not_interested',
    },
  };
  return _propsMap[actionCode] || { icon: 'add' };
};

// 240px
export default function agmHeaderRender(
  { record },
  { rowRecord, rowData = {} },
  goBack = (e) => e
) {
  const agmName = rowRecord ? rowRecord.get('agreementName') : rowData.agreementName;
  const {
    realName,
    operatedTime,
    operationCode = '', // 防止空指针
    operationCodeMeaning,
    operatedRemark,
    operatedRemarkMeaning,
  } = record.get([
    'operationCode',
    'operatedTime',
    'operationCodeMeaning',
    'operatedRemark',
    'realName',
    'operatedRemarkMeaning',
  ]);
  const { icon, classNames = [], iconColor } = getActionProps(operationCode);
  const isApprove = operationCode.includes('APPROVED') || operationCode.includes('REJECT');

  const isWorkFlow = operationCode.includes('WFL');
  const getAction = () => {
    if (isApprove) {
      return intl.get('sagm.common.view.approval').d('审批了');
    } else return operationCodeMeaning;
  };

  const selfName = classNames.join(' ');

  return {
    icon,
    color: iconColor,
    time: operatedTime,
    header:
      isWorkFlow && operationCode !== 'WFL_REVERTED' ? (
        <div className="operate-action">
          <div className="operate-wrapper">
            <span className={selfName} onClick={goBack}>
              {operationCodeMeaning}
            </span>
          </div>
        </div>
      ) : (
        <div className="operate-action">
          <div className="operate-wrapper">
            <span className="operate-name">{realName}</span>
            <span className="operate-action">
              {getAction(operationCode)}
              {/* {intl.get('sagm.common.view.le').d('了')} */}
            </span>
            <span className="operate-text">
              【<span className="record-text">{agmName}</span>】
            </span>
            {isApprove && (
              <>
                <span className="operate-text-result-prefix">
                  {intl.get('sagm.common.view.approveResultPrefix').d('，审批结果为：')}
                </span>
                <span className={`operate-text-result-more ${selfName}`}>
                  【{operationCodeMeaning}】
                </span>
              </>
            )}
          </div>
        </div>
      ),
    content: !isWorkFlow && (
      <div className="operate-content">
        {/* <span className={`${selfName}`}>{operatedRemark}</span> */}
        <div hidden={!operatedRemarkMeaning || !operatedRemark} className="operate-content-reason">
          <span>{intl.get('sagm.common.view.reason').d('原因')}：</span>
          <span>{operatedRemarkMeaning || operatedRemark}</span>
        </div>
      </div>
    ),
  };
}
