import React, { useMemo, useEffect, useCallback } from 'react';
import { DataSet, DatePicker, Form, Lov, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import { formDS } from './storeDS';

const TripartListPullModal = ({ modal, listDs }) => {

  const formDs = useMemo<DataSet>(() => new DataSet(formDS()), []);

  const handleSubmit = useCallback(async () => {
    const res = await formDs.submit();
    if (!res) return false;
    listDs.query();
  }, [formDs, listDs]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);

  return (
    <Form dataSet={formDs} columns={1} useColon={false} labelLayout={LabelLayout.float}>
      <DatePicker name='startDate' />
      <Lov name='companyIds' />
      <Lov name='supplierCompanyIds' />
      <Select name='checkStatus' />
      <Select name='invoiceTypes' />
      <Select name='invoiceStatusMulti' />
    </Form>
  );

};

export default TripartListPullModal;