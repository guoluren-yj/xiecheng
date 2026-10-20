import React, { useState } from 'react';
import { Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { RecordTimeLine, RecordApproval } from '@/components/Record';
// import RecordTimeLine from './RecordTimeLine';

function RecordTabs(props) {
  const { rowRecord, operateDs, businessKey, operateRenderer = (e) => e } = props;
  const [tabKey, setTabKey] = useState('operate');

  return (
    <Tabs activeKey={tabKey} onChange={(key) => setTabKey(key)}>
      <Tabs.TabPane key="operate" tab={intl.get('hzero.common.button.operation').d('操作记录')}>
        <div style={{ marginTop: 8 }}>
          <RecordTimeLine dataSet={operateDs} renderer={(arg) => operateRenderer(arg, rowRecord)} />
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane
        key="approve"
        tab={intl.get('hzero.common.button.approveHistory').d('审批记录')}
      >
        <RecordApproval businessKeys={businessKey} />
      </Tabs.TabPane>
    </Tabs>
  );
}
export default RecordTabs;
