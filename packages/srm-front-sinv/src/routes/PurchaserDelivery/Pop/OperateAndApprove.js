import React, { useState } from 'react';
import intl from 'utils/intl';
import { Tabs } from 'choerodon-ui';
import OperationRecord from './Operation/OperationRecord';
import ApproveRecord from './Approve/ApproveRecord';

const { TabPane } = Tabs;

const OperateAndApprove = (listProps) => {
  const [activeKey, setActiveKey] = useState('operate');

  return (
    <Tabs defaultActiveKey={activeKey} onChange={setActiveKey} animated={false}>
      <TabPane key="operate" tab={intl.get(`sinv.common.model.common.operating`).d('操作记录')}>
        <OperationRecord {...listProps} />
      </TabPane>
      <TabPane key="approve" tab={intl.get(`sinv.common.model.common.approvalInfo`).d('审批记录')}>
        <ApproveRecord {...listProps} />
      </TabPane>
    </Tabs>
  );
};

export default OperateAndApprove;
