import React, { useMemo, useEffect } from 'react';
import { Form, TextArea, DataSet } from 'choerodon-ui/pro';

import { formDs } from './mainDS';
import { unitValidate } from '@/utils/utils';

const unitCodes = {
  CONFIRM: 'SSTA.COST_SHEET_DETAIL.CONFIRM',
  RETURN: 'SSTA.COST_SHEET_DETAIL.RETURN',
};

const FilledInfoModal = (props) => {
  const { onOk, modal, action, reqFun, headerDS, custConfig, customizeForm } = props;

  const filledInfoDS = useMemo(() => new DataSet(formDs()), []);

  useEffect(() => {
    filledInfoDS.create(headerDS.current?.toData());
    modal.handleOk(handleOk);
  }, []);

  const handleOk = async () => {
    const okFlag = await unitValidate(filledInfoDS, custConfig[unitCodes[action]]);
    if (!okFlag) {
      return false;
    } else {
      onOk(reqFun, filledInfoDS.current.toData());
    }
  };

  return customizeForm(
    { code: unitCodes[action] },

    <Form dataSet={filledInfoDS} useColon={false} columns={1} labelLayout="float">
      <TextArea name="approvalOpinions" />
    </Form>
  );
};

export default FilledInfoModal;
