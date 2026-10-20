/*
 * @Date: 2024-09-03 17:50:33
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

const permissions = [
  {
    name: 'supplierInfo',
    code: 'srm.partner.suplier-ability.supply-ability-evaluate.ps.supplier.info',
    meaning: '查看供应商360信息',
  },
];

const HeaderBtns = ({
  isPub,
  onSave,
  loading,
  onSubmit,
  headerInfo,
  sourceType,
  onSupplierDetail,
  customizeBtnGroup,
  reviewSelectedRows,
}) => {
  const buttons = [
    {
      name: 'save',
      hidden: isPub,
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        loading,
        icon: 'save',
        type: 'primary',
        onClick: () => onSave(),
      },
    },
    {
      name: 'submit',
      hidden: isPub,
      child: intl.get('hzero.common.button.submit').d('提交'),
      btnProps: {
        loading,
        icon: 'check',
        onClick: () => onSubmit(),
        disabled: isEmpty(reviewSelectedRows),
      },
    },
    {
      name: 'supplierInfo',
      child: intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息'),
      btnProps: {
        loading,
        icon: 'profile',
        onClick: () => onSupplierDetail({ ...headerInfo, sourceType }),
      },
    },
  ];

  return customizeBtnGroup(
    {
      code: 'SSLM.SUPPLIER_ABILITY_REVIEW.HEADER_BTNS',
      pro: true,
    },
    <DynamicButtons buttons={buttons} permissions={permissions} />
  );
};

export default HeaderBtns;
