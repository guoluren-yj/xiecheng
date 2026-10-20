import React, { useMemo, useEffect, useCallback } from 'react';
import { Form, TextArea, DataSet } from 'choerodon-ui/pro';

import { formDs, reverseInfoDs } from './mainDS';
import { unitValidate } from '@/utils/utils';

const unitCodes = {
  CONFIRM: 'SSTA.COST_SHEET_DETAIL.CONFIRM',
  RETURN: 'SSTA.COST_SHEET_DETAIL.RETURN',
  REVERSE: 'SSTA.COST_SHEET_DETAIL.REVERSE',
  REVERSELIST: 'SSTA.COST_SHEET_LIST.REVERSE',
  CONFIRMLIST: 'SSTA.COST_SHEET_LIST.CONFIRM',
  RETURNLIST: 'SSTA.COST_SHEET_LIST.RETURN',
};

const FilledInfoModal = (props) => {
  const { onOk, modal, action, reqFun, headerDS, custConfig, customizeForm } = props;
  const reverseFlag = ['REVERSE', 'REVERSELIST'].includes(action);

  const filledInfoDs = reverseFlag ? reverseInfoDs : formDs;
  const filledInfoDS = useMemo(() => new DataSet(filledInfoDs()), [filledInfoDs]);

  const handleOk = useCallback(async () => {
    const okFlag = await unitValidate(filledInfoDS, custConfig[unitCodes[action]]);
    if (!okFlag) {
      return false;
    } else {
      return onOk(reqFun, filledInfoDS.current.toData(), action);
    }
  }, [action, custConfig, filledInfoDS, onOk, reqFun]);

  useEffect(() => {
    const record = reverseFlag ? {} : (headerDS?.current?.toData() || {});
    filledInfoDS.create(record);
    modal.handleOk(handleOk);
  }, [filledInfoDS, handleOk, headerDS, modal, reverseFlag]);

  return customizeForm(
    { code: unitCodes[action] },

    <Form dataSet={filledInfoDS} useColon={false} columns={1} labelLayout="float">
      {reverseFlag ? <TextArea name="reverseDesc" resize='both' /> : <TextArea name="approvalOpinions" resize='both' />}
    </Form>
  );
};

export default FilledInfoModal;
