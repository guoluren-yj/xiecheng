/*
 * @Date: 2024-01-23 09:52:43
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
    meaning: '淘汰申请单-删除',
    code: `srm.partner.suplier-lifecycle.management.ps.button.eliminated.delete`,
  },
  {
    name: 'cancel',
    meaning: '淘汰申请单-废弃',
    code: `srm.partner.suplier-lifecycle.management.ps.button.eliminated.obsolete`,
  },
  {
    name: 'print',
    meaning: '淘汰申请单查看-打印',
    code: `srm.partner.suplier-lifecycle.management.ps.button.eliminated.print`,
  },
];

const HeaderBtns = ({
  loading,
  onSave,
  jump360,
  onPrint,
  onDetele,
  onOperat,
  readOnly,
  sourceType,
  headerInfo,
  onObsoleted,
  editeRemote,
  requisitionId,
  customizeBtnGroup,
}) => {
  const buttons = [
    {
      name: 'save',
      hidden: !editeRemote,
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        loading,
        type: 'primary',
        icon: 'save',
        onClick: () => onSave('save'),
      },
    },
    {
      name: 'submit',
      hidden: !(requisitionId && editeRemote),
      child: intl.get('hzero.common.button.submit').d('提交'),
      btnProps: {
        loading,
        icon: 'check',
        onClick: () => onSave('submit'),
      },
    },
    {
      name: 'delete',
      hidden: !(requisitionId && editeRemote),
      child: intl.get('hzero.common.button.delete').d('删除'),
      btnProps: {
        loading,
        icon: 'delete',
        onClick: onDetele,
      },
    },
    {
      name: 'cancel',
      hidden: !(requisitionId && editeRemote),
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
      hidden: !requisitionId,
      child: intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息'),
      btnProps: {
        loading,
        icon: 'file-text',
        onClick: () => jump360({ ...headerInfo, sourceType }, true),
      },
    },
    {
      name: 'operating',
      hidden: !requisitionId,
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
      code: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER_BTNGROUP',
      pro: true,
    },
    <DynamicButtons
      buttons={buttons}
      permissions={btnsPermissions}
      unitCode="SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER_BTNGROUP"
    />
  );
};

export default HeaderBtns;
