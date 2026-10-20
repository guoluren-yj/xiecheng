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
import notification from 'utils/notification';
import ApproveButton from '_components/ApproveButton';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { handlePrint } from '@/services/supplierInformService';
import { handleJoinedMointor } from '@/routes/components/utils/utils';
import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';
import { btnsPermissions } from './utils';

const organizationId = getCurrentOrganizationId();

const HeaderBtns = ({
  isEdit,
  onSave,
  submit,
  loading,
  onSubmit,
  onDelete,
  headerInfo,
  compareFlag,
  setLoading,
  onSupplierInfo,
  aiApproveStatus,
  onOperationRecord,
  onIntelligentReview,
  onVersionComparison,
  customizeBtnGroup,
  approvalBtnInfo,
  handleQuery = () => {},
  isPub,
}) => {
  const {
    companyId,
    supplierCompanyId,
    supplierCompanyName,
    changeReqId,
    investgHeaderId,
    domesticForeignRelation,
    businessKey,
    businessApvMethod,
  } = headerInfo;
  const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
  const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
  // 工作流审批指定审批人
  const designatedFlag = useMemo(() => businessApvMethod === 'WFL_DYNAMICALLY', [
    businessApvMethod,
  ]);
  // 提交指定审批人
  const submitDesignatedProps = {
    businessKey,
    customizeCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.DESIGNATED_APPROVER',
    documentCode: 'SSLM.PURC_SUP_CHANGE_DOCUMENT',
    beforeClick: () => onSubmit('WFL_DYNAMICALLY'),
    onSuccess: submit,
    buttonText: intl.get('hzero.common.button.submit').d('提交'),
    buttonProps: {
      loading,
      icon: 'check',
      color: 'primary',
    },
  };

  // 关联调查表打印
  const handleSurveyPrint = () => {
    setLoading(true);
    handlePrint({
      investgHeaderId,
      tenantId: organizationId,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          if (res.type.indexOf('application/json') > -1) {
            notification.warning({
              description: intl
                .get(`sslm.common.view.printwarning.noTemplate`)
                .d('未设置打印模板，不可打印'),
            });
            return;
          }
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow) {
            printWindow.print();
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 头按钮集合
  const buttons = [
    {
      name: 'submit',
      hidden: !isEdit,
      btnComp: designatedFlag ? ApproveButton : Button,
      child: intl.get('hzero.common.button.submit').d('提交'),
      btnProps: {
        icon: 'check',
        color: 'primary',
        onClick: () => onSubmit(),
        ...(designatedFlag ? submitDesignatedProps : {}),
      },
    },
    {
      name: 'save',
      hidden: !isEdit,
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        icon: 'save',
        funcType: 'flat',
        onClick: onSave,
      },
    },
    {
      name: 'delete',
      hidden: !isEdit,
      child: intl.get('hzero.common.button.delete').d('删除'),
      btnProps: {
        icon: 'delete',
        funcType: 'flat',
        onClick: onDelete,
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
        disabled: aiApproveStatus === 'APPROVING',
        onClick: onIntelligentReview,
      },
    },
    {
      name: 'operation',
      child: intl.get('hzero.common.button.operation').d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        funcType: 'flat',
        onClick: onOperationRecord,
      },
    },
    {
      name: 'versionComparison',
      child: compareFlag
        ? intl.get('hzero.common.button.cancelComparison').d('取消对比')
        : intl.get('hzero.common.button.versionComparison').d('版本对比'),
      btnProps: {
        icon: 'compare',
        funcType: 'flat',
        onClick: onVersionComparison,
      },
    },
    {
      name: 'supplierInfo',
      child: intl.get('sslm.common.view.button.supplierInfo').d('供应商360信息'),
      btnProps: {
        icon: 'find_in_page',
        funcType: 'flat',
        onClick: onSupplierInfo,
      },
    },
    {
      name: 'riskScan',
      hidden: domesticForeignRelation !== 1,
      child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      btnProps: {
        icon: 'document_scanner-o',
        funcType: 'flat',
        onClick: () =>
          handleJoinedMointor({
            setLoading,
            companyId,
            supplierCompanyId,
            documentId: changeReqId,
            documentType: 'SUPPLIER_CHANGE',
            companyName: supplierCompanyName,
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
              onSuccess: () => handleQuery(true),
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
            onSuccess: () => handleQuery(true),
          }),
      },
    },
    {
      name: 'detailPrint',
      hidden: isEdit,
      btnComp: PrintProButton,
      child: intl.get('sslm.supplierInform.model.btn.detailPrint').d('变更单打印'),
      btnProps: {
        buttonText: intl.get('sslm.supplierInform.model.btn.detailPrint').d('变更单打印'),
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/detail-print-new/${changeReqId}`,
        buttonProps: {
          funcType: 'flat',
        },
      },
    },
    {
      name: 'surveyPrint',
      hidden: isEdit,
      child: intl.get('sslm.supplierInform.model.btn.surveyPrint').d('关联调查表打印'),
      btnProps: {
        icon: 'print',
        funcType: 'flat',
        disabled: !investgHeaderId,
        onClick: () => handleSurveyPrint(),
      },
    },
  ].map(btn => ({
    ...btn,
    btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 300 },
  }));

  return customizeBtnGroup(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.HEADER_BTNGROUP',
      pro: true,
    },
    <DynamicButtons
      maxNum={5}
      trigger="hover"
      buttons={buttons}
      defaultBtnType="c7n-pro"
      permissions={btnsPermissions}
      unitCode="SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.HEADER_BTNGROUP"
    />
  );
};

export default HeaderBtns;
