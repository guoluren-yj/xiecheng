import React, { useState } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import { RecordTimeLine, RecordApproval } from '@/components/Record';

function RecordTabs(props) {
  const { haswFlow, rowRecord, rowData, operateDs, businessKeys, operateRenderer = e => e } = props;
  const _haswFlow =
    haswFlow ||
    operateDs.some(r => {
      const value = r.get('operationCode') || r.get('action') || '';
      return value.includes('WFL');
    });
  const [tabKey, setTabKey] = useState('operate');

  return !_haswFlow ? (
    <div style={{ marginTop: 8 }}>
      <RecordTimeLine
        dataSet={operateDs}
        renderer={arg => operateRenderer(arg, { rowRecord, rowData }, () => setTabKey('approve'))}
      />
    </div>
  ) : (
    <Tabs activeKey={tabKey} onChange={key => setTabKey(key)}>
      <Tabs.TabPane key="operate" tab={intl.get('hzero.common.button.operation').d('操作记录')}>
        <div style={{ marginTop: 8 }}>
          <RecordTimeLine
            dataSet={operateDs}
            renderer={arg =>
              operateRenderer(arg, { rowRecord, rowData }, () => setTabKey('approve'))
            }
          />
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane
        key="approve"
        tab={intl.get('hzero.common.button.approveHistory').d('审批记录')}
      >
        <RecordApproval businessKeys={businessKeys} />
      </Tabs.TabPane>
    </Tabs>
  );
}
export default observer(RecordTabs);
