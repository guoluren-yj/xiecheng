import React from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import { operationRecordsModal } from '@/routes/components/OperationRecords';

const HeaderBtns = ({
  remote,
  isEdit,
  loading,
  changeReqId,
  showAppealBtn,
  onSubmit,
  onSave,
  onAppeal,
  onDelete,
}) => {
  // 操作记录
  const handleOperationRecord = () => {
    operationRecordsModal({
      remote,
      changeReqId,
      documentId: changeReqId,
      isSupplier: true,
      documentType: 'ENTERPRISE_TENANT_CONFIRM',
    });
  };

  const buttons = [
    {
      btnComp: Button,
      btnProps: {
        icon: 'check',
        color: 'primary',
        onClick: () => onSubmit(),
        wait: 200,
        waitType: 'throttle',
        hidden: !isEdit,
        loading,
      },
      child: intl.get('hzero.common.button.submit').d('提交'),
    },
    {
      btnComp: Button,
      btnProps: {
        icon: 'save',
        funcType: 'flat',
        onClick: () => onSave(),
        wait: 200,
        waitType: 'throttle',
        hidden: !isEdit,
        loading,
      },
      child: intl.get('hzero.common.button.save').d('保存'),
    },
    {
      btnComp: Button,
      btnProps: {
        icon: 'question_answer',
        hidden: !showAppealBtn,
        funcType: 'flat',
        onClick: () => onAppeal(),
        wait: 200,
        waitType: 'throttle',
        loading,
      },
      child: intl.get('sslm.enterpriseInform.button.appeal').d('申诉'),
    },
    {
      btnComp: Button,
      btnProps: {
        icon: 'operation_service_request',
        hidden: isEdit,
        funcType: 'flat',
        onClick: () => handleOperationRecord(),
        wait: 200,
        waitType: 'throttle',
        loading,
      },
      child: intl.get('hzero.common.button.operation').d('操作记录'),
    },
    {
      btnComp: Button,
      btnProps: {
        icon: 'delete',
        hidden: !isEdit,
        funcType: 'flat',
        onClick: () => onDelete(),
        wait: 200,
        waitType: 'throttle',
        loading,
      },
      child: intl.get('hzero.common.button.delete').d('删除'),
    },
  ];
  return <DynamicButtons maxNum={5} trigger="hover" buttons={buttons} defaultBtnType="c7n-pro" />;
};

export default HeaderBtns;
