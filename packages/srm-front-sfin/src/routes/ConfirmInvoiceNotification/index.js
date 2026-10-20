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
import { Bind, Throttle } from 'lodash-decorators';
import { Button, Modal } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { getCurrentOrganizationId, filterNullValueObject, getDateFormat } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import FilterForm from './FilterForm';
import TableList from './TableList';

const { confirm } = Modal;
// const promptCode = 'sfin.invoiceBill';
const unitCustomizeCodes = {
  FILTER: 'SFIN.CONFIRM_INVOICE_NOTIFICATION_LIST.FILTER',
  LIST: 'SFIN.CONFIRM_INVOICE_NOTIFICATION_LIST.GRID',
};

@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@withCustomize({
  unitCode: Object.values(unitCustomizeCodes),
})
@connect(({ bill, loading }) => ({
  bill,
  loading:
    loading.effects['bill/confirmNotificationBillConfirm'] ||
    loading.effects['bill/confirmBillRejectBill'] ||
    loading.effects['bill/fetchConfirmBill'],
}))
export default class index extends Component {
  noConsignmentRef;

  constructor(props) {
    super(props);
    this.state = {
      changeButton: true,
      queryValue: {},
      organizationId: getCurrentOrganizationId(),
      format: getDateFormat(),
    };
  }

