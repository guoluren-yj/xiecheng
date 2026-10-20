/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-02-24 19:15:02
 */
import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

const ChangeInfo = function ChangeInfo({ customizeForm, changeDs }) {
  const form = customizeForm(
    {
      code: 'SMDM_MATERIELAPPLICATION_EDIT.APPROVE_EDIT',
      dataSet: changeDs,
    },
    <Form
      dataSet={changeDs}
      columns={3}
      labelLayout="vertical"
      useWidthPercent
      className="c7n-pro-vertical-form-display"
    >
      <Output name="itemReqHeaderNum" />
      <Output name="reqStatus" />
      <Output name="createdName" />
      <Output name="creationDate" />
      <Output name="versionNumber" />
      <Output name="itemCode" />
      <Output name="originItemCode" />
      <Output name="sourceCode" />
    </Form>
  );

  return form;
};

export default withCustomize({ unitCode: ['SMDM_MATERIELAPPLICATION_EDIT.APPROVE_EDIT'] })(
  ChangeInfo
);
