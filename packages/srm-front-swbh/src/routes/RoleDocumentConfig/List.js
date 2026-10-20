/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-23 17:09:36
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext } from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Tabs } from 'choerodon-ui';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import { ObjectMenuType } from '../components/utils/common';
import { Store } from './StoreProvider';
import DynamicType from './components/DynamicType';
import DynamicDefine from './components/DynamicDefine';
import ToDoDefine from './components/ToDoDefine';

const { TabPane } = Tabs;

const List = () => {
  const {
    dynamicTypeDs,
    dynamicDefineDs,
    toDoDefinitionDs,
    activeKey,
    setActiveKey,
    headerButton,
    handleCreateType,
    handleCreateDefine,
    handleCreateTodo,
    handleDynamicConfig,
    handleToDoConfig,
    isTenant,
  } = useContext(Store);
  return (
    <>
      <Header title={intl.get('swbh.common.view.message.title.documentDynamicConfig').d('单据动态配置')}>
        {headerButton()}
      </Header>
      <Content>
        <Tabs tabPosition={TabsPosition.top} activeKey={activeKey} onChange={setActiveKey}>
          {/* <TabPane
            tab={intl.get('swbh.common.view.message.tab.typeConcern').d('关注类型')}
            key={ObjectMenuType.dynamicType}
          >
            <DynamicType
              dynamicTypeDs={dynamicTypeDs}
              handleEdit={handleCreateType}
              activeKey={activeKey}
              isTenant={isTenant}
            />
          </TabPane> */}
          <TabPane
            tab={intl.get('swbh.common.view.message.tab.focusDefine').d('关注定义')}
            key={ObjectMenuType.dynamicDefine}
          >
            <DynamicDefine
              dynamicDefineDs={dynamicDefineDs}
              handleEdit={handleCreateDefine}
              activeKey={activeKey}
              handleDynamicConfig={handleDynamicConfig}
              isTenant={isTenant}
            />
          </TabPane>
          <TabPane
            tab={intl.get('swbh.common.view.message.tab.toDoDefine').d('待办定义')}
            key={ObjectMenuType.toDoDefine}
          >
            <ToDoDefine
              toDoDefinitionDs={toDoDefinitionDs}
              handleEdit={handleCreateTodo}
              handleToDoConfig={handleToDoConfig}
              isTenant={isTenant}
            />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
};

export default observer(List);
