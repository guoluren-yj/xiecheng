/**
 * EventMessage - 事件查询
 * @date: 2019-3-22
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Table } from 'hzero-ui';

// import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';

import QueryForm from './QueryForm';

@connect(({ eventMessage, loading }) => ({
  eventMessage,
  tenantId: getCurrentOrganizationId(),
  fetchLoading: loading.effects['eventMessage/queryMessageList'],
}))
@formatterCollections({ code: ['spfm.eventMessage'] })
export default class EventMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  QueryForm;

  componentDidMount() {
    this.handleQueryMessage();
  }

  /**
   * 获取查询表单组件this对象
   * @param {Object} ref - 查询表单组件this
   */
  @Bind()
  handleBindRef(ref) {
    this.QueryForm = (ref.props || {}).form;
  }

  /**
   * 重置表单查询条件
   */
  @Bind()
  handleResetSearch() {
    this.QueryForm.resetFields();
  }

  /**
   * 获取事件消息信息
   * @param {Object} params 传递的参数
   */
  @Bind()
  handleQueryMessage(params = {}) {
    const {
      dispatch,
      tenantId,
      eventMessage: { pagination = {} },
    } = this.props;
    const filterValue = this.QueryForm === undefined ? {} : this.QueryForm.getFieldsValue();
    dispatch({
      type: 'eventMessage/queryMessageList',
      payload: { tenantId, ...filterValue, page: pagination, ...params },
    });
  }

  /**
   * 重试
   */
  @Bind()
  handleResendMessage(record) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'eventMessage/resendMessage',
      payload: { tenantId, ...record },
    }).then(res => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.handleQueryMessage({ page: pagination });
  }

  render() {
    const {
      eventMessage: { messageData = [], pagination = {} },
      fetchLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('spfm.eventMessage.model.eventMessage.category').d('事件类别'),
        dataIndex: 'category',
      },
      {
        title: intl.get('spfm.eventMessage.model.eventMessage.eventCode').d('事件代码'),
        dataIndex: 'eventCode',
        width: 150,
      },
      {
        title: intl.get('spfm.eventMessage.model.eventMessage.action').d('功能'),
        dataIndex: 'action',
      },
      {
        title: intl.get('spfm.eventMessage.model.eventMessage.data').d('事件数据'),
        dataIndex: 'data',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'sendStatus',
      },
      {
        title: intl.get('spfm.eventMessage.model.eventMessage.sendTime').d('发送时间'),
        dataIndex: 'sendTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        render: (_, record) => (
          <a
            onClick={() => {
              this.handleResendMessage(record);
            }}
          >
            {intl.get('spfm.eventMessage.view.button.resend').d('重试')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.eventMessage.view.eventMessage.title').d('事件查询')} />
        <Content>
          <div className="table-list-search">
            <QueryForm
              onSearch={this.handleQueryMessage}
              onReset={this.handleResetSearch}
              onRef={this.handleBindRef}
            />
          </div>
          <Table
            bordered
            columns={columns}
            rowKey="eventMessageId"
            dataSource={messageData || []}
            loading={fetchLoading}
            pagination={pagination}
            onChange={this.handlePagination}
          />
        </Content>
      </React.Fragment>
    );
  }
}
