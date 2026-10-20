import React from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { getResponse } from 'utils/utils';
import { applyRefund } from '@/services/oms/paymentRecordService';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import TextFieldPro from '@/routes/components/TextFieldPro';

import { refundDs, refundAfterDs } from './initDs';

@withProps(() => ({ initDs: new DataSet(refundDs()) }), {
  cacheState: true,
})
export default class WaitForPay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    props.onRef(this);
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
            this.props.refundDs.query();
          }
        },
      });
    } else {
      const res = getResponse(await applyRefund(afterDs.toData()));
      if (res && !res.failed) {
        notification.success({
          message: intl.get('smodr.deal.model.refundSuccess').d('退款成功'),
        });
        this.props.refundDs.query();
      }
    }
  }

  render() {
    const columns = [
      {
        name: 'action',
        width: 80,
        renderer: ({ record }) => (
          <a onClick={() => this.handleRefund(record)}>
            {intl.get('smodr.deal.model.quickRefund').d('立即退款')}
          </a>
        ),
      },
      { name: 'orderCode', width: 200 },
      { name: 'orderAmountMeaning' },
      { name: 'orderStatusMeaning', renderer: this.props.getTag },
      { name: 'paymentTypeMeaning' },
      { name: 'currencyName' },
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
          { code: 'SMODR.PAYMENT.REFUND' },
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchCode="SMODR.PAYMENT.REFUND-QUERY"
            dataSet={this.props.refundDs}
            columns={columns}
            customizedCode="SMODR.PAYMENT.STATUS.REFUND"
            searchBarConfig={{
              left: {
                render: () => (
                  <TextFieldPro
                    ds={this.props.refundDs}
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
