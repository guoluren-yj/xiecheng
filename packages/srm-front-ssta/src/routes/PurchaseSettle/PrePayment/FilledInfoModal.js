/* @Description:
 * @Date: 2021-08-05
 * @author: jss <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useMemo, useEffect, useCallback } from 'react';
import { Form, TextArea, DataSet } from 'choerodon-ui/pro';

import { unitValidate } from '@/utils/utils';
import { prePaymentHeaderDS as headerDs } from '../../../stores/PurchaseSettleDS';

const prePaymentCodes = {
  CONFIRM: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_CONFIRM',
  RETURN: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_RETURN',
  CANCEL: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_CANCEL',
};

const FilledInfoModal = (props) => {
  const { onOk, modal, action, headerDS, custConfig, customizeForm } = props;

  const settleStatus = headerDS.current?.get('settleStatus');

  const filledInfoDS = useMemo(() => new DataSet(headerDs()), []);

  useEffect(() => {
    filledInfoDS.create(headerDS.current?.toData());
    modal.handleOk(handleOk);
  }, [filledInfoDS, handleOk, headerDS, modal]);

  const handleOk = useCallback(async () => {
    const okFlag = await unitValidate(filledInfoDS, custConfig[prePaymentCodes[action]]);
    if (!okFlag) {
      return false;
    } else {
      return onOk(filledInfoDS.current.toData());
    }
  }, [action, custConfig, filledInfoDS, onOk]);

  return customizeForm(
    { code: prePaymentCodes[action] },
    <Form dataSet={filledInfoDS} useColon={false} columns={1} labelLayout="float">
      {action === 'CANCEL' && <TextArea name="canceledReason" />}
      {['CONFIRM', 'RETURN'].includes(action) && settleStatus === 'SUBMITED' && (
        <TextArea name="approvedRemark" />
      )}
      {['CONFIRM', 'RETURN'].includes(action) && settleStatus === 'CANCELING' && (
        <TextArea name="canceledRemark" />
      )}
    </Form>
  );
};

export default FilledInfoModal;
