import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Spin } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import type { ApprovalRecordProps } from './ApprovalRecord';
import type { OperationRecordProps } from './OperationRecord';
import ApprovalRecord from './ApprovalRecord';
import OperationRecord from './OperationRecord';
import { fetchApprovalData } from '../../utils/api';

const { TabPane } = Tabs;

interface HistoryRecordProps {
  approvalProps: ApprovalRecordProps;
  operationProps: OperationRecordProps;
  modal?: any;
}

// 操作/审批记录组件
const Record = (props: HistoryRecordProps) => {

  const {
    approvalProps,
    operationProps,
    modal,
  } = props;
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState('operation');
  const [approvalData, setApprovalData] = useState([]);

  const getApprovalData = useCallback(async () => {
    try {
      const { documentId, documentType } = approvalProps || {};
      const res = getResponse(await fetchApprovalData({ primaryId: documentId, documentType }));
      if (!res) return;
      setApprovalData(res);
    } finally {
      setLoading(false);
    }
  }, [approvalProps]);

  useEffect(() => {
    getApprovalData();
  }, [getApprovalData]);

  useEffect(() => {
    if (operationProps?.isExport && modal && activeKey === 'approval') {
      modal.update({
        footer: (okBtn) => [okBtn],
      });
    }
  }, [operationProps, modal, activeKey]);


  if (loading) return <Spin />;

  return isEmpty(approvalData) ?
    <OperationRecord {...operationProps} modal={modal} activeKey={activeKey} />
    : (
      <Tabs hideOnlyGroup activeKey={activeKey} onChange={setActiveKey}>
        <TabPane
          tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
          key="operation"
        >
          <OperationRecord {...operationProps} modal={modal} activeKey={activeKey} />
        </TabPane>
        <TabPane
          tab={intl.get('hzero.common.button.approveHistory').d('审批记录')}
          key="approval"
        >
          <ApprovalRecord dataSource={approvalData} />
        </TabPane>
      </Tabs>
    );
};

export default Record;
