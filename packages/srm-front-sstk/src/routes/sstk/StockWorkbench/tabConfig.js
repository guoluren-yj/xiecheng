// tabs封装

import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { fetchOnlyCount } from '@/utils/commonApi';

import stockHeaderDS from './ds';

const SRM_STCK = '/stck';
const organizationId = getCurrentOrganizationId();

export default function getTabs() {
  const initTabs = [
    {
      key: 'NEW',
      tab: intl.get('sstk.stockWorkbench.view.tab.waitSubmit').d('待提交'),
      params: { statusCodes: 'NEW,REJECTED', deleteFlag: 0 },
      searchBarCode: 'SSTK.STOCK_WORKBENCH.SEARCHBAR.SUBMIT',
      tableCode: 'SSTK.STOCK_WORKBENCH.LIST.SUBMIT',
    },
    {
      key: 'APPROVING',
      tab: intl.get('sstk.stockWorkbench.view.tab.approving').d('审批中'),
      params: { statusCodes: 'WORKFLOW_WAITING', deleteFlag: 0 },
      searchBarCode: 'SSTK.STOCK_WORKBENCH.SEARCHBAR.APPROVING',
      tableCode: 'SSTK.STOCK_WORKBENCH.LIST.APPROVING',
    },
    {
      key: 'APPROVED',
      tab: intl.get('sstk.stockWorkbench.view.tab.approved').d('已审批'),
      params: { statusCodes: 'APPROVED,WAITING_STORAGE', deleteFlag: 0 },
      searchBarCode: 'SSTK.STOCK_WORKBENCH.SEARCHBAR.APPROVED',
      tableCode: 'SSTK.STOCK_WORKBENCH.LIST.APPROVED',
    },
    {
      key: 'FINISHED',
      tab: intl.get('sstk.stockWorkbench.view.tab.finished').d('已完成'),
      params: { statusCodes: 'COMPLETE', deleteFlag: 0 },
      searchBarCode: 'SSTK.STOCK_WORKBENCH.SEARCHBAR.FINISHED',
      tableCode: 'SSTK.STOCK_WORKBENCH.LIST.FINISHED',
    },
    {
      key: 'ALL',
      tab: intl.get('sstk.stockWorkbench.view.tab.all').d('全部'),
      params: { deleteFlag: 0 },
      searchBarCode: 'SSTK.STOCK_WORKBENCH.SEARCHBAR.ALL',
      tableCode: 'SSTK.STOCK_WORKBENCH.LIST.ALL',
    },
    {
      key: 'RECYCLE',
      tab: intl.get('sstk.stockWorkbench.view.tab.recycle').d('回收站'),
      params: { deleteFlag: 1 },
      searchBarCode: 'SSTK.STOCK_WORKBENCH.SEARCHBAR.RECYCLE',
      tableCode: 'SSTK.STOCK_WORKBENCH.LIST.RECYCLE',
    },
  ];
  const url = `${SRM_STCK}/v1/${organizationId}/in-out-order-headers`;
  const tabs = initTabs.map((m) => {
    const { params, searchBarCode, tableCode } = m;
    const customizeUnitCode = `${tableCode},${searchBarCode}`;
    const config = { queryParams: { ...params, customizeUnitCode } };
    const dataSet = new DataSet(stockHeaderDS(config));
    // const selection = !['NEW', 'WAITING_APPROVE'].includes(key) ? false : 'multiple';
    return {
      ...m,
      customizeUnitCode,
      dataSet,
      search: async (isFirst = true, otherParams) => {
        const page = isFirst ? 1 : dataSet.currentPage;
        const res = await dataSet.query(page, otherParams);
        return res;
      },
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