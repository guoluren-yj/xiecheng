/**
 * index - 送货单创建 - 汇总index组件
 * @date: 2018-12-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { uniqBy, pullAllBy, isFunction, omit, isEmpty } from 'lodash';
import moment from 'moment';
import { DATETIME_MIN } from 'utils/constants';
import Search from './Search';
import List from './List';

/**
 * Maintenance - 业务组件 - 送货单创建 - 送货单维护汇总tab内容
 * @extends {Component} - React.Component
 * @reactProps {Array<Object>} [selectedRows=[]] - 选中的行数据
 * @reactProps {Array<Object>} [asnTypeCode=[]] - 送货单类型值集code
 * @reactProps {Object} [processing={}] - dispatch处理状态
 * @reactProps {boolean} [isDefaultActived=false] - 是否是默认活动tab标示 isActived
 * @reactProps {boolean} [isActived=false] - 是否是活动tab标示
 * @reactProps {function} [onRef= (e => e)] - 获取this的回调函数
 * @reactProps {function} [fetchList= (e => e)] 获取列表数据方法
 * @reactProps {function} [onListRowSelectChange= (e => e)] - 表格onRowSelectChange事件
 * @reactProps {function} [redirectDetail= (e => e)] 重定向至详情页方法
 * @reactProps {function} [fetchOperationRecord= (e => e)] 获取操作记录数据方法
 * @return React.element
 */
