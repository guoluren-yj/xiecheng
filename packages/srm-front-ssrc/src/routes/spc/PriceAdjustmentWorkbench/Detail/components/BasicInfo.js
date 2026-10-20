import React from 'react';
import { Select, Form, TextField, Lov, DateTimePicker, TextArea, Output } from 'choerodon-ui/pro';
import { renderStatus } from '../../utils';

const BasicInfo = ({ isEdit, dataSet, customizeForm, cusUnitCode }) => {
  return customizeForm(
    {
      code:
        cusUnitCode?.headerCode ||
        (isEdit
          ? 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM'
          : 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM_READONLY'),
    },
    isEdit ? (
      <Form
        useWidthPercent
        dataSet={dataSet}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        columns={3}
      >
        <Select name="priceAdjustmentStatus" />
        <TextField name="priceAdjustmentID" />
        <TextField name="priceAdjustmentCode" />
        <TextField name="priceAdjustmentName" />
        <Lov name="createdBy" isEdit={isEdit} />
        <DateTimePicker name="creationDate" />
        <Select name="priceAdjustmentType" />
        <Select name="sourceFrom" />
        <TextArea name="remark" newLine resize="both" />
      </Form>
    ) : (
      <Form
        useWidthPercent
        dataSet={dataSet}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        columns={3}
      >
        <Output
          name="priceAdjustmentStatus"
          renderer={({ value, name, record }) => renderStatus({ value, name, record })}
        />
        <Output name="priceAdjustmentID" />
        <Output name="priceAdjustmentCode" />
        <Output name="priceAdjustmentName" />
        <Output name="createdBy" renderer={({ record }) => record?.get('createdByName')} />
        <Output name="creationDate" />
        <Output name="priceAdjustmentType" />
        <Output name="sourceFrom" />
        <Output name="remark" resize="both" />
      </Form>
    )
  );
};

export default BasicInfo;
