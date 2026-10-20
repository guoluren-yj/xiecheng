/**
 * AdaptorConsole/index.js
 * 适配器控制台页面
 * @date: 2021-08-12
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment } from 'react';
import { Menu } from 'choerodon-ui';
// import RelTable from 'srm-front-boot/lib/components/RelTable';
import RelTable from '@/components/RelTable';
import ActionImg from '@/assets/action.png';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel } from 'utils/utils';
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
        encryptBody
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
    key: 'adaptorQueryBlock',
    // QueryBlock设定
    thisComponent: <RelTable tableCode="sada_adaptor_query_block" exportTemplateFlag={false} encryptBody />,
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
  {
    key: 'marmotExternalDatabaseQuerier',
    // 外部数据库查询器
    thisComponent: (
      <RelTable
        tableCode="marmot_external_database_querier"
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
      currentPageKey: 'adapterConstantSetting',
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
                defaultOpenKeys={['configurationItem']}
                defaultSelectedKeys={['adapterConstantSetting']}
                mode="inline"
              >
                <Menu.Item key="adapterConstantSetting">
                  {intl.get('spfm.adaptorConsole.view.title.constantSetting').d('常量设定')}
                </Menu.Item>
                <Menu.Item key="marmotScriptOutboundWhitelist">
                  {intl
                    .get('spfm.adaptorConsole.view.title.ContainerOutboundWhitelist')
                    .d('OutBound白名单')}
                </Menu.Item>
                {!tenantFlag ? (
                  <Menu.ItemGroup className={styles['left-item-group']}>
                    <Menu.Divider>
                      {intl.get('spfm.adaptorConsole.view.title.ConfigurationItem').d('配置项')}
                    </Menu.Divider>
                    <Menu.Item key="adapterCodeBlock">
                      {intl
                        .get('spfm.adaptorConsole.view.title.CodeBlockStorageTable')
                        .d('CodeBlock')}
                    </Menu.Item>
                    <Menu.Item key="adaptorQueryBlock">
                      {intl.get('spfm.adaptorConsole.view.title.adaptorQueryBlock').d('QueryBlock')}
                    </Menu.Item>
                    <Menu.Item key="marmotExternalDatabaseQuerier">
                      {intl
                        .get('spfm.adaptorConsole.view.title.marmotExternalDatabaseQuerier')
                        .d('外部数据库查询器')}
                    </Menu.Item>
                  </Menu.ItemGroup>
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
                      {intl
                        .get('spfm.adaptorConsole.view.title.marmotScriptBlock')
                        .d('土拨鼠代码块')}
                    </Menu.Item>
                  </Menu.SubMenu>
                )}
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
