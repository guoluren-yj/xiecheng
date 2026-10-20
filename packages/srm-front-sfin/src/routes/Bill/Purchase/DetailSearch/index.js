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
  fetchListLoading: loading.effects['bill/fetchDetailSearch'],
  tenantId: getCurrentOrganizationId(),
}))
export default class DetailSearch extends Component {
  componentDidMount() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'bill/fetchEnumMap',
      payload: { tenantId },
    });
    this.fetchList();
  }

  @Bind()
  getFormValues() {
    const { onSetDetailValue } = this.props;
    const formValues = this.form ? this.form.getFieldsValue() : {};
    const { trxDateFrom, trxDateTo, purchaseAgentIds, purOrganizationIds } = formValues;
    const data = filterNullValueObject({
      ...formValues,
      trxDateFrom: trxDateFrom ? trxDateFrom.format(DATETIME_MIN) : null,
      trxDateTo: trxDateTo ? trxDateTo.format(DATETIME_MAX) : null,
      purchaseAgentIds: purchaseAgentIds ? purchaseAgentIds.split(',') : null,
      purOrganizationIds: purOrganizationIds ? purOrganizationIds.split(',') : null,
    });
    if (onSetDetailValue) {
      onSetDetailValue(data);
    }
    return data;
  }

  @Bind()
  fetchList(page = {}) {
    const { dispatch, tenantId } = this.props;

    if (this.form) {
      const searchCondition = this.getFormValues();
      this.form.validateFields((err) => {
        if (!err) {
          dispatch({
            type: 'bill/fetchDetailSearch',
            payload: {
              page,
              tenantId,
              ...searchCondition,
              customizeUnitCode:
                'SFIN.BILL_PURCHASE_LIST.DETAIL_FILTER,SFIN.BILL_PURCHASE_LIST.DETAIL_GRID',
            },
          });
        }
      });
    }
  }

  render() {
    const { bill, fetchListLoading, rowSelection } = this.props;
    const { detailList = [], detailPage = {}, enumMap = {} } = bill;
    const fiterProps = {
      enumMap,
      onRef: (node) => {
        this.form = node;
      },
      onSearch: this.fetchList,
    };
    const listProps = {
      rowSelection,
      dataSource: detailList,
      loading: fetchListLoading,
      pagination: detailPage,
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
