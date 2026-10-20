/**
 * AdaptorConsole/index.js
 * 适配器监控页面 现更名为 开发者
 * @date: 2021-11-1
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React, { Fragment } from 'react';
import { Menu } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import ActionImg from '@/assets/action.png';
import RelTable from '@/components/RelTable';
import ScriptSearch from './components/ScriptSearch';
import ScriptLibrarySearch from './components/ScriptLibrarySearch';
import ScriptLogSearch from './components/ScriptLogSearch';
import SchedulingLog from './components/SchedulingLog';
import ActionScriptOverview from './components/ActionScriptOverview';
import AdaptorPlayGround from './components/AdaptorPlayGround';
import TemplateLibrary from './components/TemplateLibrary';
import ModifyRecords from './components/ModifyRecords';
import styles from './index.less';

const ConsoleComponents = [
  {
    key: 'adapterScriptSearch',
    // 脚本查询
    thisComponent: <ScriptSearch />,
  },
  {
    key: 'scriptLibrarySearch',
    // 脚本库搜索
    thisComponent: <ScriptLibrarySearch />,
  },
  {
    key: 'scriptLogSearch',
    // 适配器日志搜索
    thisComponent: <ScriptLogSearch />,
  },
  {
    key: 'schedulingLog',
    // 调度日志
    thisComponent: <SchedulingLog />,
  },
  {
    key: 'marmotStatistics',
    // 数据统计
    thisComponent: (
      <RelTable
        tableCode="marmot_statistics"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'actionScriptOverview',
    // 动作脚本全览
    thisComponent: <ActionScriptOverview />,
  },
  {
    key: 'marmotScriptPlugin',
    // MarmotScript插件列表
    thisComponent: (
      <RelTable
        tableCode="marmot_script_plugin"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'adaptorPlayGround',
    // 脚本查询
    thisComponent: <AdaptorPlayGround />,
  },
  {
    key: 'templateLibrary',
    // 案例库
    thisComponent: <TemplateLibrary />,
  },
  {
    key: 'modifyRecords',
    thisComponent: <ModifyRecords />,
  },
];
@formatterCollections({
  code: ['spfm.adaptorMonitor'],
})
export default class Developer extends React.Component {
  constructor() {
    super();
    this.state = {
      currentPageKey: 'adaptorPlayGround',
      showMenu: true,
    };
  }

  switchMenu = (e) => {
    this.setState({ currentPageKey: e.key });
  };

  handleFoldTree = (value) => {
    this.setState({ showMenu: value });
  };

  render() {
    const findObj = ConsoleComponents.find((res) => res.key === this.state.currentPageKey);
    const rightContent = findObj && findObj.thisComponent ? findObj.thisComponent : '';
    return (
      <Fragment>
        <div className={styles['content-container']}>
          {this.state.showMenu ? (
            <div className="content-container-left">
              <div className="content-container-left-fold">
                <div>
                  <img src={ActionImg} alt="" onClick={() => this.handleFoldTree(false)} />
                </div>
              </div>
              <Menu
                onClick={this.switchMenu}
                className={styles['left-menu']}
                defaultSelectedKeys={['adaptorPlayGround']}
                // defaultOpenKeys={['configurationItem']}
                mode="inline"
              >
                <Menu.Item key="adaptorPlayGround">
                  {intl.get('spfm.adaptorMonitor.view.title.adaptorPlayGround').d('PlayGround')}
                </Menu.Item>
                <Menu.Item key="templateLibrary">
                  {intl.get('spfm.adaptorMonitor.view.title.templateLibrary').d('案例库')}
                </Menu.Item>
                <Menu.Item key="modifyRecords">
                  {intl.get('spfm.adaptorMonitor.view.title.modifyRecords').d('我的修改项')}
                </Menu.Item>
                <Menu.ItemGroup className={styles['left-item-group']}>
                  <Menu.Divider />
                  <Menu.Item key="adapterScriptSearch">
                    {intl.get('spfm.adaptorMonitor.view.title.adaptorSearch').d('埋点脚本全览')}
                  </Menu.Item>
                  <Menu.Item key="scriptLibrarySearch">
                    {intl
                      .get('spfm.adaptorMonitor.view.title.scriptLibrarySearch')
                      .d('独立脚本全览')}
                  </Menu.Item>
                  <Menu.Item key="actionScriptOverview">
                    {intl
                      .get('spfm.adaptorMonitor.view.title.actionScriptOverview')
                      .d('动作脚本全览')}
                  </Menu.Item>
                  <Menu.Item key="scriptLogSearch">
                    {intl.get('spfm.adaptorMonitor.view.title.scriptLogSearch').d('脚本日志')}
                  </Menu.Item>
                  <Menu.Item key="schedulingLog">
                    {intl.get('spfm.adaptorMonitor.view.title.schedulingLog').d('调度日志')}
                  </Menu.Item>
                  <Menu.Item key="marmotStatistics">
                    {intl.get('spfm.adaptorMonitor.view.title.marmotStatistics').d('数据统计')}
                  </Menu.Item>
                  <Menu.Item key="marmotScriptPlugin">
                    {intl.get('spfm.adaptorMonitor.view.title.marmotScriptPlugin').d('功能测试')}
                  </Menu.Item>
                </Menu.ItemGroup>
              </Menu>
            </div>
          ) : null}
          <di className="content-container-right">
            {!this.state.showMenu ? (
              <div className="content-container-right-unfold">
                <div>
                  <img
                    src={ActionImg}
                    alt=""
                    style={{ transform: 'rotateY(180deg)' }}
                    onClick={() => this.handleFoldTree(true)}
                  />
                </div>
              </div>
            ) : null}
            <div style={{ width: '100%' }}>{rightContent}</div>
          </di>
        </div>
      </Fragment>
    );
  }
}
