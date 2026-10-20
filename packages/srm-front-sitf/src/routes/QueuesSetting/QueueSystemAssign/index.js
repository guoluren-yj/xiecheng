/**
 * QueueSystemAssign - 消息队列定义 - 消息队列系统分配定义
 * @date: 2018-9-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Table, Modal, Row, Col, Divider } from 'hzero-ui';
import qs from 'querystring';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import EditForm from './EditForm';
import QueryForm from './QueryForm';

/**
 * 消息队列系统分配定义
 *
 * @extends {Component} - React.Component
 * @reactProps {Object} queueSystemAssign - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: 'sitf.queuesSetting' })
@connect(({ queueSystemAssign, loading }) => ({
  queueSystemAssign,
  saveLoading: loading.effects['queueSystemAssign/saveQueueSystem'],
  fetchLoading: loading.effects['queueSystemAssign/fetchQueueSystem'],
}))
@withRouter
export default class QueueSystemAssign extends PureComponent {
  Form;
  /**
   * @param {object} props
   */
  constructor(props) {
    super(props);
    const { queueId } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      modalVisible: false,
      queueId,
      editRowData: {},
      selectedRows: [],
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { queueId } = this.state;
    dispatch({
      type: 'queueSystemAssign/queryQueueInfo',
      payload: {
        queueId,
      },
    });
    this.fetchQueueSystem();
  }

  /**
   * 查询数据
   * @param {object} pageData 页面信息数据
   */
  @Bind()
  fetchQueueSystem(pageData = {}) {
    const { dispatch } = this.props;
    const { queueId } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'queueSystemAssign/fetchQueueSystem',
      payload: {
        queueId,
        page: pageData,
        ...filterValues,
      },
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {object}  record 行数据
   */
  @Bind()
  showEditModal(flag, record = {}) {
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
   * 新增消息队列定义
   * @param {object} fieldsValue 传递的filedvalue
   * @param {object} form 表单
   */
  @Bind()
  handleAddQueueSystem(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData, queueId } = this.state;
    dispatch({
      type: 'queueSystemAssign/saveQueueSystem',
      payload: {
        queueId,
        editRows: [
          {
            ...editRowData,
            ...fieldsValue,
          },
        ],
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
   * 删除消息队列定义
   */
  @Bind()
  deleteQueueSystem() {
    const { dispatch } = this.props;
    const { selectedRows, queueId } = this.state;
    const onOk = () => {
      dispatch({
        type: 'queueSystemAssign/deleteQueueSystem',
        payload: {
          queueId,
          removeRows: selectedRows,
        },
      }).then(response => {
        if (response) {
          notification.success();
          this.refreshValue();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 刷新页面数据
   */
  @Bind()
  refreshValue() {
    const { queueSystemAssign: { data = {} } } = this.props;
    this.fetchQueueSystem(data.pagination);
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 点击查询按钮事件
   * @param {object} queryData 传递的filedvalue
   */
  @Bind()
  fetchQueueByCondition(queryData = {}) {
    this.fetchQueueSystem(queryData);
  }

  /**
   * 删除消息定义
   * @param {null} _ 占位符
   * @param {object} rows 当前行数据
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 分页选择事件
   * @param {object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchQueueSystem(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      queueSystemAssign: { data = {}, queueInfo = {} },
      saveLoading,
      fetchLoading,
      match,
    } = this.props;
    const { modalVisible, editRowData, selectedRows } = this.state;
    const columns = [
      {
        title: intl.get('sitf.common.system.type').d('系统分配类型'),
        dataIndex: 'systemType',
        width: 150,
      },
      {
        title: intl.get('sitf.common.system.code').d('系统分配代码'),
        dataIndex: 'systemCode',
        width: 150,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        align: 'center',
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
      onHandleAddSystem: this.handleAddQueueSystem,
      onShowEditModal: this.showEditModal,
      onFetchQueue: this.fetchQueueByCondition,
      loading: saveLoading,
    };

    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.systemAssignId),
      onChange: this.handleSelectRows,
    };

    const basePath = match.path.substring(0, match.path.indexOf('/queue-system-assign'));

    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.common.view.menu.queue.system').d('队列系统分配')}
          backPath={`${basePath}/list`}
        >
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {selectedRows.length > 0 && (
            <Button icon="minus" onClick={this.deleteQueueSystem}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
        </Header>
        <Content>
          <Row>
            <Col span={3}>
              {intl.get('sitf.queuesSetting.model.queuesSetting.queueCode').d('消息队列代码')}:
            </Col>
            <Col span={4}>{queueInfo.queueCode}</Col>
            <Col span={3}>{intl.get('sitf.common.message.queueName').d('消息队列名称')}:</Col>
            <Col span={4}>{queueInfo.queueName}</Col>
            <Divider />
          </Row>
          <QueryForm onFetchQueue={this.fetchQueueByCondition} onRef={this.handleBindRef} />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="systemAssignId"
            dataSource={data.list}
            columns={columns}
            pagination={data.pagination}
            rowSelection={rowSelection}
            onChange={this.handleStandardTableChange}
          />
          <EditForm {...editFormOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
