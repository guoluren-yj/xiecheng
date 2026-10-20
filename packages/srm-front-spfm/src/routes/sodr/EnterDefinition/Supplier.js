/**
 * Supplier - 租户级权限维护tab页 - 供应商
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Form, Input, Button, Switch } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import AddDataModal from './AddDataModal';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();

/**
 * 租户级权限管理 - 供应商
 * @extends {Component} - React.Component
 * @reactProps {Object} authoritySupplier - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ deliveryCompanySupplier, configServer, loading }) => ({
  deliveryCompanySupplier,
  configServer,
  fetchLoading: loading.effects['deliveryCompanySupplier/fetchCompaynyData'],
  fetchModalLoading: loading.effects['deliveryCompanySupplier/fetchSupplierModalData'],
}))
@Form.create({ fieldNameProp: null })
export default class Supplier extends PureComponent {
  supplierRef;

  /**
   *Creates an instance of Supplier.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      selectRows: [],
      addModalVisible: false,
      supplierIncludeAllFlagState: '',
    };
  }

  componentDidMount() {
    this.queryValue();
  }

  /**
   *查询按钮点击事件
   */
  @Bind()
  queryValue(pageData = {}) {
    const { dispatch, configHeaderId, form } = this.props;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'deliveryCompanySupplier/fetchCompaynyData',
      payload: {
        configHeaderId,
        configType: 'SUPPLIER',
        ...pageData,
        ...formValues,
      },
    });
  }

  /**
   * 添加数据
   * @param {Aarray} addRows 选择的数据
   */
  @Bind()
  addSupplier(addRows) {
    const { configHeaderId, dispatch } = this.props;
    const param = addRows.map(item => {
      return {
        companyCode: item.companyNum,
        companyId: item.companyId,
        companyName: item.companyName,
        configHeaderId,
        configType: 'SUPPLIER',
        tenantId: organizationId,
      };
    });
    dispatch({
      type: 'deliveryCompanySupplier/saveCompanyModalData',
      payload: param,
    }).then(res => {
      if (res) {
        this.onHideAddModal();
        this.queryValue();
        notification.success();
      }
    });
  }

  /**
   *删除方法
   */
  @Bind()
  remove() {
    const { selectRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCompanySupplier/deleteCompanyData',
      payload: selectRows,
    }).then(res => {
      if (res) {
        this.queryValue();
        notification.success();
      }
    });
  }

  /**
   *刷新
   */
  @Bind()
  refresh() {
    this.queryValue();
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
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCompanySupplier/fetchSupplierModalData',
      payload: {
        lovCode: 'SPUC.PLATFORM.SUPPLIER',
        organizationId,
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
    this.supplierRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    this.queryValue({
      page: pagination,
    });
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {*Boolean} checked switch的value值
   */
  @Bind()
  allFlagChanged(checked) {
    this.setState({ supplierIncludeAllFlagState: checked });
    const { includeAllFlag, configHeaderId } = this.props;
    if (includeAllFlag) {
      includeAllFlag(checked, configHeaderId, 'SUPPLIER');
    }
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
            .get('hiam.authorityManagement.model.authoritySupplier.dataName')
            .d('供应商名称')}
        >
          {getFieldDecorator('companyName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authoritySupplier.dataCode')
            .d('供应商代码')}
        >
          {getFieldDecorator('companyCode')(<Input typeCase="upper" trim inputChinese={false} />)}
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
    this.supplierRef = ref;
  }

  /**
   *渲染事件
   *
   * @returns
   */
  render() {
    const {
      allSelectLoading,
      deliveryCompanySupplier: {
        supplierModalData = [],
        supplierModalDataPagination = {},
        companyData = [],
        companyDataPagination = {},
      } = {},
      fetchLoading,
      fetchModalLoading,
      supplierIncludeAllFlag,
    } = this.props;
    const { addModalVisible, selectRows, supplierIncludeAllFlagState } = this.state;
    const newCompanyData =
      supplierIncludeAllFlag === 1 || supplierIncludeAllFlagState ? [] : companyData;
    const newCompanyDataPagination =
      supplierIncludeAllFlag === 1 || supplierIncludeAllFlagState ? {} : companyDataPagination;
    const columns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authoritySupplier.dataName')
          .d('供应商名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authoritySupplier.dataCode')
          .d('供应商代码'),
        dataIndex: 'companyNum',
        width: 300,
      },
    ];
    const supplierColumns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authoritySupplier.dataName')
          .d('供应商名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authoritySupplier.dataCode')
          .d('供应商代码'),
        dataIndex: 'companyCode',
        width: 300,
      },
    ];

    const addModalOptions = {
      columns,
      loading: fetchModalLoading,
      title: intl.get('hiam.authorityManagement.view.title.modal.supplier').d('选择供应商'),
      rowKey: 'companyId',
      queryCode: 'companyNum',
      queryName: 'companyName',
      queryCodeDesc: intl
        .get('hiam.authorityManagement.model.authoritySupplier.dataCode')
        .d('供应商代码'),
      queryNameDesc: intl
        .get('hiam.authorityManagement.model.authoritySupplier.dataName')
        .d('供应商名称'),
      dataSource: supplierModalData,
      pagination: supplierModalDataPagination,
      modalVisible: addModalVisible,
      addData: this.addSupplier,
      onHideAddModal: this.onHideAddModal,
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
    };

    const rowSelection = {
      selectedRowKeys: selectRows.map(n => n.configLineId),
      onChange: this.onSelectChange,
    };

    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <div style={{ textAlign: 'right' }}>
          <React.Fragment>
            <Button
              style={{ margin: '0 8px 16px 0' }}
              onClick={() => this.onShowAddModal()}
              disabled={supplierIncludeAllFlag === 1 || supplierIncludeAllFlagState}
            >
              {intl
                .get('hiam.authorityManagement.view.button.table.create.supplier')
                .d('新建供应商权限')}
            </Button>
            <Button
              style={{ margin: '0 8px 16px 0' }}
              disabled={selectRows.length <= 0}
              onClick={() => this.remove()}
            >
              {intl
                .get('hiam.authorityManagement.view.button.table.delete.supplier')
                .d('删除供应商权限')}
            </Button>
          </React.Fragment>
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Switch defaultChecked={supplierIncludeAllFlag === 1} onChange={this.allFlagChanged} />
          </div>
        </div>
        <EditTable
          bordered
          rowKey="configLineId"
          loading={fetchLoading || allSelectLoading}
          dataSource={newCompanyData}
          rowSelection={rowSelection}
          pagination={newCompanyDataPagination}
          columns={supplierColumns}
          scroll={{ x: tableScrollWidth(supplierColumns) }}
          onChange={this.handleTableChange}
        />
        <AddDataModal {...addModalOptions} />
      </div>
    );
  }
}
