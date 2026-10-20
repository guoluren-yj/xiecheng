import React, { Fragment } from 'react';
import { Menu } from 'choerodon-ui';
import { DataSet, Lov } from 'choerodon-ui/pro';
import ActionImg from '@/assets/action.png';
import { queryUUID, showDataMove } from '@/services/marmotWorkbenchService';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import DataImport from './components/DataImport';
import DataOutput from './components/DataOutput';
import styles from './index.less';

@formatterCollections({
  code: ['spfm.dataMigration', 'hzero.common'],
})
export default class DataMigration extends React.Component {
  constructor() {
    super();
    this.state = {
      currentPageKey: 'dataOutput',
      showMenu: true,
      tenantNum: '',
      uuid: '',
      importUUID: '',
      showImportCom: false,
    };
    this.queryFormDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'applyTenant',
          type: 'object',
          lovCode: 'SADA_TENANT_PAGE',
          ignore: 'always',
        },
        {
          name: 'applyTenantNum',
          type: 'string',
          bind: 'applyTenant.tenantNum',
        },
        {
          name: 'applyTenantName',
          type: 'string',
          bind: 'applyTenant.tenantName',
        },
      ],
    });
  }

  pleaseChooseTenant = () => {
    const tenantNum =
      this.queryFormDs && this.queryFormDs.current
        ? this.queryFormDs.current.get('applyTenantNum')
        : '';
    if (!tenantNum) {
      notification.info({
        message: intl.get('spfm.dataMigration.view.please.chooseTenant').d('请选择租户'),
      });
    }
  };

  componentDidMount() {
    showDataMove().then((res) => {
      if (res) {
        this.setState({ showImportCom: true });
      }
    });
  }

  switchMenu = (e) => {
    this.setState({ currentPageKey: e.key });
  };

  handleFoldTree = (value) => {
    this.setState({ showMenu: value });
  };

  changeTenant = () => {
    const tenantNum =
      this.queryFormDs && this.queryFormDs.current
        ? this.queryFormDs.current.get('applyTenantNum')
        : '';
    if (tenantNum) {
      this.setState({ tenantNum });
      queryUUID(tenantNum).then((res) => {
        if (res) {
          this.setState({ uuid: res });
        }
      });
    } else {
      this.setState({ tenantNum: '' });
      this.setState({ uuid: '' });
    }
  };

  changeImportUUID = (value) => {
    this.setState({ importUUID: value });
  };

  get ConsoleComponents() {
    return [
      {
        key: 'dataImport',
        thisComponent: (
          <DataImport
            tenantNum={this.state.tenantNum}
            changeTenant={this.changeTenant}
            uuid={this.state.importUUID}
            changeUUID={this.changeImportUUID}
            pleaseChooseTenant={this.pleaseChooseTenant}
          />
        ),
      },
      {
        key: 'dataOutput',
        thisComponent: (
          <DataOutput uuid={this.state.uuid} pleaseChooseTenant={this.pleaseChooseTenant} />
        ),
      },
    ];
  }

  render() {
    const findObj = this.ConsoleComponents.find((res) => res.key === this.state.currentPageKey);
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
              <Lov
                className="content-container-left-lov"
                dataSet={this.queryFormDs}
                name="applyTenant"
                placeholder={intl.get('hzero.common.view.tenantSelect.title').d('选择租户')}
                onChange={() => this.changeTenant()}
              />
              <Menu
                onClick={this.switchMenu}
                className={styles['left-menu']}
                defaultSelectedKeys={['dataOutput']}
                mode="inline"
              >
                <Menu.Item key="dataOutput">
                  {intl.get('spfm.dataMigration.view.title.dataOutput').d('数据导出')}
                </Menu.Item>
                {this.state.showImportCom && (
                  <Menu.Item key="dataImport">
                    {intl.get('spfm.dataMigration.view.title.dataImport').d('数据导入')}
                  </Menu.Item>
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
