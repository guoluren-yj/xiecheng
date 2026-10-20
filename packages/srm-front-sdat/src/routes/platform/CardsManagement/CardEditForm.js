import React, { useEffect, useState } from 'react';
import { Form, TextField, Select, NumberField, TextArea, IntlField, Lov } from 'choerodon-ui/pro';

const CardEditForm = (props) => {
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
        <Select name="level" />
        <Select name="type" />
        <Select name="groupCode" />
        <Lov name="projectObj" />
        <Lov name="reportObj" />
        <Select name="initSize" />
        <TextArea name="uriVariables" />
        <IntlField name="remark" />
        <NumberField name="orderSeq" />
      </Form>
    </>
  );
};

export default CardEditForm;
