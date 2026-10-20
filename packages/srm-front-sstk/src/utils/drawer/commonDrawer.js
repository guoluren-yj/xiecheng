import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import c7nModal from '@/utils/c7nModal';
import RecordTimeLine from '@/components/RecordTimeline';
import RecordTabs from './RecordTabs';

// 操作记录 + 工作流审批记录
function openRecordTabs({ headerRecord, headerData = {}, operateArg = {}, haswFlow } = {}) {
  const { url, queryParams = {}, operateRenderer: oRender } = operateArg;
  const businessKeys = headerRecord
    ? headerRecord.get('workflowBusinessKey')
    : headerData.workflowBusinessKey;
  const operateDs = new DataSet({
    autoQuery: true,
    paging: false,
    transport: {
      read: ({ data, params }) => ({
        url,
        method: 'GET',
        data: {
          ...data,
          ...params,
          ...queryParams,
        },
      }),
    },
  });
  const recordProps = {
    haswFlow,
    rowRecord: headerRecord,
    rowData: headerData,
    operateDs,
    businessKeys,
    operateRenderer: oRender,
  };
  Modal.open({
    drawer: true,
    key: Modal.key(),
    okCancel: false,
    title: intl.get('hzero.common.button.record').d('操作记录'),
    okText: intl.get('hzero.common.button.close').d('关闭'),
    style: { width: 742 },
    children: <RecordTabs {...recordProps} />,
  });
}

function openStockTimelineRecord(strategyId, strategyName, customRender = () => null) {
  const recordDs = new DataSet({
    transport: {
      read: {
        url: `/stck/v1/${getCurrentOrganizationId()}/stock-strategy-records/${strategyId}`,
        method: 'GET',
      },
    },
  });
  recordDs.query();
  c7nModal({
    title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <RecordTimeLine dataSet={recordDs} renderer={args => customRender(args, strategyName)} />
    ),
  });
}

export { openRecordTabs, openStockTimelineRecord };
