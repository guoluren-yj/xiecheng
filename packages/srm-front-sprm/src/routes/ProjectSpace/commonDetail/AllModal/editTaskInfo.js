/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-09-18 16:53:31
 */
import React from 'react';
import { TextField, Form, Lov, NumberField, TextArea } from 'choerodon-ui/pro';

const EditTask = function EditTask({ ...props }) {
  const { dataSet, customizeForm, code } = props;
  return customizeForm(
    {
      code: code || 'SIEC.PROJECT_EDIT.COST_FORM',
    },
    <Form dataSet={dataSet} columns={1} labelLayout="float" useColon={false}>
      <TextField name="taskNum" />
      <TextField name="taskName" />
      <Lov name="principalUserId" />
      <NumberField name="budgetAmount" />
      <TextArea name="taskExplanation" resize="vertical" />
    </Form>
  );
};

export default EditTask;
