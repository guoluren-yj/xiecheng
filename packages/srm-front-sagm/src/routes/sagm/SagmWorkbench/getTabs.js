// tabs封装

import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import getAgmHeaderDs from './Stores/agmHeaderDs';
import getAgmLineDs from './Stores/agmLineDs';

const organizationId = getCurrentOrganizationId();

export default function getTabs(type) {
  const initTabs = [
    {
      key: 'NEW',
      groupKey: 'whole',
      tab: intl.get('sagm.common.model.waitSubmit').d('待提交'),
      params: { statusCodes: 'NEW' },
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.WAIT_SUBMIT',
    },
    {
      // WORKFLOW_WAITING 工作流审批中
      key: 'WAITING_APPROVE',
      groupKey: 'whole',
      tab: intl.get('sagm.common.model.waitApprove').d('待审批'),
      params: { statusCodes: 'WAITING_APPROVE, WORKFLOW_WAITING' },
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.WAIT_APPROVE',
    },
    {
      key: 'REJECTED',
      groupKey: 'whole',
      tab: intl.get('sagm.common.model.approveReject').d('审批拒绝'),
      params: { statusCodes: 'REJECTED' },
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.WAIT_APPROVE',
    },
    {
      key: 'WAITING_PUBLISH',
      groupKey: 'whole',
      tab: intl.get('sagm.common.model.waitPublish').d('待发布'),
      params: { statusCodes: 'WAITING_PUBLISH, APPROVED' },
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.HEADER.LIST_NEW',
    },
    {
      key: 'TO_BE_EFFECTIVE',
      groupKey: 'whole',
      tab: intl.get('sagm.common.model.waitEffect').d('待生效'),
      params: { statusCodes: 'TO_BE_EFFECTIVE' },
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.HEADER.LIST_TO_BE_EFFECTIVE',
    },
    {
      key: 'EFFECTED',
      groupKey: 'whole',
      tab: intl.get('sagm.common.view.effected').d('已生效'),
      params: { statusCodes: 'EFFECTED' },
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.HEADER.LIST_EFFECTED',
    },
    {
      key: 'EXPIRED',
      groupKey: 'whole',
      tab: intl.get('sagm.common.view.expired').d('已失效'),
      params: { statusCodes: 'EXPIRED' },
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.HEADER.LIST_EXPIRED',
    },
    {
      key: 'ALL',
      groupKey: 'whole',
      tab: intl.get('sagm.common.model.all').d('全部'),
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.HEADER.LIST',
    },
    {
      key: 'DELETED',
      groupKey: 'whole',
      tab: intl.get('sagm.common.view.deleted').d('已删除'),
      params: { deleteFlag: 1 },
      searchBarCode: 'SAGM.SALE_WORKBENCH.HEADER.STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.HEADER.LIST_DELETED',
    },
    {
      key: 'LINE_EFFECTED',
      groupKey: 'detail',
      url: `/sagm/v1/${organizationId}/sale-agreement-lines/work`,
      tab: intl.get('sagm.common.view.effected').d('已生效'),
      params: { effectiveFlag: 1 },
      searchBarCode: 'SAGM.SALE_WORKBENCH.LIST.LINE_STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.AGM_LINE.LIST',
    },
    {
      key: 'LINE_EXPIRED',
      groupKey: 'detail',
      url: `/sagm/v1/${organizationId}/sale-agreement-lines/work`,
      tab: intl.get('sagm.common.view.expired').d('已失效'),
      params: { effectiveFlag: 0 },
      searchBarCode: 'SAGM.SALE_WORKBENCH.LIST.LINE_STATUS.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.AGM_LINE.LIST',
    },
    {
      key: 'LINE_ALL',
      groupKey: 'detail',
      url: `/sagm/v1/${organizationId}/sale-agreement-lines/work`,
      tab: intl.get('sagm.common.model.all').d('全部'),
      searchBarCode: 'SAGM.SALE_WORKBENCH.LIST.LINE.SEARCH_BAR',
      customizeUnitCode: 'SAGM.SALE_WORKBENCH.AGM_LINE.LIST',
    },
  ];
  if (type === 'custCode') {
    const codes = initTabs.map(m => m.customizeUnitCode);
    return [...new Set(codes), 'SAGM.SALE_WORKBENCH.BTNS'];
  }
  const tabs = initTabs.map(m => {
    const { url, params, searchBarCode, customizeUnitCode: tableCode, key } = m;
    const customizeUnitCode = `${tableCode},${searchBarCode}`;
    const config = { url, queryParams: { ...params, customizeUnitCode } };
    if (m.groupKey === 'whole') {
      Object.assign(m, { url: `/sagm/v1/${organizationId}/sale-agreement-headers` });
    }
    const selection = !['NEW', 'WAITING_APPROVE', 'WAITING_PUBLISH'].includes(key)
      ? false
      : 'multiple';
    const dataSetConfig =
      m.groupKey === 'whole'
        ? getAgmHeaderDs(config, { pageSize: 20, autoQuery: false, selection })
        : getAgmLineDs(config, { pageSize: 20, autoQuery: false });
    const dataSet = new DataSet(dataSetConfig);
    dataSet.setState('onlyQueryParam', { customizeUnitCode, ...params });
    return { ...m, dataSet };
  });
  return tabs;
}
