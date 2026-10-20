import React from 'react';
import { Form, Lov, Switch, TextField } from 'choerodon-ui/pro';

export default function (props) {
  const { dataSet } = props;

  return (
    <div className="attribute-mapping-modal">
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <Lov
          name="supplierLov"
          // onChange={(record, name) => {
          //   record.set(name, {
          //     supplierCompanyId: record.supplierCompanyId,
          //     supplierCompanyId: record.supplierCompanyId,
          //   });
          // }}
        />
        <Lov name="productLov" />
        <TextField name="productName" />
        <TextField name="thirdSkuId" />
      </Form>
      <Form dataSet={dataSet} columns={1} labelAlign="left" labelWidth={95}>
        <Switch name="platFlag" />
      </Form>
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <Lov name="companyLov" />
        <Lov name="organizationLov" />
        <Lov name="categoryLov" />
        <TextField name="categoryName" />
        <Lov name="itemLov" />
        <TextField name="itemName" />
      </Form>
    </div>
  );
}
