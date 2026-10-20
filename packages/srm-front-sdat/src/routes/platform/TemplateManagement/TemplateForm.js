import React, { useEffect, useState } from 'react';
import { Form, TextField, Select, NumberField, IntlField } from 'choerodon-ui/pro';

const TamplateForm = (props) => {
  const { localRecord, dataSet } = props;

  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    dataSet.data = [];
    dataSet.reset();
    if (localRecord && localRecord.get('cardId')) {
      dataSet.setQueryParameter('cardId', localRecord.get('cardId'));
      dataSet.query();
      setCanEdit(false);
    }
  }, [localRecord]);

  return (
    <>
      <Form dataSet={dataSet} columns={1} labelWidth={[70]}>
        <TextField name="code" disabled={!canEdit} />
        <IntlField name="name" />
        <Select name="type" />
        <NumberField name="orderSeq" />
        <IntlField name="remark" />
      </Form>
    </>
  );
};

export default TamplateForm;
