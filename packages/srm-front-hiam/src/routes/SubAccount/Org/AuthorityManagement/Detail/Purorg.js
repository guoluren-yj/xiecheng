/**
 * Purorg - 租户级权限维护tab页 - 采购组织
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Tooltip, Switch, Table, Checkbox, Icon } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isFunction, isNil } from 'lodash';
import cuxRemote from 'hzero-front/lib/utils/remote';

import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';

import AddDataModal from './AddDataModal';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 采购组织
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityPurorg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authorityPurorg, loading }) => ({
  authorityPurorg,
  addLoading: loading.effects['authorityPurorg/addAuthorityPurorg'],
  fetchLoading: loading.effects['authorityPurorg/fetchAuthorityPurorg'],
  fetchModalLoading: loading.effects['authorityPurorg/fetchModalData'],
}))
@cuxRemote(
  {
    code: 'HIAM_SUB_ACC_ORG_PURORG',
    name: 'remote',
  },
  {
    process: {
      handleCuxModalProps: undefined,
    },
  }
)
@Form.create({ fieldNameProp: null })
export default class Purorg extends PureComponent {
  purorgRef;

  /**
   *Creates an instance of Purorg.
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
      authorityTypeCode: 'PURCHASE_ORGANIZATION',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authorityPurorg/fetchAuthorityPurorg',
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
  addPurorg(addRows) {
    const {
      dispatch,
      authorityPurorg: { head = {} },
      queryParams: { userId },
    } = this.props;
    dispatch({
      type: 'authorityPurorg/addAuthorityPurorg',
      payload: {
        authorityTypeCode: 'PURCHASE_ORGANIZATION',
        userId,
        userAuthority: head,
        userAuthorityLineList: addRows,
      },
    }).then((response) => {
      if (response) {
        this.onHideAddModal();
        notification.success();
        this.purorgRef.state.addRows = [];
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
        type: 'authorityPurorg/deleteAuthorityPurorg',
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
      remote,
    } = this.props;
    const { handleCuxModalProps = undefined } = remote?.props?.process || {};
    const { cuxQueryUrl = undefined } = handleCuxModalProps || {};
    const cuxUrl = isFunction(cuxQueryUrl) ? cuxQueryUrl({ userId }) : undefined;
    dispatch({
      type: 'authorityPurorg/fetchModalData',
      payload: {
        userId,
        cuxQueryUrl: cuxUrl,
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
    this.purorgRef.state.addRows = [];
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
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  @Debounce(500)
  includeNullFlag(e) {
    const { checked } = e.target;
    const {
      dispatch,
      queryParams: { userId },
      authorityPurorg: { head = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPurorg/addAuthorityPurorg',
      payload: {
        authorityTypeCode: 'PURCHASE_ORGANIZATION',
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
      authorityPurorg: { head = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPurorg/addAuthorityPurorg',
      payload: {
        authorityTypeCode: 'PURCHASE_ORGANIZATION',
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
            .get('hiam.authorityManagement.model.authorityPurorg.dataName')
            .d('采购组织名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityPurorg.dataCode')
            .d('采购组织代码')}
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
    this.purorgRef = ref;
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
      authorityPurorg: {
        list = [],
        head = {},
        pagination = {},
        purorgDataSource = [],
        purorgPagination = {},
      },
      addLoading,
      fetchLoading,
      fetchModalLoading,
      remote,
    } = this.props;
    const { handleCuxModalProps = undefined } = remote?.props?.process || {};
    const { switchLoading, addModalVisible, selectRows } = this.state;
    const { cuxCols = [], cuxQueryFileds = [] } = handleCuxModalProps || {
      cuxCols: [],
      cuxQueryFileds: [],
    };
    const columns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityPurorg.dataName')
          .d('采购组织名称'),
        dataIndex: 'dataName',
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityPurorg.dataCode')
          .d('采购组织代码'),
        dataIndex: 'dataCode',
        width: 150,
      },
    ];
    const addModalOptions = {
      columns: columns.concat(cuxCols),
      loading: fetchModalLoading,
      confirmLoading: addLoading,
      title: intl.get('hiam.authority.model.authorityPurorg.selectPurorg').d('选择采购组织'),
      rowKey: 'dataId',
      queryCode: 'dataCode',
      queryName: 'dataName',
      cuxQueryFileds,
      queryCodeDesc: intl
        .get('hiam.authorityManagement.model.authorityPurorg.dataCode')
        .d('采购组织代码'),
      queryNameDesc: intl
        .get('hiam.authorityManagement.model.authorityPurorg.dataName')
        .d('采购组织名称'),
      dataSource: purorgDataSource,
      pagination: purorgPagination,
      modalVisible: addModalVisible,
      addData: this.addPurorg,
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
                  .get('hiam.authorityManagement.view.button.table.create.purorg')
                  .d('新建采购组织权限')}
              </Button>
              <Button
                style={{ margin: '0 8px 16px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.purorg')
                  .d('删除采购组织权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip.Purorg')
                .d('“加入全部”即将所有采购组织权限自动添加至当前账户，无需再手工添加。')}
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
          columns={columns}
          rowSelection={rowSelection}
          pagination={pagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={this.handleTableChange}
        />
        <AddDataModal {...addModalOptions} />
      </div>
    );
  }
}
