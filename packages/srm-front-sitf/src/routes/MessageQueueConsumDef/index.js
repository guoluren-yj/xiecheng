/**
 * MessageQueueConsumDef -消息队列消费组定义页面(主页面)
 * @date: 2018-9-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button, Dropdown, Menu, Icon } from 'hzero-ui';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';

import MessageConsumModal from './MessageConsumModal';
import FilterForm from './FilterForm';

@formatterCollections({ code: ['sitf.messageQueueConsumDef', 'entity.application', 'sitf.common'] })
@connect(({ messageQueueConsumDef, loading }) => ({
  messageQueueConsumDef,
  loading: loading.effects['messageQueueConsumDef/queryConsumerGroup'],
  updateLoading: loading.effects['messageQueueConsumDef/updateConsumerGroup'],
}))
export default class MessageQueueConsumDef extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tableRecord: {},
    };
  }

  componentDidMount() {
    this.refreshData();
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  refreshData() {
    const {
      dispatch,
      messageQueueConsumDef: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const form = isUndefined(this.form) ? {} : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'messageQueueConsumDef/queryConsumerGroup',
      payload: {
        page: isUndefined(_back) ? {} : pagination,
        ...form,
      },
    });
  }
  /**
   * 查询消息队列列表
   * @param {object} params 查询参数
   */
  @Bind()
  queryConsumerGroup(params = {}) {
    const {
      dispatch,
      messageQueueConsumDef: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'messageQueueConsumDef/queryConsumerGroup',
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
  handleCreateMessageQueue() {
    this.setState({
      tableRecord: {},
      visible: true,
    });
  }

  /**
   * 编辑
   * @param {object} record 行数据
   */
  @Bind()
  handlerEditMessageQueue(record = {}) {
    this.setState({
      tableRecord: record,
      visible: true,
    });
  }

  /**
   * 取消编辑/新建
   */
  @Bind()
  handleCancel() {
    this.setState({
      tableRecord: {},
      visible: false,
    });
  }
  /**
   * 保存数据
   */
  @Bind()
  handleSaveMessageQueue(values = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQueueConsumDef/updateConsumerGroup',
      payload: {
        body: [values],
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          tableRecord: {},
          visible: false,
        });
        this.queryConsumerGroup();
      }
    });
  }

  render() {
    const {
      messageQueueConsumDef: { list = {}, pagination = {} },
      loading,
      updateLoading,
    } = this.props;
    const { visible, tableRecord = {} } = this.state;
    const columns = [
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerGroupCode')
          .d('消费组代码'),
        dataIndex: 'consumerGroupCode',
        width: 150,
      },
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerGroupName')
          .d('消费组名称'),
        dataIndex: 'consumerGroupName',
        width: 150,
      },
      {
        title: intl.get('entity.application.tag').d('应用'),
        dataIndex: 'applicationName',
        width: 150,
      },
      {
        title: intl
          .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerAllFlag')
          .d('消费所有分配'),
        dataIndex: 'consumerAllFlag',
        align: 'left',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        align: 'left',
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        width: 100,
        render: (_, record) => {
          const menu = (
            <Menu>
              <Menu.Item key="edit">
                <a
                  onClick={() => {
                    this.handlerEditMessageQueue(record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </Menu.Item>
              <Menu.Item key="queueAssign">
                <Link
                  to={`/sitf/message-consum-def/queue-assigns?consumerGroupId=${record.consumerGroupId}`}
                >
                  {intl
                    .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.queueAssign')
                    .d('队列分配')}
                </Link>
              </Menu.Item>
              {record.consumerAllFlag === 0 && (
                <Menu.Item key="handlerAssign">
                  <Link
                    to={`/sitf/message-consum-def/handler-assigns?consumerGroupId=${record.consumerGroupId}&applicationCode=${record.applicationCode}`}
                  >
                    {intl
                      .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.handlerAssign')
                      .d('处理分配')}
                  </Link>
                </Menu.Item>
              )}
            </Menu>
          );
          return (
            <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
              <a className="ant-dropdown-link">
                {intl.get('sitf.common.view.menu.more').d('更多操作')}
                <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ];
    const fitlerProps = {
      onRef: this.handleRef,
      onFetchConsumer: this.queryConsumerGroup,
    };
    const detailProps = {
      visible,
      updateLoading,
      tableRecord,
      anchor: 'right',
      onHandleCancel: this.handleCancel,
      onHandleSaveMessageQueue: this.handleSaveMessageQueue,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.headerTitle')
            .d('消息队列消费组定义')}
        >
          <Button type="primary" icon="plus" onClick={this.handleCreateMessageQueue}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fitlerProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content || []}
            rowKey="consumerGroupId"
            columns={columns}
            loading={loading}
            bordered
            onChange={page => this.queryConsumerGroup(page)}
          />
        </Content>
        <MessageConsumModal {...detailProps} />
      </React.Fragment>
    );
  }
}
