/*
 * @Date: 2024-02-07 10:47:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getTabPaneList = () => [
  {
    key: 'attachment',
    tab: intl.get('sslm.common.view.title.attachmentInfo').d('附件信息'),
    searchCode: 'SSLM.SUPPLIER_DOCUMENT.LIST.SEARCH_BAR',
    tableCode: 'SSLM.SUPPLIER_DOCUMENT.LIST.SEARCH_BAR_TABLE',
  },
  {
    key: 'auth',
    tab: intl.get('sslm.common.view.title.aptitudeInfo').d('资质信息'),
    searchCode: 'SSLM.SUPPLIER_DOCUMENT.LIST.APTITUDE_SEARCH',
    tableCode: 'SSLM.SUPPLIER_DOCUMENT.LIST.APTITUDE_LIST',
  },
  {
    key: 'licence',
    tab: intl.get('sslm.common.view.title.registerInfo').d('登记信息'),
    searchCode: 'SSLM.SUPPLIER_DOCUMENT.LIST.REGISTER_SEARCH',
    tableCode: 'SSLM.SUPPLIER_DOCUMENT.LIST.REGISTER_LIST',
  },
];
