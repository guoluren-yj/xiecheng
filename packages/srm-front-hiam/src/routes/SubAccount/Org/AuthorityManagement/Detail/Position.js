/**
 * 租户级权限维护tab页 - 岗位
 * @date: 2019-11-07
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Tooltip, Switch, Table, Checkbox, Icon } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil } from 'lodash';

import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import AddDataModal from './AddDataModal';

const FormItem = Form.Item;

/**
 * 租户级权限管理 - 岗位
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityPosition - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authorityPosition, loading }) => ({
  authorityPosition,
  addLoading: loading.effects['authorityPosition/addAuthorityPosition'],
  fetchLoading: loading.effects['authorityPosition/fetchAuthorityPosition'],
  fetchModalLoading: loading.effects['authorityPosition/fetchModalData'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.authorityManagement', 'hiam.authority'] })
export default class Position extends PureComponent {
  positionRef;

  /**
   *Creates an instance of Position.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      selectRows: [],
      switchLoading: false,
      addModalVisible: false,
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'POSITION' && !isNil(userId)) {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  componentDidUpdate() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'POSITION' && !isNil(userId)) {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  /**
   *查询数据
   *
   * @param {Object} pageData
   */
  @Bind()
  fetchData(pageData) {
    const {
      form,
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const staticData = {
      userId,
      authorityTypeCode: 'POSITION',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authorityPosition/fetchAuthorityPosition',
          payload: {
            authRoleId,
            ...fieldsValue,
            ...staticData,
            ...pageData,
          },
        });
      }
    });
  }

  /**
   * 添加数据
   * @param {Aarray} addRows 选择的数据
   */
  @Bind()
  addCompany(addRows) {
    const {
      dispatch,
      authorityPosition: { head = {} },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityPosition/addAuthorityPosition',
      payload: {
        authorityTypeCode: 'POSITION',
        userId,
        userAuthority: head,
        userAuthorityLineList: addRows,
        authRoleId,
      },
    }).then(response => {
      if (response) {
        this.onHideAddModal();
        notification.success();
        this.positionRef.state.addRows = [];
        this.refresh();
      }
    });
  }

  /**
   *删除方法
   */
  @Bind()
  remove() {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { selectRows } = this.state;
    const onOk = () => {
      dispatch({
        type: 'authorityPosition/deleteAuthorityPosition',
        payload: {
          userId,
          deleteRows: selectRows,
          authRoleId,
        },
      }).then(response => {
        if (response) {
          this.refresh();
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   *刷新
   */
  @Bind()
  refresh() {
    this.fetchData();
    this.setState({
      selectRows: [],
    });
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectRows: selectedRows });
  }

  /**
   * 查询弹出框数据
   * @param {Object} queryData 查询数据
   */
  @Bind()
  fetchModalData(queryData = {}) {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityPosition/fetchModalData',
      payload: {
        userId,
        authRoleId,
        ...queryData,
      },
    });
  }

  /**
   * 展示弹出框
   */
  @Bind()
  onShowAddModal() {
    this.fetchModalData();
    this.setState({
      addModalVisible: true,
    });
  }

  /**
   * 隐藏弹出框
   */
  @Bind()
  onHideAddModal() {
    const { dispatch } = this.props;
    this.positionRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
    });
    dispatch({
      type: 'authorityPosition/updateState',
      payload: {
        positionDataSource: [],
        positionPagination: {},
      },
    });
  }

  /**
   *点击查询按钮事件
   */
  @Bind()
  queryValue() {
    this.fetchData();
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    this.fetchData({
      page: pagination,
    });
  }

  /**
   *点击包含空值后触发事件
   *
   * @param {*Boolean} checked switch的value值
   */
  @Bind()
  @Debounce(500)
  includeNullFlag(e) {
    const { checked } = e.target;
    this.setState({
      switchLoading: true,
    });
    const {
      dispatch,
      queryParams: { userId },
      authorityPosition: { head = {} },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityPosition/addAuthorityPosition',
      payload: {
        authorityTypeCode: 'POSITION',
        userId,
        userAuthority: {
          ...head,
          includeNullFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
        authRoleId,
      },
    }).then(response => {
      if (response) {
        this.refresh();
        notification.success();
        this.setState({
          switchLoading: false,
        });
      }
    });
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {*Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked) {
    this.setState({
      switchLoading: true,
    });
    const {
      dispatch,
      queryParams: { userId },
      authorityPosition: { head = {} },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityPosition/addAuthorityPosition',
      payload: {
        authorityTypeCode: 'POSITION',
        userId,
        userAuthority: {
          ...head,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
        authRoleId,
      },
    }).then(response => {
      if (response) {
        this.refresh();
        notification.success();
        this.setState({
          switchLoading: false,
        });
      }
    });
  }

  /**
   *渲染查询结构
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityPosition.posiName')
            .d('岗位名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityPosition.posiNum').d('岗位编码')}
        >
          {getFieldDecorator('dataCode')(<Input trim inputChinese={false} />)}
        </FormItem>
        <FormItem>
          <Button style={{ marginRight: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.positionRef = ref;
  }

  render() {
    const {
      queryParams: { userId },
    } = this.props;
    if (isNil(userId)) {
      return (
        <h3 style={{ color: 'gray', marginTop: '10%', textAlign: 'center' }}>
          {intl
            .get('hiam.authorityManagement.model.authorityManagement.noSupport')
            .d('此功能不适用')}
        </h3>
      );
    }
    const {
      authorityPosition: {
        list = [],
        head = {},
        pagination,
        positionDataSource = [],
        positionPagination = {},
      },
      addLoading,
      fetchLoading,
      fetchModalLoading,
    } = this.props;
    const { switchLoading, addModalVisible, selectRows } = this.state;
    const columns = [
      {
        title: intl.get('hiam.authorityManagement.model.authorityPosition.posiName').d('岗位名称'),
        dataIndex: 'dataName',
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityPosition.posiNum').d('岗位编码'),
        dataIndex: 'dataCode',
        width: 300,
      },
    ];

    const addModalOptions = {
      columns,
      confirmLoading: addLoading,
      loading: fetchModalLoading,
      title: intl.get('hiam.authorityManagement.view.title.modal.position').d('选择岗位'),
      rowKey: 'dataId',
      queryCode: 'dataCode',
      queryName: 'dataName',
      queryCodeDesc: intl
        .get('hiam.authorityManagement.model.authorityPosition.posiNum')
        .d('岗位编码'),
      queryNameDesc: intl
        .get('hiam.authorityManagement.model.authorityPosition.posiName')
        .d('岗位名称'),
      dataSource: positionDataSource,
      pagination: positionPagination,
      modalVisible: addModalVisible,
      addData: this.addCompany,
      onHideAddModal: this.onHideAddModal,
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
    };

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectRows.map(n => n.authorityLineId),
    };

    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', margin: '0 24px 16px 0' }}>
            <Tooltip
              title={intl
                .get('hiam.authority.view.message.nullValue.tooltip')
                .d('勾选后，单据中该维度字段为空该用户可查询到')}
            >
              <span style={{ marginRight: '8px' }}>
                {intl.get('hiam.authority.view.message.nullValue').d('包含空值')}
                <Icon type="question-circle" style={{ margin: '0 4px' }} />:
              </span>
              <Checkbox onChange={this.includeNullFlag} checked={head.includeNullFlag || 0} />
            </Tooltip>
          </div>
          {!head.includeAllFlag && (
            <React.Fragment>
              <Button
                loading={fetchLoading}
                style={{ margin: '0 8px 16px 0' }}
                onClick={() => this.onShowAddModal()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.create.position')
                  .d('新建岗位权限')}
              </Button>
              <Button
                style={{ margin: '0 8px 16px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.position')
                  .d('删除岗位权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip.position')
                .d('“加入全部”即将所有岗位权限自动添加至当前账户，无需再手工添加。')}
              placement="right"
            >
              <Switch
                loading={switchLoading}
                checked={!!head.includeAllFlag}
                onChange={this.includeAllFlag}
              />
            </Tooltip>
          </div>
        </div>
        <Table
          bordered
          rowKey="authorityLineId"
          loading={fetchLoading}
          dataSource={list}
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={this.handleTableChange}
        />
        <AddDataModal {...addModalOptions} />
      </div>
    );
  }
}
