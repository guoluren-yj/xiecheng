/**
 * MessageQueueProDef -消息队列处理定义
 * @date: 2018-9-13
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Form, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';

import MessageQueueProModel from './MessageQueueProModal';
import FormList from './FormList';

@formatterCollections({
  code: ['sitf.messageQueueProDef', 'entity.interface', 'entity.application', 'sitf.common'],
})
@connect(({ messageQueueProDef, loading }) => ({
  messageQueueProDef,
  loading: loading.effects['messageQueueProDef/queryMessageQueuePro'],
}))
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/message-queue-pro-def' })
export default class MessageQueueProDef extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tableRecord: {}, // 被编辑的内容
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
      type: 'messageQueueProDef/queryMessageQueuePro',
      payload: {
        page: {},
      },
    });
  }
  /**
   * 查询消息队列处理定义
   * @param {object} params 查询条件
   * @memberof MessageQueueProDef
   */
  @Bind()
  fetchMessageQueuePro(params = {}) {
    const {
      dispatch,
      messageQueueProDef: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'messageQueueProDef/queryMessageQueuePro',
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
  fetchCancle() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 新建消息队列处理定义
   */
  @Bind()
  fetchCreateMessage() {
    this.setState({
      tableRecord: {},
      visible: true,
    });
  }

  /**
   * 编辑消息队列处理定义
   * @param {object} record 行数据
   * @memberof MessageQueueProDef
   */
  @Bind()
  handleEditMessage(record = {}) {
    this.setState({
      tableRecord: record,
      visible: true,
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 保存消息队列处理定义
   * @param {object} values
   * @memberof MessageQueueProDef
   */
  @Bind()
  handleSaveMessage(values = {}) {
    const {
      dispatch,
      messageQueueProDef: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'messageQueueProDef/saveMessageQueuePro',
      payload: {
        body: [values],
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          visible: false,
        });
        this.fetchMessageQueuePro({
          page: pagination,
        });
      }
    });
  }

  /**
   * 取消编辑模态框
   */
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
    });
  }

  render() {
    const {
      messageQueueProDef: { list = {}, pagination = {} },
      loading,
    } = this.props;
    const { visible, tableRecord } = this.state;
    const columns = [
      {
        title: intl.get('sitf.common.queueHandler.code').d('队列处理代码'),
        width: 200,
        dataIndex: 'queueHandlerCode',
      },
      {
        title: intl.get('sitf.common.queueHandler.name').d('队列处理名称'),
        dataIndex: 'queueHandlerName',
        width: 200,
      },
      {
        title: intl.get('entity.interface.tag').d('接口'),
        dataIndex: 'interfaceCode',
      },
      {
        title: intl
          .get('sitf.messageQueueProDef.model.messageQueueProDef.feignPath')
          .d('Feign调用路径'),
        dataIndex: 'feignPath',
        width: 150,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        align: 'left',
        dataIndex: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('sitf.common.interface.handlerTimeout').d('处理超时'),
        dataIndex: 'handlerTimeout',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get('sitf.common.data.handlerInterface').d('处理接口'),
        dataIndex: 'handlerInterface',
        minwidth: 200,
      },
      {
        title: intl.get('entity.application.group').d('应用组'),
        dataIndex: 'applicationGroupName',
        width: 120,
      },
      {
        title: intl
          .get('sitf.messageQueueProDef.model.messageQueueProDef.handlerBeanName')
          .d('处理bean名称'),
        width: 120,
        dataIndex: 'handlerBeanName',
      },
      {
        title: intl
          .get('sitf.messageQueueProDef.model.messageQueueProDef.handlerImplements')
          .d('处理方法实现'),
        width: 120,
        dataIndex: 'handlerImplements',
      },
      {
        title: intl
          .get('sitf.messageQueueProDef.model.messageQueueProDef.handlerFactoryInterface')
          .d('处理工厂接口'),
        width: 120,
        dataIndex: 'handlerFactoryInterface',
      },
      {
        title: intl
          .get('sitf.messageQueueProDef.model.messageQueueProDef.handleFactoryBeanName')
          .d('处理工厂bean名称'),
        width: 150,
        dataIndex: 'handlerFactoryBeanName',
      },
      {
        title: intl
          .get('sitf.messageQueueProDef.model.messageQueueProDef.handlerFactoryImplements')
          .d('处理工厂方法实现'),
        width: 150,
        dataIndex: 'handlerFactoryImplements',
      },
      {
        title: intl
          .get('sitf.messageQueueProDef.model.messageQueueProDef.handleProviderInterface')
          .d('处理提供接口'),
        width: 120,
        dataIndex: 'handlerProviderInterface',
      },
      {
        title: intl.get('sitf.common.view.parameter').d('参数'),
        width: 100,
        dataIndex: 'properties',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        //  fixed: 'right',
        width: 100,
        render: (val, record) => {
          return (
            <a onClick={() => this.handleEditMessage(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];

    const listProps = {
      onRef: this.handleBindRef,
      onSearch: this.fetchMessageQueuePro,
      resetFields: this.fetchCancle,
    };

    const detailProps = {
      visible,
      loading,
      tableRecord,
      anchor: 'right',
      onHandleSaveMessage: this.handleSaveMessage,
      onFetchCancel: this.handleCancel,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.messageQueueProDef.view.messageQueueProDef').d('消息队列处理定义')}
        >
          <Button type="primary" icon="plus" onClick={this.fetchCreateMessage}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FormList {...listProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content || []}
            rowKey="queueHandleId"
            columns={columns}
            loading={loading}
            onChange={page => this.fetchMessageQueuePro(page)}
            scroll={{ x: 2400 }}
            resizable
            bordered
          />
        </Content>
        <MessageQueueProModel {...detailProps} />
      </React.Fragment>
    );
  }
}
