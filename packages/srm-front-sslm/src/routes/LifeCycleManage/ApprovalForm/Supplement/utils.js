/*
 * @Date: 2024-02-06 11:27:37
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import BaseInfo from './components/BaseInfo';
import OtherInfo from './components/OtherInfo';
import SupplierAbility from '../../Documents/Detail/SupplierAbility';
import SupplierClassify from '../../Documents/Detail/SupplierClassify';
import PurchaseInfo from '../../Documents/Detail/PurchaseInfo';
import AttachmentInfo from '../../Documents/Detail/AttachmentInfo';

export const getTabPaneList = () => [
  {
    key: 'baseInfo',
    tab: intl.get('sslm.common.view.title.baseInfo').d('基础信息'),
    component: BaseInfo,
    componentProps: {
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL_SUPPLEMENT.BASE',
    },
  },
  {
    key: 'otherInfo',
    tab: intl.get('sslm.common.view.title.otherInfo').d('其他信息'),
    component: OtherInfo,
    componentProps: {
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL_SUPPLEMENT.OTHER',
    },
  },
  {
    key: 'supplierAbility',
    tab: intl.get('sslm.common.view.supplier.ability').d('供货能力清单'),
    component: SupplierAbility,
    componentProps: {
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL_SUPPLEMENT.SUPPLIER_ABILITY',
    },
  },
  {
    key: 'supplierClassify',
    tab: intl.get('sslm.common.view.supplier.class').d('供应商分类'),
    component: SupplierClassify,
    componentProps: {
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL_SUPPLEMENT.SUPPLIER_CLASSIFY',
    },
  },
  {
    key: 'purchaseInfo',
    tab: intl.get('sslm.common.view.title.purchaseInfo').d('采购财务信息'),
    component: PurchaseInfo,
    componentProps: {
      customizeUnitCode: [
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL_SUPPLEMENT.PURCHASE_INFO',
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL_SUPPLEMENT.PURCHASE_LINE',
      ],
    },
  },
  {
    key: 'attachmentInfo',
    tab: intl.get('sslm.common.view.title.attachmentInfo').d('附件信息'),
    component: AttachmentInfo,
    componentProps: {
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL_SUPPLEMENT.ATT_INFO',
    },
  },
];
