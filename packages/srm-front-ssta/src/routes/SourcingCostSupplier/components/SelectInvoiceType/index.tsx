import React, { useMemo, useEffect, useCallback } from 'react';
import { Select, DataSet, Form } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import { selectInvoiceTypeDS } from './storeDS';

interface SelectInvoiceTypeProps {
  modal?: any,
  record?: any,
  okCallback: (invoiceType: string, record?: DSRecord) => void,
}

const SelectInvoiceType = (props: SelectInvoiceTypeProps) => {

  const { modal, record, okCallback } = props;

  const selectInvoiceTypeDs = useMemo(() => new DataSet(selectInvoiceTypeDS()), []);

  const handleOk = useCallback(async () => {
    const validRes = await selectInvoiceTypeDs.validate();
    if (!validRes) return false;
    const invoiceType = selectInvoiceTypeDs.current?.get('invoiceType');
    okCallback(invoiceType, record);
  }, [selectInvoiceTypeDs, record, okCallback]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleOk);
    }
  }, [modal, handleOk]);

  return (
    <Form
      columns={1}
      useColon={false}
      dataSet={selectInvoiceTypeDs}
      labelLayout={LabelLayout.float}
    >
      <Select name="invoiceType" dataSet={selectInvoiceTypeDs} />
    </Form>
  );
};

export default SelectInvoiceType;

