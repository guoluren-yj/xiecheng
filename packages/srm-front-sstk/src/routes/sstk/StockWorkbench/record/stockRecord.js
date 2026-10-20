import React from 'react';
import intl from 'utils/intl';

import './index.less';

const getActionProps = (actionCode) => {
  const _propsMap = {
    NEW: {
      icon: 'add',
    },
    SUBMIT: {
      icon: 'check',
    },
    CONFIRM_TRANSFER: {
      icon: 'done',
    },
    AUTO_APPROVED: {
      icon: 'authorize',
      colors: ['#47b883', '#F56349'],
      classNames: ['color-green'],
      iconColor: '#47b883',
    },
    // 工作流审批通过
    WFL_APPROVAL: {
      icon: 'authorize',
      colors: ['#47b883', '#F56349'],
      classNames: ['color-green', 'pointer'],
      iconColor: '#47b883',
    },
    WFL_REJECT: {
      icon: 'authorize',
      colors: ['#f56649', '#F56349'],
      classNames: ['color-red', 'pointer'],
      iconColor: '#f56649',
    },
    // 确认出库
    CONFIRM_DELIVERY: {
      icon: 'check',
    },
    // 确认入库
    CONFIRM_STORAGE: {
      icon: 'check',
    },
    DELETE: {
      icon: 'delete',
    },
  };
  return _propsMap[actionCode] || { icon: 'add' };
};

// 240px
export default function stockRecordRender(
  { record },
  { rowRecord, rowData = {} },
  goBack = (e) => e
) {
  const {
    operateUser,
    operatedTime,
    operationCode = '', // 防止空指针
    operationCodeMeaning,
    operatedRemark,
  } = record.get([
    'operateUser',
    'operationCode',
    'operationCodeMeaning',
    'operatedTime',
    'operatedRemark',
  ]);
  const { icon, classNames = [], iconColor } = getActionProps(operationCode);
  const name = rowRecord ? rowRecord.get('orderName') : rowData.orderName;
  const isWorkFlow = operationCode.includes('WFL');
  const isApprove = ['AUTO_APPROVED'].includes(operationCode);
  const getAction = () => {
    if (isApprove) {
      return intl.get('hzero.common.button.approval').d('审批');
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
            <span className="operate-name">{operateUser}</span>
            <span className="operate-action">
              {getAction(operationCode)}
              {intl.get('sagm.common.view.le').d('了')}
            </span>
            <span className="operate-text">
              【<span className="record-text">{name}</span>】
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
    content: !isWorkFlow && <span className={`${selfName}`}>{operatedRemark}</span>,
  };
}
