// 红色确认表

import type { ReactElement } from 'react';
import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { DataSet, Form, TextField, Select } from 'choerodon-ui/pro';
import { flow, isFunction } from 'lodash';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';
// import type { FormProps } from 'choerodon-ui/pro/lib/form/interface';

// import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';

import { formDS } from './indexDS';
// import DynamicAlert from '../../../Components/DynamicAlert';


interface BatchSettleListProps {
  modal?: any,
  okCallback: () => void,
  record: any,
  type: string,
  settleHeaderDs: DataSet,
}

const BatchSettleList = flow(
  observer,
)((props: BatchSettleListProps) => {

  const {
    modal,
    okCallback,
    settleHeaderDs,
  } = props;
  const formDs = useMemo(() => new DataSet(formDS()), []);

  const handleSubmit = useCallback(async () => {
    const validateRes = await formDs.validate();
    if (!validateRes) return false;
    const data = formDs.current?.toData();
    // eslint-disable-next-line no-unused-expressions
    settleHeaderDs.current?.set(data);
    if (isFunction(okCallback)) okCallback();
  }, [formDs, okCallback, settleHeaderDs]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);


  return (
    <div>
      <Form dataSet={formDs} useColon={false} columns={1} labelLayout={LabelLayout.float}>
        <TextField name="blueInvoiceCode" />
        <TextField name="blueInvoiceNum" />
        <TextField name="blueDigitInvoiceNum" />
        <Select name="invoiceRefundedReason" />
      </Form>
    </div>
  );
}) as (props: BatchSettleListProps) => ReactElement;

export default BatchSettleList;
