import React from 'react';
import { Form, TextField, Select, IntlField, NumberField } from 'choerodon-ui/pro';

export default function OrderEditForm({ dataSet }) {
  const documentId =
    dataSet && dataSet?.current && dataSet?.current.get ? dataSet?.current.get('documentId') : '';

  const searchMatcher = ({ text, record }) => {
    const label = record?.get('businessObjectName');
    return label.toLowerCase().indexOf(text.toLowerCase()) !== -1;
  };

  const optionRenderer = ({ record }) => {
    return `${record.get('businessObjectName')}（${record.get('businessObjectCode')}）`;
  };

  return (
    <Form dataSet={dataSet} labelLayout="float" columns={1}>
      <TextField name="documentCode" disabled={documentId} />
      <IntlField name="documentName" />
      <IntlField name="documentDesc" />
      <Select name="moduleCode" />
      <Select
        name="businessObjectId"
        disabled={documentId}
        searchable
        searchMatcher={searchMatcher}
        optionRenderer={optionRenderer}
      />
      <NumberField name="sort" />
    </Form>
  );
}
