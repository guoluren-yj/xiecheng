import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Tabs, Spin, DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import type { ApprovalRecordProps } from './ApprovalRecord';
import type { OperationRecordProps } from './OperationRecord';
import ApprovalRecord from './ApprovalRecord';
import OperationRecord from './OperationRecord';


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
  const [approvalData, setApprovalData] = useState({});

  const getApprovalData = useCallback(async () => {
    try {
      const { dataSource, readTransport } = approvalProps || {};
      if (dataSource) {
        setApprovalData(dataSource);
      } else {
        const approvalDs = new DataSet({
          paging: false,
          autoQuery: false,
          queryParameter: { size: 0 },
          transport: {
            read: readTransport,
          },
        });
        const res = await approvalDs.query();
        if (!res) return;
        setApprovalData(res);
      }
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
          tab={intl.get(`hzero.common.status.operation`).d('操作记录')}
          key="operation"
        >
          <OperationRecord {...operationProps} />
        </TabPane>
        <TabPane
          tab={intl.get('hzero.common.status.approval').d('审批记录')}
          key="approval"
        >
          <ApprovalRecord {...approvalProps} />
        </TabPane>
      </Tabs>
    );
});

export default HistoryRecord;
