/**
 * ProcessCategories
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState } from 'react';
import { Tabs } from 'choerodon-ui';

import intl from 'hzero-front/lib/utils/intl';
import ProcessConfig from './ProcessConfig';
import StartupRuleConfig from './StartupRuleConfig';
// import ServiceConfig from './ServiceConfig';
// import ExpressionEngineRule from './ExpressionEngineRule';
import ServiceConfig from './ServiceConfig';
import CategoryAttribute from './CategoryAttribute';
import ExternalSystemApproveConfig from './ExternalSystemApproveConfig';

const { TabPane } = Tabs;

export default function ProcessCategories(props = {}) {
  const { currentNode = {} } = props;

  const [currentTabKey, setCurrentTabKey] = useState('process-config');

  return (
    <div className="basic-document-config">
      <Tabs defaultActiveKey="process-config" onChange={setCurrentTabKey}>
        <TabPane
          tab={intl.get('swfl.processConfiguration.view.tab.processConfig').d('流程配置')}
          key="process-config"
          forceRender={false}
        >
          <ProcessConfig currentNode={currentNode} />
        </TabPane>
        <TabPane
          tab={intl
            .get('swfl.processConfiguration.view.tab.expressionEngineRule')
            .d('启动规则配置')}
          key="expression-engine-rule"
          forceRender={false}
        >
          {currentTabKey === 'expression-engine-rule' && (
            <StartupRuleConfig currentNode={currentNode} />
          )}
        </TabPane>
        <TabPane
          tab={intl.get('swfl.processConfiguration.view.tab.serviceConfig').d('服务配置')}
          key="service-config"
        >
          <ServiceConfig currentNode={currentNode} />
        </TabPane>
        <TabPane
          tab={intl.get('swfl.processConfiguration.view.tab.categoryAttribute').d('分类属性')}
          key="category-attribute"
        >
          <CategoryAttribute currentNode={currentNode} />
        </TabPane>
        <TabPane
          tab={intl
            .get('swfl.processConfiguration.view.tab.externalSystemApproveConfig')
            .d('外部审批配置')}
          key="external-system-approve-config"
        >
          <ExternalSystemApproveConfig currentNode={currentNode} />
        </TabPane>
      </Tabs>
    </div>
  );
}
