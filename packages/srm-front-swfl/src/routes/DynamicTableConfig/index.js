import React from 'react';
import { Tabs } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { Header, Content } from 'hzero-front/lib/components/Page';

import DynamicTable from './DynamicTable';
import DynamicTableMonitor from './DynamicTableMonitor';
import styles from './index.less';

function DynamicTableConfig() {
  return (
    <>
      <Header
        title={intl
          .get('hwfp.dynamicTableMonitor.view.title.dynamicTableConfig')
          .d('工作流分表配置')}
      />
      <Content>
        <Alert
          description={intl
            .get('hwfp.dynamicTableMonitor.view.alert')
            .d('当前菜单会影响到工作流服务的运行，请勿随意修改！！！')}
          type="error"
          showIcon
          className={styles.alert}
        />
        <Tabs>
          <Tabs.TabPane
            tab={intl.get('hwfp.dynamicTableMonitor.view.title.dynamicTable').d('分表')}
          >
            <DynamicTable />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('hwfp.dynamicTableMonitor.view.title.dynamicTableMonitor').d('分表监控')}
          >
            <DynamicTableMonitor />
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </>
  );
}

export default formatterCollections({ code: ['hwfp.dynamicTableMonitor'] })(DynamicTableConfig);
