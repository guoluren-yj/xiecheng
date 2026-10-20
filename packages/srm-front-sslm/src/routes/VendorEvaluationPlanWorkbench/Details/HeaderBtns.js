/*
 * @Date: 2024-01-02 15:38:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';
import { getCurrentOrganizationId } from 'utils/utils';

import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { handleOpenHistoryVersion as handleViewStrategy } from '@/routes/EvaluationStrategy/utils';
import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';

const tenantId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BASICINFO',
  'SSLM.SUP_PLAN_WORKBENCH_DETAIL.DETAIL_TABLE',
  'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BATCH_ALLOCATION_TABLE',
];

// 头按钮权限集合
export const btnsPermissions = [
  {
    name: 'exportPro',
    code: 'srm.partner.vendor-evaluation-plan-workbench.button.export',
    meaning: '评估计划-导出',
  },
  {
    name: 'approval',
    code: 'srm.partner.vendor-evaluation-plan-workbench.button.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.vendor-evaluation-plan-workbench.button.detail.repeal-approval',
    meaning: '撤销审批',
  },
];

const HeaderBtns = observer(
  ({
    dataSet,
    status,
    isEdit,
    allLoading,
    handleRecordDelete,
    handleSave,
    handlePublish,
    evalPlanHeaderId,
    customizeBtnGroup,
    approvalBtnInfo = {},
    handleQueryDetail = () => {},
    isPub,
  }) => {
    const isCreate = status === 'create';

    //  新建单子时 为true 或者
    const isShowPublish = !isEdit || isCreate;

    const { strategyId, businessKey } = dataSet?.current?.get(['strategyId', 'businessKey']) || {};
    const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
    const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};

    const buttons = [
      {
        name: 'publish',
        hidden: isShowPublish,
        child: intl.get(`hzero.common.button.release`).d('发布'),
        btnProps: {
          icon: 'near_me',
          color: 'primary',
          onClick: handlePublish,
        },
      },
      {
        name: 'save',
        hidden: !isEdit,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          funcType: isCreate ? 'raised' : 'flat',
          color: isCreate ? 'primary' : 'default',
          onClick: handleSave,
        },
      },
      {
        name: 'delete',
        hidden: !isEdit || isCreate,
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          onClick: handleRecordDelete,
        },
      },
      {
        name: 'exportPro',
        hidden: isCreate,
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/eval-plan-headers/single/export`,
          queryParams: {
            evalPlanHeaderId,
          },
          templateCode: 'SRM_C_EVAL_PLAN_HEADER_EXPORT',
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            loading: allLoading,
          },
        },
      },
      {
        name: 'printPro',
        hidden: isCreate,
        btnComp: PrintProButton,
        child: intl.get('hzero.common.button.print').d('打印'),
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/eval-plan-headers/detail-print-new/${evalPlanHeaderId}`,
          buttonProps: {
            funcType: 'flat',
            loading: allLoading,
          },
          params: {
            customizeUnitCode: customizeUnitCode.join(','),
          },
        },
      },
      {
        name: 'viewStrategy',
        hidden: isCreate,
        child: intl.get('sslm.vendorEvaluationPlanDetail.button.header.view').d('查看评估策略'),
        btnProps: {
          icon: 'find_in_page',
          funcType: 'flat',
          disabled: !strategyId,
          onClick: () =>
            handleViewStrategy({
              title: intl
                .get('sslm.vendorEvaluationPlanDetail.button.header.view')
                .d('查看评估策略'),
              strategyId,
            }),
        },
      },
      {
        name: 'operateRecord',
        hidden: isCreate,
        child: intl
          .get('sslm.vendorEvaluationPlanDetail.button.header.operateRecord')
          .d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () =>
            operationRecordsModal({
              documentType: 'EVAL_PLAN',
              documentId: evalPlanHeaderId,
              evalPlanHeaderId,
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
                onSuccess: handleQueryDetail,
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
              onSuccess: handleQueryDetail,
            }),
        },
      },
    ].map(btn => ({
      ...btn,
      btnProps: { ...btn.btnProps, loading: allLoading, waitType: 'throttle', wait: 300 },
    }));

    return customizeBtnGroup(
      {
        code: 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.HEADER_BTNS',
        pro: true,
      },
      <DynamicButtons
        maxNum={5}
        buttons={buttons}
        defaultBtnType="c7n-pro"
        permissions={btnsPermissions}
        unitCode="SSLM.SUP_PLAN_WORKBENCH_DETAIL.HEADER_BTNS"
      />
    );
  }
);

export default HeaderBtns;
