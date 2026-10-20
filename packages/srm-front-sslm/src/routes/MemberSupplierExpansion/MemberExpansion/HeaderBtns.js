/*
 * @Date: 2024-07-30 15:03:46
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useCallback } from 'react';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import { operationRecordsModal } from '@/routes/components/OperationRecords';

import { Store } from '../stores';

const HeaderBtns = () => {
  const { loading, isEdit, dataSource, handleSave, handlePreview, handleRelease } = useContext(
    Store
  );

  // 操作记录
  const handleOperate = useCallback(() => {
    operationRecordsModal({
      isPlatform: true,
      documentId: dataSource.memberInfoId,
      documentType: 'MEMBER_SUPPLIER',
    });
  }, [JSON.stringify(dataSource)]);

  const buttons = [
    {
      name: 'release',
      hidden: !isEdit,
      child: intl.get('hzero.common.button.release').d('发布'),
      btnProps: {
        icon: 'publish2',
        color: 'primary',
        onClick: () => handleRelease(),
      },
    },
    {
      name: 'save',
      hidden: !isEdit,
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        icon: 'save',
        funcType: 'flat',
        onClick: () => handleSave(),
      },
    },
    {
      name: 'update',
      hidden: isEdit,
      child: intl.get('hzero.common.button.update').d('修改'),
      btnProps: {
        icon: 'mode_edit',
        funcType: 'flat',
        onClick: () => handleSave('EDIT'),
      },
    },
    {
      name: 'preview',
      child: intl.get('hzero.common.button.preview').d('预览'),
      btnProps: {
        icon: 'plagiarism',
        funcType: 'flat',
        onClick: () => handlePreview(),
      },
    },
    {
      name: 'operation',
      child: intl.get('hzero.common.button.operation').d('操作记录'),
      btnProps: {
        funcType: 'flat',
        icon: 'operation_service_request',
        onClick: () => handleOperate(),
      },
    },
  ].map(btn => ({
    ...btn,
    btnProps: {
      ...btn.btnProps,
      loading,
      wait: 200,
      waitType: 'throttle',
    },
  }));
  return <DynamicButtons maxNum={5} buttons={buttons} defaultBtnType="c7n-pro" />;
};

export default HeaderBtns;
