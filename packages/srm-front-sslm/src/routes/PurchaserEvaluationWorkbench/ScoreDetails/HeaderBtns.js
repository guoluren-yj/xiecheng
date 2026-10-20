/*
 * @Date: 2024-01-09 09:43:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import DynamicButtons from '_components/DynamicButtons';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';

const btnsPermissions = [
  {
    name: 'approval',
    code: 'srm.partner.purchaser.evaluation-workbench.button.score.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.purchaser.evaluation-workbench.button.score.detail.repeal-approval',
    meaning: '撤销审批',
  },
];

const HeaderBtns = ({
  isPub,
  loading,
  readOnly,
  submitUserId,
  evalHeaderId,
  handleViewEval,
  customizeBtnGroup,
  handleSaveAndSubmit,
  approvalBtnInfo,
  handleQuery = () => {},
  basicInfo = {},
  remote,
  history,
}) => {
  const { businessKey } = basicInfo || {};
  // 审批/撤销审批
  const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
  const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};

  const buttons = [
    {
      name: 'submit',
      hidden: readOnly,
      child: intl.get(`sslm.purchaserEvaluationDetail.button.header.submit`).d('提交'),
      btnProps: {
        color: 'primary',
        icon: 'done',
        loading,
        onClick: () => handleSaveAndSubmit(1),
      },
    },
    {
      name: 'save',
      hidden: readOnly,
      child: intl.get(`hzero.common.button.save`).d('保存'),
      btnProps: {
        funcType: 'flat',
        icon: 'save',
        loading,
        onClick: () => handleSaveAndSubmit(),
      },
    },
    {
      name: 'viewReport',
      child: intl
        .get(`sslm.purchaserEvaluationDetail.button.header.viewEvaluationReport`)
        .d('查看评估报告'),
      btnProps: {
        funcType: 'flat',
        icon: 'find_in_page',
        loading,
        onClick: handleViewEval,
      },
    },
    {
      name: 'operationRecord',
      child: intl.get(`sslm.purchaserEvaluationDetail.button.header.operationRecord`).d('操作记录'),
      btnProps: {
        funcType: 'flat',
        icon: 'operation_service_request',
        loading,
        onClick: () =>
          operationRecordsModal({
            documentType: 'REPORT_EVAL_SUBMIT',
            documentId: evalHeaderId,
            sourceCode: 'FILLING',
            submitUserId: isPub ? submitUserId : '',
          }),
      },
    },
    {
      name: 'approval',
      hidden: isEmpty(approvalDataMap) || isPub,
      child: intl.get('hzero.common.button.approval').d('审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'authorize',
        onClick: () =>
          handleApprove({
            approveProps: {
              ...approvalBtnProps,
              onSuccess: handleQuery,
            },
          }),
      },
    },
    {
      name: 'revokeApproval',
      hidden: isEmpty(revokeDataMap) || isPub,
      child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'reply',
        onClick: () =>
          handleRevokeApprova({
            businessKey,
            onSuccess: handleQuery,
          }),
      },
    },
  ];

  // 埋点
  const remoteButtons = remote
    ? remote.process('SSLM_PURCHASER_EVALUATION_WORKBENCH_SCORE_PROCESS_HEADER_BUTTONS', buttons, {
        readOnly,
        isPub,
        loading,
        basicInfo,
        history,
      })
    : buttons;

  return customizeBtnGroup(
    {
      code: 'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_HEADER_BTN',
      pro: true,
    },
    <DynamicButtons
      maxNum={5}
      buttons={remoteButtons}
      defaultBtnType="c7n-pro"
      permissions={btnsPermissions}
    />
  );
};

export default HeaderBtns;
