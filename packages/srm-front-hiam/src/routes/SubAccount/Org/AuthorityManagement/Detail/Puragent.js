/**
 * Puragent - 租户级权限维护tab页 - 采购员
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Tooltip, Switch, Table, Checkbox, Icon } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import AddDataModal from './AddDataModal';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 采购员
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityPuragent - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authorityPuragent, loading }) => ({
  authorityPuragent,
  addLoading: loading.effects['authorityPuragent/addAuthorityPuragent'],
  fetchLoading: loading.effects['authorityPuragent/fetchAuthorityPuragent'],
  fetchModalLoading: loading.effects['authorityPuragent/fetchModalData'],
}))
@Form.create({ fieldNameProp: null })
export default class Puragent extends PureComponent {
  puragentRef;

  /**
   *Creates an instance of Puragent.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      selectRows: [],
      switchLoading: false,
      addModalVisible: false,
    };
  }

  componentDidMount() {
    const {
      queryParams: { userId },
    } = this.props;
    if (!isNil(userId)) {
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
    } = this.props;
    const staticData = {
      userId,
      authorityTypeCode: 'PURCHASE_AGENT',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authorityPuragent/fetchAuthorityPuragent',
          payload: {
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
  addPuragent(addRows) {
    const {
      dispatch,
      authorityPuragent: { head = {} },
      queryParams: { userId },
    } = this.props;
    dispatch({
      type: 'authorityPuragent/addAuthorityPuragent',
      payload: {
        authorityTypeCode: 'PURCHASE_AGENT',
        userId,
        userAuthority: head,
        userAuthorityLineList: addRows,
      },
    }).then((response) => {
      if (response) {
        this.onHideAddModal();
        notification.success();
        this.puragentRef.state.addRows = [];
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
    } = this.props;
    const { selectRows } = this.state;
    const onOk = () => {
      dispatch({
        type: 'authorityPuragent/deleteAuthorityPuragent',
        payload: {
          userId,
          deleteRows: selectRows,
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
    } = this.props;
    dispatch({
      type: 'authorityPuragent/fetchModalData',
      payload: {
        userId,
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
    this.puragentRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
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
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    this.fetchData({
      page: pagination,
    });
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
   *点击包含空值后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  @Debounce(500)
  includeNullFlag(e) {
    const { checked } = e.target;
    const {
      dispatch,
      queryParams: { userId },
      authorityPuragent: { head = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPuragent/addAuthorityPuragent',
      payload: {
        authorityTypeCode: 'PURCHASE_AGENT',
        userId,
        userAuthority: {
          ...head,
          includeNullFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
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
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked) {
    const {
      dispatch,
      queryParams: { userId },
      authorityPuragent: { head = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPuragent/addAuthorityPuragent',
      payload: {
        authorityTypeCode: 'PURCHASE_AGENT',
        userId,
        userAuthority: {
          ...head,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
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
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityPuragent.dataName')
            .d('采购员名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityPuragent.dataCode')
            .d('采购员代码')}
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
    this.puragentRef = ref;
  }

  /**
   *渲染事件
   *
   * @returns
   * @memberof Puragent
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
      authorityPuragent: {
        list = [],
        head = {},
        pagination = {},
        puragentDataSource = [],
        puragentPagination = {},
      },
      addLoading,
      fetchLoading,
      fetchModalLoading,
    } = this.props;
    const { switchLoading, addModalVisible, selectRows } = this.state;
    const columns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityPuragent.dataName')
          .d('采购员名称'),
        dataIndex: 'dataName',
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityPuragent.dataCode')
          .d('采购员代码'),
        dataIndex: 'dataCode',
        width: 300,
      },
    ];

    const addModalOptions = {
      columns,
      confirmLoading: addLoading,
      loading: fetchModalLoading,
      title: intl.get('hiam.authorityManagement.view.title.modal.puragent').d('选择采购员'),
      rowKey: 'dataId',
      queryCode: 'dataCode',
      queryName: 'dataName',
      queryCodeDesc: intl
        .get('hiam.authorityManagement.model.authorityPuragent.dataCode')
        .d('采购员代码'),
      queryNameDesc: intl
        .get('hiam.authorityManagement.model.authorityPuragent.dataName')
        .d('采购员名称'),
      dataSource: puragentDataSource,
      pagination: puragentPagination,
      modalVisible: addModalVisible,
      addData: this.addPuragent,
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
                  .get('hiam.authorityManagement.view.button.table.create.puragent')
                  .d('新建采购员权限')}
              </Button>
              <Button
                style={{ margin: '0 8px 16px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.puragent')
                  .d('删除采购员权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip.puragent')
                .d('“加入全部”即将所有采购员权限自动添加至当前账户，无需再手工添加。')}
              placement="right"
            >
              <Switch
                switchLoading={switchLoading}
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
