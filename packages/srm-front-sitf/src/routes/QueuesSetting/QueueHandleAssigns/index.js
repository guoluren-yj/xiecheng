/**
 * QueueHandleAssigns - 消息队列定义 - 消息队列处理分配定义
 * @date: 2018-9-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import lodash from 'lodash';
import { withRouter } from 'react-router-dom';
import { Form, Button, Row, Col, Divider } from 'hzero-ui';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import DataTable from './DataTable';
import AssignDataTable from './AssignDataTable';
import '../index.less';

/**
 * 消息队列处理分配定义
 * @extends {Component} - React.Component
 * @reactProps {Object} queuesSetting - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: 'sitf.queuesSetting' })
@connect(({ queueHandleAssigns, loading }) => ({
  queueHandleAssigns,
  fetchHandleAssign: loading.effects['queueHandleAssigns/fetchHandleAssign'],
  fetchAssignData: loading.effects['queueHandleAssigns/fetchAssignData'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
export default class QueueHandleAssigns extends PureComponent {
  queueHandleData;
  QueueHandleAssignsData;

  constructor(props) {
    super(props);
    const { queueId } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      queueId,
      page: 0,
      size: 10,
    };
  }

  /**
   * 挂载后渲染方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { queueId } = this.state;
    dispatch({
      type: 'queueHandleAssigns/queryQueueInfo',
      payload: {
        queueId,
      },
    });
    this.fetchHandleAssign();
    this.fetchAssignData();
  }

  /**
   * 获取ref
   * @param {Function} queueHandleData 获取ref
   */
  @Bind()
  getDataTableRef(queueHandleData) {
    this.queueHandleData = queueHandleData;
  }

  /**
   * 获取ref
   * @param {Function} QueueHandleAssignsData 获取ref
   */
  @Bind()
  getAssignDataTableRef(QueueHandleAssignsData) {
    this.QueueHandleAssignsData = QueueHandleAssignsData;
  }

  /**
   * 查询待分配数据
   * @param {object} data 查询参数
   */
  @Bind()
  fetchHandleAssign(data) {
    const { dispatch } = this.props;
    const { queueId, page, size } = this.state;
    dispatch({
      type: 'queueHandleAssigns/fetchHandleAssign',
      payload: {
        page,
        size,
        queueId,
        ...data,
      },
    });
  }

  /**
   * 查询已分配数据
   * @param {object} data 查询参数
   */
  @Bind()
  fetchAssignData(data) {
    const { dispatch } = this.props;
    const { queueId, page, size } = this.state;
    dispatch({
      type: 'queueHandleAssigns/fetchAssignData',
      payload: {
        page,
        size,
        queueId,
        ...data,
      },
    });
  }

  /**
   * 数据刷新
   */
  @Bind()
  refresh() {
    this.fetchHandleAssign();
    this.fetchAssignData();
    this.queueHandleData.state.selectedRows = [];
    this.QueueHandleAssignsData.state.selectedRows = [];
  }

  /**
   * 添加数据（从左至右）
   */
  @Bind()
  handleAddDate() {
    const { dispatch } = this.props;
    const { queueId } = this.state;
    dispatch({
      type: 'queueHandleAssigns/addAssignData',
      payload: {
        queueId,
        addRows: lodash.isArray(this.queueHandleData.state.selectedRows)
          ? this.queueHandleData.state.selectedRows.map(row => {
              return {
                ...row,
                handlerId: row.queueHandlerId,
              };
            })
          : [],
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.refresh();
      }
    });
  }

  /**
   * 删除数据(从右至左)
   */
  @Bind()
  removeAssignData() {
    const { dispatch } = this.props;
    const { queueId } = this.state;
    dispatch({
      type: 'queueHandleAssigns/removeAssignData',
      payload: {
        queueId,
        removeRows: this.QueueHandleAssignsData.state.selectedRows,
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.refresh();
      }
    });
  }

  render() {
    const {
      queueHandleAssigns: { data = {}, assignData = {}, queueInfo = {} },
      fetchHandleAssign,
      fetchAssignData,
      match,
    } = this.props;
    const dataColumns = [
      {
        title: intl.get('sitf.common.queueHandler.code').d('队列处理代码'),
        dataIndex: 'queueHandlerCode',
        width: 120,
      },
      {
        title: intl.get('sitf.common.queueHandler.name').d('队列处理名称'),
        dataIndex: 'queueHandlerName',
      },
    ];
    const assignDataColumns = [
      {
        title: intl.get('sitf.common.queueHandler.code').d('队列处理代码'),
        dataIndex: 'queueHandlerCode',
        width: 120,
      },
      {
        title: intl.get('sitf.common.queueHandler.name').d('队列处理名称'),
        dataIndex: 'queueHandlerName',
      },
    ];
    const dataOptions = {
      data,
      dataColumns,
      loading: fetchHandleAssign,
      onFetchHandleAssign: this.fetchHandleAssign,
      getDataTableRef: this.getDataTableRef,
    };
    const assignDataOptions = {
      assignData,
      assignDataColumns,
      loading: fetchAssignData,
      onFetchAssignData: this.fetchAssignData,
      getAssignDataTableRef: this.getAssignDataTableRef,
    };
    const basePath = match.path.substring(0, match.path.indexOf('/queue-Handle-assigns'));
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.common.queueHandler.allot').d('队列处理分配')}
          backPath={`${basePath}/list`}
        />
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
          <Row gutter={24} type="flex" justify="space-around" align="top">
            <Col span={11}>
              <DataTable {...dataOptions} />
            </Col>
            <Col span={2}>
              <div className="handle-div-add">
                <Button
                  type="primary"
                  className="handle-btn"
                  icon="right"
                  onClick={this.handleAddDate}
                />
              </div>
              <div className="handle-div-remove">
                <Button
                  type="primary"
                  className="handle-btn"
                  icon="left"
                  onClick={this.removeAssignData}
                />
              </div>
            </Col>
            <Col span={11}>
              <AssignDataTable {...assignDataOptions} />
            </Col>
          </Row>
        </Content>
      </React.Fragment>
    );
  }
}
