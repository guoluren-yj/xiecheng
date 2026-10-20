import React from 'react';
import { TextField, DatePicker, Lov, Form } from 'choerodon-ui/pro';

const BaseInfo = function BaseInfo(props) {
  const { headerDs, customizeForm } = props;

  const form = customizeForm(
    {
      code: 'SMDM.FIXED.ASSETS_DEFINITION.FORM',
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} columns={1} labelLayout="float" useColon={false}>
      <TextField name="fixedAssetCode" />
      <TextField name="fixedAssetName" />
      <TextField name="assetCode" />
      <TextField name="assetDescription" />
      <DatePicker name="assetDate" />
      <Lov name="companyId" />
      <TextField name="companyName" disabled />
      <Lov name="ouId" />
      <TextField name="sourceCode" disabled />
    </Form>
  );

  return form;
};

export default BaseInfo;
