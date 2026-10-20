/**
 * 维护开票通知
 * @date: 2019-10-17
 * @author ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
// import { Button } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
// import ExcelExport from 'components/ExcelExport';
import { getCurrentOrganizationId, filterNullValueObject, getDateFormat } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PermissionButton } from 'components/Permission';
import notification from 'utils/notification';

import FilterForm from './FilterForm';
import TableList from './TableList';

// const promptCode = 'sfin.invoiceBill';

const unitCustomizeCodes = {
  FILTER: 'SFIN.MAINTAIN_INVOICE_NOTIFICATION_LIST.FILTER',
  LIST: 'SFIN.MAINTAIN_INVOICE_NOTIFICATION_LIST.GRID',
};

@withCustomize({
  unitCode: Object.values(unitCustomizeCodes),
})
@formatterCollections({
  code: ['sfin.invoiceBill', 'sfin.payableInvoice'],
})
@connect(({ bill, loading }) => ({
  noConsignMent: {
    bill,
    loading:
      loading.effects['bill/fetchMaintainNotificationList'] ||
      loading.effects['bill/invoiceNotificationBatchSubmit'],
  },
}))
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      format: getDateFormat(),
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.fetchBillStatus();
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const thisForm = this.filterForm;
    const formValues = isUndefined(thisForm)
      ? {}
      : filterNullValueObject(thisForm.getFieldsValue());
    const filterValues = {
      ...formValues,
      trxDateFrom:
        formValues.trxDateFrom && moment(formValues.trxDateFrom).format('YYYY-MM-DD 00:00:00'),
      trxDateTo: formValues.trxDateTo && moment(formValues.trxDateTo).format('YYYY-MM-DD 00:00:00'),
    };
    return filterValues;
  }

  /**
   * 批量查询值集
   */
  @Bind()
  fetchBillStatus() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/queryMapValueCode',
      payload: {
        BillStatus: 'SFIN.BILL_STATUS', // 状态
      },
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
      type: 'bill/fetchMaintainNotificationList',
      payload: {
        // supplierTenantId: organizationId,
        page: isEmpty(params) ? {} : params,
        ...filedValues,
        purOrganizationId: organizationId,
        creationDateFrom: creationDateFrom ? creationDateFrom.format(DATETIME_MIN) : undefined,
        creationDateTo: creationDateTo ? creationDateTo.format(DATETIME_MAX) : undefined,
        customizeUnitCode: Object.values(unitCustomizeCodes).join(),
      },
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  @Bind()
  handleSubmit() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'bill/invoiceNotificationBatchSubmit',
      payload: selectedRows.map((item) => {
        return {
          billHeader: item,
          batchSubmitFlag: 1,
        };
      }),
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchMaintainConsigBill();
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      }
    });
  }

  render() {
    const { noConsignMent = {}, customizeFilterForm, customizeTable } = this.props;
    const {
      loading,
      bill: {
        maintainConsigDataSource = {},
        maintainConsigPagination = {},
        code: { BillStatus = [] },
      },
    } = noConsignMent;
    const { format, organizationId, selectedRowKeys } = this.state;
    const filterForm = {
      customizeFilterForm,
      code: unitCustomizeCodes.FILTER,
      format,
      BillStatus,
      organizationId,
      onFetchConsigBill: this.fetchMaintainConsigBill,
    };
    const tableParams = {
      customizeTable,
      code: unitCustomizeCodes.LIST,
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
        <Header
          title={intl
            .get('sfin.invoiceBill.view.message.maintainBillNotification')
            .d('维护开票通知')}
        >
          <PermissionButton
            icon="check"
            name="submit"
            type="primary"
            disabled={isEmpty(selectedRowKeys)}
            onClick={() => this.handleSubmit()}
            permissionList={[
              {
                code: `srm.finance.purchase-bill.inform-update.button.batchSubmit`,
                type: 'button',
              },
            ]}
            loading={loading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </PermissionButton>
        </Header>
        <Content>
          <FilterForm {...filterForm} onRef={this.handleRef} />
          <TableList {...tableParams} />
        </Content>
      </React.Fragment>
    );
  }
}
