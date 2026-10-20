/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
// import { Button, Drawer } from 'hzero-ui';
// import { isEmpty, isFunction, isNumber } from 'lodash';
// import intl from 'utils/intl';
// import formatterCollections from 'utils/intl/formatterCollections';
// import { getCurrentOrganizationId } from 'utils/utils';
import Search from './Search';
import List from './List';

const defaultTableRowKey = 'supplierCompanyId';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [supplierKpiIndicator={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [batchSubmitDeliveryLoading=false] - 批量提交送货单处理中
 * @reactProps {boolean} [queryOperationRecordLoading=false] - 查询操作记录处理中
 * @reactProps {boolean} [batchDeleteDeliveryLoading=false] - 批量删除处理中
 * @reactProps {boolean} [batchCreateDeliveryLoading=false] - 批量创建处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建数据处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护送货单处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class SupplierKpiIndicator extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
      selectedRows: [],
    };

    // 方法注册
    ['onTableChange', 'handleFetchList', 'onTableRowSelectChange'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.handleFetchList();
  }

  /**
   * handleFetchList - 查询列表数据
   * @param {Array} params - 查询条件
   */
  handleFetchList(params) {
    const { fetchList = e => e } = this.props;
    fetchList(params, res => {
      if (res) {
        const { dataSource, pagination } = res;
        this.setState({
          dataSource,
          pagination,
        });
      }
    });
  }

  /**
   * onTableChange - 表格分页事件
   * @param {Array} page - 分页参数
   */
  onTableChange(page) {
    const {
      form: { getFieldsValue = () => {} },
    } = (this.search || {}).props;
    this.handleFetchList({ page, ...getFieldsValue() });
  }

  /**
   * onTableRowSelectChange - 行选择onChange
   * @param {Array} rest
   */
  onTableRowSelectChange(...rest) {
    const selectedRows = rest[1];
    this.setState({
      selectedRows,
    });
  }

  render() {
    const { loading, lifeCycleStageCode, evaluationTemplateRemote } = this.props;
    const {
      dataSource = [],
      pagination,
      selectedRows,
      currentEnabledOrDisabledRowkey,
    } = this.state;
    // const { code = {} } = supplierKpiIndicatorOrg;
    const searchProps = {
      wrappedComponentRef: node => {
        this.search = node;
      },
      fetchList: this.handleFetchList,
      lifeCycleStageCode,
      evaluationTemplateRemote,
    };

    const listProps = {
      ref: node => {
        this.list = node;
      },
      loading,
      onChange: this.onTableChange,
      pagination,
      dataSource,
      addChildIndicator: this.addChildIndicator,
      openIndicatorDetail: this.openIndicatorDetail,
      formulaConfig: this.openFormula,
      actionRowKey: currentEnabledOrDisabledRowkey,
      enable: this.enableIndicator,
      openIndicationAssign: this.openIndicationAssign,
      rowSelection: {
        selectedRows,
        selectedRowKeys: selectedRows.map(o => o[defaultTableRowKey]),
        onChange: this.onTableRowSelectChange,
      },
      defaultTableRowKey,
      evaluationTemplateRemote,
    };

    return (
      <Fragment>
        <Search {...searchProps} />
        <br />
        <List {...listProps} />
      </Fragment>
    );
  }
}
