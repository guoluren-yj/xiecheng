/**
 * messageQueueAssigns -消费组定义- 消息队列分配定义
 * @date: 2018-9-28
 * @author: 消息队列消费组定义页面
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form, Button, Row, Col, Divider } from 'hzero-ui';
import { omit, isArray, isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';

import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';

import DataTable from './DataTable';
import AssignDataTable from './AssignDataTable';
import '../index.less';

@connect(({ messageQueueAssigns, loading }) => ({
  messageQueueAssigns,
  assignloading: loading.effects['messageQueueAssigns/queryDateAssginQueue'],
  unAssignloading: loading.effects['messageQueueAssigns/queryDateUnassignQueue'],
}))
@formatterCollections({ code: ['sitf.messageQueueConsumDef'] })
@Form.create({ fieldNameProp: null })
@withRouter
export default class QueueAssigns extends PureComponent {
  constructor(props) {
    super(props);
    const { consumerGroupId } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      consumerGroupId,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { consumerGroupId } = this.state;
    // 查询消费组数据
    dispatch({
      type: 'messageQueueAssigns/queryConsumerGroup',
      payload: { consumerGroupId },
    });
    this.queryAssignList();
    this.queryUnassignList();
  }

  /**
   * 刷新数据
   */
  @Bind()
  refresh() {
    this.queryAssignList();
    this.queryUnassignList();
    this.dataTable.state.selectedRows = [];
    this.relAssignData.state.selectedRows = [];
  }

  @Bind()
  relDataTable(dataTable) {
    this.dataTable = dataTable;
  }

  @Bind()
  relAssignDataTable(relAssignData) {
    this.relAssignData = relAssignData;
  }

  /**
   * 从左到右，保存接口
   * @returns
   */
  @Bind()
  handleAddQueue() {
    const { dispatch } = this.props;
    const { dataTable } = this;
    const content = dataTable.state.selectedRows;
    const endList = [];
    if (content.length === 0) {
      notification.warning({
        message: intl.get(' hzero.common.message.confirm.remove').d('请至少选择一条数据'),
      });
      return;
    } else {
      content.forEach(item => {
        const newList = omit(item, [
          'createdBy',
          'creationDate',
          'lastUpdateDate',
          'lastUpdatedBy',
          'objectVersionNumber',
          '_token',
        ]);
        // eslint-disable-next-line
        newList['consumerGroupId'] = this.state.consumerGroupId;
        endList.push(newList);
      });
    }
    dispatch({
      type: 'messageQueueAssigns/saveQueueAssign',
      payload: {
        body: endList,
        consumerGroupId: this.state.consumerGroupId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.refresh();
      }
    });
  }
  /**
   * 从右边到左边，删除接口
   * @memberof QueueAssigns
   */
  @Bind()
  handleDeleteQueue() {
    const { dispatch } = this.props;
    const { relAssignData } = this;
    const content = relAssignData.state.selectedRows;
    const listId = [];
    if (isArray(content) && isEmpty(content)) {
      notification.warning({
        message: intl.get(' hzero.common.message.confirm.remove').d('请至少选择一条数据'),
      });
      return;
    } else {
      content.forEach(item => {
        listId.push(item.assignId);
      });
    }
    dispatch({
      type: 'messageQueueAssigns/deleteQueueAssign',
      payload: {
        body: {
          assignIds: listId,
        },
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.refresh();
      }
    });
  }
  /**
   * 查询已分配数据
   * @param {object} params 查询参数
   */
  @Bind()
  queryAssignList(params = {}) {
    const { dispatch } = this.props;

    const fieldValues = isUndefined(this.relAssignData.props.form)
      ? {}
      : filterNullValueObject(this.relAssignData.props.form.getFieldsValue());
    dispatch({
      type: 'messageQueueAssigns/queryDateAssginQueue',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues.option,
        consumerGroupId: this.state.consumerGroupId,
      },
    });
  }

  /**
   * 查询未分配数据
   * @param {object} params 查询参数
   */
  @Bind()
  queryUnassignList(params = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.dataTable.props.form)
      ? {}
      : filterNullValueObject(this.dataTable.props.form.getFieldsValue());
    dispatch({
      type: 'messageQueueAssigns/queryDateUnassignQueue',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues.option,
        consumerGroupId: this.state.consumerGroupId,
      },
    });
  }

  render() {
    const {
      unAssignloading,
      assignloading,
      messageQueueAssigns: {
        assginQueueList = {},
        unassignQueueList = {},
        list = {},
        assignPagination = {},
        unAssignPagination = {},
      },
    } = this.props;

    const { consumerGroupId } = this.state;
    const dataColumns = [
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.queueCode')
          .d('队列定义代码'),
        dataIndex: 'queueCode',
        width: 120,
      },
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.queueName')
          .d('队列定义名称'),
        dataIndex: 'queueName',
      },
    ];
    const assignDataColumns = [
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.queueCode')
          .d('队列定义代码'),
        dataIndex: 'queueCode',
        width: 120,
      },
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.queueName')
          .d('队列定义名称'),
        dataIndex: 'queueName',
      },
    ];
    // 未分配数据
    const dataOptions = {
      unassignQueueList,
      dataColumns,
      consumerGroupId,
      unAssignloading,
      unAssignPagination,
      onQueryUnassignDate: this.queryUnassignList,
    };
    // 已分配数据
    const assignDataOptions = {
      assginQueueList,
      assignDataColumns,
      consumerGroupId,
      assignloading,
      assignPagination,
      onQueryAssignDate: this.queryAssignList,
    };
    const consumerGroupCode = list.content && list.content.map(item => item.consumerGroupCode);
    const consumerGroupName = list.content && list.content.map(item => item.consumerGroupName);
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.title')
            .d('队列定义分配')}
          backPath="/sitf/message-consum-def/list"
        />
        <Content>
          <Row>
            <Col span={3}>
              {intl
                .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.messageCode')
                .d('消息队列编码')}
            </Col>
            <Col span={4}>{consumerGroupCode}</Col>
            <Col span={3}>
              {intl
                .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.messageName')
                .d('消息队列名称')}
            </Col>
            <Col span={4}>{consumerGroupName}</Col>
            <Divider />
          </Row>
          <Row gutter={24} type="flex" justify="space-around" align="top">
            <Col span={11}>
              <DataTable {...dataOptions} onRef={this.relDataTable} />
            </Col>
            <Col span={2}>
              <div className="handle-div-add">
                <Button
                  type="primary"
                  className="handle-btn"
                  icon="right"
                  onClick={this.handleAddQueue}
                />
              </div>
              <div className="handle-div-remove">
                <Button
                  type="primary"
                  className="handle-btn"
                  icon="left"
                  onClick={this.handleDeleteQueue}
                />
              </div>
            </Col>
            <Col span={11}>
              <AssignDataTable {...assignDataOptions} onRef={this.relAssignDataTable} />
            </Col>
          </Row>
        </Content>
      </React.Fragment>
    );
  }
}
