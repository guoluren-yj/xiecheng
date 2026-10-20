import React from 'react';
import intl from 'utils/intl';
import './styles.less';

const getActionProps = (actionCode) => {
  const _propsMap = {
    NEW: {
      icon: 'add',
    },
    PUBLISHED: {
      icon: 'publish2',
    },
    AUTO_PUBLISH: {
      icon: 'publish2',
    },
    AUTO_PUBLISHED: {
      icon: 'publish2',
    },
    CANCEL_PUBLISHED: {
      icon: 'publish_cancel',
    },
    REJECTED: {
      icon: 'authorize',
      classNames: ['color-red'],
      iconColor: '#F56349',
    },
    APPROVED: {
      icon: 'authorize',
      classNames: ['color-green'],
      iconColor: '#47B881',
    },
    AUTO_APPROVED: {
      icon: 'authorize',
      classNames: ['color-green'],
      iconColor: '#47B881',
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
    SUBMITED: {
      icon: 'check',
    },
    DELETED: {
      icon: 'delete',
    },
    EDIT: {
      icon: 'mode_edit',
    },
    EFFECTED: {
      icon: 'verified_user-o',
    },
  };
  return _propsMap[actionCode] || { icon: 'add' };
};
export default function agmHeaderRender({ record }, { rowRecord }, goBack = (e) => e) {
  const agmName = rowRecord.get('agreementHeaderName');
  const {
    operateByName,
    operateDate,
    action = '',
    actionMeaning,
    remark,
    remarkMeaning,
  } = record.get([
    'action',
    'remark',
    'operateDate',
    'actionMeaning',
    'remarkMeaning',
    'operateByName',
  ]);
  const { icon, classNames = [], iconColor } = getActionProps(action);
  const isApprove = ['APPROVED', 'REJECTED', 'AUTO_APPROVED'].includes(action);
  const _actionMeaning = isApprove
    ? intl.get('sagm.common.view.approval').d('审批了')
    : actionMeaning;
  const isWorkFlow = action.includes('WFL');
  const selfName = classNames.join(' ');

  return {
    icon,
    time: operateDate,
    color: iconColor || '#e5e5e5',
    header:
      isWorkFlow && action !== 'WFL_REVERTED' ? (
        <div className="operate-action">
          <div className="operate-wrapper">
            <span className={selfName} onClick={goBack}>
              {actionMeaning}
            </span>
          </div>
        </div>
      ) : (
        <div className="operate-action">
          <div className="operate-wrapper">
            <span className="operate-name">{operateByName}</span>
            <span className="operate-action">
              {_actionMeaning}
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
                <span className={`operate-text-result-more ${selfName}`}>【{actionMeaning}】</span>
              </>
            )}
          </div>
        </div>
      ),
    content: !isWorkFlow && <span className={`${selfName}`}>{remarkMeaning || remark}</span>,
  };
}
