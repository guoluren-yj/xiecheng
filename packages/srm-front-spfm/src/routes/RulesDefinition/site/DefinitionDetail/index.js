/**
 * 业务定义表格区域
 * @date: 2020-06-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tabs } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import ParamService from './ParamService';
import PolicyConfig from './PolicyConfig';

const { TabPane } = Tabs;

function DefinitionDetail() {
  return (
    <Tabs defaultActiveKey="1" style={{ overflowY: 'scroll' }}>
      <TabPane tab={intl.get('spfm.rulesDefinition.view.tab.paramService').d('参数服务')} key="1">
        <ParamService />
      </TabPane>
      <TabPane tab={intl.get('spfm.rulesDefinition.view.tab.policyConfig').d('策略配置')} key="2">
        <PolicyConfig />
      </TabPane>
    </Tabs>
  );
}

export default DefinitionDetail;
