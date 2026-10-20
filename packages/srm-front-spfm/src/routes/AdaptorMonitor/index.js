/**
 * AdaptorConsole/index.js
 * 适配器监控页面
 * @date: 2021-11-1
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { Menu } from 'choerodon-ui';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import ScriptSearch from '../script/Search';
import ScriptLibrarySearch from './components/ScriptLibrarySearch';
import ScriptLogSearch from './components/ScriptLogSearch';
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
];
@formatterCollections({
  code: ['spfm.adaptorMonitor'],
})
export default class AdaptorMonitor extends React.Component {
  constructor() {
    super();
    this.state = {
      currentPageKey: 'adapterScriptSearch',
    };
  }

  switchMenu = (e) => {
    this.setState({ currentPageKey: e.key });
  };

  render() {
    const rightContent = ConsoleComponents.find((res) => res.key === this.state.currentPageKey)
      ?.thisComponent;
    return (
      <Content>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 200 }}>
            <Menu
              onClick={this.switchMenu}
              className={styles['left-menu']}
              defaultSelectedKeys={['adapterScriptSearch']}
              defaultOpenKeys={['configurationItem']}
              mode="inline"
            >
              <Menu.Item key="adapterScriptSearch">
                {intl.get('spfm.adaptorMonitor.view.title.adaptorSearch').d('埋点脚本全览')}
              </Menu.Item>
              <Menu.Item key="scriptLibrarySearch">
                {intl.get('spfm.adaptorMonitor.view.title.scriptLibrarySearch').d('独立脚本全览')}
              </Menu.Item>
              <Menu.Item key="scriptLogSearch">
                {intl.get('spfm.adaptorMonitor.view.title.scriptLogSearch').d('脚本日志')}
              </Menu.Item>
            </Menu>
          </div>
          <div style={{ width: 'calc( 100% - 200px )' }}>{rightContent}</div>
        </div>
      </Content>
    );
  }
}
