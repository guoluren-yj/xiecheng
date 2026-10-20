/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:41:27
 * @LastEditors: yanglin
 * @LastEditTime: 2023-01-28 11:18:30
 */
import React from 'react';
// import intl from 'utils/intl';
import { Form, TextField, Select, DatePicker, Lov, IntlField, CheckBox } from 'choerodon-ui/pro';

const Base = ({ baseInfoDs }) => {
  return (
    <div className="config-right-content">
      <Form
        dataSet={baseInfoDs}
        showLines={6}
        columns={3}
        labelLayout="float"
        useColon={false}
        showHelp="tooltip"
        useWidthPercent
      >
        <TextField name="containerCode" />
        <IntlField name="containerName" />
        <Select name="containerStatus" />

        {/* <Select name="templateType" /> */}
        <DatePicker name="effectiveTime" />
        <TextField name="version" />
        {/* <Select name="enabledFlag" /> */}

        <CheckBox name="versionControlFlag" />
        <Lov name="appointorId" />
        <TextField name="createdByName" />
        <DatePicker name="creationDate" />

        <CheckBox name="defaultCheckFlag" />
      </Form>
    </div>
  );
};

export default Base;
