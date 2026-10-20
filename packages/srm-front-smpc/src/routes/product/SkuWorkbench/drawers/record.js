import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';

import EmotionFill from '@/components/EmotionFill';
import RecordTimeLine from '../records/RecordTimeLine';
import PartRecordTimeline from '../records/PartRecordTimeLine';
import RecordTabs from '../records/RecordTabs';
import { operateRenderer, historyRenderer, priceRenderer } from '../records/renderers';
import { fetchPriceRecord, fetchHistoryVersionRecord } from '../api';

const organizationId = getCurrentOrganizationId();

// 操作记录|库存记录
export function operateRecord(record, isSup) {
  const skuId = record.get('skuId');
  // const skuName = record.get('skuName');
  const ds = new DataSet({
    autoQuery: false,
    paging: false,
    transport: {
      read: { url: `/smpc/v1/${organizationId}/sku-operation-records/list`, method: 'GET' },
    },
  });
  ds.setQueryParameter('skuId', skuId);
  ds.query();
  const title = intl.get('smpc.product.view.operateRecord').d('操作记录');
  Modal.open({
    title,
    mask: true,
    drawer: true,
    destroyOnClose: true,
    style: { width: 750 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <RecordTimeLine dataSet={ds} renderer={(args) => operateRenderer(args, record, isSup)} />
    ),
  });
}

// 操作记录 + 工作流审批记录
export async function openRecordTabs(
  { rowRecord, skuTemporaryId, leftOperateArg = {}, ...other } = {},
  isSup = false
) {
  const skuId = rowRecord.get('skuId');
  const recordProps = {
    rowRecord,
    isSup,
    businessParams: {
      skuId,
      skuTemporaryId,
    },
    leftOperateArg,
    ...other,
  };
  Modal.open({
    drawer: true,
    key: Modal.key(),
    okCancel: false,
    title: intl.get('smpc.product.view.operateRecord').d('操作记录'),
    okText: intl.get('hzero.common.button.close').d('关闭'),
    style: { width: 742 },
    children: <RecordTabs {...recordProps} />,
  });
}

// 历史版本
export function historyRecord({ skuId, onView = (e) => e }) {
  const ds = new DataSet({
    autoQuery: false,
    paging: false,
  });
  const fetchData = async () => {
    const res = await fetchHistoryVersionRecord(
      filterNullValueObject({
        skuId,
      })
    );
    if (getResponse(res)) {
      ds.setState('finishLoading', true);
      ds.appendData(res || []);
    }
  };
  fetchData();
  Modal.open({
    title: intl.get('smpc.product.view.skuHistoryRecord').d('商品历史记录'),
    mask: true,
    drawer: true,
    destroyOnClose: true,
    style: { width: 750 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <PartRecordTimeline dataSet={ds} renderer={(args) => historyRenderer(args, onView)} />
    ),
  });
}

// 价格记录
export async function priceRecord(record) {
  const { skuName, skuId } = record.get(['skuName', 'skuId']);
  const ds = new DataSet({
    autoQuery: false,
    paging: false,
  });
  const fetchData = async () => {
    ds.status = 'loading';
    const res = await fetchPriceRecord(
      filterNullValueObject({
        skuId,
        ...(ds.getState('reqParams') || {}), // 加载更多需传
      })
    );
    ds.status = 'ready';
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
    title: intl.get('smpc.product.view.priceRecords').d('价格记录'),
    mask: true,
    drawer: true,
    destroyOnClose: true,
    style: { width: 750 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <EmotionFill type="price" ds={ds}>
        <PartRecordTimeline
          dataSet={ds}
          partLoad
          loadMore={fetchData}
          renderer={(args) => priceRenderer(args, skuName)}
        />
      </EmotionFill>
    ),
  });
}
