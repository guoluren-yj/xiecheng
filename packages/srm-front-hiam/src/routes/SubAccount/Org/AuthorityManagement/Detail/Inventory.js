/**
 * inventory - 租户级权限维护tab页 - 库房
 * @date: 2018-7-31
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Tooltip, Switch, Row, Col, Checkbox, Icon } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil } from 'lodash';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import AddDataModal from './AddDataModal';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 库房
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityInventory - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authorityInventory, loading }) => ({
  authorityInventory,
  addLoading: loading.effects['authorityInventory/addAuthorityInventory'],
  fetchLoading: loading.effects['authorityInventory/fetchAuthorityInventory'],
  fetchModalLoading: loading.effects['authorityInventory/fetchModalData'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.authorityManagement', 'hiam.authority'] })
export default class Inventory extends PureComponent {
  inventoryRef;

  /**
   *Creates an instance of Inventory.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      selectRows: [],
      switchLoading: false,
      addModalVisible: false,
      display: true,
      addMore: true,
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'INVENTORY' && !isNil(userId)) {
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
    if (this.preAuthRoleId !== authRoleId && activeKey === 'INVENTORY' && !isNil(userId)) {
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
  fetchData(pageData = {}) {
    const {
      form,
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const staticData = {
      userId,
      authorityTypeCode: 'INVENTORY',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authorityInventory/fetchAuthorityInventory',
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
  addInventory(addRows) {
    const {
      dispatch,
      authorityInventory: { head = {} },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityInventory/addAuthorityInventory',
      payload: {
        authorityTypeCode: 'INVENTORY',
        userId,
        userAuthority: head,
        userAuthorityLineList: addRows,
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        this.inventoryRef.state.addRows = [];
        this.onHideAddModal();
        notification.success();
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
        type: 'authorityInventory/deleteAuthorityInventory',
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
      type: 'authorityInventory/fetchModalData',
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
    this.inventoryRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
      addMore: true,
    });
    this.inventoryRef.handleFormReset();
  }

  /**
   *查询按钮点击事件
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
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  @Bind()
  @Bind()
  toggleAddForm() {
    const { addMore } = this.state;
    this.setState({
      addMore: !addMore,
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
    const {
      dispatch,
      queryParams: { userId },
      authorityInventory: { head = {} },
      authRoleId,
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityInventory/addAuthorityInventory',
      payload: {
        authorityTypeCode: 'INVENTORY',
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
    const {
      dispatch,
      queryParams: { userId },
      authorityInventory: { head = {} },
      authRoleId,
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityInventory/addAuthorityInventory',
      payload: {
        authorityTypeCode: 'INVENTORY',
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
   *
   * @returns
   */
  renderForm() {
    const { getFieldDecorator, getFieldValue, resetFields } = this.props.form;
    const { display } = this.state;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={19}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityInventory.inventoryCode')
                    .d('库房代码')}
                >
                  {getFieldDecorator('dataCode')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityInventory.invOrganizationName')
                    .d('库房名称')}
                >
                  {getFieldDecorator('dataName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityInventory.companyName')
                    .d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      onChange={() => {
                        resetFields('invOrganizationId');
                      }}
                      code="SPFM.USER_AUTH.COMPANY"
                      lovOptions={{ displayField: 'companyName', valueField: 'companyId' }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityInventory.organizationName')
                    .d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov
                      code="SPFM.USER_AUTH.INVORG"
                      queryParams={{ companyId: getFieldValue('companyId') }}
                      disabled={!getFieldValue('companyId')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={5} className="search-btn-more">
            <FormItem>
              <Button
                style={{ display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button style={{ marginRight: 1 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   *渲染添加查询结构
   *
   * @returns
   */
  @Bind()
  renderaddModalForm() {
    const { queryValue, handleFormReset } = this.inventoryRef;
    const { getFieldDecorator, getFieldValue, resetFields } = this.inventoryRef.props.form;
    const { addMore } = this.state;

    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={16}>
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityInventory.inventoryCode')
                    .d('库房代码')}
                >
                  {getFieldDecorator('dataCode')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityInventory.invOrganizationName')
                    .d('库房名称')}
                >
                  {getFieldDecorator('dataName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: addMore ? 'none' : 'block' }}>
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityInventory.companyName')
                    .d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      onChange={() => {
                        resetFields('invOrganizationId');
                      }}
                      lovOptions={{ displayField: 'companyName', valueField: 'companyId' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityInventory.organizationName')
                    .d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov
                      code="SPFM.USER_AUTH.INVORG"
                      queryParams={{ companyId: getFieldValue('companyId') }}
                      disabled={!getFieldValue('companyId')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={8} className="search-btn-more">
            <FormItem>
              <Button
                style={{ display: addMore ? 'inline-block' : 'none' }}
                onClick={this.toggleAddForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: addMore ? 'none' : 'inline-block' }}
                onClick={this.toggleAddForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button style={{ marginRight: 4 }} onClick={() => handleFormReset()}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={() => queryValue()} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.inventoryRef = ref;
  }

  /**
   *渲染事件
   *
   * @returns
   */
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
      authorityInventory: {
        list = [],
        head = {},
        pagination = {},
        inventoryDataSource = [],
        inventoryPagination = {},
      },
      addLoading,
      fetchLoading,
      fetchModalLoading,
    } = this.props;
    const { switchLoading, addModalVisible, selectRows } = this.state;
    const columns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityInventory.inventoryCode')
          .d('库房编码'),
        width: 100,
        dataIndex: 'dataCode',
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityInventory.invOrganizationName')
          .d('库房名称'),
        dataIndex: 'dataName',
        // width: 300,
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityInventory.organizationName')
          .d('库存组织'),
        dataIndex: 'organizationName',
        // width: 300,
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityInventory.companyName').d('公司'),
        dataIndex: 'companyName',
        // width: 300,
      },
    ];

    const addModalOptions = {
      columns,
      loading: fetchModalLoading,
      confirmLoading: addLoading,
      title: intl.get('hiam.authorityManagement.view.title.modal.inventory').d('选择库房'),
      rowKey: 'dataId',
      // queryCode: 'dataCode',
      // queryName: 'dataName',
      // queryCodeDesc: intl
      //   .get('hiam.authorityManagement.model.authorityInventory.dataCode')
      //   .d('库房代码'),
      // queryNameDesc: intl
      //   .get('hiam.authorityManagement.model.authorityInventory.dataName')
      //   .d('库房名称'),
      renderForm: this.renderaddModalForm,
      dataSource: inventoryDataSource,
      pagination: inventoryPagination,
      modalVisible: addModalVisible,
      addData: this.addInventory,
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
                  .get('hiam.authorityManagement.view.button.table.create.inventory')
                  .d('新建库房权限')}
              </Button>
              <Button
                style={{ margin: '0 8px 16px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.inventory')
                  .d('删除库房权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip.inventory')
                .d('“加入全部”即将所有库房权限自动添加至当前账户，无需再手工添加。')}
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
        <EditTable
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
