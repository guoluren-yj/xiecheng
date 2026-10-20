import React from 'react';
import { Tabs } from 'choerodon-ui';
import { useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import OperateTable from './OperateTable';
import ApproveTable from './ApproveTable';
import OperateDs from './stores/OperateDs';
import ApproveDs from './stores/ApproveDs';

const { TabPane } = Tabs;

const OperationRecord = function OperationRecord(props) {
  const { poHeaderId, organizationId } = props;
  const operateDs = useDataSet(() => OperateDs({ organizationId, poHeaderId }), [
    organizationId,
    poHeaderId,
  ]);
  const approveDs = useDataSet(() => ApproveDs({ organizationId, poHeaderId }), [
    organizationId,
    poHeaderId,
  ]);
  return (
    <Tabs animated={false}>
      <TabPane key="operate" tab={intl.get(`hzero.common.button.operating`).d('操作记录')}>
        <OperateTable dataSet={operateDs} poHeaderId={poHeaderId} organizationId={organizationId} />
      </TabPane>
      <TabPane
        key="approve"
        tab={intl.get(`sodr.common.model.approval.approvalInfo`).d('审批记录')}
      >
        <ApproveTable dataSet={approveDs} />
      </TabPane>
    </Tabs>
  );
};

export default OperationRecord;
