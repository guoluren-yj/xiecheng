import React from 'react';
import { Tabs, Tooltip, Icon } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';
import marmotImg from '@/assets/marmot3.png';
import MarmotConsole from './component/MarmotConsole';
import Developer from './component/Developer';
import MarmotHub from './component/MarmotHub';
import DataMigration from './component/DataMigration';
import DataOperation from './component/DataOperation';
import OauthConfig from '../OauthConfig/Console';
import ManagementSetting from './component/ManagementSetting';
import style from './index.less';

const { TabGroup, TabPane } = Tabs;

function MarmotWorkbench() {
  const extraButton = (
    <Button
      onClick={() => {
        openTab({
          key: `/spfm/adaptor-task/list`,
          title: intl.get('spfm.marmotWorkbench.button.adaptor.title').d('埋点脚本管理'),
        });
      }}
    >
      {intl.get('spfm.marmotWorkbench.button.adaptor.title').d('埋点脚本管理')}
    </Button>
  );

  return (
    <>
      <Header
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>
              {intl.get('spfm.marmotWorkbench.view.marmotWorkbench.title').d('Marmot工作台')}
            </span>
            <Tooltip
              placement="right"
              title={intl
                .get('spfm.marmotWorkbench.view.marmotHelpManual.title')
                .d('Marmot 帮助手册')}
            >
              <Icon
                style={{ marginLeft: 4, cursor: 'pointer' }}
                type="help"
                onClick={() => {
                  window.open(`${window.$$env.BASE_PATH || '/'}pub/marmot-help-manual`);
                }}
              />
            </Tooltip>
          </div>
        }
      />
      <Content>
        <Tabs
          keyboard={false}
          defaultActiveKey="marmotHub"
          tabPosition="top"
          hideOnlyGroup
          className={style['tabs-divider']}
          tabBarExtraContent={extraButton}
        >
          <TabGroup
            tab={intl.get('spfm.marmotWorkbench.view.marmotHub.title').d('Hub')}
            node="marmotHub"
            key="marmotHub"
          >
            <TabPane key="marmotHub">
              <MarmotHub />
            </TabPane>
          </TabGroup>
          <TabGroup
            tab={intl.get('spfm.marmotWorkbench.view.marmotConsole.title').d('控制台')}
            node="marmotConsole"
            key="marmotConsole"
          >
            <TabPane key="marmotConsole">
              <MarmotConsole />
            </TabPane>
          </TabGroup>
          <TabGroup
            tab={intl.get('spfm.marmotWorkbench.view.developer.title').d('开发者')}
            node="developer"
            key="developer"
          >
            <TabPane key="developer">
              <Developer />
            </TabPane>
          </TabGroup>
          <TabGroup
            tab={intl.get('spfm.marmotWorkbench.view.oauthConfig.title').d('认证集成')}
            node="oauthConfig"
            key="oauthConfig"
          >
            <TabPane key="oauthConfig">
              <OauthConfig />
            </TabPane>
          </TabGroup>
          <TabGroup
            tab={intl.get('spfm.marmotWorkbench.view.dataMigration.title').d('数据迁移')}
            node="dataMigration"
            key="dataMigration"
          >
            <TabPane key="dataMigration">
              <DataMigration />
            </TabPane>
          </TabGroup>
          <TabGroup
            tab={intl.get('spfm.marmotWorkbench.view.dataOperation.title').d('运营工具')}
            node="dataOperation"
            key="dataOperation"
          >
            <TabPane key="dataOperation">
              <DataOperation />
            </TabPane>
          </TabGroup>
          <TabGroup
            tab={intl.get('spfm.marmotWorkbench.view.managementSetting.title').d('管理设定')}
            node="managementSetting"
            key="managementSetting"
          >
            <TabPane key="managementSetting">
              <ManagementSetting />
            </TabPane>
          </TabGroup>
        </Tabs>
        <div className={style['pic-right']}>
          <img
            draggable="false"
            src={marmotImg}
            className="pic-right-item"
            alt="marmot"
            style={{ opacity: 0.1 }}
          />
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['spfm.marmotWorkbench', 'hzero.common'],
})(
  withProps(
    () => {
      const valueData = {};
      return valueData;
    },
    { cacheState: true, keepOriginDataSet: true }
  )(MarmotWorkbench)
);
