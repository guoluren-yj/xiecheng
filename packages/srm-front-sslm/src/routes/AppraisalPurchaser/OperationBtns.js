/*
 * @Date: 2023-11-07 14:18:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { Fragment } from 'react';

import intl from 'utils/intl';
import MoreButton from '@/routes/components/MoreButton';
import { ApprovalBtn, RevokeApprovalBtn } from '@/routes/components/WorkFlowApproval';

const OperationBtns = props => {
  const {
    remote,
    record,
    activeKey,
    onCopy,
    onEdit,
    onDiscard,
    onRecalculate,
    onUnratedPerson,
    approvalInfo = {},
    dataSet,
    notPermissionBtns = [],
  } = props;
  const { evalStatus, businessKey } = record.get(['evalStatus', 'businessKey']) || {};

  // 评分中，隐藏审批/撤销审批
  const hiddenApprovalBtn = evalStatus === 'MANUAL_EVALUATING';
  // 审批/撤销审批
  const { approvalDataMap, revokeDataMap } = approvalInfo || {};
  const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
  // 撤销审批按钮
  const revokeBtnProps = revokeDataMap ? revokeDataMap[businessKey] : {};

  const btns = [
    {
      name: 'edit',
      onClick: onEdit,
      hidden: !(
        activeKey === 'all' &&
        ![
          'SYSTEM_PROCESSING',
          'APPROVING',
          'PUBLISHED',
          'APPEALING',
          'DISCARDED',
          'SUPPLIER_CONFIRMED',
          'NEW_APPROVING',
        ].includes(evalStatus)
      ),
      child: intl.get('hzero.common.button.edit').d('编辑'),
    },
    {
      name: 'copy',
      onClick: onCopy,
      hidden: activeKey !== 'all',
      child: intl.get('hzero.common.button.copy').d('复制'),
    },
    {
      name: 'discard',
      onClick: onDiscard,
      hidden: !(
        activeKey === 'all' &&
        ['NEW', 'NEW_APPROVED', 'NEW_REJECTED', 'SYSTEM_FAIL', 'MANUAL_EVALUATING'].includes(
          evalStatus
        )
      ),
      child: intl.get('sslm.common.button.discard').d('废弃'),
    },
    {
      name: 'viewUnratedPerson',
      onClick: onUnratedPerson,
      hidden: evalStatus !== 'MANUAL_EVALUATING',
      child: intl.get('sslm.common.button.viewUnratedPerson').d('查看未评分人'),
    },
    {
      name: 'recalculate',
      onClick: onRecalculate,
      hidden: evalStatus !== 'SYSTEM_FAIL',
      child: intl.get(`sslm.supplierDocManage.view.button.execute`).d('执行评分'),
    },
    {
      name: 'approval',
      hidden: isEmpty(approvalBtnProps) || activeKey !== 'all' || hiddenApprovalBtn,
      btnComp: <ApprovalBtn />,
      approveProps: {
        ...approvalBtnProps,
        onSuccess: () => dataSet.query(),
      },
      showIcon: false,
    },
    {
      name: 'revokeApproval',
      hidden: isEmpty(revokeBtnProps) || activeKey !== 'all' || hiddenApprovalBtn,
      btnComp: <RevokeApprovalBtn />,
      showIcon: false,
      approveProps: {
        businessKey,
        onSuccess: () => dataSet.query(),
      },
    },
  ]
    .map(b => {
      const { name, hidden } = b;
      const newHidden = hidden || notPermissionBtns.includes(name);
      return { ...b, hidden: newHidden };
    })
    .filter(btn => !btn.hidden);

  const buttons = remote
    ? remote.process('SSLM_APPRAISAL_PURCHASER_LIST_LINE_BTNS', btns, { evalStatus, ...props })
    : btns;

  return <Fragment>{isEmpty(buttons) ? '-' : <MoreButton buttons={buttons} />}</Fragment>;
};

export default OperationBtns;
