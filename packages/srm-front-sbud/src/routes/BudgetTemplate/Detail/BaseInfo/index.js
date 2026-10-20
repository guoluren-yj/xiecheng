import React from 'react';
import intl from 'utils/intl';
import { Form, TextField, Select, DatePicker, IntlField } from 'choerodon-ui/pro';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Base = ({ baseInfoDs }) => {
  return (
    <Form
      dataSet={baseInfoDs}
      showLines={6}
      columns={3}
      labelLayout="float"
      useColon={false}
      useWidthPercent
    >
      <TextField name="budgetTemplateCode" />
      <IntlField name="budgetTemplateDesc" />

      <TextField name="templateStatusMeaning" />
      <TextField name="createdByName" />
      <DatePicker name="creationDate" mode='dateTime'/>

      <DatePicker name="lastUpdateDate" />
    </Form>
  );
};

export default Base;
