/**
 * DetailSearch - FilterForm
 * @date: 2020-8-13
 * @author JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Fragment, Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

@formatterCollections({
  code: [
    'hzero.common',
    'entity.item',
    'entity.company',
    'entity.supplier',
    'entity.business',
    'sfin.invoiceBill',
  ],
})
@connect(({ bill, loading }) => ({
  bill,
  fetchListLoading: loading.effects['bill/fetchSalesDetailSearch'],
  tenantId: getCurrentOrganizationId(),
}))
export default class DetailSearch extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'bill/fetchEnumMap',
      payload: { tenantId },
    });
    this.fetchList();
  }

  @Bind()
  bindForm(form) {
    this.form = form;
  }

  @Bind()
  getFormValues() {
    const formValues = this.form ? this.form.getFieldsValue() : {};
    const { trxDateFrom, trxDateTo, purchaseAgentIds, purOrganizationIds } = formValues;
    return filterNullValueObject({
      ...formValues,
      trxDateFrom: trxDateFrom ? trxDateFrom.format(DATETIME_MIN) : null,
      trxDateTo: trxDateTo ? trxDateTo.format(DATETIME_MAX) : null,
      purchaseAgentIds: purchaseAgentIds ? purchaseAgentIds.split(',') : null,
      purOrganizationIds: purOrganizationIds ? purOrganizationIds.split(',') : null,
    });
  }

  @Bind()
  fetchList(page = {}) {
    const { dispatch, tenantId } = this.props;
    const searchCondition = this.getFormValues();
    dispatch({
      type: 'bill/fetchSalesDetailSearch',
      payload: {
        page,
        tenantId,
        customizeUnitCode: 'SFIN.BILL_SALE_LIST.DETAIL_FILTER,SFIN.BILL_SALE_LIST.DETAIL_GRID',
        ...searchCondition,
      },
    });
  }

  render() {
    const { bill, fetchListLoading, rowSelection } = this.props;
    const { salesDetailList = [], salesDetailPage = {}, enumMap = {} } = bill;
    const fiterProps = {
      enumMap,
      bindForm: this.bindForm,
      onSearch: this.fetchList,
    };
    const listProps = {
      rowSelection,
      dataSource: salesDetailList,
      loading: fetchListLoading,
      pagination: salesDetailPage,
      onFetchList: this.fetchList,
    };
    return (
      <Fragment>
        <FilterForm {...fiterProps} />
        <ListTable {...listProps} />
      </Fragment>
    );
  }
}
