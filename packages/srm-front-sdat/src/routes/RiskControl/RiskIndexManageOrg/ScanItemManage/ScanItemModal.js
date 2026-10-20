import React from 'react';
// import intl from 'utils/intl';
import { Form, TextField, NumberField, IntlField } from 'choerodon-ui/pro';

export default function ScanItemModal({ dataSet, type, viewType }) {
  return (
    <>
      {type !== 2 ? (
        <Form columns={1} dataSet={dataSet} labelLayout="float">
          {type === 1 && <TextField name="parentCode" disabled />}
          {type === 1 && <TextField name="parentName" disabled />}
          <TextField name="itemCode" disabled={viewType === 'edit'} />
          <IntlField name="itemName" />
          <NumberField name="sortNum" />
          {/* <Switch name="endFlag" /> */}
        </Form>
      ) : (
        <Form columns={1} dataSet={dataSet} labelLayout="float">
          <TextField name="itemCode" disabled={viewType === 'edit'} />
          <IntlField name="itemName" />
          <NumberField name="sortNum" />
          {/* <Lov name="tenantList" /> */}
        </Form>
      )}
    </>
  );
}
