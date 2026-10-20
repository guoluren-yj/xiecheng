import React, { useMemo, useEffect, useCallback } from 'react';
import { Form, TextArea, DataSet } from 'choerodon-ui/pro';
import { unitValidate } from '@/utils/utils';
import { filledInfoDs } from './Detail/mainDS';

const billCodes = {
  CONFIRM: 'SSTA.SUPPLIER_BILL_LIST.PRE_CONFIRM',
  RETURN: 'SSTA.SUPPLIER_BILL_LIST.PRE_RETURN',
  CANCEL: 'SSTA.SUPPLIER_BILL_LIST.CANCEL_MODAL',
};

const FilledInfoModal = (props) => {
  const { onOk, modal, action, reqFun, custConfig, customizeForm, billStatus } = props;
  const filledInfoDS = useMemo(() => new DataSet(filledInfoDs()), []);
  useEffect(() => {
    modal.handleOk(handleOk);
  }, [modal, handleOk]);

  const handleOk = useCallback(async () => {
    const okFlag = await unitValidate(filledInfoDS, custConfig[billCodes[action]]);
    if (!okFlag) {
      return false;
    } else {
      const info = filledInfoDS.current?.toData();
      return onOk(reqFun, action, info, billCodes[action]);
    }
  }, [action, custConfig, filledInfoDS, onOk, reqFun]);

  return customizeForm(
    { code: billCodes[action] },
    <Form dataSet={filledInfoDS} useColon={false} columns={1} labelLayout="float">
      {['CONFIRM', 'RETURN'].includes(action) &&
        billStatus !== 'NEW' &&
        ['SUBMITED', 'SUBMITED_APPROVING', 'WAIT_SUPPLIER_CONFIRM'].includes(billStatus) && (
          <TextArea name="approvedRemark" />
        )}
      {['CONFIRM', 'RETURN'].includes(action) &&
        ['CANCELING', 'CANCEL_APPROVING', 'WAIT_SUPPLIER_CANCEL'].includes(billStatus) && (
          <TextArea name="canceledRemark" />
        )}
      {action === 'CANCEL' && <TextArea name="canceledReason" />}
    </Form>
  );
};

export default FilledInfoModal;
