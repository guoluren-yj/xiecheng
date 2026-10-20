/**
 * EventHandle - 事件处理定义
 * @date: 2019-3-13
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Row, Col, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';

import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { enableRender } from 'utils/renderer';

import EditModal from './EditModal';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * 事件处理
 * @extends {Component} - React.Component
 * @reactProps {Object} eventHandle - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ loading, eventHandle }) => ({
  eventHandle,
  tenantId: getCurrentOrganizationId(),
  fetchDataLoading: loading.effects['eventHandle/fetchEventHandleData'],
  createLoading: loading.effects['eventHandle/createEventHandle'],
}))
@formatterCollections({ code: ['spfm.eventHandle'] })
export default class eventHandle extends React.PureComponent {
  constructor(props) {
    super(props);
    const { eventId = undefined } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      eventId,
      editData: {},
      modalVisible: false,
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    this.fetchEventData();
    this.fetchEventHandleData();
  }

  /**
   * 获取平台事件数据
   */
  @Bind()
  fetchEventData() {
    const { dispatch } = this.props;
    const { eventId } = this.state;
    dispatch({
      type: 'eventHandle/fetchEventData',
      payload: {
        eventId,
      },
    });
  }

  /**
   * 获取事件处理数据
   * @param {Object} params 参数
   */
  @Bind()
  fetchEventHandleData(params = {}) {
    const { eventId } = this.state;
    const {
      dispatch,
      eventHandle: { pagination = {} },
      tenantId,
    } = this.props;
    dispatch({
      type: 'eventHandle/fetchEventHandleData',
      payload: { eventId, page: pagination, tenantId, ...params },
    });
  }

  /**
   * 控制modal的显示与隐藏
   * @param {Boolean} flag 显示/隐藏标记
   */
  @Bind()
  handleModalVisible(flag) {
    this.setState({
      modalVisible: flag,
    });
  }

  /**
   * 显示modal
   */
  @Bind()
  showModal() {
    this.setState({
      editData: {},
    });
    this.handleModalVisible(true);
  }

  /**
   * 隐藏modal
   */
  @Bind()
  hiddenModal() {
    this.handleModalVisible(false);
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchEventHandleData({ page: pagination });
  }

  /**
   * 保存数据
   * @param {Object} fieldsValue 传递的fieldsValue
   */
  @Bind()
  saveData(fieldsValue = {}) {
    const {
      dispatch,
      pagination,
      tenantId,
      eventHandle: { eventData = [] },
    } = this.props;
    const { editData, eventId } = this.state;
    dispatch({
      type: 'eventHandle/saveData',
      payload: {
        eventId,
        tenantId,
        pagination,
        ...editData,
        eventCode: eventData[0].eventCode,
        ...fieldsValue,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.hiddenModal();
        this.fetchEventHandleData();
      }
    });
  }

  /**
   * 编辑数据
   * @param {Object} record 行数据
   */
  @Bind()
  handleUpdate(record = {}) {
    this.setState({
      editData: record,
    });
    this.handleModalVisible(true);
  }

  render() {
    const {
      fetchDataLoading,
      eventHandle: { eventHandleData = [], pagination = {}, eventData = [] },
    } = this.props;
    const { editData, modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('spfm.eventHandle.model.eventHandle.handleFunction').d('处理方法'),
        dataIndex: 'handleFunction',
      },
      {
        title: intl.get('spfm.eventHandle.model.eventHandle.orderSeq').d('排序号'),
        dataIndex: 'orderSeq',
      },
      {
        title: intl.get('spfm.common.model.levelCode').d('层级'),
        dataIndex: 'levelCode',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
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
        <Header
          title={intl.get('spfm.eventHandle.view.message.title').d('事件处理')}
          backPath={isTenantRoleLevel() ? '/spfm/event-org/list' : '/spfm/event/list'}
        >
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <Row gutter={32}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.common.model.categoryCode').d('事件编码')}
                >
                  {eventData && eventData[0] && eventData[0].eventCode}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.common.model.eventName').d('事件描述')}
                >
                  {eventData && eventData[0] && eventData[0].eventName}
                </FormItem>
              </Col>
            </Row>
          </div>
          <Table
            bordered
            rowKey="eventHandleId"
            columns={columns}
            loading={fetchDataLoading}
            dataSource={eventHandleData}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <EditModal
            title={
              editData.eventHandleId === undefined
                ? intl.get('spfm.eventHandle.view.message.title.modal.create').d('新建事件处理')
                : intl.get('spfm.eventHandle.view.message.title.modal.edit').d('编辑事件处理')
            }
            modalVisible={modalVisible}
            initData={editData}
            onCancel={this.hiddenModal}
            onOk={this.saveData}
          />
        </Content>
      </React.Fragment>
    );
  }
}
