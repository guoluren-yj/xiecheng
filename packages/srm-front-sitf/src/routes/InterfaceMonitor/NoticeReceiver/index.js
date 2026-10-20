/**
 * NoticeReceiver - 监控联系人
 * @date: 2018-11-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Table, Modal, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import qs from 'querystring';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import EditForm from './EditForm';

/**
 * 监控联系人
 * @extends {Component} - React.Component
 * @reactProps {Object} noticeReceiver - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['sitf.noticeReceiver', 'entity.tenant', 'entity.roles'] })
@connect(({ noticeReceiver, loading }) => ({
  noticeReceiver,
  saveLoading: loading.effects['noticeReceiver/saveNoticeReceiver'],
  fetchLoading: loading.effects['noticeReceiver/fetchNoticeReceiver'],
}))
@withRouter
export default class NoticeReceiver extends PureComponent {
  form;
  constructor(props) {
    super(props);
    const { monitorSystemId = undefined } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      monitorSystemId,
      modalVisible: false, // 弹出框显示/隐藏标记
      editRowData: {}, // 当前编辑行数据
      selectedRows: [], // 勾选中数据
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    this.fetchMonitorSystemInfo();
    this.fetchNoticeReceiver();
  }

  /**
   * 查询监控系统详情
   */
  @Bind()
  fetchMonitorSystemInfo() {
    const { dispatch } = this.props;
    const { monitorSystemId } = this.state;
    dispatch({
      type: 'noticeReceiver/fetchMonitorSystemInfo',
      payload: {
        monitorSystemId,
      },
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchNoticeReceiver(pageData = {}) {
    const { dispatch } = this.props;
    const { monitorSystemId } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'noticeReceiver/fetchNoticeReceiver',
      payload: {
        monitorSystemId,
        page: pageData,
        ...filterValues,
      },
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  onShowEditModal(flag, record = {}) {
    const state = {
      modalVisible: !!flag,
      editRowData: record,
    };
    if (!flag) {
      state.editRowData = {};
    }
    this.setState(state);
  }

  /**
   * 新增系统监控
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  onHandleAddNoticeReceiver(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData, monitorSystemId } = this.state;
    dispatch({
      type: 'noticeReceiver/saveNoticeReceiver',
      payload: {
        monitorSystemId,
        ...editRowData,
        ...fieldsValue,
      },
    }).then(response => {
      if (response) {
        notification.success();
        form.resetFields();
        this.onShowEditModal(false);
        this.refreshValue();
      }
    });
  }

  /**
   * 删除监控联系人配置
   */
  @Bind()
  deleteNoticeReceiver() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const onOk = () => {
      dispatch({
        type: 'noticeReceiver/deleteNoticeReceiver',
        payload: selectedRows,
      }).then(response => {
        if (response) {
          notification.success();
          this.refreshValue();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    const {
      noticeReceiver: { data = {} },
    } = this.props;
    this.fetchNoticeReceiver(data);
    this.setState({
      editRowData: {},
      selectedRows: [],
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryNoticeReceiver(queryData = {}) {
    this.fetchNoticeReceiver(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchNoticeReceiver(pagination);
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
   * 勾选方法
   * @param {*} _ 占位
   * @param {Array} selectedRows 选中数据
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      match,
      saveLoading,
      fetchLoading,
      noticeReceiver: { data = {}, monitorSystemInfo = {} },
    } = this.props;
    const { modalVisible, editRowData, selectedRows } = this.state;
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowsKeys: selectedRows.map(n => n.receiverId),
    };
    const columns = [
      {
        title: intl.get('entity.roles.contacts').d('联系人'),
        dataIndex: 'name',
        width: 100,
      },
      {
        title: intl.get('hzero.common.phone').d('手机号'),
        dataIndex: 'mobilephone',
        width: 180,
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'email',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        align: 'left',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        align: 'left',
        render: (_, record) => (
          <Fragment>
            <a
              onClick={() => {
                this.onShowEditModal(true, record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </Fragment>
        ),
      },
    ];

    const editFormOptions = {
      modalVisible,
      editRowData,
      loading: saveLoading,
      onHandleAddNoticeReceiver: this.onHandleAddNoticeReceiver,
      onShowEditModal: this.onShowEditModal,
    };
    const basePath = match.path.substring(0, match.path.indexOf('/notice-receiver'));
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.noticeReceiver.view.message.title').d('监控联系人配置')}
          backPath={`${basePath}/list`}
        >
          <Button icon="plus" type="primary" onClick={() => this.onShowEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="delete"
            onClick={() => this.deleteNoticeReceiver(true)}
            disabled={selectedRows.length <= 0}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <Row gutter={24}>
              <Col span={2} style={{ textAlign: 'right', paddingRight: '6px' }}>
                {intl.get('entity.tenatn.name').d('租户名称')}:
              </Col>
              <Col
                span={4}
                style={{
                  borderBottom: '1px solid #999',
                  marginTop: `${!monitorSystemInfo.tenantName ? '16px' : ''}`,
                }}
              >
                {monitorSystemInfo.tenantName}
              </Col>
              <Col span={2} style={{ textAlign: 'right' }}>
                {intl
                  .get('sitf.monitorInterfaceSetting.view.message.externalSystemCode')
                  .d('外部系统代码')}
                :
              </Col>
              <Col
                span={4}
                style={{
                  borderBottom: '1px solid #999',
                  marginTop: `${!monitorSystemInfo.externalSystemCode ? '16px' : ''}`,
                }}
              >
                {monitorSystemInfo.externalSystemCode}
              </Col>
              <Col span={2} style={{ textAlign: 'right' }}>
                {intl
                  .get('sitf.monitorInterfaceSetting.view.message.externalSystemName')
                  .d('外部系统名称')}
                :
              </Col>
              <Col
                span={4}
                style={{
                  borderBottom: '1px solid #999',
                  marginTop: `${!monitorSystemInfo.externalSystemName ? '16px' : ''}`,
                }}
              >
                {monitorSystemInfo.externalSystemName}
              </Col>
            </Row>
          </div>
          <Table
            bordered
            loading={fetchLoading}
            rowKey="receiverId"
            dataSource={data.list}
            columns={columns}
            pagination={data.pagination}
            onChange={this.handleStandardTableChange}
            rowSelection={rowSelection}
          />
          <EditForm {...editFormOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
