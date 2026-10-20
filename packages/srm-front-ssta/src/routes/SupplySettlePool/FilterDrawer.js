import React from 'react';
import { Form, TextField, Select, DatePicker } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';

const prefix = 'ssta.supplySettlePool';

const FilterDrawer = (props) => {
  const { activeKey, filterDS, customizeForm } = props;

  return (
    <>
      {activeKey === 'BILL' &&
        customizeForm(
          { code: 'SSTA.SUPPLY_POOL_RECORD.BILL_FILTER' },
          <Form dataSet={filterDS} labelLayout="float">
            <TextField
              name="documentNum"
              label={intl.get(`${prefix}.model.supplySettlePool.bill`).d('对账单编号')}
            />
            <Select
              name="recordStatus"
              label={intl.get(`${prefix}.model.supplySettlePool.billRecordStatus`).d('对账状态')}
              multiple
            />
            <DatePicker
              name="recordDateFrom"
              label={intl
                .get(`${prefix}.model.supplySettlePool.billRecordDateFrom`)
                .d('对账日期从')}
            />
            <DatePicker
              name="recordDateTo"
              label={intl.get(`${prefix}.model.supplySettlePool.billRecordDateTo`).d('对账日期至')}
            />
            <Select
              name="recordSource"
              label={intl.get(`${prefix}.model.supplySettlePool.billRecordSource`).d('对账来源')}
              multiple
            />
            <Select
              name="netWorth"
              label={intl.get(`${prefix}.model.supplySettlePool.netWorth`).d('显示净值数据')}
            >
              <Select.Option value="Y">{intl.get('hzero.common.status.yes').d('是')}</Select.Option>
              <Select.Option value="N">{intl.get('hzero.common.status.no').d('否')}</Select.Option>
            </Select>
          </Form>
        )}

      {activeKey === 'INVOICE' &&
        customizeForm(
          { code: 'SSTA.SUPPLY_POOL_RECORD.INVOICE_FILTER' },
          <Form dataSet={filterDS}>
            <TextField
              name="documentNum"
              label={intl.get(`${prefix}.model.supplySettlePool.settle`).d('结算单编号')}
            />
            <Select
              name="recordStatus"
              label={intl
                .get(`${prefix}.model.supplySettlePool.invoiceRecordStatus`)
                .d('发票匹配状态')}
              multiple
            />
            <DatePicker
              name="recordDateFrom"
              label={intl
                .get(`${prefix}.model.supplySettlePool.invoiceRecordDateFrom`)
                .d('发票匹配日期从')}
            />
            <DatePicker
              name="recordDateTo"
              label={intl
                .get(`${prefix}.model.supplySettlePool.invoiceRecordDateTo`)
                .d('发票匹配日期至')}
            />
            <Select
              name="recordSource"
              label={intl
                .get(`${prefix}.model.supplySettlePool.invoiceRecordSource`)
                .d('发票匹配来源')}
              multiple
            />
            <Select
              name="netWorth"
              label={intl.get(`${prefix}.model.supplySettlePool.netWorth`).d('显示净值数据')}
            >
              <Select.Option value="Y">{intl.get('hzero.common.status.yes').d('是')}</Select.Option>
              <Select.Option value="N">{intl.get('hzero.common.status.no').d('否')}</Select.Option>
            </Select>
          </Form>
        )}
      {activeKey === 'PAYMENT' &&
        customizeForm(
          { code: 'SSTA.SUPPLY_POOL_RECORD.PAYMENT_FILTER' },
          <Form dataSet={filterDS}>
            <TextField
              name="documentNum"
              label={intl.get(`${prefix}.model.supplySettlePool.statementNum`).d('结算单编号')}
            />
            <Select
              name="paymentType"
              label={intl.get(`${prefix}.model.supplySettlePool.collectionType`).d('收款类型')}
              multiple
            />
            <Select
              name="recordStatus"
              label={intl
                .get(`${prefix}.model.supplySettlePool.collectionRecordStatus`)
                .d('收款状态')}
              multiple
            />
            <DatePicker
              name="recordDateFrom"
              label={intl
                .get(`${prefix}.model.supplySettlePool.collectionRecordDateFrom`)
                .d('收款日期从')}
            />
            <DatePicker
              name="recordDateTo"
              label={intl
                .get(`${prefix}.model.supplySettlePool.collectionRecordDateTo`)
                .d('收款日期至')}
            />
            <Select
              name="recordSource"
              label={intl
                .get(`${prefix}.model.supplySettlePool.collectionRecordSource`)
                .d('收款来源')}
              multiple
            />
            <Select
              name="netWorth"
              label={intl.get(`${prefix}.model.supplySettlePool.netWorth`).d('显示净值数据')}
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
    'SSTA.SUPPLY_POOL_RECORD.BILL_FILTER',
    'SSTA.SUPPLY_POOL_RECORD.INVOICE_FILTER',
    'SSTA.SUPPLY_POOL_RECORD.PAYMENT_FILTER',
  ],
})(FilterDrawer);
