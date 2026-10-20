/*
 * HeaderBtns 详情-按钮组
 * @Date: 2024-06-04 13:38:15
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

const HeaderBtns = observer(
  ({
    customizeBtnGroup,
    loading,
    handleSave = () => {},
    handleDelete = () => {},
    handleSubmit = () => {},
    handleOperationRecord = () => {},
    handleEdit = () => {},
    headerInfo = {},
    isEdit,
  }) => {
    const { abilityReqId, abilityReqStatus } = headerInfo || {};
    // 编辑页面除保存外其他按钮
    const showEditPageBtn = isEdit && abilityReqId;

    // 保存为主按钮
    const saveMainBtn = isEdit && !abilityReqId;
    // 编辑按钮
    const showEditBtn = ['NEW', 'REJECTED'].includes(abilityReqStatus) && !isEdit;

    const buttons = [
      {
        name: 'submit',
        btnProps: {
          icon: 'check',
          type: 'c7n-pro',
          funcType: showEditPageBtn ? 'raised' : 'flat',
          color: showEditPageBtn ? 'primary' : '',
          onClick: handleSubmit,
        },
        child: intl.get('hzero.common.button.submit').d('提交'),
        hidden: !showEditPageBtn,
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
        child: intl.get('hzero.common.button.save').d('保存'),
        hidden: !isEdit,
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
    ].map(btn => ({
      ...btn,
      btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 300 },
    }));

    return customizeBtnGroup ? (
      customizeBtnGroup(
        {
          code: 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.HEADER_BTNS',
          pro: true,
        },
        <DynamicButtons buttons={buttons} maxNum={5} trigger="hover" defaultBtnType="c7n-pro" />
      )
    ) : (
      <DynamicButtons buttons={buttons} maxNum={5} trigger="hover" defaultBtnType="c7n-pro" />
    );
  }
);

export default HeaderBtns;
