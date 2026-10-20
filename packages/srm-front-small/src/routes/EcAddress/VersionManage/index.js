import React, { Component } from 'react';
import {
  DataSet,
  Button,
  Tabs,
  Dropdown,
  Menu,
  Icon,
  Form,
  Table,
  TextField,
  CheckBox,
  Modal,
  Tooltip,
} from 'choerodon-ui/pro';
import { Tag, Popconfirm, Badge } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import { observable } from 'mobx';
import { observer, Observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import withProps from 'utils/withProps';
import ExcelExport from 'components/ExcelExport';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import ImportButton from 'components/Import';
import { openImport } from '@/utils/c7nModal';
import {
  saveVersion,
  enableVersion,
  deleteVersion,
  getCode,
  fetchInheritAddress,
  fetchUpgradeVersion,
  fetchVersionSetDefaultApi,
} from '@/services/ecAddressManageService';
import c7nModal from '@/utils/c7nModal.js';
import { downloadFileByAxios } from 'services/api';
import { openTipsModal } from '@/modals';
import OperationRecord from '../modal/OperationRecord/index.js';
import ViewProgress from '../modal/ViewProgress/index.js';

// import { MergeFieldName } from 'srm-front-boot/lib/components/SearchBarTable/util';

import { tableDs, tenTableDs, inheritAddressDS } from './ds.js';

@formatterCollections({
  code: ['small.ecAddressManage', 'hzero.common', 'small.common'],
})
@withRouter
@withProps(
  () => ({
    tableDS: new DataSet(tableDs()),
    tenTableDS: new DataSet(tenTableDs()),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class VersionManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataKey: '1',
      spinning: false,
    };
  }

  @Bind()
  async handleVersion() {
    const result = getResponse(await getCode());
    const formDS = new DataSet({
      fields: [
        {
          name: 'version',
          type: 'string',
          label: intl.get('small.ecAddressManage.EC.address.addAddressVersion').d('新建地址版本'),
          required: true,
        },
        {
          name: 'enabledFlag',
          label: intl.get('small.ecAddressManage.EC.address.using').d('启用'),
        },
      ],
    });
    if (result) {
      formDS.loadData([{ version: result }]);
    }
    c7nModal({
      title: intl.get('small.ecAddressManage.EC.address.addAddressVersion').d('新建地址版本'),
      children: (
        <Form dataSet={formDS} labelLayout="float">
          <TextField name="version" disabled />
          <CheckBox name="enabledFlag" disabled />
        </Form>
      ),
      onOk: async () => {
        let flag = false;
        flag = await formDS.validate();
        if (flag) {
          const res = getResponse(await saveVersion({ versionCode: result }));
          if (res) {
            this.props.tableDS.query();
          }
        } else {
          return false;
        }
      },
      style: { width: 380 },
      // okText: intl.get('small.ecAddressManage.EC.address.save').d('保存'),
    });
  }

  @Bind()
  async handleDelete(record) {
    const res = getResponse(
      await deleteVersion({
        versionId: record.get('versionId'),
        objectVersionNumber: record.get('objectVersionNumber'),
      })
    );
    if (res && !res.failed) {
      this.props.tableDS.query();
    }
  }

  @Bind()
  async handleEnable(record) {
    const res = getResponse(
      await enableVersion({
        versionId: record.get('versionId'),
        enabledFlag: record.get('enabledFlag') === 1 ? 0 : 1,
        objectVersionNumber: record.get('objectVersionNumber'),
        versionCode: record.get('versionCode'),
      })
    );
    if (res && !res.failed) {
      this.props.tableDS.query();
    }
  }

  @Bind()
  handleCheck(record) {
    this.setState({ dataKey: '2', currentVersionCode: record.get('versionCode') }, () => {
      // eslint-disable-next-line no-unused-expressions
      this.searchBarRef?.setField('_mergeField', record.get('versionCode'));
    });
  }

  @Bind()
  openVersionList(onOk = e => e) {
    const ds = new DataSet(inheritAddressDS());
    const selectedData = observable([]);
    const columns = [
      {
        name: 'versionCode',
        width: 120,
      },
      {
        name: 'quantity',
        width: 120,
      },
      {
        name: 'tenantQuantity',
        width: 120,
      },
      {
        name: 'lastUpdateDate',
      },
    ];

    const handleOnOk = () => {
      onOk({ modal, data: selectedData[0] });
    };
    const modal = c7nModal({
      title: intl.get('small.ecAddressManage.EC.address.addressVersion').d('地址版本'),
      style: {
        width: 720,
      },
      children: (
        <Table
          dataSet={ds}
          columns={columns}
          queryFieldsLimit={2}
          style={{ maxHeight: 'calc(100vh - 260px)' }}
          customizedCode='address-version'
          onRow={({ record: r }) => ({
            onClick: () => {
              selectedData[0] = r;
            },
          })}
        />
      ),
      footer: (
        <>
          <Observer>
            {
              () => (
                <Button onClick={handleOnOk} color="primary" disabled={selectedData.length === 0}>
                  {intl.get('hzero.common.button.ok').d('确定')}
                </Button>
              )
            }
          </Observer>
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      ),
    });
  }

  @Bind()
  handleInheritAddress(record) {
    const onInheritAddressOk = async ({ modal, data }) => {
      const res = getResponse(await fetchInheritAddress({
        ...record.toData(),
        extendVersionId: data.get('versionId'),
        extendVersionCode: data.get('versionCode'), // 继承的版本号
      }));
      if (res) {
        notification.success();
        modal.close();
        this.props.tableDS.query(this.props.tableDS.currentPage);
      }
    };
    this.openVersionList(onInheritAddressOk);
  }

  @Bind()
  beforeVersionUpgrade(record) {
    const onVersionOk = ({ modal, data })=>{
      modal.close();
      this.versionUpgrade(record, data.toData());
    };
    this.openVersionList(onVersionOk);
  }

  @Bind()
  versionUpgrade(record, lastRegionVersionVO) {
    const { versionCode } = lastRegionVersionVO || {};
    openTipsModal({
      title: intl.get('small.common.model.tips').d('提示'),
      children: intl.get('small.ecAddressManage.addressConfirm.versionUpgrade.tips1', {
        version: versionCode,
      }).d(`是否确认将当前地址版本升级为版本${versionCode}。注意：该操作将会对租户下所有地址数据产生影响，请谨慎操作。`),
      onOk: async () => {
        const res = getResponse(await fetchUpgradeVersion({
          ...record.toData(),
          upgradeVersionId: lastRegionVersionVO?.versionId,
        }));
        if (res) {
          notification.success({
            message: intl.get('small.ecAddressManage.addressConfirm.successInfo').d('升级成功！'),
          });
          this.props.tenTableDS.query();
          return true;
        }
        else {
          notification.error({
            message: intl.get('small.ecAddressManage.addressConfirm.errorInfo', {
              error: res?.message,
            }).d(`升级失败，失败原因是：${res.message}，请检查后重新操作。`),
          });
          return true;
        }
      },
    });
  }

  // 升级进度查看
  versionProgress=(record)=>{
    Modal.open({
      title: intl.get('small.ecAddressManage.EC.address.versionProgress').d('升级进度查看'),
      mask: true,
      drawer: true,
      destroyOnClose: true,
      style: { width: 1042 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: <ViewProgress recordDs={record} />,
    });
  }

  // 操作记录 版本管理+租户版本管理
  handleOpenOperationRecords= (params)=>{
    Modal.open({
      title: intl.get('small.ecAddressManage.EC.address.operationRecords').d('操作记录'),
      mask: true,
      drawer: true,
      destroyOnClose: true,
      style: { width: 742 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: <OperationRecord params={params} />,
    });
  }

  @Bind()
  async handleExportAdd(record) {
    this.setState({ spinning: true }, () => {
      const requestUrl = `/smal/v1/region-version/export?versionId=${record.get('versionId')}`;
      downloadFileByAxios({ requestUrl })
        .then((res) => {
          if (res) {
            this.setState({ spinning: false });
          }
        })
        .finally(() => {
          this.setState({ spinning: false });
        });
    });
  }

  @Bind()
  handleImport(record) {
    openImport(
      {
        afterClose: () => this.props.tableDS.query(),
      },
      {
        key: '/small/data-import/SMAL.PRODUCT_GROUP_IMPORT',
        code: 'SMAL.PRODUCT_GROUP_IMPORT',
        args: { versionId: record.get('versionId') },
      }
    );
  }

  @Bind()
  handlePush(record) {
    this.props.history.push({
      pathname: '/small/ec-address/list',
      state: { versionId: record.get('versionId'), versionCode: record.get('versionCode') },
    });
  }

  @Bind()
  handleSetDefault(record) {
    const setDefault = ()=>{
      this.setState({ spinning: true }, () => {
        const params = {
          ...record.toData(),
          defaultFlag: record.get('defaultFlag') ? 0 : 1,
        };
        fetchVersionSetDefaultApi(params)
          .then((res) => {
            if (res) {
              this.setState({ spinning: false });
              this.props.tableDS.query();
            }
          })
          .finally(() => {
            this.setState({ spinning: false });
          });
      });
    };
    const defaultVersion = record.get('defaultVersionCode');
    if (record.get('defaultVersionId')) {
      openTipsModal({
        title: intl.get('small.common.model.tips').d('提示'),
        children: intl.get('small.ecAddressManage.addressConfirm.versionSeDefault.tips', {
          version: defaultVersion,
        }).d(`已有默认地址版本${defaultVersion}，是否将当前版本设为默认？`),
        onOk: () => {
          setDefault();
        },
      });
    } else {
      setDefault();
    }

  }

  render() {
    const { dataKey, spinning, currentVersionCode } = this.state;
    const menu = record => (
      <Menu>
        <Menu.Item>
          <Popconfirm
            placement="topRight"
            title={intl.get('small.ecAddressManage.view.confirmDelete').d('确认删除？')}
            onConfirm={() => this.handleDelete(record)}
          >
            <Button
              funcType="link"
              disabled={
                record.get('enabledFlag') === 1 ||
                record.get('tenantQuantity') !== 0 ||
                record.get('quantity') !== 0
              }
              // onClick={() => this.handleDeleteModal(record)}
            >
              {intl.get('small.ecAddressManage.EC.address.delete').d('删除')}
            </Button>
          </Popconfirm>
        </Menu.Item>
        <Menu.Item>
          <ExcelExport
            buttonText={intl.get('small.ecAddressManage.EC.address.exportAdd').d('导出地址')}
            requestUrl={`/smal/v1/region-version/export?versionId=${record.get('versionId')}`}
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'link',
              icon: '',
              // permissionList: [
              //   {
              //     code: `${path}.button.receiver.export-new`,
              //     type: 'button',
              //     meaning: '收货地址-(新)导出',
              //   },
              // ],
            }}
          />
        </Menu.Item>
        <Menu.Item>
          <Button
            funcType="link"
            onClick={() => this.handleInheritAddress(record)}
            // 继承阶段为未继承则可以点击(继承成功之后会立即转变为未继承)
            disabled={record.get('extendStatus') !== 'NOT_EXTEND'}
          >
            {intl.get('small.ecAddressManage.EC.address.inheritAddress').d('继承地址')}
          </Button>
        </Menu.Item>
        <Menu.Item>
          <Tooltip title={!record.get('enabledFlag') ? intl.get('small.ecAddressManage.address.default.disabledTip').d('禁用地址不可设为默认') : null}>
            <Button
              funcType="link"
              onClick={() => this.handleSetDefault(record)}
              disabled={!record.get('enabledFlag') || !!record.get('defaultFlag')} // 禁用地址不可设为默认
            >
              {/* {record.get('defaultFlag') ? intl.get('small.common.model.default.cancel').d('取消默认') : intl.get('small.common.model.default.set').d('设为默认')} */}
              {intl.get('small.common.model.default.set').d('设为默认')}
            </Button>
          </Tooltip>
        </Menu.Item>
        <Menu.Item>
          <Button
            disabled={record.get('tenantQuantity') === 0}
            funcType="link"
            onClick={() => this.handleCheck(record)}
          >
            {intl.get('small.ecAddressManage.EC.address.checkTenant').d('查看应用租户')}
          </Button>
        </Menu.Item>
        <Menu.Item>
          <Button
            funcType="link"
            onClick={() =>
              this.handleOpenOperationRecords({
                versionId: record.get('versionId'),
                tenantId: record.get('tenantId'),
              })
            }
          >
            {intl.get('small.ecAddressManage.EC.address.operationRecords').d('操作记录')}
          </Button>
        </Menu.Item>
      </Menu>
    );
    const columns = [
      {
        name: 'enabledFlag',
        renderer: ({ value }) => (
          <Tag
            color={value === 1 ? 'rgba(71,184,129,0.10)' : 'rgba(245,99,73,0.10)'}
            style={{ color: value === 1 ? '#47B881' : '#F56349' }}
          >
            {value === 1
              ? intl.get('small.ecAddressManage.EC.address.using').d('启用')
              : intl.get('small.ecAddressManage.EC.address.disabled').d('禁用')}
          </Tag>
        ),
      },
      {
        name: 'versionCode',
        renderer: ({ text, record }) =>
          record.get('quantity') > 0 ? (
            <Button
              disabled={record.get('quantity') === 0 || record.get('enabledFlag') === 0}
              color="primary"
              funcType="link"
              onClick={() => this.handlePush(record)}
            >
              {text}
            </Button>
          ) : (
            <span>{text}</span>
          ),
      },
      { name: 'quantity', align: 'right' },
      { name: 'tenantQuantity', align: 'right' },
      { name: 'lastUpdateDate', width: 180 },
      { name: 'defaultFlag', renderer: ({ value }) =>
        (value === 1 ?
          <Badge status="success" text={intl.get('hzero.common.status.yes').d('是')} /> :
          <Badge status="error" text={intl.get('hzero.common.status.no').d('否')} /> ),
      },
      {
        name: 'operation',
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <ImportButton
                businessObjectTemplateCode="SMAL.REGION.IMPORT"
                refreshButton
                buttonText={intl.get('small.ecAddressManage.EC.address.importAdd').d('导入地址')}
                prefixPatch="/smal"
                args={{
                  versionId: record.get('versionId'),
                  templateCode: 'SMAL.REGION.IMPORT',
                }}
                successCallBack={() => this.props.tableDS.query()}
                buttonProps={{
                  icon: '',
                  color: 'primary',
                  funcType: 'link',
                  disabled: record.get('enabledFlag') === 1,
                }}
                modalProps={{
                  title: `${intl
                    .get('small.ecAddressManage.EC.address.importVersionAdd')
                    .d('导入版本地址')}${record.get('versionCode')}`,
                }}
              />
              {/* <Button funcType="link" color="primary" onClick={() => this.handleImport(record)}>
              {intl.get('small.ecAddressManage.EC.address.exportAdd').d('导入地址')}
            </Button> */}
              <Tooltip title={record.get('defaultFlag') ? intl.get('small.ecAddressManage.address.enabled.disabledTip').d('默认地址版本不可禁用') : null}>
                <Button
                  funcType="link"
                  color="primary"
                  disabled={
                    (record.get('enabledFlag')
                      ? record.get('tenantQuantity') !== 0
                      : record.get('quantity') === 0 ) || !!record.get('defaultFlag')
                  }
                  onClick={() => this.handleEnable(record)}
                >
                  {record.get('enabledFlag')
                    ? intl.get('small.ecAddressManage.EC.address.disabled').d('禁用')
                    : intl.get('small.ecAddressManage.EC.address.using').d('启用')}
                </Button>
              </Tooltip>
              <Dropdown overlay={() => menu(record)}>
                <Button funcType="link" color="primary">
                  {intl.get('hzero.common.button.more').d('更多')}
                </Button>
                <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginBottom: 2 }} />
              </Dropdown>
            </span>
          );
        },
      },
    ];
    const tenColumns = [
      { name: 'tenantName' },
      { name: 'tenantNum' },
      { name: 'versionCode' },
      {
        name: 'operate',
        title: intl.get('hzero.common.action').d('操作'),
        width: 240,
        renderer: ({ record }) => (
          <span className="action-link">
            <Button funcType="link" color="primary" onClick={() => this.beforeVersionUpgrade(record)}>
              {intl.get('small.ecAddressManage.EC.address.versionUpgrade').d('地址版本升级')}
            </Button>
            <Button funcType="link" color="primary" onClick={() => this.versionProgress(record)}>
              {intl.get('small.ecAddressManage.EC.address.versionProgress').d('升级进度查看')}
            </Button>
            <Button
              funcType="link"
              color="primary"
              onClick={() =>
                this.handleOpenOperationRecords({ tenantId: record.get('tenantId'), versionId: -1 })
              }
            >
              {intl.get('small.ecAddressManage.EC.address.operationRecords').d('操作记录')}
            </Button>
          </span>
        ),
      },
    ];

    const ObserBtn = observer(({ ds }) => {
      const versionIds = ds.selected.map((i) => i.toData().versionId);
      return (
        <ExcelExport
          buttonText={intl.get('small.ecAddressManage.EC.address.exportDiff').d('导出版本差异')}
          requestUrl={`/smal/v1/region-version/diff-export?currentVersionId=${versionIds?.[0]}&compareVersionId=${versionIds?.[1]}`}
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            disabled: ds.selected.length !== 2,
          }}
        />
      );
    });
    return (
      <React.Fragment>
        <Header
          backPath="/small/ec-address/list"
          title={intl.get('small.ecAddressManage.EC.address.version').d('版本管理')}
        >
          {dataKey === '1' && (
            <>
              <Button icon="add" color="primary" onClick={this.handleVersion}>
                {intl.get('small.ecAddressManage.EC.address.addVersion').d('新建版本')}
              </Button>
              <ObserBtn ds={this.props.tableDS} />
            </>
          )}
        </Header>
        <Content>
          <Tabs
            activeKey={dataKey}
            onChange={(key) => {
              this.setState({ dataKey: key });
              if (key === '1') {
                this.props.tableDS.query();
              } else {
                this.props.tenTableDS.query();
              }
            }}
            customizedCode="SMALL.EC_ADDRESS.LIST.TABS"
          >
            <Tabs.TabPane
              tab={intl.get('small.ecAddressManage.EC.address.version').d('版本管理')}
              key="1"
              count={() => this.props.tableDS.totalCount}
            >
              <div style={{ height: 'calc(100vh - 252px)' }}>
                <SearchBarTable
                  style={{ maxHeight: `calc(100% - 22px)` }}
                  spin={{ spinning }}
                  dataSet={this.props.tableDS}
                  columns={columns}
                  searchCode="SMAL.REGION.VERSION.QUERY"
                  customizedCode="SMALL.EC_ADDRESS.LIST.VERSION"
                />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('small.ecAddressManage.EC.address.tenantVersion').d('租户版本管理')}
              key="2"
              count={() => this.props.tenTableDS.totalCount}
            >
              <div style={{ height: 'calc(100vh - 252px)' }}>
                <SearchBarTable
                  style={{ maxHeight: `calc(100% - 22px)` }}
                  dataSet={this.props.tenTableDS}
                  columns={tenColumns}
                  searchBarRef={(ref) => {
                    this.searchBarRef = ref;
                  }}
                  customizedCode="SMALL.EC_ADDRESS.LIST.TENANT.VERSION"
                  searchCode="SMAL.REGION.VERSION.TENANT.QUERY"
                  searchBarConfig={{
                    onLoad: () => {
                      this.searchBarRef.setField('_mergeField', currentVersionCode);
                    },
                  }}
                />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
