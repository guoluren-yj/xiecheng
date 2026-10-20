// tabs封装

import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMCT = '/smct';
const organizationId = getCurrentOrganizationId();

export function getDataSetProps(params) {
  return {
    selection: false,
    pageSize: 20,
    autoQuery: false,
    fields: [
      {
        name: 'publishStatus',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'templateCode',
        label: intl.get('small.centralize.view.centralizeCode').d('拼单活动编码'),
      },
      {
        name: 'templateName',
        label: intl.get('small.centralize.view.centralizeName').d('拼单活动名称'),
      },
      {
        name: 'templateType',
        lookupCode: 'SMCT.CENTRALIZED_TEMPLATE_TYPE',
        label: intl.get('small.centralize.view.centralizeMode').d('拼单模式'),
      },
      {
        name: 'templateDate',
        label: intl.get('small.centralize.view.activeTime').d('活动时间'),
        type: 'date',
        range: ['startDate', 'endDate'],
      },
      {
        name: 'startDate',
        type: 'date',
        bind: 'templateDate.startDate',
      },
      {
        name: 'endDate',
        type: 'date',
        bind: 'templateDate.endDate',
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('small.centralize.view.creationDate').d('创建时间'),
      },
      {
        name: 'lastUpdateDate',
        label: intl.get('small.centralize.view.lastUpdateTime').d('更新时间'),
      },
      {
        name: 'createdByName',
        label: intl.get('small.common.view.createByName').d('创建人'),
      },
    ],
    transport: {
      read: ({ data }) => ({
        url: `${SRM_SMCT}/v1/${organizationId}/centralized-templates`,
        method: 'GET',
        data: { ...params, ...data, customizeUnitCode: 'SMALL.CENTRALIZE.STATUS_ALL.LIST,SMCT_CENTRALIZED_TEMPLATE.SEARCHBAR' },
      }),
    },
  };
}

export default function getTabs(type) {
  const initTabs = [
    {
      key: 'UNPUBLISHED',
      tab: intl.get('small.centralize.view.unpublish').d('未发布'),
      params: { filterFlag: 2 },
      searchBarCode: 'SMCT_CENTRALIZED_TEMPLATE.UNPUBLISH_SEARCH',
      customizeUnitCode: 'SMALL.CENTRALIZE.STATUS_UNPUBLISH.LIST',
    },
    {
      key: 'PUBLISHED',
      tab: intl.get('small.centralize.view.published').d('已发布'),
      params: { filterFlag: 1 },
      searchBarCode: 'SMCT_CENTRALIZED_TEMPLATE.PUBLISHED_SEARCH',
      customizeUnitCode: 'SMALL.CENTRALIZE.STATUS_PUBLISHED.LIST',
    },
    {
      key: 'ALL',
      tab: intl.get('small.centralize.view.all').d('全部'),
      searchBarCode: 'SMCT_CENTRALIZED_TEMPLATE.SEARCH',
      customizeUnitCode: 'SMALL.CENTRALIZE.STATUS_ALL.LIST',
    },
  ];
  if (type === 'custCode') {
    const codes = initTabs.map(m => m.customizeUnitCode);
    return [...new Set(codes)];
  }
  const tabs = initTabs.map(m => {
    const { params, searchBarCode, customizeUnitCode: tableCode } = m;
    const customizeUnitCode = `${tableCode},${searchBarCode}`;
    return { ...m, dataSet: new DataSet(getDataSetProps({ ...params, customizeUnitCode })) };
  });
  return tabs;
}
