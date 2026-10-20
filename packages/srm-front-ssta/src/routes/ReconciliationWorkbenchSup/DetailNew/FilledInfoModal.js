/* @Description:
 * @Date: 2021-08-05
 * @author: jss <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useMemo, useEffect, useCallback } from 'react';
import { Form, TextArea, DataSet } from 'choerodon-ui/pro';

import { formDs } from './mainDS';
import { unitValidate } from '@/utils/utils';

const billCodes = {
  CONFIRM: 'SSTA.SUPPLIER_BILL_DETAIL.PRE_CONFIRM',
  RETURN: 'SSTA.SUPPLIER_BILL_DETAIL.PRE_RETURN',
  CANCEL: 'SSTA.SUPPLIER_BILL_DETAIL.PRE_CANCEL',
};

const FilledInfoModal = (props) => {
  const { onOk, modal, action, reqFun, headerDS, editFlag, custConfig, customizeForm } = props;

  const billStatus = headerDS.current?.get('billStatus');

  const filledInfoDS = useMemo(() => new DataSet(formDs()), []);

  useEffect(() => {
    filledInfoDS.create(headerDS.current?.toData());
    modal.handleOk(handleOk);
  }, [filledInfoDS, handleOk, headerDS, modal]);

  const handleOk = useCallback(async () => {
    const okFlag = await unitValidate(filledInfoDS, custConfig[billCodes[action]]);
    if (!okFlag) {
      return false;
    } else {
      return onOk(reqFun, filledInfoDS.current.toData(), action);
    }
  }, [action, custConfig, filledInfoDS, onOk, reqFun]);

  return customizeForm(
    { code: billCodes[action] },
    <Form dataSet={filledInfoDS} useColon={false} columns={1} labelLayout="float">
      {action === 'CANCEL' && <TextArea name="canceledReason" />}
      {['CONFIRM', 'RETURN'].includes(action) &&
        billStatus !== 'NEW' &&
        ['SUBMITED', 'SUBMITED_APPROVING', 'WAIT_SUPPLIER_CONFIRM'].includes(billStatus) &&
        editFlag && <TextArea name="approvedRemark" />}
      {['CONFIRM', 'RETURN'].includes(action) &&
        ['CANCELING', 'CANCEL_APPROVING', 'WAIT_SUPPLIER_CANCEL'].includes(billStatus) &&
        editFlag && <TextArea name="canceledRemark" />}
    </Form>
  );
};

export default FilledInfoModal;
