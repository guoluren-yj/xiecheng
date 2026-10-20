/**
 * DisposeAssigns -消费组定义- 消息队列处理分配定义
 * @date: 2018-9-28
 * @author: 消息队列消费组定义页面
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Row, Col, Divider } from 'hzero-ui';
import { isArray, isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';

import { Header, Content } from 'components/Page';

import DataTable from './DataTable';
import AssignDataTable from './AssignDataTable';
import '../index.less';

@connect(({ messageHandlerAssigns, loading }) => ({
  messageHandlerAssigns,
  unAssignloading: loading.effects['messageHandlerAssigns/queryDateUnassignHandler'],
  assignloading: loading.effects['messageHandlerAssigns/queryDataAssginHandler'],
}))
@formatterCollections({ code: ['sitf.messageQueueConsumDef'] })
@Form.create({ fieldNameProp: null })
export default class messageHandlerAssigns extends PureComponent {
  constructor(props) {
    super(props);
    const { consumerGroupId } = qs.parse(props.history.location.search.substr(1));
    const { applicationCode } = qs.parse(props.history.location.search.substr(2));
    this.state = {
      consumerGroupId,
      applicationCode,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { consumerGroupId } = this.state;
    // 查询消费组数据
    dispatch({
      type: 'messageHandlerAssigns/queryConsumerGroup',
      payload: { consumerGroupId },
    });
    this.queryAssignHandler();
    this.queryUnassignHandler();
  }

  @Bind()
  relDateTable(dataAssign) {
    this.dataAssign = dataAssign;
  }

  @Bind()
  relAssignData(assginDateTable) {
    this.assginDateTable = assginDateTable;
  }

  /**
   * 数据刷新
   * @memberof messageHandlerAssigns
   */
  @Bind()
  refresh() {
    this.queryAssignHandler();
    this.queryUnassignHandler();
    this.dataAssign.state.selectedRows = [];
    this.assginDateTable.state.selectedRows = [];
  }

  // 从左边到右边，保存接口
  @Bind()
  handleAddHandle() {
    const { dispatch } = this.props;
    const { dataAssign } = this;
    const content = dataAssign.state.selectedRows;
    const endList = [];
    if (content.length === 0) {
      notification.warning({
        message: intl.get(' hzero.common.message.confirm.remove').d('请至少选择一条数据'),
      });
      return;
    } else {
      content.forEach(item => {
        endList.push({ handlerId: item.handlerId, consumerGroupId: this.state.consumerGroupId });
      });
    }
    dispatch({
      type: 'messageHandlerAssigns/saveAssignHandler',
      payload: {
        body: endList,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.refresh();
      }
    });
  }

  // 从右边到左边，删除接口
  @Bind()
  handleDeleteAssignHandler() {
    const { dispatch } = this.props;
    const { assginDateTable } = this;
    const content = assginDateTable.state.selectedRows;
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
      type: 'messageHandlerAssigns/delectAssignHandler',
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
   * 查询已分配
   * @param {object} params 查询条件
   * @memberof messageHandlerAssigns
   */
  @Bind()
  queryAssignHandler(params = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.assginDateTable)
      ? {}
      : filterNullValueObject(this.assginDateTable.props.form.getFieldsValue());

    dispatch({
      type: 'messageHandlerAssigns/queryDataAssginHandler',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues.option,
        consumerGroupId: this.state.consumerGroupId,
        applicationCode: this.state.applicationCode,
      },
    });
  }

  /**
   * 查询未分配数据
   * @param {object} params
   * @memberof messageHandlerAssigns
   */
  @Bind()
  queryUnassignHandler(params = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.dataAssign)
      ? {}
      : filterNullValueObject(this.dataAssign.props.form.getFieldsValue());
    dispatch({
      type: 'messageHandlerAssigns/queryDateUnassignHandler',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues.option,
        consumerGroupId: this.state.consumerGroupId,
        applicationCode: this.state.applicationCode,
      },
    });
  }

  render() {
    const {
      messageHandlerAssigns: {
        assginHandlerList = {},
        unassignHandlerList = {},
        queueList,
        unHandlerPagination = {},
        handlerPagination = {},
      },
      unAssignloading,
      assignloading,
    } = this.props;
    const { consumerGroupId } = this.state;
    const consumerGroupCode =
      queueList.content && queueList.content.map(item => item.consumerGroupCode);
    const consumerGroupName =
      queueList.content && queueList.content.map(item => item.consumerGroupName);
    const dataColumns = [
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.handlerCode')
          .d('队列处理代码'),
        dataIndex: 'queueHandlerCode',
        width: 120,
      },
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.handlerName')
          .d('队列处理名称'),
        dataIndex: 'queueHandlerName',
      },
    ];
    const assignDataColumns = [
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.handlerCode')
          .d('队列处理代码'),
        dataIndex: 'queueHandlerCode',
        width: 120,
      },
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.handlerName')
          .d('队列处理名称'),
        dataIndex: 'queueHandlerName',
      },
    ];
    // 未分配数据
    const dataOptions = {
      unassignHandlerList,
      dataColumns,
      consumerGroupId,
      unAssignloading,
      unHandlerPagination,
      onQueryUnAssignDate: this.queryUnassignHandler,
    };
    // 已分配数据
    const assignDataOptions = {
      assginHandlerList,
      assignDataColumns,
      consumerGroupId,
      assignloading,
      handlerPagination,
      onQueryAssignDate: this.queryAssignHandler,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.handlertitle')
            .d('队列处理分配')}
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
              <DataTable {...dataOptions} onRef={this.relDateTable} />
            </Col>
            <Col span={2}>
              <div className="handle-div-add">
                <Button
                  type="primary"
                  className="handle-btn"
                  icon="right"
                  onClick={this.handleAddHandle}
                />
              </div>
              <div className="handle-div-remove">
                <Button
                  type="primary"
                  className="handle-btn"
                  icon="left"
                  onClick={this.handleDeleteAssignHandler}
                />
              </div>
            </Col>
            <Col span={11}>
              <AssignDataTable {...assignDataOptions} onRef={this.relAssignData} />
            </Col>
          </Row>
        </Content>
      </React.Fragment>
    );
  }
}
