import React, { useMemo, useEffect, useCallback } from 'react';
import { Form, DataSet, Lov } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';

import { searchDs } from './mainDs';

const SyncTaxCtr = (props) => {
  const { modal, onOk } = props;

  const syncTaxCtrDs = useMemo(() => new DataSet(searchDs()), []);

  const handleOk = useCallback(async () => {
    const validateFlag = await syncTaxCtrDs.validate();
    if (!validateFlag) return false;
    const res = await syncTaxCtrDs.submit();
    if (!res) return false;
    if (onOk) onOk();
  }, [syncTaxCtrDs, onOk]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  return (
    <Form dataSet={syncTaxCtrDs} labelLayout={LabelLayout.float}>
      <Lov name="customerLov" />
      <Lov name="companyLov" />
    </Form>
  );
};

export default SyncTaxCtr;
