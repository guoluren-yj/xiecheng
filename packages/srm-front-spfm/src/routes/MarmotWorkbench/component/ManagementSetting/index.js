import React, { Fragment } from 'react';
import { Menu } from 'choerodon-ui';
// import RelTable from 'srm-front-boot/lib/components/RelTable';
import ActionImg from '@/assets/action.png';
import RelTable from '@/components/RelTable';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

const ConsoleComponents = [
  {
    key: 'marmotOptions',
    // 引擎参数
    thisComponent: (
      <RelTable
        tableCode="marmot_config"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'adaptorStaticCode',
    // 埋点管理
    thisComponent: (
      <RelTable
        tableCode="adaptor_static_code"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotWebhook',
    // Webhook
    thisComponent: (
      <RelTable
        tableCode="marmot_webhook"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotExternalDatabase',
    // marmotExternalDatabase
    thisComponent: (
      <RelTable
        tableCode="marmot_external_database"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'globalCrossSchemaRule',
    // 数据库Schema规则
    thisComponent: (
      <RelTable
        tableCode="global_cross_schema_rule"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
];
@formatterCollections({
  code: ['spfm.managementSetting'],
})
export default class ManagementSetting extends React.Component {
  constructor() {
    super();
    this.state = {
      currentPageKey: 'marmotOptions',
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
                defaultSelectedKeys={['marmotOptions']}
                // defaultOpenKeys={['marmotOptions']}
                forceSubMenuRender
                mode="inline"
              >
                <Menu.Item key="marmotOptions">
                  {intl.get('spfm.managementSetting.view.title.marmotOptions').d('MarmotOptions')}
                </Menu.Item>
                <Menu.Item key="adaptorStaticCode">
                  {intl.get('spfm.managementSetting.view.title.adaptorStaticCode').d('埋点管理')}
                </Menu.Item>
                <Menu.Item key="marmotWebhook">
                  {intl.get('spfm.managementSetting.view.title.marmotWebhook').d('Webhook')}
                </Menu.Item>
                <Menu.Item key="marmotExternalDatabase">
                  {intl
                    .get('spfm.managementSetting.view.title.marmotExternalDatabase')
                    .d('MarmotExternalDatabase')}
                </Menu.Item>
                <Menu.Item key="globalCrossSchemaRule">
                  {intl
                    .get('spfm.managementSetting.view.title.globalCrossSchemaRule')
                    .d('数据库Schema规则')}
                </Menu.Item>
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
