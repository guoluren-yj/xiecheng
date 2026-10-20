import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';

import { openRecordTabs } from '@/utils/drawer/commonDrawer';
import RecordTimeLine from '../recordRenders/RecordTimeLine';
import PartRecordTimeline from '../recordRenders/PartRecordTimeLine';
import {
  agmHeaderRender,
  agmLineRender,
  agmStrategyRender,
  authorityActionRender,
} from '../recordRenders';
import { fetchPriceRecord } from '../api';

const organizationId = getCurrentOrganizationId();

// 销售协议操作记录
export function viewSagmRecords(record) {
  if (record) {
    const agreementHeaderId = record.get('agreementHeaderId');
    // 操作记录
    openRecordTabs({
      haswFlow: record.get('statusCode') === 'WORKFLOW_WAITING',
      headerRecord: record,
      operateArg: {
        url: `/sagm/v1/${organizationId}/sale-agreement-records/list`,
        queryParams: {
          agreementHeaderId,
        },
        operateRenderer: agmHeaderRender,
      },
    });
  }
}

// 价格策略操作记录
export function viewStrategyRecord(record) {
  const strategyName = record.get('strategyName');
  const priceStrategyLineId = record.get('priceStrategyLineId');
  const ds = new DataSet({
    autoQuery: false,
    paging: false,
    transport: {
      read: {
        url: `/sagm/v1/${organizationId}/strategy-change-records/list`,
        method: 'GET',
      },
    },
  });
  ds.setQueryParameter('priceStrategyLineId', priceStrategyLineId);
  ds.query();
  Modal.open({
    title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
    drawer: true,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <RecordTimeLine dataSet={ds} renderer={args => agmStrategyRender(args, strategyName)} />
    ),
  });
}

// 销售协议价格历史记录
export function viewLinePriceRecord(record) {
  const params = record.get(['skuId', 'orgId', 'priceStrategyId', 'orgLevelPath']);
  const ds = new DataSet({
    autoQuery: false,
    paging: false,
  });
  const fetchData = async () => {
    const res = await fetchPriceRecord(
      filterNullValueObject({
        ...params,
        ...(ds.getState('reqParams') || {}), // 加载更多需传
      })
    );
    if (getResponse(res)) {
      const { resultList = [], currentYear, noMore, currentRow, offset } = res || {};
      ds.setState('finishLoading', true);
      ds.appendData(resultList);
      ds.setState('reqParams', {
        currentYear,
        noMore,
        currentRow,
        offset,
      });
      ds.setState('noMore', noMore);
    }
  };
  fetchData();
  Modal.open({
    title: intl.get('sagm.common.view.priceHistoryRecord').d('价格历史记录'),
    drawer: true,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <PartRecordTimeline
        dataSet={ds}
        partLoad
        loadMore={fetchData}
        renderer={args => agmLineRender(args, record.get('skuName'))}
      />
    ),
  });
}

// 采买权限操作记录
export function viewAuthActionRecord(record) {
  const { authorityListId, authorityListName, authAgreementRefId } = record.get([
    'authorityListId',
    'authorityListName',
    'authAgreementRefId',
  ]);
  const ds = new DataSet({
    autoQuery: true,
    paging: false,
    transport: {
      read: {
        url: `/sagm/v1/${organizationId}/auth-historys/list`,
        method: 'GET',
        data: { authorityListId, authAgreementRefId },
      },
    },
  });
  Modal.open({
    title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
    drawer: true,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <RecordTimeLine
        dataSet={ds}
        renderer={args => authorityActionRender(args, authorityListName)}
      />
    ),
  });
}
