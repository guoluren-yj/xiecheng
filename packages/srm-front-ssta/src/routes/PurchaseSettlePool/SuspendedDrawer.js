import React from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

const tableType = {
  A: 'ALL',
  B: 'BILL',
  C: 'INVOICE',
  D: 'PAYMENT',
};

const SuspendedDrawer = (props) => {
  const { dataSet, customizeForm, type, label, suspended = true } = props;
  return customizeForm(
    {
      code: `SSTA.PURCHASE_POOL_LIST.${tableType[type]}.${
        suspended ? '' : 'REVOKE_'
      }PENDING_REASON`,
    },
    <Form dataSet={dataSet} useColon={false} columns={1} labelLayout="float">
      <TextArea name="remark" label={label} resize="vertical" />
    </Form>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SSTA.PURCHASE_POOL_LIST.ALL.PENDING_REASON',
      'SSTA.PURCHASE_POOL_LIST.BILL.PENDING_REASON',
      'SSTA.PURCHASE_POOL_LIST.INVOICE.PENDING_REASON',
      'SSTA.PURCHASE_POOL_LIST.PAYMENT.PENDING_REASON',
      'SSTA.PURCHASE_POOL_LIST.ALL.REVOKE_PENDING_REASON',
      'SSTA.PURCHASE_POOL_LIST.BILL.REVOKE_PENDING_REASON',
      'SSTA.PURCHASE_POOL_LIST.INVOICE.REVOKE_PENDING_REASON',
      'SSTA.PURCHASE_POOL_LIST.PAYMENT.REVOKE_PENDING_REASON',
    ],
  })
)(SuspendedDrawer);
