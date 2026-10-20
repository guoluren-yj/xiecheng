/**
 * Company - 配置中心-收货单审批规则-公司定义列表tab
 * @date: 2020-6-2
 * @author: JingChen <jing.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button, Form, Input, Table, Switch } from 'hzero-ui';

import notification from 'utils/notification';
import { tableScrollWidth, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import AddDataModal from './AddDataModal';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();

@connect(({ deliveryCompanySupplier, configServer, loading }) => ({
  deliveryCompanySupplier,
  configServer,
  fetchLoading: loading.effects['deliveryCompanySupplier/fetchCompaynyData'],
}))
@Form.create({ fieldNameProp: null })
export default class Company extends PureComponent {
  companyRef;

  /**
   *Creates an instance of Company.
   * @param {Object} props 属性
   * @memberof Company
   */
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      addCompanyModalVisible: false,
      companyIncludeAllFlagState: '',
    };
  }

  componentDidMount() {
    this.queryValue();
  }

  /**
   *查询数据
   */
  @Bind()
  queryValue(pagination = {}) {
    const { dispatch, configHeaderId, form } = this.props;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'deliveryCompanySupplier/fetchCompaynyData',
      payload: {
        ...formValues,
        ...pagination,
        configHeaderId,
        configType: 'COMPANY',
      },
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   *表格选中事件
   *
   * @param {*} _ 占位
   * @param {*Array} rows 选中行数据
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    const selectedRowKeys = selectedRows.map((i) => i.configLineId);
    this.setState({ selectedRows, selectedRowKeys });
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
          label={intl.get('hiam.authorityManagement.model.authorityCompany.name').d('名称')}
        >
          {getFieldDecorator('companyName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityCompany.dataCode').d('代码')}
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
   * 新增
   */
  @Bind()
  onShowAddModal() {
    this.fetchModalData();
    this.setState({
      addCompanyModalVisible: true,
    });
  }

  /**
   * 删除
   * @param {*} queryData
   */
  @Bind()
  remove() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCompanySupplier/deleteCompanyData',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        this.queryValue();
        notification.success();
      }
    });
  }

  /**
   * 查询弹出框数据
   * @param {Object} queryData 查询数据
   */
  @Bind()
  fetchModalData(queryData = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCompanySupplier/fetchCompanyModalData',
      payload: {
        organizationId,
        ...queryData,
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.companyRef = ref;
  }

  /**
   * 添加数据
   * @param {Aarray} addRows 选择的数据
   */
  @Bind()
  addCompany(addRows) {
    const { configHeaderId, dispatch } = this.props;
    const param = addRows.map((item) => {
      return {
        companyCode: item.companyNum,
        companyId: item.companyId,
        companyName: item.companyName,
        configHeaderId,
        configType: 'COMPANY',
        tenantId: organizationId,
      };
    });
    dispatch({
      type: 'deliveryCompanySupplier/saveCompanyModalData',
      payload: param,
    }).then((res) => {
      if (res) {
        this.onHideAddModal();
        this.queryValue();
        notification.success();
      }
    });
  }

  /**
   * 隐藏弹出框
   */
  @Bind()
  onHideAddModal() {
    // this.supplierRef.state.addRows = [];
    this.setState({
      addCompanyModalVisible: false,
    });
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {*Boolean} checked switch的value值
   */
  @Bind()
  allFlagChanged(checked) {
    this.setState({ companyIncludeAllFlagState: checked });
    const { includeAllFlag, configHeaderId } = this.props;
    if (includeAllFlag) {
      includeAllFlag(checked, configHeaderId, 'COMPANY');
    }
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
   *渲染方法
   *
   * @returns
   */
  render() {
    const {
      fetchLoading = false,
      companyIncludeAllFlag = '',
      allSelectLoading,
      deliveryCompanySupplier: {
        companyData = [],
        companyDataPagination = {},
        companyModalData = [],
        companyModalDataPagination = {},
      } = {},
    } = this.props;
    const { selectedRows, selectedRowKeys, companyIncludeAllFlagState } = this.state;
    const newCompanyData =
      companyIncludeAllFlag === 1 || companyIncludeAllFlagState ? [] : companyData;
    const newCompanyDataPagination =
      companyIncludeAllFlag === 1 || companyIncludeAllFlagState ? {} : companyDataPagination;
    const columns = [
      {
        title: intl.get('sfin.common.model.common.companyName').d('公司名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('sslm.common.model.companyId').d('公司代码'),
        dataIndex: 'companyNum',
        width: 300,
      },
    ];
    const { addCompanyModalVisible } = this.state;
    const addCompanyModalOptions = {
      columns,
      // loading: fetchModalLoading,
      // confirmLoading: addLoading,
      allSelectLoading,
      title: intl.get('hiam.authorityManagement.view.title.modal.company').d('选择公司'),
      rowKey: 'companyId',
      queryCode: 'companyNum',
      queryName: 'companyName',
      queryCodeDesc: intl.get('sslm.common.model.companyId').d('公司代码'),
      queryNameDesc: intl.get('sfin.common.model.common.companyName').d('公司名称'),
      dataSource: companyModalData,
      pagination: companyModalDataPagination,
      modalVisible: addCompanyModalVisible,
      addData: this.addCompany,
      onHideAddModal: this.onHideAddModal,
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
    };
    const companyColumns = [
      {
        title: intl.get('sslm.sample.model.company').d('公司'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityCompany.dataCode').d('代码'),
        dataIndex: 'companyCode',
        width: 400,
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <div style={{ textAlign: 'right' }}>
          <React.Fragment>
            <Button
              style={{ margin: '0 8px 16px 0' }}
              onClick={this.onShowAddModal}
              disabled={companyIncludeAllFlag === 1 || companyIncludeAllFlagState}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              style={{ margin: '0 8px 16px 0' }}
              disabled={selectedRows.length <= 0}
              onClick={() => this.remove()}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </React.Fragment>
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Switch defaultChecked={companyIncludeAllFlag === 1} onChange={this.allFlagChanged} />
          </div>
        </div>
        <Table
          bordered
          rowKey="configLineId"
          pagination={newCompanyDataPagination}
          loading={fetchLoading || allSelectLoading}
          dataSource={newCompanyData}
          rowSelection={rowSelection}
          columns={companyColumns}
          scroll={{ x: tableScrollWidth(companyColumns) }}
          onChange={this.handleTableChange}
        />
        <AddDataModal {...addCompanyModalOptions} />
      </div>
    );
  }
}
