/**
 * EventCategory - 事件类型定义
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
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

import EditModal from './EditModal';
import FilterForm from './FilterForm';

@connect(({ loading, eventCategory }) => ({
  tenantId: getCurrentOrganizationId(),
  eventCategory,
  fetchDataLoading: loading.effects['eventCategory/fetchEventList'],
  createLoading: loading.effects['eventCategory/createEvent'],
}))
@formatterCollections({ code: ['spfm.eventCategory', 'spfm.common'] })
export default class eventCategory extends PureComponent {
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
    this.fetchEventList();
  }

  /**
   * 获取事件类型信息
   * @param {*object} params 传递的参数
   */
  fetchEventList(params = {}) {
    const {
      tenantId,
      dispatch,
      eventCategory: { pagination = {} },
    } = this.props;
    const filterValue = this.filterForm === undefined ? {} : this.filterForm.getFieldsValue();
    dispatch({
      type: 'eventCategory/fetchEventList',
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
    this.fetchEventList({ page: {} });
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
      type: 'eventCategory/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

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
   *  保存事件类型
   * @param {object} fieldsValue 传递的fieldsValue
   */
  @Bind()
  handleSaveEvent(fieldsValue) {
    const { dispatch, tenantId } = this.props;
    const { eventFormData } = this.state;
    dispatch({
      type: 'eventCategory/createEvent',
      payload: { ...eventFormData, ...fieldsValue, tenantId },
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchEventList();
      }
    });
  }

  /**
   * 编辑数据
   */
  @Bind()
  handleUpdate(record = {}) {
    this.setState({
      eventFormData: record,
    });
    this.handleModalVisible(true);
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchEventList({ page: pagination });
  }

  render() {
    const {
      fetchDataLoading,
      createLoading,
      eventCategory: { eventList = [], modalVisible, pagination = {} },
    } = this.props;
    const { eventFormData = {} } = this.state;
    const columns = [
      {
        title: intl.get('spfm.eventCategory.model.eventCategory.categoryCode').d('事件类型编码'),
        width: 150,
        dataIndex: 'categoryCode',
      },
      {
        title: intl.get('spfm.eventCategory.model.eventCategory.categoryName').d('事件类型描述'),
        dataIndex: 'categoryName',
      },
      {
        title: intl.get('spfm.common.model.levelCode').d('层级'),
        dataIndex: 'levelCode',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        render: record => {
          return (
            <a
              onClick={() => {
                this.handleUpdate(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.eventCategory.view.message.title').d('事件类型定义')}>
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
            rowKey="categoryId"
            loading={fetchDataLoading}
            dataSource={eventList}
            columns={columns}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <EditModal
            title={
              eventFormData.categoryId === undefined
                ? intl.get('spfm.common.model.createCategory').d('新建事件类型')
                : intl.get('spfm.eventCategory.view.message.title.modal.edit').d('编辑事件类型')
            }
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
