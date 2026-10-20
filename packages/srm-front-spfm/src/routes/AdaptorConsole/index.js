/**
 * AdaptorConsole/index.js
 * 适配器控制台页面
 * @date: 2021-08-12
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Menu } from 'choerodon-ui';
import { Content } from 'components/Page';
// import RelTable from 'srm-front-boot/lib/components/RelTable';
import RelTable from '@/components/RelTable';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel } from 'utils/utils';
import AdaptorPlayGround from './components/AdaptorPlayGround';
import styles from './index.less';

const tenantFlag = isTenantRoleLevel();
const ConsoleComponents = [
  {
    key: 'adapterConstantSetting',
    // 常量设定
    thisComponent: (
      <RelTable
        tableCode="sada_adaptor_constants"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'adapterCodeBlock',
    // CodeBlock设定
    thisComponent: (
      <RelTable
        tableCode="sada_adaptor_code_block"
        exportTemplateFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotScriptOutboundWhitelist',
    // HttpClient白名单
    thisComponent: (
      <RelTable
        tableCode="marmot_script_outbound_whitelist"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'adaptorPlayGround',
    // 适配器PlayGround
    thisComponent: <AdaptorPlayGround />,
  },
  {
    key: 'adaptorQueryBlock',
    // QueryBlock设定
    thisComponent: <RelTable tableCode="sada_adaptor_query_block" exportTemplateFlag={false} />,
  },
  // 租户级配置项
  {
    key: 'marmotConstants',
    // 土拨鼠常量表
    thisComponent: (
      <RelTable
        tableCode="sada_marmot_constants"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotScriptBlock',
    // 土拨鼠代码块
    thisComponent: (
      <RelTable
        tableCode="sada_marmot_script_block"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
];
@formatterCollections({
  code: ['spfm.adaptorConsole', 'spfm.adaptorPlayGround'],
})
export default class Console extends React.Component {
  constructor() {
    super();
    this.state = {
      currentPageKey: 'adaptorPlayGround',
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
              defaultOpenKeys={['configurationItem']}
              defaultSelectedKeys={['adaptorPlayGround']}
              mode="inline"
            >
              <Menu.Item key="adaptorPlayGround">
                {intl.get('spfm.adaptorPlayGround.view.title.adaptorPlayGround').d('PlayGround')}
              </Menu.Item>
              {!tenantFlag ? (
                <Menu.SubMenu
                  key="configurationItem"
                  title={
                    <span>
                      {intl.get('spfm.adaptorConsole.view.title.ConfigurationItem').d('配置项')}
                    </span>
                  }
                >
                  <Menu.Item key="adapterConstantSetting">
                    {intl.get('spfm.adaptorConsole.view.title.constantSetting').d('常量设定')}
                  </Menu.Item>
                  <Menu.Item key="adapterCodeBlock">
                    {intl
                      .get('spfm.adaptorConsole.view.title.CodeBlockStorageTable')
                      .d('CodeBlock设定')}
                  </Menu.Item>
                  <Menu.Item key="marmotScriptOutboundWhitelist">
                    {intl
                      .get('spfm.adaptorConsole.view.title.ContainerOutboundWhitelist')
                      .d('HttpClient白名单')}
                  </Menu.Item>
                  <Menu.Item key="adaptorQueryBlock">
                    {intl
                      .get('spfm.adaptorConsole.view.title.adaptorQueryBlock')
                      .d('QueryBlock设定')}
                  </Menu.Item>
                </Menu.SubMenu>
              ) : (
                <Menu.SubMenu
                  key="configurationItem"
                  title={
                    <span>
                      {intl.get('spfm.adaptorConsole.view.title.ConfigurationItem').d('配置项')}
                    </span>
                  }
                >
                  <Menu.Item key="marmotConstants">
                    {intl.get('spfm.adaptorConsole.view.title.marmotConstants').d('土拨鼠常量表')}
                  </Menu.Item>
                  <Menu.Item key="marmotScriptBlock">
                    {intl.get('spfm.adaptorConsole.view.title.marmotScriptBlock').d('土拨鼠代码块')}
                  </Menu.Item>
                </Menu.SubMenu>
              )}
            </Menu>
          </div>
          <div style={{ width: 'calc( 100% - 200px )' }}>{rightContent}</div>
        </div>
      </Content>
    );
  }
}
