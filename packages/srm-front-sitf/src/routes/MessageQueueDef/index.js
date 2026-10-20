/**
 * MessgeQueue -消息队列组定义页面
 * @date: 2018-9-9
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Form, Button } from 'hzero-ui';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import CacheComponent from 'components/CacheComponent';
import { Header, Content } from 'components/Page';

import MessageQueueModal from './MessageQueueDefModal';
import FormList from './FormList';

@formatterCollections({ code: ['sitf.messageQueue'] })
@connect(({ messageQueue, loading }) => ({
  messageQueue,
  loading: loading.effects['messageQueue/queryMessageQueue'],
}))
@withRouter
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/message-queue' })
export default class MessgeQueue extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      visible: false,
      tableRecord: {},
    };
  }

  form;

  componentDidMount() {
    this.refreshData();
  }

  @Bind()
  refreshData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQueue/queryMessageQueue',
      payload: {
        page: {},
      },
    });
  }
  /**
   * 查询消息队列组定义列表
   * @param {object} params 查询条件
   * @param {object} query  历史查询条件
   */
  @Bind()
  fetchMessageQueue(params = {}) {
    const {
      dispatch,
      messageQueue: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'messageQueue/queryMessageQueue',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  queryCancle() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 新建消息队列组定义
   */
  @Bind()
  handleCreateMessage() {
    this.setState({
      tableRecord: {},
      visible: true,
    });
  }

  /**
   * 编辑消息队列组
   * @param {object} record 行记录
   */
  @Bind()
  handleEditMessage(record = {}) {
    this.setState({
      tableRecord: record,
      visible: true,
    });
  }

  /**
   * 取消编辑/新建
   */
  @Bind()
  onHandleCancel() {
    this.setState({
      tableRecord: {},
      visible: false,
    });
  }

  /**
   * 保存数据
   * @param {object} values 保存的值
   */
  @Bind()
  handleSaveMesaage(values = {}) {
    const {
      dispatch,
      messageQueue: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'messageQueue/createOrEditQueue',
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
        this.fetchMessageQueue({
          page: pagination,
        });
      }
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      messageQueue: { list = {}, pagination = {} },
      loading,
    } = this.props;
    const { visible, tableRecord, tenantId } = this.state;
    const columns = [
      {
        title: intl.get('sitf.messageQueue.model.messageQueue.queueGroupCode').d('消息队列组代码'),
        dataIndex: 'queueGroupCode',
        align: 'left',
      },
      {
        title: intl.get('sitf.messageQueue.model.messageQueue.queueGroupName').d('消息队列组名称'),
        dataIndex: 'queueGroupName',
        align: 'left',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        align: 'left',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        align: 'left',
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        render: (val, record) => {
          return (
            <a
              onClick={() => {
                this.handleEditMessage(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const listProps = {
      onRef: this.handleBindRef,
      onSearch: this.fetchMessageQueue,
      resetFields: this.queryCancle,
    };
    const detailProps = {
      tenantId,
      visible,
      loading,
      tableRecord,
      onHandleSaveMessage: this.handleSaveMesaage,
      onHandleCancel: this.onHandleCancel,
      anchor: 'right',
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sitf.messageQueue.view.message.title').d('消息队列组定义')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateMessage}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FormList {...listProps} />
          </div>
          <Table
            pagination={pagination}
            columns={columns}
            loading={loading}
            bordered
            dataSource={list.content}
            rowKey="queueGroupId"
            onChange={page => this.fetchMessageQueue(page)}
          />
        </Content>
        <MessageQueueModal {...detailProps} />
      </React.Fragment>
    );
  }
}
