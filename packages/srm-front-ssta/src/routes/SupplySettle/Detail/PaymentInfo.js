import React from 'react';
import intl from 'utils/intl';

import { Button, Form } from 'choerodon-ui/pro';
import { FormItem } from '@/routes/Components';
import { decimalPointAccuracy } from '@/routes/utils';

const PaymentInfo = (props) => {
  const {
    loadPaymentInfo,
    closePaymentInfo,
    updateFlag,
    paymentInfoDS,
    customizeForm,
    editFlag,
  } = props;
  const unitCodes =
    paymentInfoDS.current.get('documentType') === 'INVOICE'
      ? 'SSTA.SUPPLY_SETTLE_DETAIL.INVOICE_INFO_BOX'
      : 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT_INFO_BOX';

  return (
    <>
      {customizeForm(
        {
          code: unitCodes,
          readOnly: editFlag,
        },
        <Form
          dataSet={paymentInfoDS}
          columns={3}
          useColon={false}
          labelLayout={!editFlag ? 'float' : 'vertical'}
        >
          <FormItem name="bankIdLov" editor="lov" editable={updateFlag} />
          <FormItem name="bankBranchName" disabled={updateFlag} />
          <FormItem name="bankAccountNum" disabled={updateFlag} />
          <FormItem name="bankAccountName" disabled={updateFlag} />
          <FormItem name="paymentMethodLov" editor="lov" editable={updateFlag} />
          <FormItem
            name="paymentCondition"
            placeholder={intl
              .get(`ssta.purchaseSettle.model.purchaseSettle.paymentCondition`)
              .d('付款条件')}
            editor="lov"
            editable={updateFlag}
          />

          <FormItem
            name="paymentDiscountAmount"
            editor="numberfield"
            editable={updateFlag}
            renderer={({ value, record }) => {
              return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                repair: true,
                check: true,
              });
            }}
          />
          <FormItem name="expectPaymentDate" editor="datepicker" editable={updateFlag} />
        </Form>
      )}
      {updateFlag && (
        <div className="ssta-body-footer">
          <Button onClick={loadPaymentInfo} color="primary" disabled={!updateFlag}>
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
          <Button onClick={closePaymentInfo}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      )}
    </>
  );
};
export default PaymentInfo;
