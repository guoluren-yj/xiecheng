/*
 * @Date: 2024-08-14 14:02:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './styles.less';
import SupplierDetail from './components/SupplierDetail';

// 查看供应商信息
export const viewSupplierDetail = record => {
  Modal.open({
    key: Modal.key(),
    drawer: true,
    style: { width: 1090 },
    cancelButton: false,
    className: styles['supplier-detail-modal'],
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('sslm.supplierInvite.model.invite.supplierInfo').d('供应商信息'),
    children: <SupplierDetail record={record} />,
  });
};
