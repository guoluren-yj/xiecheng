/*
 * @Date: 2024-01-22 20:37:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

const btnsPermissions = [
  {
    name: 'delete',
    meaning: '预留申请单-删除',
    code: `srm.partner.suplier-lifecycle.management.ps.button.prepare.delete`,
  },
  {
    name: 'cancel',
    meaning: '预留申请单-废弃',
    code: `srm.partner.suplier-lifecycle.management.ps.button.prepare.obsolete`,
  },
  {
    name: 'printer',
    meaning: '预留申请单查看-打印',
    code: `srm.partner.suplier-lifecycle.management.ps.button.prepare.print`,
  },
];

const HeaderBtns = ({
  loading,
  onSave,
  jump360,
  readOnly,
  saveFlag,
  sourceType,
  submitFlag,
  reviewFlag,
  deleteFlag,
  requisitionId,
  obsoletedFlag,
  backScoreFlag,
  processStatus,
  onPrint,
  onOperat,
  onDelete,
  onBackScore,
  onObsoleted,
  prepareHeader,
  customizeBtnGroup,
}) => {
  const buttons = [
    {
      name: 'save',
      hidden: !saveFlag,
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        loading,
        type: 'primary',
        icon: 'save',
        onClick: () => onSave('save'),
      },
    },
    {
      name: 'delete',
      hidden: !deleteFlag,
      child: intl.get('hzero.common.button.delete').d('删除'),
      btnProps: {
        loading,
        icon: 'delete',
        onClick: onDelete,
      },
    },
    {
      name: 'initiateReview',
      hidden: !reviewFlag,
      child: intl.get('sslm.commonApplication.view.button.initiateReview').d('发起评审'),
      btnProps: {
        loading,
        icon: 'solution',
        onClick: () => onSave('review'),
      },
    },
    {
      name: 'submitReview',
      hidden: !submitFlag,
      child: intl.get('sslm.commonApplication.view.button.submitReview').d('提交审批'),
      btnProps: {
        loading,
        icon: 'check',
        onClick: () => onSave('submit'),
      },
    },
    {
      name: 'backScore',
      hidden: !backScoreFlag,
      child: intl.get('sslm.common.view.button.backScore').d('退回评分'),
      btnProps: {
        loading,
        icon: 'reply',
        onClick: onBackScore,
      },
    },
    {
      name: 'cancel',
      hidden: !obsoletedFlag,
      child: intl.get('sslm.commonApplication.view.button.cancel').d('废弃'),
      btnProps: {
        loading,
        icon: 'close',
        onClick: onObsoleted,
      },
    },
    {
      name: 'printer',
      hidden: !readOnly,
      child: intl.get('hzero.common.button.print').d('打印'),
      btnProps: {
        loading,
        icon: 'printer',
        onClick: onPrint,
      },
    },
    {
      name: 'supplierInfo',
      hidden: !requisitionId,
      child: intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息'),
      btnProps: {
        loading,
        icon: 'file-text',
        onClick: () => jump360({ ...prepareHeader, sourceType }, true),
      },
    },
    {
      name: 'operating',
      hidden: !processStatus,
      child: intl.get('hzero.common.button.operating').d('操作记录'),
      btnProps: {
        loading,
        icon: 'file-text',
        onClick: onOperat,
      },
    },
  ];
  return customizeBtnGroup(
    {
      code: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER_BTNGROUP',
      pro: true,
    },
    <DynamicButtons
      buttons={buttons}
      permissions={btnsPermissions}
      unitCode="SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER_BTNGROUP"
    />
  );
};

export default HeaderBtns;
