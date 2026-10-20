import type { ReactElement } from 'react';
import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet, Form, NumberField, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { depositReturnDS } from './storeDS';

export const DepositReturnSupplierCode = 'SSTA.DEPOSIT_DETAIL_SUP.RETURN_SUPPLIER';

interface DepositReturnProps {
  modal?: any,
  depositRecord: DSRecord | null | undefined,
  okCallback: Function,
  remote?: any,
}

const DepositReturn = withCustomize({
  unitCode: [DepositReturnSupplierCode],
})((props) => {

  const { modal, depositRecord, okCallback, customizeForm, remote } = props;
  const depositReturnDs = useMemo<DataSet>(() => new DataSet(depositReturnDS(depositRecord)), [depositRecord]);

  const handleSubmit = useCallback(async () => {
    // 前置埋点
    if(remote && remote.event){
       const flag = await remote.event.fireEvent('beforeReturnSupplier', { record: depositRecord, formDs: depositReturnDs });
       if(!flag) return false;
    }
    const res = await depositReturnDs.submit();
    if (!res) return false;
    if (okCallback) okCallback();
  }, [depositReturnDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);

  if (!depositRecord) return <Spin />;

  return customizeForm(
    { code: DepositReturnSupplierCode },
    <Form
      columns={1}
      useColon={false}
      dataSet={depositReturnDs}
      labelLayout={LabelLayout.float}
    >
      <NumberField name="paymentAmount" />
    </Form>
  );
}) as (props: DepositReturnProps) => ReactElement;

export default DepositReturn;