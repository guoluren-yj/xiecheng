import React from 'react';
import { Bind } from 'lodash-decorators';
import { Button, DataSet, Modal, Table } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import TextFieldPro from '@/routes/components/TextFieldPro';
import { SMALL_ORDER } from '_utils/config';
import c7nModal from '@/utils/c7nModal';

import { quickPay, applyRefund } from '@/services/oms/paymentRecordService';
import StatusModal from './StatusModal/index';
import { refundAfterDs } from './initDs';
import openRecords from '../OrderLineManage/TimeRecord';

const organizationId = getCurrentOrganizationId();

@withRouter
export default class AllList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    props.onRef(this);
  }

  // 查看历史记录
  @Bind()
  handleOpenModal(type = '', record = {}) {
    let params = {};
    let url = '';
    const { orderId } = record.toData();
    const historyType = type;
    switch (historyType) {
      case 'zhifu':
        params = {
          orderId,
          operationType: 'PAYMENT',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/payment-records`;
        break;
      case 'tuikuan':
        params = {
          orderId,
          operationType: 'REFUND',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/payment-records`;
        break;
      default:
        break;
    }
    openRecords({ params, url });
  }

  @Bind()
  handleCheckStatus(record = {}) {
    const modal = c7nModal({
      title: intl.get('smodr.orderLine.model.doStatus').d('执行状态'),
      style: { width: 1000 },
      bodyStyle: { padding: 0 },
      children: (
        <StatusModal
          getPayTag={this.props.getPayTag}
          getRefundTag={this.props.getRefundTag}
          recordData={record}
          handleOperationModal={this.handleOpenModal}
          customizeForm={this.props.customizeForm}
          handleOpen={this.props.handleOpen}
        />
      ),
      footer: (
        <Button onClick={() => modal?.close()} color="primary">
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
    });
  }

  @Bind()
  async quickpay(record) {
    if (record.get('paymentTypeCode') === 'REMITTANCE_PAYMENT') {
      this.props.handleOpen(record);
    }
    else {
      const windowHref = window.location.href;
      // const { history } = this.props;
      const res = getResponse(
        await quickPay({ returnUrl: windowHref, paymentOrderDTOList: [record.toData()] })
      );
      if (res && res.cashierHtml) {
        if (res?.cashierHtml?.startsWith('http')) {
          window.open(res?.cashierHtml);
        } else {
          document.open('text/html', 'replace');
          document.write(res?.cashierHtml);
          document.close();
        }
        // history.push(`/pub/spct/payment-cashier?paymentOrderNum=${res.paymentOrderNum}`);
        // window.open(`/app/pub/spct/payment-cashier?paymentOrderNum=${res.paymentOrderNum}`);
      } else if (res?.cashierUri) {
        window.open(`/app${res?.cashierUri}&cashierConfigSource=SMALL_BACK`);
      }
    }
  }

  @Bind()
  async handleRefund(record) {
    const afterDs = new DataSet(refundAfterDs(record));
    await afterDs.query();
    const columns = [
      { name: 'afterSaleCode' },
      { name: 'skuName' },
      { name: 'refundAmountMeaning' },
      { name: 'refundTypeMeaning' },
      // { name: 'afterSaleTime' },
    ];
    if (afterDs.toData().length > 1) {
      Modal.open({
        title: intl.get('smodr.deal.model.chooseRefund').d('选择退款单据'),
        style: { width: '820px' },
        children: <Table dataSet={afterDs} columns={columns} />,
        onOk: async () => {
          const param = afterDs?.selected.map((i) => i.toData());
          const res = getResponse(await applyRefund(param));
          if (res && !res.failed) {
            notification.success({
              message: intl.get('smodr.deal.model.refundSuccess').d('退款成功'),
            });
            this.props.allDs.query();
          }
        },
      });
    } else {
      const res = getResponse(await applyRefund(afterDs.toData()));
      if (res && !res.failed) {
        notification.success({
          message: intl.get('smodr.deal.model.refundSuccess').d('退款成功'),
        });
        this.props.allDs.query();
      }
    }
  }

  render() {
    const columns = [
      { name: 'paymentStatusMeaning', renderer: this.props.getPayTag },
      { name: 'orderStatusMeaning', renderer: this.props.getTag },
      {
        name: 'action',
        width: 180,
        renderer: ({ record }) => [
          <span className="action-link">
            <Button color="primary" funcType="link" onClick={() => this.handleCheckStatus(record)}>
              {intl.get('smodr.payment.model.checkDoStatus').d('查看执行状态')}
            </Button>
            {!!record?.get('paymentFlag') && (
              <Button color="primary" funcType="link" onClick={() => this.quickpay(record)}>
                {intl.get('smodr.payment.model.quickPay').d('立即支付')}
              </Button>
            )}
            {!!record?.get('refundFlag') && (
              <Button color="primary" funcType="link" onClick={() => this.handleRefund(record)}>
                {intl.get('smodr.payment.model.quickRefund').d('立即退款')}
              </Button>
            )}
          </span>,
        ],
      },
      { name: 'orderCode', width: 200 },
      // { name: 'orderTypeCodeMeaning' },
      { name: 'paymentTypeMeaning' },
      { name: 'currencyName' },
      {
        name: 'orderAmountMeaning',
        align: 'right',
      },
      {
        name: 'paymentAmountMeaning',
        align: 'right',
      },
      {
        name: 'refundedAmountMeaning',
        align: 'right',
      },
      {
        name: 'refundingAmountMeaning',
        align: 'right',
      },
      {
        name: 'notRefundAmountMeaning',
        align: 'right',
      },
      { name: 'buyerDate' },
      { name: 'buyerName' },
      { name: 'purchaseCompanyName' },
      { name: 'supplierCompanyName' },
    ];
    const { customizeTable } = this.props;

    return (
      <div style={{ height: 'calc(100vh - 260px)' }}>
        {customizeTable(
          { code: 'SMODR.PAYMENT.ALL' },
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchCode="SMODR.PAYMENT.QUERY"
            dataSet={this.props.allDs}
            columns={columns}
            customizedCode="SMODR.PAYMENT.STATUS.ALL"
            searchBarConfig={{
              left: {
                render: () => (
                  <TextFieldPro
                    ds={this.props.allDs}
                    placeholder={intl
                      .get('smodr.deal.view.searchTip')
                      .d('请输入商城订单编码查询')}
                    name="orderCodeList"
                    onRef={(ref) => {
                      this.queryRef = ref;
                    }}
                  />
                ),
              },
              onReset: () => {
                if (this.queryRef) {
                  this.queryRef.handleClear();
                }
              },
              onClear: () => {
                if (this.queryRef) {
                  this.queryRef.handleClear();
                }
              },
            }}
          />
        )}
      </div>
    );
  }
}
