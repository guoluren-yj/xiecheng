/**
 * MaintainIndex -非寄销开票申请维护查询界面
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { withRouter } from 'react-router';

import { getCurrentOrganizationId, filterNullValueObject, getDateFormat } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import FilterForm from './FilterForm';
import TableList from './TableList';

@withRouter
export default class NoConsignmentIndex extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      format: getDateFormat(),
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const { nonRef } = this.props;
    if (nonRef) {
      nonRef(this);
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
      type: 'bill/fetchFilterBillStatus',
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  fetchMaintainConsigBill(params = {}) {
    const { dispatch } = this.props;
    const filedValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { creationDateFrom, creationDateTo, organizationId } = filedValues;
    dispatch({
      type: 'bill/fetchMaintainConsigBill',
      payload: {
        // supplierTenantId: organizationId,
        page: isEmpty(params) ? {} : params,
        ...filedValues,
        purOrganizationId: organizationId,
        creationDateFrom: creationDateFrom ? creationDateFrom.format(DATETIME_MIN) : undefined,
        creationDateTo: creationDateTo ? creationDateTo.format(DATETIME_MAX) : undefined,
      },
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const { handleGetSelect } = this.props;
    if (handleGetSelect) handleGetSelect(selectedRowKeys, selectedRows);
    this.setState({
      selectedRowKeys,
    });
  }

  render() {
    const {
      loading,
      bill: {
        maintainConsigDataSource = {},
        maintainConsigPagination = {},
        code: { BillFiterStatus = [] },
      },
    } = this.props;
    const { format, organizationId, selectedRowKeys } = this.state;
    const filterForm = {
      format,
      BillFiterStatus,
      organizationId,
      onFetchConsigBill: this.fetchMaintainConsigBill,
    };
    const tableParams = {
      loading,
      maintainConsigDataSource,
      maintainConsigPagination,
      onFetchConsigBill: this.fetchMaintainConsigBill,
      rowSelection: {
        selectedRowKeys,
        onChange: this.onSelectChange,
      },
    };
    return (
      <React.Fragment>
        <FilterForm {...filterForm} onRef={this.handleRef} />
        <TableList {...tableParams} />
      </React.Fragment>
    );
  }
}
