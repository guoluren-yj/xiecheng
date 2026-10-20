/**
 * 供应商视角 缴费记录
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-01-06
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Menu, Modal } from 'choerodon-ui/pro';
import { Dropdown, Icon } from 'choerodon-ui';
import { getResponse, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';
import {
  beforeGenerate,
  checkAlreadyPay,
  fetchWithdraw,
  cancelPay,
} from '@/services/supplier/supplierInvoicingService';
import {
  InvoiceInfoDS,
  BillingInfoDS,
  BillPaymentDS,
  HistoryRecordDS,
} from '@/stores/supplier/supplierInvoicDS';
import StaticSearchBar from '@/components/StaticSearchBar';

import InvoiceInfoModal from './InvoiceInfoModal';
import BillingInfoModal from './BillingInfoModal';
import HistoryRecordModal from './HistoryRecordModal';
import RenewalModal from './RenewalModal';
import PayModel from './PayModel';
import OperationRecord from './OperationRecord';
import { getQueryConfig } from './queryConfig';

import styles from './index.less';

class SupplierRecord extends Component {
  invoiceDS = new DataSet({ ...InvoiceInfoDS() });

  hisListDS = new DataSet({ ...HistoryRecordDS() });

  billingDS = new DataSet({ ...BillingInfoDS() });

  billPaymentDS = new DataSet({ ...BillPaymentDS() });

  constructor(props) {
    super(props);
    this.state = {
      localRecord: null,
      showInvoiceInfo: false, // 发票信息弹窗
      showBillingInfo: false, // 开票信息弹窗
      isCanEdit: true, // 是否可编辑
      showHistory: false, // 缴费历史弹窗
      showRenewal: false, // 续费弹窗
      pageType: 'view',
      showPayModel: false, // 缴费弹窗
    };
  }

  /**
   * 撤销修改
   * @param {*} record
   */
  @Bind()
  viewHistory(record) {
    this.setState({
      localRecord: record,
      showHistory: true,
    });
  }

  /**
   * 查看开票信息
   * @param {*} record
   */
  @Bind()
  handleViewBillMsg(record, type) {
    this.setState({
      localRecord: record,
      showBillingInfo: true,
      isCanEdit: type === 'edit',
      pageType: type === 'edit' ? 'apply' : 'view',
    });
  }

  /**
   * 撤回操作
   * @param {*} record
   */
  @Bind()
  async handleWithdraw(record) {
    if (record && record.get('supplierPaymentId')) {
      const res = await fetchWithdraw({
        supplierPaymentIdList: [record.get('supplierPaymentId')],
        userId: getCurrentUser().id,
        userName: getCurrentUser().realName,
        ticketState: 'WITHDRAWN',
      });
      if (getResponse(res)) {
        this.props.listDS.query();
      }
    }
  }

  /**
   * 查看发票信息
   * @param {*} record
   */
  @Bind()
  handleViewInvoiceMsg(record, type) {
    this.setState({
      localRecord: record,
      showInvoiceInfo: true,
      isCanEdit: type === 'edit',
    });
  }

  @Bind()
  handleCloseModal() {
    this.setState({
      localRecord: null,
      showBillingInfo: false,
      showInvoiceInfo: false,
      isCanEdit: true,
      showHistory: false,
      showRenewal: false,
      showPayModel: false,
    });
    this.props.listDS.query();
  }

  /**
   * 续费操作
   * @param {*} record
   */
  @Bind()
  handleRenewal(record) {
    this.setState({
      showRenewal: true,
      localRecord: record,
    });
  }

  /**
   * 取消支付操作
   * @param {*} record
   */
  @Bind()
  handleCancelPay(record) {
    const supplierPaymentId = record?.get('supplierPaymentId') ?? '';
    if (record && supplierPaymentId) {
      cancelPay({
        supplierPaymentId,
      }).then(res => {
        if (getResponse(res)) {
          this.props.listDS.query();
        }
      });
    }
  }

  /**
   * 打开缴费弹窗
   * @param {*} record
   */
  @Bind()
  openPayModel(record) {
    this.setState({
      localRecord: record,
      showPayModel: true,
    });
  }

  @Bind()
  renderBlock(record) {
    const statusVal = record.get('ticketState');
    const payStatus = record?.get('payStatus') ?? '';
    const payUserId = record?.get('payUserId') ?? '';
    const currentUserId = getCurrentUser().id;

    const endDate = record?.get('endDate') ?? '';
    const disabledPayBtn =
      payStatus === 'UNPAID' && new Date().getTime() >= new Date(endDate).getTime();

    const btnText = !record.get('hasBuy')
      ? intl.get(`spfm.supplierInvoic.button.renewalPay`).d('续费')
      : intl.get(`spfm.supplierInvoic.button.renewalPaying`).d('续费中');

    return statusVal === 'INVOICE_TICKET' && record.get('canRenew') ? (
      <span className="action-link">
        {['UNPAID', 'CANCELLED', 'PAY_APPLY'].includes(payStatus) ? (
          <>
            {disabledPayBtn ? (
              <span style={{ color: '#D0D0D0' }}>
                {intl.get('spfm.supplierInvoic.view.button.toPayFee').d('缴费')}
              </span>
            ) : (
              <a onClick={() => this.openPayModel(record)}>
                {intl.get('spfm.supplierInvoic.view.button.toPayFee').d('缴费')}
              </a>
            )}
          </>
        ) : null}
        {payStatus === 'PAY_APPLY' && payUserId === currentUserId ? (
          <a onClick={() => this.handleCancelPay(record)}>
            {intl.get('spfm.supplierInvoic.view.button.cancelPay').d('取消支付')}
          </a>
        ) : null}
        {record.get('canRenew') && <a onClick={() => this.handleRenewal(record)}>{btnText}</a>}
      </span>
    ) : (
      <span className="action-link">
        {['UNPAID', 'CANCELLED', 'PAY_APPLY'].includes(payStatus) ? (
          <>
            {disabledPayBtn ? (
              <span style={{ color: '#D0D0D0' }}>
                {intl.get('spfm.supplierInvoic.view.button.toPayFee').d('缴费')}
              </span>
            ) : (
              <a onClick={() => this.openPayModel(record)}>
                {intl.get('spfm.supplierInvoic.view.button.toPayFee').d('缴费')}
              </a>
            )}
          </>
        ) : null}
        {payStatus === 'PAY_APPLY' && payUserId === currentUserId ? (
          <a onClick={() => this.handleCancelPay(record)}>
            {intl.get('spfm.supplierInvoic.view.button.cancelPay').d('取消支付')}
          </a>
        ) : null}

        {['WITHDRAWN', 'APPROVAL_REFUSED', 'PENDING_APPLY'].includes(statusVal) &&
          payStatus === 'PAID' && (
            <a onClick={() => this.handleViewBillMsg(record, 'edit')}>
              {intl.get(`spfm.supplierInvoic.view.button.applyTicket`).d('申请开票')}
            </a>
          )}
        {['INVOICE_TICKET', 'INVOICE_APPLY', 'INVOICE_REVISION', 'APPROVAL_PASSED'].includes(
          statusVal
        ) && (
          <a onClick={() => this.handleViewBillMsg(record)}>
            {intl.get(`spfm.supplierInvoic.view.btn.changeEdit`).d('开票信息')}
          </a>
        )}
        {statusVal === 'INVOICE_APPLY' ? (
          <a onClick={() => this.handleWithdraw(record)}>
            {intl.get(`spfm.supplierInvoic.view.btn.withdraw`).d('撤回')}
          </a>
        ) : null}
        {record.get('canRenew') && <a onClick={() => this.handleRenewal(record)}>{btnText}</a>}
        {['INVOICE_TICKET'].includes(statusVal) && !record.get('canRenew') && (
          <a onClick={() => this.handleViewInvoiceMsg(record, '')}>
            {intl.get('spfm.supplierInvoic.model.invoiceInformation').d('发票信息')}
          </a>
        )}
      </span>
    );
  }

  @Bind()
  renderMoreAction(record) {
    return (
      <Menu>
        <Menu.Item
          className={styles['dropdown-more-operate']}
          onClick={() => this.handleViewInvoiceMsg(record, '')}
        >
          <a>{intl.get('spfm.supplierInvoic.model.invoiceInformation').d('发票信息')}</a>
        </Menu.Item>
        <Menu.Item
          className={styles['dropdown-more-operate']}
          onClick={() => this.handleViewInvoiceMsg(record, '')}
        >
          <a onClick={() => this.handleViewBillMsg(record)}>
            {intl.get(`spfm.supplierInvoic.view.btn.changeEdit`).d('开票信息')}
          </a>
        </Menu.Item>
      </Menu>
    );
  }

  /**
   * 操作项
   * @returns
   */
  @Bind()
  renderOperator(record) {
    const statusVal = record.get('ticketState');
    return (
      <>
        <div>
          {this.renderBlock(record)}
          {statusVal === 'INVOICE_TICKET' && record.get('canRenew') ? (
            <Dropdown
              overlay={this.renderMoreAction(record)}
              trigger={['click']}
              placement="bottomLeft"
            >
              <a style={{ marginLeft: '10px' }}>
                {intl.get('hzero.common.page.more').d('更多')}
                <Icon type="expand_more" />
              </a>
            </Dropdown>
          ) : null}
        </div>
      </>
    );
  }

  /**
   * 查看操作记录
   */
  handleView = record => {
    let modal = null;

    const handleClose = () => {
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('spfm.supplierInvoic.view.title.ticketReport').d('开票记录'),
      children: <OperationRecord localRecord={record} />,
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: { width: '432px' },
      okText: intl.get('spfm.supplierInvoic.view.button.close').d('关闭'),
      onCancel: handleClose,
      onOk: handleClose,
      footer: okBtn => okBtn,
    });
  };

  @Bind()
  columns() {
    const classMap = {
      PENDING_APPLY: styles.invoiceing, // 待申请
      INVOICE_APPLY: styles.invoiceing, // 待审批
      WITHDRAWN: styles.uninvoiced, // 已撤回
      APPROVAL_PASSED: styles.invoiced, // 审批通过
      APPROVAL_REFUSED: styles.invoiceRefused, // 审批拒绝
      INVOICE_TICKET: styles.invoiced, // 已开票
      INVOICE_REVISION: styles.invoiceing, // 发票变更中
    };

    const payClassMap = {
      UNPAID: styles.uninvoiced, // 未支付
      PAID: styles.invoiced, // 已支付
      CANCELLED: styles.invoiceRefused, // 已取消
      PAY_APPLY: styles.invoiceing, // 支付中
    };

    return [
      {
        name: 'payStatus',
        width: 100,
        renderer: ({ text, value }) => {
          const classes = payClassMap[value];
          return text ? (
            <span className={classNames(styles['tag-status'], classes)}>{text}</span>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'ticketState',
        width: 100,
        renderer: ({ text, value }) => {
          const classes = classMap[value];
          return text ? (
            <span className={classNames(styles['tag-status'], classes)}>{text}</span>
          ) : (
            '-'
          );
        },
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operator',
        width: 140,
        renderer: ({ record }) => this.renderOperator(record),
      },
      { name: 'paymentNo', width: 180 },
      { name: 'coreTenantCode', width: 160 },
      { name: 'coreTenantName', width: 160 },
      { name: 'supplierTenantCode', width: 100 },
      { name: 'supplierTenantName', width: 160 },
      { name: 'payUser', width: 160 },
      {
        name: 'paymentFee',
        width: 120,
        renderer: ({ record }) => {
          return `CNY ${record.get('paymentFee')}`;
        },
      },
      { name: 'paymentDate', width: 150 },
      { name: 'startDate', width: 150 },
      { name: 'endDate', width: 150 },
      {
        header: intl.get('spfm.supplierInvoic.view.title.ticketReport').d('开票记录'),
        name: 'optRecords',
        lock: 'right',
        width: 100,
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleView(record)}>
                {intl.get('spfm.supplierInvoic.view.button.view').d('查看')}
              </a>
            </span>
          );
        },
      },
    ];
  }

  @Bind()
  getFilters() {
    return { ...getQueryConfig('supplier') };
  }

  @Bind()
  onQuery({ params }) {
    const { targetId = '' } = this.props;
    const sortArr = params.customizeOrderField ? params.customizeOrderField.split(':') : [];
    this.props.listDS.queryDataSet.data = [
      {
        ...params,
        paymentDate: params.paymentDate ? `${params.paymentDate.substring(0, 10)} 00:00:00` : '',
        startDate: params.startDate ? `${params.startDate.substring(0, 10)} 00:00:00` : '',
        endDate: params.endDate ? `${params.endDate.substring(0, 10)} 00:00:00` : '',
        sortField: sortArr.length ? sortArr[0] : '',
        sortType: sortArr.length ? sortArr[1] : '',
        customizeOrderField: '',
        targetId,
      },
    ];
    this.props.listDS.query();
  }

  @Bind()
  pushToPay(supplierPaymentId) {
    const { host = '', protocol = '' } = document.location;

    if (supplierPaymentId) {
      beforeGenerate({
        supplierPaymentId,
        returnUrl: protocol && host ? `${protocol}//${host}/app/spfm/supplier-payment-record` : '',
      }).then(res => {
        if (res && typeof res === 'string' && !res.includes('failed')) {
          this.props.history.push(
            `/pub/spct/payment-cashier-plateform?payBusinessType=SUPPLIER_PAY&paymentOrderNum=${res}`
          );
        } else {
          const params = JSON.parse(res);
          if (params.code || params.message) {
            notification.error({
              message: params.message,
            });
          }
        }
      });
    }
  }

  @Bind()
  handleCheckReady(supplierPaymentId) {
    if (supplierPaymentId) {
      checkAlreadyPay({ supplierPaymentId }).then(result => {
        if (getResponse(result)) {
          this.pushToPay(supplierPaymentId);
        }
      });
    }
  }

  render() {
    const {
      showInvoiceInfo,
      showBillingInfo,
      localRecord,
      isCanEdit,
      showHistory,
      showRenewal,
      pageType,
      showPayModel,
    } = this.state;

    const invoiceInfoProps = {
      visible: showInvoiceInfo,
      localRecord,
      isCanEdit,
      dataSet: this.invoiceDS,
      onCancel: this.handleCloseModal,
    };

    const billingInfoProps = {
      visible: showBillingInfo,
      localRecord,
      dataSet: this.billingDS,
      isCanEdit,
      pageType,
      onCancel: this.handleCloseModal,
    };

    const historyInfoProps = {
      visible: showHistory,
      listDS: this.hisListDS,
      billingDS: this.billingDS,
      localRecord,
      onCancel: this.handleCloseModal,
    };

    const renewalInfoProps = {
      visible: showRenewal,
      dataSet: this.billPaymentDS,
      billingDS: this.billingDS,
      localRecord,
      onCancel: this.handleCloseModal,
      onPay: this.pushToPay,
      onCheckReady: this.handleCheckReady,
    };

    const payModelProps = {
      visible: showPayModel,
      localRecord,
      onCancel: this.handleCloseModal,
    };

    return (
      <>
        <StaticSearchBar
          cacheState
          clearButton
          onRef={ref => {
            this.SearchBarRef = ref;
          }}
          searchCode="AMKT.SUPPLIER_INVOIC_FILTER"
          filters={this.getFilters()}
          dataSet={[this.props.listDS]}
          onQuery={this.onQuery}
          showLoading={false}
        />
        <div style={{ height: `calc(100vh - 300px)` }}>
          <Table
            dataSet={this.props.listDS}
            columns={this.columns()}
            queryBar="none"
            customizable
            customizedCode="SPFM_AMKT_SUPPLIER_INVOIC_PLACE"
            autoHeight={{ type: 'maxHeight', diff: 20 }}
          />
        </div>
        {showInvoiceInfo && <InvoiceInfoModal {...invoiceInfoProps} />}
        {showBillingInfo && <BillingInfoModal {...billingInfoProps} />}
        {showHistory && <HistoryRecordModal {...historyInfoProps} />}
        {showRenewal && <RenewalModal {...renewalInfoProps} />}
        {showPayModel && <PayModel {...payModelProps} />}
      </>
    );
  }
}

export default SupplierRecord;
