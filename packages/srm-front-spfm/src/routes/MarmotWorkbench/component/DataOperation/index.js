import React, { Fragment } from 'react';
import { Menu, Card, Col, Row } from 'choerodon-ui';
import { DataSet, Lov } from 'choerodon-ui/pro';
import ActionImg from '@/assets/action.png';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import MarmotDownloadButton from 'srm-front-boot/lib/components/MarmotDownloadButton';
import styles from './index.less';

@formatterCollections({
  code: ['spfm.dataOperation', 'hzero.common'],
})
export default class DataOperation extends React.Component {
  constructor() {
    super();
    this.state = {
      showMenu: true,
      tenantNum: '',
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

  getTenantNum = () => {
    const tenantNum = this.queryFormDs?.current.get('applyTenantNum');

    if (!tenantNum) {
      notification.info({
        message: intl.get('spfm.dataOperation.view.please.chooseTenant').d('请选择租户'),
      });
    } else {
      return this.state.tenantNum;
    }
  };

  componentDidMount() {
    // showDataMove().then((res) => {
    // //   if (res) {
    // //     this.setState({ showImportCom: true });
    // //   }
    // });
  }

  switchMenu = () => {
    // this.setState({ currentPageKey: e.key });
  };

  handleFoldTree = (value) => {
    const tenantNum = this.queryFormDs?.current.get('applyTenantNum');
    if (!tenantNum) {
      notification.info({
        message: intl.get('spfm.dataOperation.view.please.chooseTenant').d('请选择租户'),
      });
      return false;
    }
    this.setState({ showMenu: value });
  };

  changeTenant = () => {
    const tenantNum = this.queryFormDs?.current.get('applyTenantNum');
    if (tenantNum) {
      this.setState({ tenantNum });
    } else {
      this.setState({ tenantNum: '' });
    }
  };

  //   changeImportUUID = (value) => {
  //     this.setState({ importUUID: value });
  //   };

  render() {
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
                  {intl.get('spfm.dataOperation.view.title.dataOutput').d('运营操作项')}
                </Menu.Item>
                {/* {this.state.showImportCom && (
                  <Menu.Item key="dataImport">
                    {intl.get('spfm.dataOperation.view.title.dataImport').d('数据导入')}
                  </Menu.Item>
                )} */}
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
            <div style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Card title="清单导出" bordered={false}>
                    <MarmotDownloadButton
                      displayName="导出该租户开发资产列表"
                      api="/marmot/v1/marmot-site-api/MARMOT_ALL_EXCEL_EXPORT"
                      queryParams={[{ name: 'tenantNum', value: this.getTenantNum() }]}
                    />
                  </Card>
                </Col>
                {/* <Col span={8}>
        <Card title="Card title" bordered={false}>Card content</Card>
      </Col>
      <Col span={8}>
        <Card title="Card title" bordered={false}>Card content</Card>
      </Col> */}
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Card title="业务规则数据导出" bordered={false}>
                    <MarmotDownloadButton
                      displayName="导出该租户业务规则数据"
                      api="/sada/v1/marmot-site-api/CNF_META_DEFINITION_EXP"
                      queryParams={[{ name: 'tenantNum', value: this.getTenantNum() }]}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </di>
        </div>
      </Fragment>
    );
  }
}
