import React from 'react';
import { Form, TextField, Select, DatePicker } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';

const FilterDrawer = (props) => {
  const { activeKey, filterDS, customizeForm } = props;

  return (
    <>
      {activeKey === 'BILL' &&
        customizeForm(
          { code: 'SSTA.PURCHASE_POOL_RECORD.BILL_FILTER' },
          <Form dataSet={filterDS} labelLayout="float">
            <TextField
              name="documentNum"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.bill')
                .d('对账单编号')}
            />
            <Select
              name="recordStatus"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.billRecordStatus')
                .d('对账状态')}
              multiple
            />
            <DatePicker
              name="recordDateFrom"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.billRecordDateFrom')
                .d('对账日期从')}
            />
            <DatePicker
              name="recordDateTo"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.billRecordDateTo')
                .d('对账日期至')}
            />
            <Select
              name="recordSource"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.billRecordSource')
                .d('对账来源')}
              multiple
            />
            <Select
              name="netWorth"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netWorth')
                .d('显示净值数据')}
            >
              <Select.Option value="Y">{intl.get('hzero.common.status.yes').d('是')}</Select.Option>
              <Select.Option value="N">{intl.get('hzero.common.status.no').d('否')}</Select.Option>
            </Select>
          </Form>
        )}

      {activeKey === 'INVOICE' &&
        customizeForm(
          { code: 'SSTA.PURCHASE_POOL_RECORD.INVOICE_FILTER' },
          <Form dataSet={filterDS} labelLayout="float">
            <TextField
              name="documentNum"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settle')
                .d('结算单编号')}
            />
            <Select
              name="recordStatus"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceRecordStatus')
                .d('发票匹配状态')}
              multiple
            />
            <DatePicker
              name="recordDateFrom"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceRecordDateFrom')
                .d('发票匹配日期从')}
            />
            <DatePicker
              name="recordDateTo"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceRecordDateTo')
                .d('发票匹配日期至')}
            />
            <Select
              name="recordSource"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceRecordSource2')
                .d('发票匹配来源')}
              multiple
            />
            <Select
              name="netWorth"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netWorth')
                .d('显示净值数据')}
            >
              <Select.Option value="Y">{intl.get('hzero.common.status.yes').d('是')}</Select.Option>
              <Select.Option value="N">{intl.get('hzero.common.status.no').d('否')}</Select.Option>
            </Select>
          </Form>
        )}
      {activeKey === 'PAYMENT' &&
        customizeForm(
          { code: 'SSTA.PURCHASE_POOL_RECORD.PAYMENT_FILTER' },
          <Form dataSet={filterDS} labelLayout="float">
            <TextField
              name="documentNum"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.documentNum3')
                .d('结算单编号')}
            />
            <Select
              name="paymentType"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.paymentType')
                .d('付款类型')}
              multiple
            />
            <Select
              name="recordStatus"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.paymentRecordStatus')
                .d('付款状态')}
              multiple
            />
            <DatePicker
              name="recordDateFrom"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.paymentRecordDateFrom')
                .d('付款日期从')}
            />
            <DatePicker
              name="recordDateTo"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.paymentRecordDateTo')
                .d('付款日期至')}
            />
            <Select
              name="recordSource"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.paymentRecordSource')
                .d('付款来源')}
              multiple
            />
            <Select
              name="netWorth"
              label={intl
                .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netWorth')
                .d('显示净值数据')}
            >
              <Select.Option value="Y">{intl.get('hzero.common.status.yes').d('是')}</Select.Option>
              <Select.Option value="N">{intl.get('hzero.common.status.no').d('否')}</Select.Option>
            </Select>
          </Form>
        )}
    </>
  );
};

export default withCustomize({
  unitCode: [
    'SSTA.PURCHASE_POOL_RECORD.BILL_FILTER',
    'SSTA.PURCHASE_POOL_RECORD.INVOICE_FILTER',
    'SSTA.PURCHASE_POOL_RECORD.PAYMENT_FILTER',
  ],
})(FilterDrawer);
