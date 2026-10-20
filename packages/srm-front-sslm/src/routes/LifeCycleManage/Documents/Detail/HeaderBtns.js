/*
 * @Date: 2023-04-20 11:15:01
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import ApproveButton from '_components/ApproveButton';
import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';

import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';

const organizationId = getCurrentOrganizationId();

const btnsPermissions = [
  {
    name: 'approval',
    code: 'srm.partner.lifecycle.management.button.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.lifecycle.management.button.detail.repeal-approval',
    meaning: '撤销审批',
  },
];

const HeaderBtns = ({
  isEdit,
  onSave,
  btnFlag,
  isCreate,
  loading,
  onSubmit,
  onDiscard,
  onRelatedDoc,
  requisitionId,
  onRiskScan,
  isAmktClient,
  onSupplierInfo,
  aiApproveStatus,
  onOperationRecord,
  customizeBtnGroup,
  unitCodeList,
  approvalBtnInfo,
  baseInfoDs,
  handleRefresh = () => {},
  handleSubmit = () => {},
  onIntelligentReview = () => {},
  isPub,
}) => {
  // 审批按钮
  const { businessKey, documentType, businessApvMethod } =
    baseInfoDs?.current?.get(['businessKey', 'documentType', 'businessApvMethod']) || {};
  const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
  const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
  // 升降级类型单据
  const isNormal = useMemo(() => documentType === 'NORMAL', [documentType]);
  // 工作流审批指定审批人
  const designatedFlag = useMemo(() => businessApvMethod === 'WFL_DYNAMICALLY', [
    businessApvMethod,
  ]);
  // 提交指定审批人
  const submitDesignatedProps = {
    businessKey,
    customizeCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.DESIGNATED_APPROVERS',
    documentCode: isNormal ? 'SSLM.NORMAL.REQ_APPROVAL' : 'SSLM.SPECIAL.REQ_APPROVAL',
    beforeClick: () => onSubmit('WFL_DYNAMICALLY'),
    onSuccess: handleSubmit,
    buttonText: intl.get('hzero.common.button.submit').d('提交'),
    buttonProps: {
      loading,
      icon: 'check',
      color: 'primary',
    },
  };
  // 头按钮集合
  const buttons = [
    {
      name: 'submit',
      hidden: !btnFlag,
      btnComp: designatedFlag ? ApproveButton : Button,
      child: intl.get('hzero.common.button.submit').d('提交'),
      btnProps: {
        icon: 'check',
        color: 'primary',
        onClick: onSubmit,
        ...(designatedFlag ? submitDesignatedProps : {}),
      },
    },
    {
      name: 'save',
      hidden: !isEdit,
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        icon: 'save',
        onClick: onSave,
        funcType: isCreate ? 'raised' : 'flat',
        color: isCreate ? 'primary' : 'default',
      },
    },
    {
      name: 'cancel',
      hidden: !btnFlag || isAmktClient,
      child: intl.get('sslm.common.button.discard').d('废弃'),
      btnProps: {
        icon: 'cancel',
        funcType: 'flat',
        onClick: onDiscard,
      },
    },
    {
      name: 'intelligentReview',
      child: (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {!loading && <IntelligentReviewIcon style={{ marginRight: '4px' }} />}
          {intl.get('sslm.common.button.intelligentReview').d('智能预审')}
        </span>
      ),
      btnProps: {
        funcType: 'flat',
        disabled: isCreate || aiApproveStatus === 'APPROVING',
        onClick: onIntelligentReview,
      },
    },
    {
      name: 'operationRecord',
      hidden: isCreate,
      child: intl.get('hzero.common.button.operation').d('操作记录'),
      btnProps: {
        funcType: 'flat',
        icon: 'operation_service_request',
        onClick: onOperationRecord,
      },
    },
    {
      name: 'print',
      hidden: isCreate,
      btnComp: PrintProButton,
      child: intl.get('hzero.common.button.print').d('打印'),
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-reqss/detail-print-new/${requisitionId}`,
        buttonProps: {
          funcType: 'flat',
        },
        params: {
          customizeUnitCode: unitCodeList.join(','),
        },
      },
    },
    {
      name: 'supplierRelatedDoc',
      hidden: isCreate || isAmktClient,
      child: intl.get('sslm.common.view.supplierRelatedDoc').d('关联业务单据'),
      btnProps: {
        icon: 'relate',
        funcType: 'flat',
        onClick: onRelatedDoc,
      },
    },
    {
      name: 'supplierInfo',
      hidden: isCreate || isAmktClient,
      child: intl.get('sslm.common.view.button.supplierInfo').d('供应商360信息'),
      btnProps: {
        icon: 'find_in_page',
        funcType: 'flat',
        onClick: onSupplierInfo,
      },
    },
    {
      name: 'riskScan',
      hidden: isCreate || isAmktClient,
      child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      btnProps: {
        icon: 'document_scanner-o',
        funcType: 'flat',
        onClick: onRiskScan,
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
              onSuccess: handleRefresh,
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
            onSuccess: handleRefresh,
          }),
      },
    },
  ].map(btn => ({
    ...btn,
    btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 300 },
  }));

  return customizeBtnGroup(
    {
      code: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.HEADER_BTNS',
      pro: true,
    },
    <DynamicButtons
      maxNum={5}
      trigger="hover"
      buttons={buttons}
      defaultBtnType="c7n-pro"
      unitCode="SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.HEADER_BTNS"
      permissions={btnsPermissions}
    />
  );
};

export default HeaderBtns;
