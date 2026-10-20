/**
 * index - 送货单创建 - 汇总index组件
 * @date: 2018-12-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { uniqBy, pullAllBy, isFunction, isEmpty } from 'lodash';
import moment from 'moment';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
// import withCustomize from 'srm-front-cuz';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';
import Search from './Search';
import List from './List';
// import ListTable from './ListTable';
/**
 * getPastHalfYear - 获取当前时间半年前时间
 * @param {!object} currentDate - 当前日期 - moment对象类型
 */
function getPastHalfYear(currentDate = moment()) {
  const currentDateTime = isFunction(currentDate.valueOf) ? currentDate.valueOf() : null;
  if (!currentDateTime) {
    return;
  }
  // 将半年的时间单位换算成毫秒
  const halfYear = ((currentDate.isLeapYear() ? 366 : 365) / 2) * 24 * 3600 * 1000;
  const pastResult = currentDateTime - halfYear; // 半年前的时间（毫秒单位）
  return moment(pastResult);
}
/**
 * Creation - 业务组件 - 送货单创建 - 送货单创建汇总tab内容
 * @extends {Component} - React.Component
 * @reactProps {Array<Object>} [selectedRows=[]] - 选中的行数据
 * @reactProps {Array<Object>} [flagCode=[]] - 是否值集code
 * @reactProps {Object} [processing={}] - dispatch处理状态
 * @reactProps {boolean} [isDefaultActived=false] - 是否是默认活动tab标示 isActived
 * @reactProps {boolean} [isActived=false] - 是否是当前活动tab标示
 * @reactProps {function} [onRef= (e => e)] - 获取this的回调函数
 * @reactProps {function} [fetchList= (e => e)] 获取列表数据方法
 * @reactProps {function} [onListRowSelectChange= (e => e)] - 表格onRowSelectChange事件
 * @return React.element
 */
@formatterCollections({
  code: [
    'sinv.deliveryCancelled',
    'entity.supplier',
    'entity.customer',
    'entity.roles',
    'entity.organization',
    'sinv.receiptExecution',
  ],
})
@connect(({ deliveryCreation = {}, loading = {} }) => ({
  deliveryCreation,
  fetchSettingsLoading: loading.effects['deliveryCreation/fetchSettings'],
}))
export default class Creation extends Component {
  constructor(props) {
    // 调用父类的构造函数
    super(props);
    // 如果props中有onRef方法，则调用该方法，并将this作为参数传入
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    // 初始化state
    this.state = {};
    // 方法注册
    ['onListRowSelect', 'onListRowSelectAll', 'handleFetchList', 'updateSelectedRows'].forEach(
      (method) => {
        // 将方法绑定到this上
        this[method] = this[method].bind(this);
      }
    );
  }

  /**
   * componentDidMount 生命周期函数
   * 若isDefaultActived是否是默认活动tab标示为true则获取列表数据
   */
  componentDidMount() {
    const { onRef = (e) => e } = this.props;
    onRef(this);
  }

  // 查询配置
  @Bind()
  handleSearch() {
    const { ruleData } = this.props;
    if (!isEmpty(ruleData)) {
      const { rcvFlag, planDataFlag, planFlag } = ruleData;
      const { getFieldsValue = () => {} } = ((this.search || {}).props || {}).form || {};
      const params = getFieldsValue();
      const {
        needByDateStart,
        needByDateEnd,
        promiseDeliveryDateStart,
        promiseDeliveryDateEnd,
      } = params;
      this.handleFetchList({
        ...params,
        needByDateStart: needByDateStart ? moment(needByDateStart).format(DATETIME_MIN) : undefined,
        needByDateEnd: needByDateEnd ? moment(needByDateEnd).format(DATETIME_MIN) : undefined,
        promiseDeliveryDateStart: promiseDeliveryDateStart
          ? moment(promiseDeliveryDateStart).format(DATETIME_MIN)
          : undefined,
        promiseDeliveryDateEnd: promiseDeliveryDateEnd
          ? moment(promiseDeliveryDateEnd).format(DATETIME_MIN)
          : undefined,
        planFlag: params.planFlag
          ? params.planFlag
          : (rcvFlag && planDataFlag) || planFlag
          ? 1
          : null,
      });
    }
  }

  /**
   * handleFetchList - 查询列表行数据
   * @param {object} params - 查询条件
   */
  handleFetchList(params = {}) {
    const { fetchList = (e) => e, fetchImportConfig, searchListParams } = this.props;
    const { planFlag: planFlagCux } = searchListParams;
    const { planFlag } = params;
    const newParams = {
      ...params,
      planFlag: planFlagCux || planFlag,
      customizeUnitCode: +planFlag
        ? 'SINV.DELIVERY_CREATION.LIST_BY_PLAN,SINV.DELIVERY_CREATION.FILTER'
        : 'SINV.DELIVERY_CREATION.LIST,SINV.DELIVERY_CREATION.FILTER',
    };
    fetchList(newParams, ({ dataSource }) => {
      fetchImportConfig();
      if (planFlag === '1') {
        this.updateSelectedRowsTable(dataSource);
      } else {
        this.updateSelectedRows(dataSource);
      }
    });
  }

