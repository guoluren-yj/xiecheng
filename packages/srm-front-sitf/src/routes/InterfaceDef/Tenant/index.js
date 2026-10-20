/**
 * InterfaceDef -接口定义页面 --租户级
 * @date: 2018-8-16
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Button, Icon, Dropdown, Divider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { Link } from 'dva/router';

import { getCurrentOrganizationId, filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';
import InterfaceModal from './InterfaceModal';

@formatterCollections({
  code: ['sitf.interfaceDef', 'sitf.common', 'entity.interface', 'entity.application'],
})
export default class InterfaceDef extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      organizationRole: isTenantRoleLevel(),
      tableRecord: {}, // 保存的记录
      modalVisible: false,
    };
  }

  form;

  componentDidMount() {
    this.batchCode();
    this.refreshData();
  }

  /**
   * 值级查询
   */
  @Bind()
  batchCode() {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const lovCodes = {
      interface: 'SITF.INTERFACE_TYPE',
      individual: 'SITF.INDIVIDUAL_FLAG',
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: {
        lovCodes,
      },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  refreshData() {
    const { modelName = 'interfaceDef' } = this.props;
    const {
      dispatch,
      [modelName]: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const form = isUndefined(this.form) ? {} : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: `${modelName}/fetchInterfaceDef`,
      payload: {
        page: isUndefined(_back) ? {} : pagination,
        ...form,
      },
    });
  }

  /**
   * 查询消息队列接口
   * @param {object} params 查询参数
   */
  @Bind()
  fetchInterfaceDef(params = {}) {
    const { modelName = 'interfaceDef' } = this.props;
    const {
      dispatch,
      [modelName]: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: `${modelName}/fetchInterfaceDef`,
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 新建表格
   */
  @Bind()
  handleCreateInterface() {
    this.setState({
      modalVisible: true,
      tableRecord: {},
    });
  }

  /**
   * 编辑表格
   */
  @Bind()
  handleEditInterface(record = {}) {
    this.setState({
      modalVisible: true,
      tableRecord: record,
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSaveInterface(values = {}) {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    dispatch({
      type: `${modelName}/updateInterfaces`,
      payload: {
        body: [values],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          modalVisible: false,
        });
        this.fetchInterfaceDef();
      }
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
    });
  }

  /**
   * 引用云级接口
   */
  @Bind()
  quoteData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'interfaceDefOrg/quoteInterface',
      payload: {},
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchInterfaceDef();
      }
    });
  }

  render() {
    const { modelName = 'interfaceDef' } = this.props;
    const {
      [modelName]: { list = {}, code, pagination = {} },
      loading,
      quoteLoading,
    } = this.props;
    const { tenantId, tableRecord, modalVisible, organizationRole } = this.state;
    const columns = [
      {
        title: intl.get('entity.interface.type').d('接口类别'),
        dataIndex: 'interfaceCategoryName',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('entity.interface.code').d('接口代码'),
        dataIndex: 'interfaceCode',
        width: 200,
        align: 'left',
      },
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get('entity.interface.type').d('接口类型'),
        dataIndex: 'interfaceTypeMeaning',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('entity.interface.pushFlag').d('是否主动推送数据'),
        dataIndex: 'pushFlag',
        width: 130,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('entity.interface.handleFunction').d('接口处理方法'),
        dataIndex: 'handleFunction',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        align: 'left',
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'comments',
        align: 'left',
        width: 80,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        width: 280,
        render: (val, record) => {
          const menu = (
            <div>
              <a
                style={{ borderBottom: '2px solid #fff' }}
                onClick={() => {
                  this.handleEditInterface(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Divider type="vertical" />
              <a key="interfaceTable">
                <Link
                  to={
                    organizationRole
                      ? `/sitf/interface-def-org/table?interfaceId=${record.interfaceId}&interfaceCode=${record.interfaceCode}&interfaceName=${record.interfaceName}`
                      : `/sitf/interface-def/table?interfaceId=${record.interfaceId}&interfaceCode=${record.interfaceCode}&interfaceName=${record.interfaceName}`
                  }
                >
                  {intl
                    .get('sitf.interfaceDef.view.interfaceDef.interfaceTableDef')
                    .d('关键字段提取')}
                </Link>
              </a>
              <Divider type="vertical" />
              {organizationRole && (
                <a key="centerTable">
                  <Link to={`/sitf/interface-def-org/cate?interfaceId=${record.interfaceId}`}>
                    {intl
                      .get('sitf.interfaceDef.view.interfaceDef.interfaceCateDef')
                      .d('中间表定义')}
                  </Link>
                </a>
              )}
            </div>
          );
          const { children } = menu.props;
          const item = Object.keys(children);
          if (item.length > 5) {
            return (
              <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                <a className="ant-dropdown-link">
                  {intl.get('hzero.common.button.action').d('操作')}
                  <Icon type="down" />
                </a>
              </Dropdown>
            );
          } else {
            return menu;
          }
        },
      },
    ];
    const columnsOrg = [
      {
        title: intl.get('entity.interface.type').d('接口类别'),
        dataIndex: 'interfaceCategoryName',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('entity.interface.code').d('接口代码'),
        dataIndex: 'interfaceCode',
        width: 200,
        align: 'left',
      },
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get('entity.interface.type').d('接口类型'),
        dataIndex: 'interfaceTypeMeaning',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('entity.interface.pushFlag').d('是否主动推送数据'),
        dataIndex: 'pushFlag',
        width: 130,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('entity.interface.handleFunction').d('接口处理方法'),
        dataIndex: 'handleFunction',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        align: 'left',
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('sitf.interfaceDef.model.interfaceDef.individualFlag').d('二开'),
        dataIndex: 'individualFlag',
        width: 80,
        align: 'left',
        render: (val, record) => {
          return record.individualFlag === 1 ? (
            <span>{intl.get('sitf.interfaceDef.model.interfaceDef.individualFlag').d('二开')}</span>
          ) : (
            <span>{intl.get('sitf.interfaceDef.view.interfaceDef.normal').d('标准')}</span>
          );
        },
      },
      {
        title: intl.get('hzero.common.rerunErrorFlag').d('错误重跑'),
        width: 100,
        align: 'left',
        dataIndex: 'rerunErrorFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.asyncFlag').d('异步标识'),
        width: 100,
        align: 'left',
        dataIndex: 'asyncFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'comments',
        align: 'left',
        width: 150,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        width: 230,
        render: (val, record) => {
          const menu = (
            <div>
              <a
                style={{ borderBottom: '2px solid #fff' }}
                onClick={() => {
                  this.handleEditInterface(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Divider type="vertical" />
              <a key="interfaceTable">
                <Link
                  to={
                    organizationRole
                      ? `/sitf/interface-def-org/table?interfaceId=${record.interfaceId}&interfaceCode=${record.interfaceCode}&interfaceName=${record.interfaceName}`
                      : `/sitf/interface-def/table?interfaceId=${record.interfaceId}&interfaceCode=${record.interfaceCode}&interfaceName=${record.interfaceName}`
                  }
                >
                  {intl
                    .get('sitf.interfaceDef.view.interfaceDef.interfaceTableDef')
                    .d('关键字段提取')}
                </Link>
              </a>
              <Divider type="vertical" />
              {organizationRole && (
                <a key="centerTable">
                  <Link to={`/sitf/interface-def-org/cate?interfaceId=${record.interfaceId}`}>
                    {intl
                      .get('sitf.interfaceDef.view.interfaceDef.interfaceCateDef')
                      .d('中间表定义')}
                  </Link>
                </a>
              )}
            </div>
          );
          const { children } = menu.props;
          const item = Object.keys(children);
          if (item.length > 5) {
            return (
              <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                <a className="ant-dropdown-link">
                  {intl.get('hzero.common.button.action').d('操作')}
                  <Icon type="down" />
                </a>
              </Dropdown>
            );
          } else {
            return menu;
          }
        },
      },
    ];
    const filterProps = {
      code,
      organizationRole,
      onRef: this.handleRef,
      onFetchData: this.fetchInterfaceDef,
    };
    const detailProps = {
      code,
      modalVisible,
      loading,
      tenantId,
      organizationRole,
      tableRecord,
      anchor: 'right',
      onHandleSaveInterface: this.handleSaveInterface,
      onCancel: this.handleCancel,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sitf.interfaceDef.view.interfaceDef.interfaceDef').d('接口定义')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateInterface}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {organizationRole && (
            <Button icon="fork" loading={quoteLoading || loading} onClick={this.quoteData}>
              {intl.get('sitf.common.button.option.quote').d('引用云级接口')}
            </Button>
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content}
            rowKey="interfaceId"
            columns={!organizationRole ? columns : columnsOrg}
            loading={loading}
            bordered
            onChange={(page) => this.fetchInterfaceDef(page)}
          />
        </Content>
        <InterfaceModal {...detailProps} />
      </React.Fragment>
    );
  }
}
