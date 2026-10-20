/**
 * MaintainIndex -非寄销开票单销售账单汇总查询
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { withRouter } from 'react-router';

import { filterNullValueObject, getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import FilterForm from './FilterForm';
import TableList from './TableList';

@withRouter
export default class NonPerformanceIndex extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      format: getDateFormat(),
    };
  }

  componentDidMount() {
    const { onNonRef } = this.props;
    if (onNonRef) {
      onNonRef(this);
    }
    this.fetchBillStatus();
  }

  /**
   * 获取申请单状态值级
   */
  @Bind()
  fetchBillStatus() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/fetchBillStatus',
    });
  }

  /**
   *
   * @param {*} ref
   */
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  fetchSupplierBill(params = {}) {
    const { dispatch, onSetQueryValue } = this.props;
    const { organizationId } = this.state;
    const filedValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { creationDateFrom, creationDateTo, approvedDateFrom, approvedDateTo } = filedValues;
    const searchData = {
      organizationId,

      page: isEmpty(params) ? {} : params,
      ...filedValues,
      creationDateFrom: creationDateFrom ? creationDateFrom.format(DATETIME_MIN) : undefined,
      creationDateTo: creationDateTo ? creationDateTo.format(DATETIME_MAX) : undefined,
      approvedDateFrom: approvedDateFrom ? approvedDateFrom.format(DATETIME_MIN) : undefined,
      approvedDateTo: approvedDateTo ? approvedDateTo.format(DATETIME_MAX) : undefined,
    };
    if (onSetQueryValue) {
      onSetQueryValue(searchData);
    }
    dispatch({
      type: 'bill/fetchSupplierBill',
      payload: searchData,
    });
  }

  render() {
    const {
      loading,
      currentUser: { id },
      bill: {
        supplierDataSource = {},
        supplierPagination = {},
        code: { BillStatus = [] },
      },
      rowSelection,
      onClearQueryValue,
    } = this.props;
    const { format } = this.state;
    const listParams = {
      format,
      BillStatus,
      onFetchSupplierBill: this.fetchSupplierBill,
      onRef: this.handleRef,
      onHandleFormReset: onClearQueryValue,
    };
    const tableList = {
      id,
      loading,
      supplierDataSource,
      supplierPagination,
      onFetchSupplierBill: this.fetchSupplierBill,
      rowSelection,
    };
    return (
      <React.Fragment>
        <FilterForm {...listParams} />
        <TableList {...tableList} />
      </React.Fragment>
    );
  }
}
