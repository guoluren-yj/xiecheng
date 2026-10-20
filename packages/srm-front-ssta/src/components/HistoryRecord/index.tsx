import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Tabs, Spin } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import type { ApprovalRecordProps } from './ApprovalRecord';
import type { OperationRecordProps } from './OperationRecord';
import ApprovalRecord from './ApprovalRecord';
import OperationRecord from './OperationRecord';
import { fetchApprovalData } from './api';
import { getResponse } from '../../utils/utils';

const { TabPane } = Tabs;

interface HistoryRecordProps {
  approvalProps: ApprovalRecordProps;
  operationProps: OperationRecordProps;
}

// 历史记录组件
const HistoryRecord = forwardRef((props: HistoryRecordProps, ref: any) => {

  const {
    approvalProps,
    operationProps,
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

  /**
   * 暴露给父组件的方法
   */
  useImperativeHandle(ref, () => ({
    setActiveKey,
  }));

  if (loading) return <Spin />;

  return isEmpty(approvalData) ?
    <OperationRecord {...operationProps} />
    : (
      <Tabs hideOnlyGroup activeKey={activeKey} onChange={setActiveKey}>
        <TabPane
          tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
          key="operation"
        >
          <OperationRecord {...operationProps} />
        </TabPane>
        <TabPane
          tab={intl.get('ssta.costSheet.model.costSheet.approvalRecord').d('审批记录')}
          key="approval"
        >
          <ApprovalRecord dataSource={approvalData} />
        </TabPane>
      </Tabs>
    );
});

export default HistoryRecord;