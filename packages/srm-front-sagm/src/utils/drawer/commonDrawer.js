import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import RecordTabs from './RecordTabs';

// 操作记录 + 工作流审批记录
function openRecordTabs({ haswFlow, headerRecord, headerData = {}, operateArg = {} } = {}) {
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
    haswFlow, // 是否有审批记录
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

export { openRecordTabs };