export default class Maintenance extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      dataSource: [], // 列表数据源
      pagination: {}, // 列表分页
    };
    // 方法注册
    ['onListRowSelect', 'onListRowSelectAll', 'handleFetchList'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentDidMount 生命周期函数
   * 若isDefaultActived是否是默认活动tab标示为true或isActived是否是当前活动tab标示为true则获取列表数据
   */
  componentDidMount() {
    const {
      isDefaultActived,
      isActived,
      onRef = (e) => e,
      maintenanceQueryParamsCache,
      backFlag,
      searchListParams,
    } = this.props;
    const { searchParams = {} } = searchListParams;

    onRef(this);
    const { getFieldsValue = (e) => e } = ((this.search || {}).props || {}).form || {};
    const newMaintenanceQueryParamsCache = {
      ...searchParams,
      ...maintenanceQueryParamsCache,
      creationDateFrom: maintenanceQueryParamsCache.creationDateFrom
        ? moment(maintenanceQueryParamsCache.creationDateFrom).format(DATETIME_MIN)
        : undefined,
      creationDateTo: maintenanceQueryParamsCache.creationDateTo
        ? moment(maintenanceQueryParamsCache.creationDateTo).format(DATETIME_MIN)
        : undefined,
    };
    const params = getFieldsValue() || {};
    if (isDefaultActived || isActived) {
      this.handleFetchList(
        backFlag
          ? newMaintenanceQueryParamsCache
          : {
              ...params,
              ...searchParams,
              creationDateFrom: params.creationDateFrom
                ? moment(params.creationDateFrom).format(DATETIME_MIN)
                : undefined,
              creationDateTo: params.creationDateTo
                ? moment(params.creationDateTo).format(DATETIME_MIN)
                : undefined,
            }
      );
    }
  }

  /**
   * getSnapshotBeforeUpdate 生命周期函数
   * 若isActived是否是当前活动tab标示为true则获取列表数据
   */
  getSnapshotBeforeUpdate() {
    const { backFlag, maintenanceQueryParamsCache = {}, searchListParams = {} } = this.props;
    const { searchParams = {} } = searchListParams;
    const { setFieldsValue } = ((this.search || {}).props || {}).form || {};
    if (!isEmpty(searchParams)) {
      for (const [key, val] of Object.entries(searchParams)) {
        setFieldsValue({ [key]: val });
      }
    }
    if (isFunction(setFieldsValue)) {
      setFieldsValue(backFlag ? omit(maintenanceQueryParamsCache, ['page']) : {});
    }
    // return isActived && isActived !== prevProps.isActived;
  }

  /**
   * componentDidUpdate 生命周期函数
   * 若isActived(snapshot)是否是当前活动tab标示为true则获取列表数据
   */
  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (snapshot) {
  //     this.handleFetchList();
  //   }
  // }

  /**
   * handleFetchList - 查询列表行数据
   * @param {object} params - 查询条件
   */
  handleFetchList(params = {}) {
    const { fetchList = (e) => e } = this.props;
    const newParams = {
      ...params,
      customizeUnitCode:
        'SINV.DELIVERY_CREATION.LIST_BY_MAINTAIN,SINV.DELIVERY_CREATION.FILTER_BY_MAINTAIN',
    };
    fetchList(newParams, ({ dataSource, pagination }) => {
      this.setState({
        dataSource,
        pagination,
      });
    });
  }

  /**
   * onTableChange - 列表分页切换函数
   * @param {object} page - 分页数据
   */
  onTableChange(page = {}) {
    const { setQueryParamsCache = (e) => e } = this.props;
    const { getFieldsValue = (e) => e } = ((this.search || {}).props || {}).form || {};
    setQueryParamsCache({ page });
    const params = getFieldsValue() || {};
    this.handleFetchList({
      page,
      ...params,
      creationDateFrom: params.creationDateFrom
        ? moment(params.creationDateFrom).format(DATETIME_MIN)
        : undefined,
      creationDateTo: params.creationDateTo
        ? moment(params.creationDateTo).format(DATETIME_MIN)
        : undefined,
    });
  }

  /**
   * onListRowSelect - 列表单行选择函数
   * @param {object} record - 选中行数据
   * @param {object} selected - 行数据是否选中
   */
  onListRowSelect(record, selected) {
    const { onListRowSelectChange = (e) => e, selectedRows = [] } = this.props;
    onListRowSelectChange(
      selected
        ? uniqBy(selectedRows.concat(record), 'asnHeaderId')
        : selectedRows.filter((o) => o.asnHeaderId !== record.asnHeaderId)
    );
  }

  /**
   * onListRowSelect - 列表单全行选择函数
   * @param {object} changeRows - 变化的行数据
   * @param {object} selected - 行数据是否选中
   */
  onListRowSelectAll(selected, defaultSelectedRows, changeRows) {
    const { onListRowSelectChange = (e) => e, selectedRows = [] } = this.props;
    onListRowSelectChange(
      selected
        ? uniqBy(selectedRows.concat(changeRows), 'asnHeaderId')
        : pullAllBy([...selectedRows], changeRows, 'asnHeaderId')
    );
  }

  render() {
    const {
      customizeTable,
      customizeFilterForm,
      selectedRows = [],
      processing = {},
      asnTypeCode = [],
      redirectDetail = (e) => e,
      fetchOperationRecord = (e) => e,
      setQueryParamsCache = (e) => e,
      clearQueryParamsCache = (e) => e,
      isRowCollapsedCache,
      resetFetchListParamsChange,
    } = this.props;
    const { dataSource = [], pagination = {} } = this.state;
    const searchProps = {
      customizeFilterForm,
      asnTypeCode,
      resetFetchListParamsChange,
      setQueryParamsCache,
      clearQueryParamsCache,
      isRowCollapsedCache,
      wrappedComponentRef: (node) => {
        this.search = node;
      },
      fetchList: this.handleFetchList,
    };

    const listProps = {
      customizeTable,
      ref: (node) => {
        this.list = node;
      },
      processing: {
        queryList:
          processing.queryMaintenanceListLoading ||
          processing.batchDeleteDeliveryLoading ||
          processing.batchSubmitDeliveryLoading,
      },
      onChange: this.onTableChange.bind(this),
      pagination,
      dataSource,
      rowSelection: {
        selectedRowKeys: selectedRows.map((n) => n.asnHeaderId),
        onSelect: this.onListRowSelect,
        onSelectAll: this.onListRowSelectAll,
        onChange: this.handleOnListRowSelectChange,
      },
      fetchOperationRecord,
      redirectDetail,
    };
    return (
      <Fragment>
        <Search {...searchProps} />
        <List {...listProps} />
      </Fragment>
    );
  }
}
