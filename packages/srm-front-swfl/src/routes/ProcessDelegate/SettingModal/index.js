import React from 'react';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import AutomaticProcess from './AutomaticProcess';
import Delegate from './Delegate';

const { TabPane } = Tabs;
const ApproveSetting = ({ handleCancel }) => {
  return (
    <div style={{ height: '100%' }}>
      <Tabs defaultActiveKey="automaticProcess">
        <TabPane
          tab={intl
            .get('hwfp.automaticProcess.view.message.title.automaticProcess')
            .d('自动处理规则')}
          key="automaticProcess"
        >
          <AutomaticProcess handleCancel={handleCancel} />
        </TabPane>
        <TabPane tab={intl.get('hwfp.common.auto.delegate.rule').d('自动转交规则')} key="delegate">
          <Delegate handleCancel={handleCancel} />
        </TabPane>
      </Tabs>
    </div>
  );
};
export default formatterCollections({
  code: ['hwfp.common', 'hwfp.automaticProcess'],
})(ApproveSetting);
