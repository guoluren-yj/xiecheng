/**
 * 租户级权限维护tab页 - 员工
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
 * 租户级权限管理 - 员工
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityEmployee - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authorityEmployee, loading }) => ({
  authorityEmployee,
  addLoading: loading.effects['authorityEmployee/addAuthorityEmployee'],
  fetchLoading: loading.effects['authorityEmployee/fetchAuthorityEmployee'],
  fetchModalLoading: loading.effects['authorityEmployee/fetchModalData'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.authorityManagement', 'hiam.authority'] })
export default class Employee extends PureComponent {
  employeeRef;

  /**
   *Creates an instance of Employee.
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
    if (this.preAuthRoleId !== authRoleId && activeKey === 'EMPLOYEE' && !isNil(userId)) {
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
    if (this.preAuthRoleId !== authRoleId && activeKey === 'EMPLOYEE' && !isNil(userId)) {
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
      authorityTypeCode: 'EMPLOYEE',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authorityEmployee/fetchAuthorityEmployee',
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
      authorityEmployee: { head = {} },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityEmployee/addAuthorityEmployee',
      payload: {
        authorityTypeCode: 'EMPLOYEE',
        userId,
        authRoleId,
        userAuthority: head,
        userAuthorityLineList: addRows,
      },
    }).then((response) => {
      if (response) {
        this.onHideAddModal();
        notification.success();
        this.employeeRef.state.addRows = [];
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
        type: 'authorityEmployee/deleteAuthorityEmployee',
        payload: {
          userId,
          deleteRows: selectRows,
          authRoleId,
        },
      }).then((response) => {
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
      type: 'authorityEmployee/fetchModalData',
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
    this.employeeRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
    });

    dispatch({
      type: 'authorityEmployee/updateState',
      payload: {
        employeeDataSource: [],
        employeePagination: {},
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
   * @param {Boolean} checked check的value值
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
      authorityEmployee: { head = {} },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityEmployee/addAuthorityEmployee',
      payload: {
        authorityTypeCode: 'EMPLOYEE',
        userId,
        userAuthority: {
          ...head,
          includeNullFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
        authRoleId,
      },
    }).then((response) => {
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
      authorityEmployee: { head = {} },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityEmployee/addAuthorityEmployee',
      payload: {
        authorityTypeCode: 'EMPLOYEE',
        userId,
        userAuthority: {
          ...head,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
        authRoleId,
      },
    }).then((response) => {
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
            .get('hiam.authorityManagement.model.authorityEmployee.employName')
            .d('员工名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityEmployee.employCode')
            .d('员工编码')}
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
    this.employeeRef = ref;
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
      authorityEmployee: {
        list = [],
        head = {},
        pagination,
        employeeDataSource = [],
        employeePagination = {},
      },
      addLoading,
      fetchLoading,
      fetchModalLoading,
    } = this.props;
    const { switchLoading, addModalVisible, selectRows } = this.state;
    const columns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityEmployee.employName')
          .d('员工名称'),
        dataIndex: 'dataName',
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityEmployee.employCode')
          .d('员工编码'),
        dataIndex: 'dataCode',
        width: 300,
      },
    ];

    const addModalOptions = {
      columns,
      confirmLoading: addLoading,
      loading: fetchModalLoading,
      title: intl.get('hiam.authorityManagement.view.title.modal.employee').d('选择员工'),
      rowKey: 'dataId',
      queryCode: 'dataCode',
      queryName: 'dataName',
      queryCodeDesc: intl
        .get('hiam.authorityManagement.model.authorityEmployee.employCode')
        .d('员工编码'),
      queryNameDesc: intl
        .get('hiam.authorityManagement.model.authorityEmployee.employName')
        .d('员工名称'),
      dataSource: employeeDataSource,
      pagination: employeePagination,
      modalVisible: addModalVisible,
      addData: this.addCompany,
      onHideAddModal: this.onHideAddModal,
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
    };

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectRows.map((n) => n.authorityLineId),
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
              <Button style={{ margin: '0 8px 16px 0' }} onClick={() => this.onShowAddModal()}>
                {intl
                  .get('hiam.authorityManagement.view.button.table.create.employee')
                  .d('新建员工权限')}
              </Button>
              <Button
                style={{ margin: '0 8px 16px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.employee')
                  .d('删除员工权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip.employee')
                .d('“加入全部”即将所有员工权限自动添加至当前账户，无需再手工添加。')}
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
