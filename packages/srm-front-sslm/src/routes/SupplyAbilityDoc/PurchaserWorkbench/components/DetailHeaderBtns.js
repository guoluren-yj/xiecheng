/*
 * HeaderBtns 详情-按钮组
 * @Date: 2024-06-04 13:38:15
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import ApproveButton from '_components/ApproveButton';
import DynamicButtons from '_components/DynamicButtons';

import { handleSupplierDetail } from '@/routes/components/utils/utils';

const permissions = [
  {
    name: 'supplierInfo',
    code: 'srm.partner.supply-ability-doc-purchaser.button.360info',
    meaning: '供应商360信息',
  },
];

const HeaderBtns = observer(
  ({
    customizeBtnGroup,
    loading,
    sourceType,
    handleSave = () => {},
    handleDelete = () => {},
    handleSubmit = () => {},
    handleOperationRecord = () => {},
    headerInfo = {},
    isEdit,
    handleApproved = () => {},
    handleRefused = () => {},
    handleEdit = () => {},
    submitValidate = () => {},
    isPub,
  }) => {
    const {
      abilityReqStatus,
      usePurchaseItemFlag = 1,
      initiateCamp = '0',
      abilityReqId,
      businessKey,
      businessApvMethod,
    } = headerInfo || {};
    const showAppeoveBtn = ['WAIT_APPROVAL', 'REJECTED_WFL'].includes(abilityReqStatus) && !isPub;

    // 供应商发起的单据，采购方不允许供应商选择物料时展示保存按钮
    const showSaveBtn = isPub
      ? false
      : isEdit || (!!Number(initiateCamp) && !Number(usePurchaseItemFlag) && showAppeoveBtn);
    // 编辑页面按钮
    const showEditPageBtn = isEdit && abilityReqId;

    // 提交为主按钮
    const submitMainBtn = showEditPageBtn && !showAppeoveBtn;
    // 保存为主按钮
    const saveMainBtn = isEdit && !abilityReqId;
    // 编辑按钮
    const showEditBtn = ['NEW', 'REJECTED'].includes(abilityReqStatus) && !isEdit && !isPub;
    // 工作流审批指定审批人
    const designatedFlag = useMemo(() => businessApvMethod === 'WFL_DYNAMICALLY', [
      businessApvMethod,
    ]);

    // 提交指定审批人
    const submitDesignatedProps = {
      businessKey,
      customizeCode: 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.DESIGNATED_APPROVER',
      documentCode: 'SSLM_SA_REQ_DOCUMENT',
      beforeClick: submitValidate,
      onSuccess: handleSubmit,
      buttonText: intl.get('hzero.common.button.submit').d('提交'),
      buttonProps: {
        icon: 'check',
        funcType: submitMainBtn ? 'raised' : 'flat',
        color: submitMainBtn ? 'primary' : '',
      },
    };
    // 审批通过指定审批人
    const approvedDesignatedProps = {
      businessKey,
      customizeCode: 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.DESIGNATED_APPROVER',
      documentCode: 'SSLM_SA_REQ_DOCUMENT',
      onSuccess: handleApproved,
      buttonText: intl.get('hzero.common.button.approved').d('审批通过'),
      buttonProps: {
        icon: 'check_circle',
        funcType: showAppeoveBtn ? 'raised' : 'flat',
        color: showAppeoveBtn ? 'primary' : '',
      },
    };

    const buttons = [
      {
        name: 'submit',
        btnComp: designatedFlag ? ApproveButton : Button,
        btnProps: {
          icon: 'check',
          type: 'c7n-pro',
          funcType: submitMainBtn ? 'raised' : 'flat',
          color: submitMainBtn ? 'primary' : '',
          onClick: handleSubmit,
          ...(designatedFlag ? submitDesignatedProps : {}),
        },
        child: intl.get('hzero.common.button.submit').d('提交'),
        hidden: !showEditPageBtn,
      },
      {
        name: 'approved',
        btnComp: designatedFlag ? ApproveButton : Button,
        btnProps: {
          icon: 'check_circle',
          type: 'c7n-pro',
          funcType: showAppeoveBtn ? 'raised' : 'flat',
          color: showAppeoveBtn ? 'primary' : '',
          onClick: handleApproved,
          ...(designatedFlag ? approvedDesignatedProps : {}),
        },
        child: intl.get('hzero.common.button.approved').d('审批通过'),
        hidden: !showAppeoveBtn,
      },
      {
        name: 'refused',
        btnProps: {
          icon: 'cancel',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleRefused,
        },
        child: intl.get('hzero.common.button.refused').d('审批拒绝'),
        hidden: !showAppeoveBtn,
      },
      {
        name: 'save',
        btnProps: {
          type: 'c7n-pro',
          icon: 'save',
          funcType: saveMainBtn ? 'raised' : 'flat',
          color: saveMainBtn ? 'primary' : '',
          onClick: handleSave,
        },
        hidden: !showSaveBtn,
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'delete',
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          onClick: handleDelete,
        },
        hidden: !showEditPageBtn,
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
      {
        name: 'edit',
        btnProps: {
          type: 'c7n-pro',
          icon: 'mode_edit',
          color: 'primary',
          onClick: handleEdit,
        },
        hidden: !showEditBtn,
        child: intl.get('hzero.common.button.edit').d('编辑'),
      },
      {
        name: 'operationRecord',
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: handleOperationRecord,
        },
        hidden: !abilityReqId,
        child: intl.get('hzero.common.button.operation').d('操作记录'),
      },
      {
        name: 'supplierInfo',
        hidden: !abilityReqId,
        child: intl.get('sslm.common.view.button.supplierInfo').d('供应商360信息'),
        btnProps: {
          icon: 'find_in_page',
          funcType: 'flat',
          onClick: () => handleSupplierDetail({ ...headerInfo, sourceType }),
        },
      },
    ].map(btn => ({
      ...btn,
      btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 300 },
    }));

    return customizeBtnGroup ? (
      customizeBtnGroup(
        {
          code: 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.HEADER_BTNS',
          pro: true,
        },
        <DynamicButtons
          buttons={buttons}
          maxNum={5}
          trigger="hover"
          defaultBtnType="c7n-pro"
          permissions={permissions}
        />
      )
    ) : (
      <DynamicButtons
        buttons={buttons}
        maxNum={5}
        trigger="hover"
        defaultBtnType="c7n-pro"
        permissions={permissions}
      />
    );
  }
);

export default HeaderBtns;
