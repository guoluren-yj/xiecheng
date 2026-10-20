/*
 * @Date: 2024-01-23 09:29:19
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
    meaning: '潜在申请单-删除',
    code: `srm.partner.suplier-lifecycle.management.ps.button.potential.delete`,
  },
  {
    name: 'cancel',
    meaning: '潜在申请单-废弃',
    code: `srm.partner.suplier-lifecycle.management.ps.button.potential.obsolete`,
  },
  {
    name: 'print',
    meaning: '潜在申请单查看-打印',
    code: `srm.partner.suplier-lifecycle.management.ps.button.potential.print`,
  },
];

const HeaderBtns = ({
  loading,
  saveFlag,
  processStatus,
  readOnly,
  jump360,
  sourceType,
  headerInfo,
  submitFlag,
  reviewFlag,
  deleteFlag,
  obsoletedFlag,
  backScoreFlag,
  onSave,
  onPrint,
  onDetele,
  onOperat,
  onBackScore,
  onObsoleted,
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
        onClick: onDetele,
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
      name: 'print',
      hidden: !readOnly,
      child: intl.get('hzero.common.button.print').d('打印'),
      btnProps: {
        loading,
        type: 'primary',
        icon: 'printer',
        onClick: onPrint,
      },
    },
    {
      name: 'supplierInfo',
      hidden: !processStatus,
      child: intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息'),
      btnProps: {
        loading,
        icon: 'file-text',
        onClick: () => jump360({ ...headerInfo, sourceType }, true),
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
      code: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_HEADER_BTNGROUP',
      pro: true,
    },
    <DynamicButtons
      buttons={buttons}
      permissions={btnsPermissions}
      unitCode="SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_HEADER_BTNGROUP"
    />
  );
};

export default HeaderBtns;
