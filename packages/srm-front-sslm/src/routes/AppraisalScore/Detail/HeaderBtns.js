/*
 * @Date: 2023-10-20 16:03:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback, useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { refreshTab } from 'utils/menuTab';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import ApproveButton from '_components/ApproveButton';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId } from 'utils/utils';

import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';

const organizationId = getCurrentOrganizationId();

const btnsPermissions = [
  {
    name: 'approval',
    code: 'srm.partner.evaluation-manage.scoring-workbench.button.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.evaluation-manage.scoring-workbench.button.detail.repeal-approval',
    meaning: '撤销审批',
  },
];

const HeaderBtns = ({
  isEdit,
  loading,
  scoreStatus,
  evalStatus,
  onSave,
  onSubmit,
  onRiskScan,
  customizeBtnGroup,
  onRefresh = () => {},
  evalHeaderId,
  onScoreCancel,
  approvalBtnInfo = {},
  submitValidate = () => {},
  getQueryParams = () => {},
  businessKey,
  isPub = false,
  backList,
  basicDs,
  submitUserId,
  remote,
}) => {
  const { dtlApproveConfigFlag } = basicDs?.current?.get(['dtlApproveConfigFlag']) || {};

  // 操作记录
  const handleOperate = useCallback(() => {
    operationRecordsModal({
      evalHeaderId,
      headerId: evalHeaderId,
      documentId: evalHeaderId,
      sourceCode: 'FILLING',
      documentType: 'EVAL_MANAGE_SUBMIT',
    });
  }, [evalHeaderId]);

  // 撤回评分展示逻辑
  const scoreCancelFlag =
    scoreStatus === 'SCORED' &&
    ['MANUAL_EVALUATING', 'MANUAL_COMPLETE', 'FINAL_COLLECTED', 'REJECTED'].includes(evalStatus);

  // 审批/撤销审批
  const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
  const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};

  // 工作流审批指定审批人
  const designatedFlag = useMemo(() => dtlApproveConfigFlag === 'WFL_DYNAMICALLY', [
    dtlApproveConfigFlag,
  ]);

  // 提交指定审批人
  const submitDesignatedProps = {
    businessKey,
    customizeCode: 'SSLM.SCORING_WORKBENCH_DETAIL.DESIGNATED_APPROVER',
    documentCode: 'SSLM.KPI_MANGE_DTL_DOCUMENT',
    beforeClick: submitValidate,
    onSuccess: onSubmit,
    buttonText: intl.get('hzero.common.button.submit').d('提交'),
    buttonProps: {
      icon: 'check',
      color: 'primary',
    },
  };

  const buttons = [
    {
      name: 'submit',
      hidden: !isEdit || isPub,
      btnComp: designatedFlag ? ApproveButton : Button,
      child: intl.get('hzero.common.button.submit').d('提交'),
      btnProps: {
        loading,
        color: 'primary',
        icon: 'check',
        onClick: onSubmit,
        ...(designatedFlag ? submitDesignatedProps : {}),
      },
    },
    {
      name: 'save',
      hidden: !isEdit || isPub,
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        loading,
        funcType: 'flat',
        icon: 'save',
        onClick: onSave,
      },
    },
    {
      name: 'scoreCancel',
      hidden: !scoreCancelFlag || isPub,
      child: intl.get(`sslm.common.button.scoreCancel`).d('撤回评分'),
      btnProps: {
        loading,
        funcType: 'flat',
        icon: 'revocation',
        onClick: onScoreCancel,
      },
    },
    {
      name: 'operationRecord',
      child: intl.get('hzero.common.button.operation').d('操作记录'),
      btnProps: {
        loading,
        funcType: 'flat',
        icon: 'operation_service_request',
        onClick: handleOperate,
      },
    },
    {
      name: 'riskScan',
      child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      btnProps: {
        loading,
        icon: 'document_scanner-o',
        funcType: 'flat',
        onClick: onRiskScan,
      },
    },
    {
      name: 'commonImport',
      btnComp: CommonImport,
      hidden: !isEdit,
      btnProps: {
        refreshButton: true,
        prefixPatch: SRM_SSLM,
        businessObjectTemplateCode: 'SRM_C_SRM_SSLM_KPI_EVAL_HEADER_SCORE_IMPORT',
        buttonText: intl.get('hzero.common.button.import').d('导入'),
        args: {
          organizationId,
          evalHeaderId,
        },
        buttonProps: {
          loading,
          funcType: 'flat',
          permissionList: [
            {
              code: 'srm.partner.evaluation-manage.scoring-workbench.button.import',
              type: 'button',
              meaning: '评分工作台-导入',
            },
          ],
        },
        customeImportTemplate: {
          templateCode: 'SRM_C_SRM_SSLM_KPI_EVAL_HEADER_SCROE_EXPORT',
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/eval-headers/evaluation/new/${evalHeaderId}/export`,
        },
        successCallBack: () => {
          refreshTab();
        },
      },
    },
    {
      name: 'newExport',
      btnComp: ExcelExportPro,
      btnProps: {
        queryParams: () => getQueryParams(),
        templateCode: 'SRM_C_SRM_SSLM_KPI_EVAL_HEADER_SCROE_EXPORT',
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/eval-headers/evaluation/new/${evalHeaderId}/export`,
        buttonText: intl.get('hzero.common.button.export').d('导出'),
        otherButtonProps: {
          loading,
          type: 'c7n-pro',
          funcType: 'flat',
          permissionList: [
            {
              code: 'srm.partner.evaluation-manage.scoring-workbench.button.export',
              type: 'button',
              meaning: '评分工作台-导出',
            },
          ],
        },
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
              onSuccess: () => onRefresh(true),
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
            onSuccess: () => onRefresh(true),
          }),
      },
    },
  ];

  // 埋点
  const remoteButtons = remote
    ? remote.process('SSLM_APPRAISAL_SCORE_DETAIL_PROCESS_HEADER_BUTTONS', buttons, {
        isEdit,
        isPub,
        loading,
        basicDs,
        evalHeaderId,
        submitUserId,
        backList,
      })
    : buttons;

  return customizeBtnGroup ? (
    customizeBtnGroup(
      {
        code: 'SSLM.SCORING_WORKBENCH_DETAIL.HEADER_BTNS',
        pro: true,
      },
      <DynamicButtons
        maxNum={5}
        trigger="hover"
        buttons={remoteButtons}
        defaultBtnType="c7n-pro"
        permissions={btnsPermissions}
        unitCode="SSLM.SCORING_WORKBENCH_DETAIL.HEADER_BTNS"
      />
    )
  ) : (
    <DynamicButtons
      maxNum={5}
      trigger="hover"
      buttons={remoteButtons}
      defaultBtnType="c7n-pro"
      permissions={btnsPermissions}
      unitCode="SSLM.SCORING_WORKBENCH_DETAIL.HEADER_BTNS"
    />
  );
};

export default HeaderBtns;
