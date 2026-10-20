/**
 * SeciInterfaceDef - 接口定义
 * @date: 2019-01-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { filterNullValueObject } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import QueryForm from './QueryForm';
import InterfaceModal from './InterfaceModal';

/**
 * 接口定义
 * @extends {Component} - React.Component
 * @reactProps {Object} seciInterfaceDef - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ seciInterfaceDef, loading }) => ({
  seciInterfaceDef,
  loading: loading.effects['seciInterfaceDef/fetchSeciInterfaceDef'],
}))
@formatterCollections({ code: ['sitf.seciInterfaceDef', 'entity.interface'] })
export default class SeciInterfaceDef extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableRecord: {}, // 保存的记录
      modalVisible: false,
    };
  }

  form;

  componentDidMount() {
    this.refreshData();
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 刷新数据
   */
  @Bind()
  refreshData() {
    const {
      dispatch,
      seciInterfaceDef: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const form = isUndefined(this.form) ? {} : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: `seciInterfaceDef/fetchSeciInterfaceDef`,
      payload: {
        page: isUndefined(_back) ? {} : pagination,
        ...form,
      },
    });
  }

  /**
   * 查询接口定义
   * @param {object} params 查询参数
   */
  @Bind()
  fetchSeciInterfaceDef(params = {}) {
    const {
      dispatch,
      seciInterfaceDef: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: `seciInterfaceDef/fetchSeciInterfaceDef`,
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 新建表单
   */
  @Bind()
  handleCreateInterface() {
    this.setState({
      modalVisible: true,
      tableRecord: {},
    });
  }

  /**
   * 编辑数据
   * @param {Object} record 行数据
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
    const { dispatch } = this.props;
    dispatch({
      type: `seciInterfaceDef/updateInterfaces`,
      payload: [values],
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          modalVisible: false,
        });
        this.fetchSeciInterfaceDef();
      }
    });
  }

  /**
   * 取消隐藏弹出框
   */
  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
    });
  }

  render() {
    const {
      seciInterfaceDef: { data = [], pagination = {} },
      loading,
    } = this.props;
    const { tableRecord, modalVisible } = this.state;
    const columns = [
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
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'edit',
        width: 100,
        render: (val, record) => {
          return (
            <a
              onClick={() => {
                this.handleEditInterface(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];

    const filterProps = {
      onRef: this.handleRef,
      onFetchData: this.fetchSeciInterfaceDef,
    };

    const detailProps = {
      modalVisible,
      loading,
      tableRecord,
      anchor: 'right',
      onHandleSaveInterface: this.handleSaveInterface,
      onCancel: this.handleCancel,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`seci.seciInterfaceDef.view.message.title`).d('接口定义')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateInterface}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <QueryForm {...filterProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={data}
            rowKey="interfaceId"
            columns={columns}
            loading={loading}
            bordered
            onChange={page => this.fetchSeciInterfaceDef(page)}
          />
        </Content>
        <InterfaceModal {...detailProps} />
      </React.Fragment>
    );
  }
}
