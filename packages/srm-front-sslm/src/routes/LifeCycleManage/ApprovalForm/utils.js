/*
 * @Date: 2023-08-31 14:21:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';

import StatusInfo from '../Documents/Detail/StatusInfo';
import OtherInfo from '../Documents/Detail/OtherInfo';
import SupplierAbility from '../Documents/Detail/SupplierAbility';
import SupplierClassify from '../Documents/Detail/SupplierClassify';
import PurchaseInfo from '../Documents/Detail/PurchaseInfo';

export const getEnterpriseTabPane = ({ toStageCode, relTableList } = {}) =>
  [
    {
      key: 'statusInfo',
      hidden: toStageCode !== 'ELIMINATED',
      tab: intl.get('sslm.common.view.title.statusInfo').d('状态信息'),
      component: StatusInfo,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.STATUS',
    },
    {
      key: 'otherInfo',
      tab: intl.get('sslm.common.view.title.otherInfo').d('其他信息'),
      component: OtherInfo,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.OTHERS',
    },
    {
      key: 'supplierAbility',
      tab: intl.get('sslm.common.view.supplier.ability').d('供货能力清单'),
      component: SupplierAbility,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.SUPPLIER_ABILITY',
    },
    {
      key: 'supplierClassify',
      tab: intl.get('sslm.common.view.supplier.class').d('供应商分类'),
      component: SupplierClassify,
      customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.SUPPLIER_CLASSIFY',
    },
    {
      key: 'purchaseInfo',
      tab: intl.get('sslm.common.view.title.purchaseInfo').d('采购财务信息'),
      component: PurchaseInfo,
      customizeUnitCode: [
        'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.PURCHASE_INFO',
        'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.PURCHASE_LINE',
      ],
    },
    ...relTableList.map(n => ({
      key: n.uniqueCode,
      tab: n.tableName,
      modelTable: n,
      type: 'DynamicTable',
      component: DynamicTable,
    })),
  ].filter(n => !n.hidden);
