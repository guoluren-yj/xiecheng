/**
 * SysToolsTwo/index.js
 * 系统工具2
 * @date: 2021-11-11
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { Menu } from 'choerodon-ui';
import { Content } from 'components/Page';
// import RelTable from 'srm-front-boot/lib/components/RelTable';
import RelTable from '@/components/RelTable';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

const ConsoleComponents = [
  {
    key: 'globalBlackApiList',
    // 全局API黑名单
    thisComponent: (
      <RelTable
        tableCode="global_black_api_list"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'globalTenantConcurrentLimitConfig',
    // 全局二级流控配置
    thisComponent: (
      <RelTable
        tableCode="global_tenant_concurrent_limit_config"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
];
@formatterCollections({
  code: ['spfm.sysToolsTwo'],
})
export default class SysToolsTwo extends React.Component {
  constructor() {
    super();
    this.state = {
      currentPageKey: 'globalBlackApiList',
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
              mode="inline"
            >
              <Menu.Item key="globalBlackApiList">
                {intl.get('spfm.sysToolsTwo.view.title.globalBlackApiList').d('全局API黑名单')}
              </Menu.Item>
              <Menu.Item key="globalTenantConcurrentLimitConfig">
                {intl
                  .get('spfm.sysToolsTwo.view.title.globalTenantConcurrentLimitConfig')
                  .d('全局二级流控配置')}
              </Menu.Item>
            </Menu>
          </div>
          <div style={{ width: 'calc( 100% - 200px )' }}>{rightContent}</div>
        </div>
      </Content>
    );
  }
}
