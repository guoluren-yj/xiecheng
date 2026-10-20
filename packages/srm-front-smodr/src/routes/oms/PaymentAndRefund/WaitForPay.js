import React from 'react';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { getResponse } from 'utils/utils';
import { quickPay } from '@/services/oms/paymentRecordService';
import notification from 'utils/notification';
import TextFieldPro from '@/routes/components/TextFieldPro';

import intl from 'utils/intl';

// @withProps(() => ({ initDs: new DataSet(initDs()) }), {
//   cacheState: true,
// })
@withRouter
export default class WaitForPay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    props.onRef(this);
  }

  @Bind()
  async quickpay(record) {
    if (record.get('paymentTypeCode') === 'REMITTANCE_PAYMENT') {
      this.props.handleOpen(record);
    } else {
      const windowHref = window.location.href;
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
      } else if (res?.cashierUri) {
        window.open(`/app${res?.cashierUri}&cashierConfigSource=SMALL_BACK`);
      } else if (res && !(res.cashierHtml || res?.cashierHtml)) {
        notification.success();
        this.props.updateActiveKey('1');
      }
    }
  }

  render() {
    const columns = [
      { name: 'paymentStatusMeaning', renderer: this.props.getPayTag },
      {
        name: 'action',
        renderer: ({ record }) => (
          <a onClick={() => this.quickpay(record)}>
            {intl.get('smodr.payment.model.quickPay').d('立即支付')}
          </a>
        ),
      },
      { name: 'orderCode', width: 200 },
      { name: 'orderStatusMeaning', renderer: this.props.getTag },
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
      { name: 'buyerDate' },
      { name: 'buyerName' },
      { name: 'purchaseCompanyName' },
      { name: 'supplierCompanyName' },
    ];
    const { customizeTable } = this.props;
    return (
      <div style={{ height: 'calc(100vh - 260px)' }}>
        {customizeTable(
          { code: 'SMODR.PAYMENT.PAYMENT' },
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchCode="SMODR.PAYMENT.PAYMENT-QUERY"
            dataSet={this.props.payDs}
            columns={columns}
            customizedCode="SMODR.PAYMENT.STATUS.PAYMENT"
            searchBarConfig={{
              left: {
                render: () => (
                  <TextFieldPro
                    ds={this.props.payDs}
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
