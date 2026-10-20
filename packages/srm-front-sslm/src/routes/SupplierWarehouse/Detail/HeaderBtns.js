/*
 * @Date: 2024-05-17 11:15:01
 * @Author: CDJ <dengji.chen@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';

const btnsPermissions = () => {
  return [
    {
      name: 'infoCompare',
      code: 'srm.partner.my-partner.supplier-warehouse.ps.button',
      meaning: '简易入库信息比对-查看',
    },
    {
      name: 'approval',
      code: 'srm.partner.my-partner.supplier-warehouse.button.detail.approval',
      meaning: '审批',
    },
    {
      name: 'revokeApproval',
      code: 'srm.partner.my-partner.supplier-warehouse.button.detail.repeal-approval',
      meaning: '撤销审批',
    },
  ];
};

const HeaderBtns = ({
  submitFlag,
  handleSubmit,
  loading = false,
  handleSave,
  isEdit = false,
  handleDelete,
  headerData = {},
  handleInfoCompare,
  handleOperationModal,
  extSupplierReqId,
  approvalBtnInfo = {},
  handleRefresh = () => {},
  isPub,
}) => {
  const { reqTypeCode, businessKey } = headerData || {};
  const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
  const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
  // 头按钮集合
  const buttons = [
    {
      name: 'submit',
      hidden: !submitFlag,
      child: intl.get('hzero.common.button.submit').d('提交'),
      btnProps: {
        icon: 'check',
        color: 'primary',
        onClick: handleSubmit,
      },
    },
    {
      name: 'save',
      hidden: !isEdit,
      child: intl.get('hzero.common.save').d('保存'),
      btnProps: {
        icon: 'save',
        funcType: 'flat',
        onClick: handleSave,
      },
    },
    {
      name: 'delete',
      hidden: !isEdit,
      child: intl.get('hzero.common.button.enter').d('删除'),
      btnProps: {
        icon: 'delete',
        funcType: 'flat',
        onClick: handleDelete,
      },
    },
    {
      name: 'infoCompare',
      hidden: reqTypeCode !== 'SUP_UPDATE_REQ',
      child: intl.get('hzero.common.button.infoCompare').d('信息比对'),
      btnProps: {
        icon: 'description-o',
        funcType: 'flat',
        onClick: handleInfoCompare,
      },
    },
    {
      name: 'operateRecord',
      hidden: !extSupplierReqId,
      child: intl.get('hzero.common.button.operating').d('操作记录'),
      btnProps: {
        icon: 'schedule',
        funcType: 'flat',
        onClick: handleOperationModal,
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
    btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 500 },
  }));

  return (
    <DynamicButtons
      maxNum={5}
      trigger="hover"
      buttons={buttons}
      defaultBtnType="c7n-pro"
      permissions={btnsPermissions}
    />
  );
};

export default HeaderBtns;
