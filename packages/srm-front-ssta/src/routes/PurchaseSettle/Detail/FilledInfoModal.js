/* @Description:
 * @Date: 2021-08-05
 * @author: jss <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useMemo, useEffect } from 'react';
import { Form, DatePicker, TextArea, DataSet } from 'choerodon-ui/pro';

import { unitValidate } from '@/utils/utils';
import { headerDS as headerDs } from '../../../stores/PurchaseSettleDS';

const invoiceCodes = {
  CONFIRM: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_CONFIRM',
  RETURN: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_RETURN',
  CANCEL: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_CANCEL',
  SYNC: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_SYNC',
};

const paymentCodes = {
  CONFIRM: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CONFIRM',
  RETURN: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_RETURN',
  CANCEL: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CANCEL',
};

const FilledInfoModal = (props) => {
  const { onOk, modal, action, headerDS, custConfig, documentType, customizeForm } = props;

  const settleStatus = headerDS.current?.get('settleStatus');

  const filledInfoCode = documentType === 'INVOICE' ? invoiceCodes[action] : paymentCodes[action];

  const filledInfoDS = useMemo(() => new DataSet(headerDs()), []);

  useEffect(() => {
    filledInfoDS.create(headerDS.current?.toData());
    modal.handleOk(handleOk);
  }, []);

  const handleOk = async () => {
    const okFlag = await unitValidate(filledInfoDS, custConfig[filledInfoCode]);
    if (!okFlag) {
      return false;
    } else {
      onOk(filledInfoDS.current.toData());
    }
  };

  return customizeForm(
    { code: filledInfoCode },
    <Form dataSet={filledInfoDS} useColon={false} columns={1} labelLayout="float">
      {['CONFIRM', 'SYNC'].includes(action) &&
        documentType === 'INVOICE' &&
        settleStatus !== 'CANCELING' && <DatePicker name="accountingDate" />}
      {action === 'CANCEL' && <TextArea name="canceledReason" />}
      {['CONFIRM', 'RETURN'].includes(action) &&
        ['SUBMITED', 'SUBMITED_APPROVING'].includes(settleStatus) && (
          <TextArea name="approvedRemark" />
        )}
      {['CONFIRM', 'RETURN'].includes(action) &&
        ['CANCELING', 'CANCEL_APPROVING', 'INVOICE_EXCEPTION', 'INVOICE_FAILED'].includes(
          settleStatus
        ) && <TextArea name="canceledRemark" />}
    </Form>
  );
};

export default FilledInfoModal;
