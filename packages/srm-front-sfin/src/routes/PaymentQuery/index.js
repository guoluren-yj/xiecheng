/**
 * index.js - 付款申请审批界面
 * @date: 2019-9-27
 * @author: napeng <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Button } from 'hzero-ui';
import moment from 'moment';
import { Bind, Throttle } from 'lodash-decorators';
import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import { isEmpty } from 'lodash';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import PayQueryTab from './PayQueryTab';
import PayDetailLine from './PayDetailLine';
import PayAdvanceDetailLine from './PayAdvanceDetailLine';

const { TabPane } = Tabs;

@connect(({ payQuery = {}, loading }) => ({
  loading: loading.effects['payQuery/returnPaymentHeader'],
  payQuery,
}))
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'sfin.paymentRecord',
    'sfin.paymentQuery',
    'entity.supplier',
    'sfin.invoiceBill',
    'entity.company',
    'sfin.invoiceVerification',
  ],
})
export default class PaymentApprove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payQueryRowKeys: [],
      payDetailLineRowKeys: [], // 到票付款明细行已勾选数据
      payAdvanceDetailLineRowKeys: [], // 预付款申请明细行已勾选数据
      organizationId: getCurrentOrganizationId(),
      activeKey: 'payQueryTab',
      payCheckFlag: true,
      configValue: '',
      payQueryRow: [],
    };
  }

  componentDidMount() {
    this.fetchEnum();
    this.fetchPayConfig();
  }

  //  * 查询值集
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payQuery/init',
    });
  }

  //  * 查询配置项
  @Bind()
  fetchPayConfig() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payQuery/getConfigByPayment',
      settingCode: '010543',
    }).then((res) => {
      if (res) {
        this.setState({ configValue: res.settingValue });
      }
    });
  }

  //  * 回退
  @Bind()
  @Throttle(1000)
  isReturned() {
    const {
      payQuery: { pagination },
      dispatch,
    } = this.props;
    const { payQueryRow } = this.state;
    dispatch({
      type: 'payQuery/returnPaymentHeader',
      payQueryRow,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ payQueryRow: [] });
        this.setState({ payQueryRowKeys: [] });
        this.payQueryTab.handleSearch(pagination.payQuery);
      }
    });
  }

  @Bind()
  changeTabs(activeKey) {
    const {
      payQuery: { pagination },
    } = this.props;
    if (activeKey === 'payQueryTab' && this.payQueryTab) {
      this.payQueryTab.handleSearch(pagination.payQuery);
    } else if (activeKey === 'payDetailLine' && this.payDetailLine) {
      this.payDetailLine.handleSearch(pagination.payDetailLine);
    } else if (activeKey === 'payAdvanceDetailLine' && this.payAdvanceDetailLine) {
      this.payAdvanceDetailLine.handleSearch(pagination.payAdvanceDetailLine);
    }
    this.setState({ activeKey });
    // dispatch({
    //   type: 'payQuery/updateState',
    //   payload: {
    //     activeKey,
    //   },
    // });
  }

  @Bind()
  clearRows() {
    this.setState({ payDetailLineRowKeys: [], payAdvanceDetailLineRowKeys: [] });
  }

  // 个性化编码
  @Bind()
  getCustomizeUnitCode() {
    const { activeKey } = this.state;
    const customizeUnitCode =
      activeKey === 'payDetailLine'
        ? 'SFIN.PAY_QUERY_LIST.PAYDETAILLINE_FILTER,SFIN.PAY_QUERY_LIST.PAYDETAILLINE_GRID'
        : activeKey === 'payAdvanceDetailLine'
        ? 'SFIN.PAY_QUERY_LIST.PAYADVANCEDETAILLINE_FILTER,SFIN.PAY_QUERY_LIST.PAYADVANCEDETAILLINE_GRID'
        : 'SFIN.PAY_QUERY_LIST.FILTER,SFIN.PAY_QUERY_LIST.GRID';
    return customizeUnitCode;
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { activeKey } = this.state;
    const thisForm =
      activeKey === 'payDetailLine'
        ? this.payDetailLine
        : activeKey === 'payAdvanceDetailLine'
        ? this.payAdvanceDetailLine
        : this.payQueryTab;
    const params = thisForm ? (thisForm.props && thisForm.props.form.getFieldsValue()) || {} : {};
    const {
      creationDateStart,
      creationDateEnd,
      actualPaymentDateStart,
      actualPaymentDateEnd,
    } = params;
    return filterNullValueObject({
      ...params,
      creationDateStart: creationDateStart && moment(creationDateStart).format(DATETIME_MIN),
      creationDateEnd: creationDateEnd && moment(creationDateEnd).format(DATETIME_MAX),
      actualPaymentDateStart:
        actualPaymentDateStart && moment(actualPaymentDateStart).format(DATETIME_MIN),
      actualPaymentDateEnd:
        actualPaymentDateEnd && moment(actualPaymentDateEnd).format(DATETIME_MAX),
      customizeUnitCode: this.getCustomizeUnitCode(),
    });
  }

  render() {
    const { history, loading } = this.props;
    const {
      payQueryRowKeys,
      payDetailLineRowKeys,
      payAdvanceDetailLineRowKeys,
      organizationId,
      activeKey,
      payCheckFlag,
      configValue,
    } = this.state;
    const payQueryRowSelection = {
      selectedRowKeys: payQueryRowKeys,
      onChange: (keys, selectedRows) => {
        this.setState({ payCheckFlag: true });

        selectedRows.forEach((n) => {
          if (n.paymentStatus !== 'APPROVED') {
            this.setState({ payCheckFlag: false });
          } else if (
            configValue === '0' &&
            n.paymentStatus === 'APPROVED' &&
            n.erpImportCode !== null &&
            !['NOT_IMPORT', 'IMPORT_FAIL'].includes(n.erpImportCode)
          ) {
            this.setState({ payCheckFlag: false });
          }
        });
        this.setState({ payQueryRowKeys: keys });
        this.setState({ payQueryRow: selectedRows });
      },
    };
    const payDetailLineRowSelection = {
      selectedRowKeys: payDetailLineRowKeys,
      onChange: (keys) => this.setState({ payDetailLineRowKeys: keys }),
    };
    const payAdvanceDetailLineRowSelection = {
      selectedRowKeys: payAdvanceDetailLineRowKeys,
      onChange: (keys) => this.setState({ payAdvanceDetailLineRowKeys: keys }),
    };
    const paymentLineIds = payDetailLineRowKeys.join(',');
    const advanceLineIds = payAdvanceDetailLineRowKeys.join(',');

    return (
      <React.Fragment>
        <Header title={intl.get(`sfin.payment.common.payQuery`).d('付款申请查询')}>
          {activeKey === 'payQueryTab' && (
            <React.Fragment>
              <ExcelExport
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/payment-headers/list/export`}
                queryParams={this.handleGetFormValue()}
                otherButtonProps={{ type: 'primary' }}
              />
              <ExcelExport
                buttonText={intl.get(`sfin.invoiceVerification.button.checkedExport`).d('勾选导出')}
                otherButtonProps={{
                  disabled: isEmpty(payQueryRowKeys),
                }}
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/payment-headers/list/export`}
                queryParams={{
                  paymentHeaderIds: payQueryRowKeys,
                  customizeUnitCode: this.getCustomizeUnitCode(),
                }}
              />
              <Button
                disabled={isEmpty(payQueryRowKeys) || !payCheckFlag}
                onClick={() => this.isReturned()}
                loading={loading}
              >
                {intl.get('sfin.payment.common.is_returned').d('退回')}
              </Button>
            </React.Fragment>
          )}
          {activeKey === 'payDetailLine' && (
            <React.Fragment>
              <ExcelExport
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/payment-lines/export`}
                queryParams={this.handleGetFormValue()}
                otherButtonProps={{ type: 'primary' }}
              />
              <ExcelExport
                buttonText={intl.get(`sfin.invoiceVerification.button.checkedExport`).d('勾选导出')}
                otherButtonProps={{
                  icon: 'export',
                  disabled: isEmpty(payDetailLineRowKeys),
                }}
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/payment-lines/export`}
                queryParams={{ paymentLineIds, customizeUnitCode: this.getCustomizeUnitCode() }}
              />
            </React.Fragment>
          )}
          {activeKey === 'payAdvanceDetailLine' && (
            <React.Fragment>
              <ExcelExport
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/payment-advance-lines/export`}
                queryParams={this.handleGetFormValue()}
                otherButtonProps={{ type: 'primary' }}
              />
              <ExcelExport
                buttonText={intl.get(`sfin.invoiceVerification.button.checkedExport`).d('勾选导出')}
                otherButtonProps={{
                  icon: 'export',
                  disabled: isEmpty(payAdvanceDetailLineRowKeys),
                }}
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/payment-advance-lines/export`}
                queryParams={{ advanceLineIds, customizeUnitCode: this.getCustomizeUnitCode() }}
              />
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Tabs activeKey={activeKey} tabPosition="top" animated={false} onChange={this.changeTabs}>
            <TabPane
              tab={intl.get('sfin.payment.common.payQuery').d('付款申请查询')}
              key="payQueryTab"
            >
              <PayQueryTab
                onRef={(ref) => {
                  this.payQueryTab = ref;
                }}
                rowSelection={payQueryRowSelection}
                history={history}
              />
            </TabPane>
            <TabPane
              tab={intl.get('sfin.payment.common.payQuery.payDetailLine').d('到票付款明细行')}
              key="payDetailLine"
            >
              <PayDetailLine
                onRef={(ref) => {
                  this.payDetailLine = ref;
                }}
                history={history}
                clearRows={this.clearRows}
                rowSelection={payDetailLineRowSelection}
              />
            </TabPane>
            <TabPane
              tab={intl.get('sfin.payment.common.payAdvanceDetailLine').d('预付款申请明细行')}
              key="payAdvanceDetailLine"
            >
              <PayAdvanceDetailLine
                onRef={(ref) => {
                  this.payAdvanceDetailLine = ref;
                }}
                history={history}
                clearRows={this.clearRows}
                rowSelection={payAdvanceDetailLineRowSelection}
              />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
