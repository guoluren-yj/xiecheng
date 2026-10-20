
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { fetchOnlyCount } from '@/utils/commonApi';

import { stockInfoDS, affairInfoDS } from './ds';

const SRM_STCK = '/stck';
const organizationId = getCurrentOrganizationId();

export default function getTabs() {
  const initTabs = [
    {
      key: 'STOCK',
      tab: intl.get('sstk.stockReportWorkbench.view.tab.stockQuery').d('库存查询'),
      url: `${SRM_STCK}/v1/${organizationId}/stocks`,
      // params: { statusCodes: 'NEW' },
      ds: stockInfoDS,
      searchBarCode: 'SSTK.STOCK_REPORT_WORKBENCH.STOCK.SEARCHBAR',
      tableCode: 'SSTK.STOCK_REPORT_WORKBENCH.STOCK.LIST',
    },
    {
      key: 'AFFAIR',
      tab: intl.get('sstk.stockReportWorkbench.view.tab.affairQuery').d('事务查询'),
      url: `${SRM_STCK}/v1/${organizationId}/stock-transactions`,
      ds: affairInfoDS,
      // params: { statusCodes: 'NEW' },
      searchBarCode: 'SSTK.STOCK_REPORT_WORKBENCH.AFFAIR.SEARCHBAR',
      tableCode: 'SSTK.STOCK_REPORT_WORKBENCH.AFFAIR.LIST',
    },
  ];
  const tabs = initTabs.map((m) => {
    const { url, params, searchBarCode, tableCode, ds } = m;
    const customizeUnitCode = `${tableCode},${searchBarCode}`;
    const config = { url, queryParams: { ...params, customizeUnitCode } };
    return {
      ...m,
      customizeUnitCode,
      dataSet: new DataSet(ds(config)),
      queryCount: async () => {
        const res = getResponse(await fetchOnlyCount(url, params));
        if (res) {
          return res;
        }
        return {};
      },
    };
  });
  return tabs;
}