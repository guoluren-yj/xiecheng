/**
 * ESService - 外部系统定义 - 关联服务
 * @date: 2018-9-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form, Button, Table, Row, Col, Divider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { createPagination } from 'utils/utils';
import EditForm from './EditForm';
import QueryForm from './QueryForm';

/**
 * 外部系统定义 - 关联服务
 * @extends {Component} - React.Component
 * @reactProps {Object} externalSystems - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['sitf.externalSystems', 'entity.interface', 'entity.application'] })
@connect(({ externalSystems, loading }) => ({
  externalSystems,
  loading: loading.effects['externalSystems/saveESService'],
  fetchLoading: loading.effects['externalSystems/fetchESService'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
export default class ESService extends PureComponent {
  constructor(props) {
    super(props);
    const parentParams = qs.parse(props.history.location.search.substr(1));
    this.state = {
      modalVisible: false,
      editRowData: {},
      queryParams: {},
      pageCache: {
        page: 0,
        size: 10,
      },
      parentParams,
    };
  }

  /**
   * 组件挂载后执行方法
   * @memberof ESService
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { pageCache, parentParams } = this.state;
    dispatch({
      type: 'externalSystems/fetchESInfo',
      payload: {
        externalSystemCode: parentParams && parentParams.externalSystemCode,
      },
    });
    this.fetchESService({
      ...pageCache,
    });
  }

  /**
   * 查询数据
   * @param {object} pageData 页面信息数据
   * @memberof ESService
   */
  @Bind()
  fetchESService(pageData = {}) {
    const { form, dispatch } = this.props;
    const { pageCache, parentParams, queryParams } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'externalSystems/fetchESService',
          payload: {
            ...fieldsValue,
            ...queryParams,
            ...pageCache,
            ...pageData,
            ...parentParams,
          },
        });
      }
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {object} record 行数据
   * @memberof ESService
   */
  @Bind()
  showEditModal(flag, record) {
    const state = {
      modalVisible: !!flag,
      editRowData: record || {},
    };
    if (!flag) {
      state.editRowData = {};
    }
    this.setState(state);
  }

  /**
   * 新增外部系统定义
   * @param {object} fieldsValue 传递的filedvalue
   * @param {object} form 表单
   */
  @Bind()
  handleAddESService(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData, parentParams } = this.state;
    dispatch({
      type: 'externalSystems/saveESService',
      payload: {
        ...parentParams,
        ...editRowData,
        ...fieldsValue,
      },
    }).then(response => {
      if (response) {
        notification.success();
        form.resetFields();
        this.showEditModal(false);
        this.refreshValue();
      }
    });
  }

  /**
   * 刷新数据
   * @memberof ESService
   */
  @Bind()
  refreshValue() {
    this.fetchESService();
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 点击查询按钮事件
   * @param {object} queryData 查询条件
   * @memberof ESService
   */
  @Bind()
  fetchESServiceByCondition(queryData = {}) {
    const data = {
      page: 0,
      ...queryData,
    };
    this.setState({
      queryParams: queryData,
      pageCache: {
        ...this.state.pageCache,
        page: 0,
      },
    });
    this.fetchESService(data);
  }

  /**
   * 表单重置
   * @memberof ESService
   */
  @Bind()
  handleFormReset() {
    this.setState({
      queryParams: {},
    });
  }

  /**
   * 分页变化事件
   * @memberof ESService
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    const params = {
      page: pagination.current - 1, // 服务器接口从 0 开始分页
      size: pagination.pageSize,
    };
    this.setState({
      pageCache: {
        page: pagination.current - 1,
        size: pagination.pageSize,
      },
    });
    this.fetchESService(params);
  }

  /**
   * 渲染方法
   * @returns
   * @memberof ESService
   */
  render() {
    const {
      externalSystems: { esServiceData = {}, esInfo = {} },
      loading,
      fetchLoading,
      match,
    } = this.props;
    const { modalVisible, editRowData, parentParams } = this.state;
    const columns = [
      {
        title: intl.get('entity.application.tag').d('应用'),
        dataIndex: 'applicationName',
        width: 120,
      },
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceName',
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.serviceName').d('服务名称'),
        dataIndex: 'serviceName',
        width: 100,
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.path').d('服务路径'),
        dataIndex: 'path',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        align: 'left',
        render: (_, record) => (
          <Fragment>
            <a
              onClick={() => {
                this.showEditModal(true, record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </Fragment>
        ),
      },
    ];

    const editFormOptions = {
      modalVisible,
      editRowData,
      parentParams,
      loading,
      onHandleAddESService: this.handleAddESService,
      showEditModal: this.showEditModal,
      onFetchESService: this.fetchESServiceByCondition,
    };

    const basePath = match.path.substring(0, match.path.indexOf('/es-service'));

    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.externalSystems.view.message.title.esservice.head').d('关联服务')}
          backPath={`${basePath}/list`}
        >
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Row>
            <Col span={3}>
              {intl
                .get('sitf.externalSystems.model.externalSystems.externalSystemCode')
                .d('系统代码')}
              :
            </Col>
            <Col span={4}>{esInfo.externalSystemCode}</Col>
            <Col span={3}>
              {intl
                .get('sitf.externalSystems.model.externalSystems.externalSystemName')
                .d('系统名称')}
              :
            </Col>
            <Col span={4}>{esInfo.externalSystemName}</Col>
            <Divider />
          </Row>
          <QueryForm
            onFetchESService={this.fetchESServiceByCondition}
            onHandleFormReset={this.handleFormReset}
          />
          <Table
            bordered
            rowKey="serviceId"
            columns={columns}
            loading={fetchLoading}
            dataSource={esServiceData.list}
            pagination={createPagination(esServiceData)}
            onChange={this.handleStandardTableChange}
          />
          <EditForm {...editFormOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