  /**
   * 从新查询到的数组去更新选中行
   * @param {*} dataSource
   */
  updateSelectedRows(dataSource) {
    const { onListRowSelectChange = (e) => e, selectedRows = [] } = this.props;
    const dataRowKeys = dataSource.map((i) => i.poLineLocationId);
    const newSelectedRows = selectedRows.map((item) => {
      if (dataRowKeys.includes(item.poLineLocationId)) {
        return dataSource.find((i) => i.poLineLocationId === item.poLineLocationId);
      }
      return item;
    });
    onListRowSelectChange(newSelectedRows);
  }

  /**
   * 从新查询到的数组去更新选中行
   * @param {*} dataSource
   */
  updateSelectedRowsTable(dataSource) {
    const { onListRowSelectChange = (e) => e, selectedRows = [] } = this.props;
    const dataRowKeys = dataSource.map((i) => i.planId);
    const newSelectedRows = selectedRows.map((item) => {
      if (dataRowKeys.includes(item.planId)) {
        return dataSource.find((i) => i.planId === item.planId);
      }
      return item;
    });
    onListRowSelectChange(newSelectedRows);
  }

  /**
   * onTableChange - 列表分页切换函数
   * @param {object} page - 分页数据
   */
  onTableChange(page = {}, _, sorter) {
    const { setQueryParamsCache = (e) => e } = this.props;
    const { getFieldsValue = (e) => e } = ((this.search || {}).props || {}).form || {};
    setQueryParamsCache({ page });
    const params = getFieldsValue() || {};
    const {
      needByDateStart,
      needByDateEnd,
      promiseDeliveryDateStart,
      promiseDeliveryDateEnd,
    } = params;
    this.handleFetchList({
      page,
      ...params,
      // planFlag: 'HPFM.FLAG',
      needByDateStart: needByDateStart ? moment(needByDateStart).format(DATETIME_MIN) : null,
      needByDateEnd: needByDateEnd ? moment(needByDateEnd).format(DATETIME_MIN) : null,
      promiseDeliveryDateStart: promiseDeliveryDateStart
        ? moment(promiseDeliveryDateStart).format(DATETIME_MIN)
        : null,
      promiseDeliveryDateEnd: promiseDeliveryDateEnd
        ? moment(promiseDeliveryDateEnd).format(DATETIME_MIN)
        : null,
      sort: sorter,
    });
  }

  /**
   * onListRowSelect - 列表单行选择函数
   * @param {object} record - 选中行数据
   * @param {object} selected - 行数据是否选中
   */
  onListRowSelect(record, selected) {
    const { onListRowSelectChange = (e) => e, selectedRows = [], planFlag } = this.props;
    onListRowSelectChange(
      selected
        ? uniqBy(selectedRows.concat(record), planFlag === '1' ? 'planId' : 'poLineLocationId')
        : planFlag === '1'
        ? selectedRows.filter((o) => o.planId !== record.planId)
        : selectedRows.filter((o) => o.poLineLocationId !== record.poLineLocationId)
    );
  }

  /**
   * onListRowSelect - 列表单全行选择函数
   * @param {object} changeRows - 变化的行数据
   * @param {object} selected - 行数据是否选中
   */
  onListRowSelectAll(selected, defaultSelectedRows, changeRows) {
    const { onListRowSelectChange = (e) => e, selectedRows = [], planFlag } = this.props;
    const newSelectedRows = selected
      ? uniqBy(selectedRows.concat(changeRows), planFlag === '1' ? 'planId' : 'poLineLocationId')
      : pullAllBy([...selectedRows], changeRows, planFlag === '1' ? 'planId' : 'poLineLocationId');
    onListRowSelectChange(newSelectedRows);
  }

  render() {
    const {
      settings,
      ruleData,
      planList, // TODO
      selectedRows = [],
      processing = {},
      flagCode = [],
      orderSource = [],
      planFlag = [],
      customizeTable,
      customizeFilterForm,
      fetchSettingsLoading,
      dataSource = [],
      pagination = {},
      searchListParams = {},
    } = this.props;
    const formProps = {
      ruleData,
      settings,
      planList,
      searchListParams,
      customizeFilterForm,
      wrappedComponentRef: (node) => {
        this.search = node;
      },
      fetchList: this.handleFetchList,
      getPastHalfYear,
      flagCode,
      orderSource,
      planFlag,
    };
    const listProps = {
      planFlag,
      pagination,
      dataSource,
      customizeTable,
      ref: (node) => {
        this.list = node;
      },
      selectedRows,
      loading:
        processing.queryCreateListLoading ||
        processing.batchCreateDeliveryLoading ||
        processing.fetchBusinessRuleLoading ||
        fetchSettingsLoading,
      onChange: this.onTableChange.bind(this),
      rowSelection: {
        selectedRowKeys:
          planFlag === '1'
            ? selectedRows.map((n) => n.planId)
            : selectedRows.map((n) => n.poLineLocationId),
        onSelect: this.onListRowSelect,
        onSelectAll: this.onListRowSelectAll,
        onChange: this.handleOnListRowSelectChange,
      },
    };
    return (
      <Fragment>
        <Search {...formProps} />
        <List {...listProps} />
      </Fragment>
    );
  }
}
