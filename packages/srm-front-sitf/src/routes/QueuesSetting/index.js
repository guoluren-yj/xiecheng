/**
 * QueuesSetting - 消息队列定义
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Table, Menu, Dropdown, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import EditForm from './EditForm';
import QueryForm from './QueryForm';

/**
 * 消息队列定义
 * @extends {Component} - React.Component
 * @reactProps {Object} queuesSetting - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['sitf.queuesSetting', 'sitf.common'] })
@connect(({ queuesSetting, loading }) => ({
  queuesSetting,
  saveLoading: loading.effects['queuesSetting/saveQueueSetting'],
  fetchLoading: loading.effects['queuesSetting/fetchQueueSetting'],
}))
@withRouter
@CacheComponent({ cacheKey: '/sitf/queues-setting/list' })
export default class QueuesSetting extends PureComponent {
  Form;
  /**
   * 内部状态
   */
  state = {
    modalVisible: false,
    editRowData: {},
  };

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const {
      dispatch,
      queuesSetting: { data = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const page = isUndefined(_back) ? {} : data.pagination;
    dispatch({
      type: 'queuesSetting/fetchCode',
      payload: {},
    });
    this.fetchQueueSetting(page);
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchQueueSetting(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'queuesSetting/fetchQueueSetting',
      payload: {
        page: pageData,
        ...filterValues,
      },
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {Boolean} flag 显/隐标记
   * @param {Object} record 行数据
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
   * 新增消息队列
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  handleAddQueue(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: 'queuesSetting/saveQueueSetting',
      payload: [
        {
          ...editRowData,
          ...fieldsValue,
        },
      ],
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
   * 刷新
   */
  @Bind()
  refreshValue() {
    const {
      queuesSetting: { data = {} },
    } = this.props;
    this.fetchQueueSetting(data.pagination);
    this.setState({
      editRowData: {},
    });
  }

  /**
   *点击查询按钮事件
   */
  @Bind()
  fetchQueueByCondition(queryData = {}) {
    this.fetchQueueSetting(queryData);
  }

  /**
   * 分页change事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchQueueSetting(pagination);
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
   */
  render() {
    const {
      queuesSetting: {
        data = {},
        code: { ConsumptionType = [] },
      },
      saveLoading,
      fetchLoading,
      history,
    } = this.props;
    const { modalVisible, editRowData } = this.state;
    const columns = [
      {
        title: intl.get('sitf.queuesSetting.model.queuesSetting.queueCode').d('消息队列代码'),
        dataIndex: 'queueCode',
        width: 150,
      },
      {
        title: intl.get('sitf.common.message.queueName').d('消息队列名称'),
        dataIndex: 'queueName',
      },
      {
        title: intl.get('sitf.queuesSetting.model.queuesSetting.queueGroupName').d('队列组'),
        dataIndex: 'queueGroupName',
      },
      {
        title: intl.get('hzero.commom.status').d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
        align: 'left',
      },
      {
        title: intl.get('sitf.queuesSetting.model.queuesSetting.consumptionMode').d('消费方式'),
        dataIndex: 'consumptionMode',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get('sitf.queuesSetting.model.queuesSetting.queueNumber').d('消息队列数量'),
        dataIndex: 'queueNumber',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('sitf.queuesSetting.model.queuesSetting.messageTimeout').d('消息超时(秒)'),
        dataIndex: 'messageTimeout',
        width: 120,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'left',
        fixed: 'right',
        render: (_, record) => {
          const menu = (
            <Menu>
              <Menu.Item>
                <a
                  onClick={() => {
                    this.showEditModal(true, record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    history.push(
                      `/sitf/queues-setting/queue-Handle-assigns?queueId=${record.queueId}`
                    );
                  }}
                >
                  {intl.get('sitf.common.queueHandler.allot').d('队列处理分配')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    history.push(
                      `/sitf/queues-setting/queue-system-assign?queueId=${record.queueId}`
                    );
                  }}
                >
                  {intl.get('sitf.common.view.menu.queue.system').d('队列系统分配')}
                </a>
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
              <a className="ant-dropdown-link">
                {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ];

    const editFormOptions = {
      modalVisible,
      editRowData,
      ConsumptionType,
      onHandleAddQueue: this.handleAddQueue,
      onShowEditModal: this.showEditModal,
      onFetchQueue: this.fetchQueueByCondition,
      loading: saveLoading,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('sitf.queuesSetting.view.message.title.list').d('消息队列定义')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <QueryForm onFetchQueue={this.fetchQueueByCondition} onRef={this.handleBindRef} />
          <Table
            bordered
            rowKey="queueId"
            loading={fetchLoading}
            dataSource={data.list}
            columns={columns}
            pagination={data.pagination}
            onChange={this.handleStandardTableChange}
          />
          <EditForm {...editFormOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
