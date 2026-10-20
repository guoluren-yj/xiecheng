/**
 * Event - 事件定义
 * @date: 2019-3-12
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import EditModal from './EditModal';
import FilterForm from './FilterForm';
@connect(({ loading, event }) => ({
  event,
  tenantId: getCurrentOrganizationId(),
  fetchDataLoading: loading.effects['event/fetchEventData'],
  createLoading: loading.effects['event/createEvent'],
}))
@formatterCollections({ code: ['spfm.event', 'spfm.common'] })
export default class event extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      eventFormData: {},
    };
  }

  filterForm;

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    this.fetchEventData();
  }

  /**
   * 获取事件定义信息
   * @param {object} params 传递的参数
   */
  fetchEventData(params = {}) {
    const {
      dispatch,
      event: { pagination = {} },
      tenantId,
    } = this.props;
    const filterValue = this.filterForm === undefined ? {} : this.filterForm.getFieldsValue();
    dispatch({
      type: 'event/fetchEventData',
      payload: { tenantId, ...filterValue, page: pagination, ...params },
    });
  }

  /**
   * 获取查询表单组件this对象
   * @param {object} ref - 查询表单组件this
   */
  @Bind
  handleBindRef(ref) {
    this.filterForm = (ref.props || {}).form;
  }

  @Bind()
  handleSearch() {
    this.fetchEventData({ page: {} });
  }

  /**
   * 重置表单查询条件
   */
  @Bind()
  handleResetSearch() {
    this.filterForm.resetFields();
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'event/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * 展示新建窗口
   */
  @Bind()
  showModal() {
    this.setState({
      eventFormData: {},
    });
    this.handleModalVisible(true);
  }

  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * 保存事件信息
   * @param {object} fieldsValue 传递的fieldsValue
   */
  @Bind()
  handleSaveEvent(fieldsValue) {
    const { dispatch, tenantId } = this.props;
    const { eventFormData } = this.state;
    dispatch({
      type: 'event/createEvent',
      payload: { tenantId, ...eventFormData, ...fieldsValue },
    }).then((res) => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchEventData();
      }
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchEventData({ page: pagination });
  }

  render() {
    const {
      fetchDataLoading,
      createLoading,
      history,
      event: { eventData = [], modalVisible, pagination = {} },
    } = this.props;
    const { eventFormData = {} } = this.state;
    const columns = [
      {
        title: intl.get('spfm.event.model.event.categoryName').d('事件类型'),
        width: 150,
        dataIndex: 'categoryName',
      },
      {
        title: intl.get('spfm.common.model.categoryCode').d('事件编码'),
        dataIndex: 'eventCode',
      },
      {
        title: intl.get('spfm.common.model.eventName').d('事件描述'),
        dataIndex: 'eventName',
      },
      {
        title: intl.get('spfm.event.model.event.className').d('数据类型'),
        dataIndex: 'className',
      },
      {
        title: intl.get('spfm.common.model.levelCode').d('层级'),
        dataIndex: 'levelCode',
      },
      {
        title: intl.get('spfm.event.view.message.handleEvent').d('事件处理'),
        render: (_, record) => (
          <a
            onClick={() => {
              history.push(`handle?eventId=${record.eventId}`);
            }}
          >
            {intl.get('spfm.event.view.message.handleEvent').d('事件处理')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.event.view.message.title').d('平台事件定义')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm
              onSearch={this.handleSearch}
              onReset={this.handleResetSearch}
              onRef={this.handleBindRef}
            />
          </div>
          <Table
            bordered
            rowKey="eventId"
            loading={fetchDataLoading}
            dataSource={eventData}
            columns={columns}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <EditModal
            title={intl.get('spfm.common.model.createCategory').d('新建事件类型')}
            loading={createLoading}
            modalVisible={modalVisible}
            initData={eventFormData}
            onCancel={this.hideModal}
            onOk={this.handleSaveEvent}
          />
        </Content>
      </React.Fragment>
    );
  }
}