  componentDidMount() {
    this.fetchBillStatus();
    this.fetchMaintainConsigBill();
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
      trxDateFrom: formValues.trxDateFrom && moment(formValues.trxDateFrom).format(DATETIME_MIN),
      trxDateTo: formValues.trxDateTo && moment(formValues.trxDateTo).format(DATETIME_MAX),
    };
    return filterValues;
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
  @Throttle(1000)
  onConfirm() {
    const {
      dispatch,
      bill: { auditRows = [] },
    } = this.props;
    if (auditRows.length <= 0) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    } else {
      confirm({
        title: intl.get(`hzero.common.view.message.title.modal.pass`).d('是否确认通过?'),
        onOk: () => {
          dispatch({
            type: 'bill/confirmValidateBill',
            payload: {
              organizationId: getCurrentOrganizationId(),
              billHeaderList: auditRows,
              customizeUnitCode: Object.values(unitCustomizeCodes).join(),
            },
          }).then((response) => {
            if (response?.validatedCode === 'INFO') {
              confirm({
                title: response.msg,
                // content: '',
                onOk: () => {
                  dispatch({
                    type: 'bill/confirmNotificationBillConfirm',
                    payload: {
                      organizationId: getCurrentOrganizationId(),
                      billHeaderList: auditRows,
                      customizeUnitCode: Object.values(unitCustomizeCodes).join(),
                    },
                  }).then((res) => {
                    if (res) {
                      dispatch({
                        type: 'bill/updateState',
                        payload: { auditRows: [] },
                      });
                      this.fetchMaintainConsigBill();
                      notification.success();
                    }
                  });
                },
              });
            }
            if (response?.validatedCode === 'SUCCESS') {
              dispatch({
                type: 'bill/confirmNotificationBillConfirm',
                payload: {
                  organizationId: getCurrentOrganizationId(),
                  billHeaderList: auditRows,
                  customizeUnitCode: Object.values(unitCustomizeCodes).join(),
                },
              }).then((res) => {
                if (res) {
                  dispatch({
                    type: 'bill/updateState',
                    payload: { auditRows: [] },
                  });
                  this.fetchMaintainConsigBill();
                  notification.success();
                }
              });
            }
            if (response?.validatedCode === 'WIATING_CONFIRM') {
              confirm({
                title: response.msg,
                onOk: () => {
                  dispatch({
                    type: 'bill/confirmNotificationBillConfirm',
                    payload: {
                      organizationId: getCurrentOrganizationId(),
                      billHeaderList: auditRows,
                      customizeUnitCode: Object.values(unitCustomizeCodes).join(),
                    },
                  }).then((res) => {
                    if (res) {
                      dispatch({
                        type: 'bill/updateState',
                        payload: { auditRows: [] },
                      });
                      this.fetchMaintainConsigBill();
                      notification.success();
                    }
                  });
                },
              });
            }
          });
        },
      });
    }
  }

  @Bind()
  onECExport() {
    this.noConsignmentRef.onExport();
  }

  /**
   * 获取TableList的ref
   * @param {object} ref - 组件ref
   */
  @Bind()
  getNCRef(ref = {}) {
    this.noConsignmentRef = ref;
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
    const { submittedDateFrom, submittedDateTo, organizationId } = filedValues;
    dispatch({
      type: 'bill/fetchConfirmBill',
      payload: {
        // supplierTenantId: organizationId,
        page: isEmpty(params) ? {} : params,
        ...filedValues,
        purOrganizationId: organizationId,
        submittedDateFrom: submittedDateFrom ? submittedDateFrom.format(DATETIME_MIN) : undefined,
        submittedDateTo: submittedDateTo ? submittedDateTo.format(DATETIME_MAX) : undefined,
        customizeUnitCode: Object.values(unitCustomizeCodes).join(),
      },
    });
  }

  @Bind()
  @Throttle(1000)
  onGoBack() {
    const {
      dispatch,
      bill: { auditRows = [] },
    } = this.props;
    if (auditRows.length <= 0) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    } else {
      confirm({
        title: intl.get(`hzero.common.view.message.title.modal.detail`).d('是否确认要退回?'),
        onOk: () => {
          dispatch({
            type: 'bill/confirmBillRejectBill',
            payload: {
              organizationId: getCurrentOrganizationId(),
              billHeaderList: auditRows,
              customizeUnitCode: Object.values(unitCustomizeCodes).join(),
            },
          }).then((res) => {
            if (res) {
              dispatch({
                type: 'bill/updateState',
                payload: { auditRows: [] },
              });
              this.fetchMaintainConsigBill();
              notification.success();
            }
          });
        },
      });
    }
  }

  render() {
    const { changeButton, queryValue, format, organizationId } = this.state;
    const {
      bill: {
        auditRows = [],
        maintainConsigDataSource = {},
        maintainConsigPagination = {},
        code: { BillFiterStatus = [] },
        auditNCDataSource = {},
        auditNCPagination = {},
      },
      loading,
      customizeFilterForm,
      customizeTable,
    } = this.props;

    const filterForm = {
      customizeFilterForm,
      code: unitCustomizeCodes.FILTER,
      format,
      BillFiterStatus,
      organizationId,
      onFetchConsigBill: this.fetchMaintainConsigBill,
    };
    const tableParams = {
      customizeTable,
      code: unitCustomizeCodes.LIST,
      onListRef: this.getNCRef,
      maintainConsigDataSource,
      maintainConsigPagination,
      fetchLoading: loading,
      auditRows,
      auditNCDataSource,
      auditNCPagination,
      onFetchConsigBill: this.fetchMaintainConsigBill,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sfin.invoiceBill.view.message.confirmBillNotification')
            .d('确认开票通知')}
        >
          {changeButton ? (
            <React.Fragment>
              <Button
                icon="check"
                type="primary"
                disabled={isEmpty(auditRows)}
                loading={loading}
                onClick={() => this.onConfirm(true)}
              >
                {intl.get('sfin.invoiceBill.model.invoiceBill.approve').d('通过')}
              </Button>
              <Button
                icon="close"
                disabled={isEmpty(auditRows)}
                loading={loading}
                onClick={() => this.onGoBack(true)}
              >
                {intl.get('sfin.invoiceBill.model.invoiceBill.return').d('退回')}
              </Button>
              <ExcelExport
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/inform-confirm-export`}
                queryParams={{
                  ...queryValue,
                  customizeUnitCode: Object.values(unitCustomizeCodes).join(),
                }}
              />
            </React.Fragment>
          ) : (
            <div />
          )}
        </Header>
        <Content>
          <FilterForm {...filterForm} onRef={this.handleRef} />
          <TableList {...tableParams} />
        </Content>
      </React.Fragment>
    );
  }
}
