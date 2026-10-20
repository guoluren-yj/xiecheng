/**
 * EventDataType - 事件数据类型定义
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

@connect(({ loading, eventDataType }) => ({
  eventDataType,
  tenantId: getCurrentOrganizationId(),
  fetchDataLoading: loading.effects['eventDataType/fetchEventDataList'],
  createLoading: loading.effects['eventDataType/createEventDataType'],
}))
@formatterCollections({ code: ['spfm.eventDataType', 'spfm.common'] })
export default class eventDataType extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      eventFormData: {}, // 事件数据类型数据
    };
  }

  filterForm;

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    this.fetchEventDataList();
  }

  /**
   * 获取事件数据类型信息
   * @param {*object} params 传递的参数
   */
  fetchEventDataList(params = {}) {
    const { tenantId, dispatch, eventDataType: { pagination = {} } } = this.props;
    const filterValue = this.filterForm === undefined ? {} : this.filterForm.getFieldsValue();
    dispatch({
      type: 'eventDataType/fetchEventDataList',
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
    this.fetchEventDataList({ page: {} });
  }

  /**
   * 重置查询信息
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
      type: 'eventDataType/updateState',
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

  /**
   * 隐藏Modal
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * 保存事件数据类型信息
   * @param {*object} fieldsValue 传递的fieldsValue
   */
  @Bind()
  handleSaveEventData(fieldsValue) {
    const { dispatch, tenantId } = this.props;
    const { eventFormData } = this.state;
    dispatch({
      type: 'eventDataType/createEventDataType',
      payload: { tenantId, ...eventFormData, ...fieldsValue },
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchEventDataList();
      }
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchEventDataList({ page: pagination });
  }

  render() {
    const {
      fetchDataLoading,
      createLoading,
      eventDataType: { eventDataList = [], modalVisible, pagination = {} },
    } = this.props;
    const { eventFormData = {} } = this.state;
    const columns = [
      {
        title: intl.get('spfm.eventDataType.model.eventDataType.className').d('类名'),
        width: 150,
        dataIndex: 'className',
      },
      {
        title: intl.get('spfm.eventDataType.model.eventDataType.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('spfm.common.model.levelCode').d('层级'),
        dataIndex: 'levelCode',
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.eventDataType.view.message.title').d('事件数据类型定义')}>
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
            rowKey="dataTypeId"
            loading={fetchDataLoading}
            dataSource={eventDataList}
            columns={columns}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <EditModal
            title={intl
              .get('spfm.eventDataType.view.message.title.modal.create')
              .d('新建事件数据类型')}
            loading={createLoading}
            modalVisible={modalVisible}
            initData={eventFormData}
            onCancel={this.hideModal}
            onOk={this.handleSaveEventData}
          />
        </Content>
      </React.Fragment>
    );
  }
}
