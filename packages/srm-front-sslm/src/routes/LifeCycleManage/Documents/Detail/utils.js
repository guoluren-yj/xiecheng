/*
 * @Date: 2023-07-25 16:47:45
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

import BaseInfo from './BaseInfo';
import OtherInfo from './OtherInfo';
import StatusInfo from './StatusInfo';
import PurchaseInfo from './PurchaseInfo';
import AttachmentInfo from './AttachmentInfo';
import SupplierAbility from './SupplierAbility';
import SupplierClassify from './SupplierClassify';

export const getPanelList = ({ isCreate, baseInfoDs }) => {
  return [
    {
      key: 'baseInfo',
      header: intl.get('sslm.common.view.title.baseInfo').d('基础信息'),
      component: BaseInfo,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.BASE_INFO',
    },
    {
      key: 'statusInfo',
      hidden: isCreate || baseInfoDs?.current?.get('toStageCode') !== 'ELIMINATED',
      header: intl.get('sslm.common.view.title.statusInfo').d('状态信息'),
      component: StatusInfo,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.STATUS_INFO',
    },
    {
      key: 'otherInfo',
      hidden: isCreate,
      header: intl.get('sslm.common.view.title.otherInfo').d('其他信息'),
      component: OtherInfo,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.OTHER_INFO',
    },
    {
      key: 'supplierAbility',
      hidden: isCreate,
      header: intl.get('sslm.common.view.supplier.ability').d('供货能力清单'),
      component: SupplierAbility,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_ABILITY',
      buttonCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_ABILITY_BTN',
    },
    {
      key: 'supplierClassify',
      hidden: isCreate,
      header: intl.get('sslm.common.view.supplier.class').d('供应商分类'),
      component: SupplierClassify,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_CLASSIFY',
      buttonCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_CLASSIFY_BTN',
    },
    {
      key: 'purchaseInfo',
      hidden: isCreate,
      header: intl.get('sslm.common.view.title.purchaseInfo').d('采购财务信息'),
      component: PurchaseInfo,
      customizeUnitCode: [
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_INFO',
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_LINE',
      ],
      buttonCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_LINE_BTN',
    },
    {
      key: 'attachmentInfo',
      hidden: isCreate,
      header: intl.get('sslm.common.view.title.attachmentInfo').d('附件信息'),
      component: AttachmentInfo,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.ATT_INFO',
    },
  ];
};
