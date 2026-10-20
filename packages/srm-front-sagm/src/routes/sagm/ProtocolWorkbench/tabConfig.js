// import React from 'react';

import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';

import { protocolDs, protocolDetailDs, productDetailDs } from './subTableDs';

const SRM_AGM = '/sagm';
const organizationId = getCurrentOrganizationId();

const getTabs = (type) => {
  // key 不要随便改，其他地方有用到
  const initTabs = [
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.create').d('新建'),
      key: 'create',
      groupKey: 'protocol',
      searchBarCode: 'SAGM.WORKBENCH.PROTOCOL.NEW.SEARCH_BAR',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL.LIST',
      params: { agreementStatus: 'NEW' },
      url: `${SRM_AGM}/v1/${organizationId}/agreements`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.waitApprove').d('待审批'),
      key: 'submitted',
      groupKey: 'protocol',
      searchBarCode: 'SAGM.WORKBENCH.PROTOCOL.SUBMITTED.SEARCH_BAR',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL.LIST',
      params: { queryStatus: 'SUBMITTED,APPROVING' },
      url: `${SRM_AGM}/v1/${organizationId}/agreements`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.approveReject').d('审批拒绝'),
      key: 'approveReject',
      groupKey: 'protocol',
      searchBarCode: 'SAGM.WORKBENCH.PROTOCOL.REJECT.SEARCH_BAR',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL.LIST',
      params: { agreementStatus: 'REJECT' },
      url: `${SRM_AGM}/v1/${organizationId}/agreements`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.approved').d('审批通过'),
      key: 'approved',
      groupKey: 'protocol',
      searchBarCode: 'SAGM.WORKBENCH.PROTOCOL.APPROVED.SEARCH_BAR',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL.LIST',
      params: { agreementStatus: 'APPROVED' },
      url: `${SRM_AGM}/v1/${organizationId}/agreements`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.published').d('已发布'),
      key: 'published',
      groupKey: 'protocol',
      searchBarCode: 'SAGM.WORKBENCH.PROTOCOL.PUBLISHED.SEARCH_BAR',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL.LIST',
      params: { agreementStatus: 'PUBLISHED' },
      url: `${SRM_AGM}/v1/${organizationId}/agreements`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.finished').d('已终止'),
      key: 'finished',
      groupKey: 'protocol',
      searchBarCode: 'SAGM.WORKBENCH.PROTOCOL.TERMINATE.SEARCH_BAR',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL.LIST',
      params: { agreementStatus: 'TERMINATED' },
      url: `${SRM_AGM}/v1/${organizationId}/agreements`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.all').d('全部'),
      key: 'all',
      groupKey: 'protocol',
      searchBarCode: 'SAGM.WORKBENCH.PROTOCOL.ALL.SEARCH_BAR',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL.LIST',
      url: `${SRM_AGM}/v1/${organizationId}/agreements`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.deleted').d('已删除'),
      key: 'deleted',
      groupKey: 'protocol',
      searchBarCode: 'SAGM.WORKBENCH.DELETED.SEARCH_BAR',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL.LIST',
      params: { agreementStatus: 'DELETED' },
      url: `${SRM_AGM}/v1/${organizationId}/agreements`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.protocolDetail').d('协议明细'),
      key: 'protocol_detail',
      groupKey: 'detail',
      params: { deleteFlag: 0 },
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PROTOCOL_DETAIL',
      searchBarCode: 'SAGM.WORKBENCH.PROTOCAL_DETAIL.SEARCH_BAR1',
      url: `${SRM_AGM}/v1/${organizationId}/agreement-lines`,
    },
    {
      tab: intl.get('sagm.common.view.workbenchTabKey.productDetail').d('商品明细'),
      key: 'product_detail',
      groupKey: 'detail',
      customizeUnitCode: 'SAGM.WORKBENCH.MAIN.PRODUCT_DETAIL',
      searchBarCode: 'SAGM.WORKBENCH.PRODUCT_DETAIL.SEARCH_BAR',
      url: `${SRM_AGM}/v1/${organizationId}/agreement-details`,
    },
  ];

  if (type === 'customizeCode') {
    return [...new Set(initTabs.map((m) => m.customizeUnitCode))];
  }

  return initTabs.map((i) => {
    const { customizeUnitCode: tableCode = '', searchBarCode = '', groupKey, key, params = {} } = i;
    const dsName =
      groupKey === 'protocol'
        ? protocolDs
        : key === 'protocol_detail'
        ? protocolDetailDs
        : productDetailDs;
    const customizeUnitCode = [tableCode, searchBarCode].filter((f) => f).join(',');
    const config = {
      queryParams: { customizeUnitCode, ...params },
    };
    const dataSet = new DataSet(dsName(config));
    dataSet.setState('onlyQueryParam', { customizeUnitCode, ...params });
    if (['approveReject', 'finished', 'all', 'deleted'].includes(i.key)) {
      dataSet.selection = false;
    }
    // 个性化编码 和 筛选器编码
    return {
      ...i,
      dataSet,
      getPara: () => {
        const queryPara = dataSet?.queryDataSet?.current.toJSONData() || {};
        const agreementNumbers = dataSet.getQueryParameter('agreementNumbers');
        return filterNullValueObject({
          ...queryPara,
          ...params,
          agreementNumbers,
          customizeUnitCode,
        });
      },
    };
  });
};

export { getTabs };
