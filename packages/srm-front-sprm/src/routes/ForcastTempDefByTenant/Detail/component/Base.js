/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext, useRef } from 'react';
import { TextField, IntlField, DatePicker, Form, Select } from 'choerodon-ui/pro';

import { Store } from '../stores';

const BaseInfo = function BaseInfo() {
  const { headerDs, changeFlag } = useContext(Store);

  const formRef = useRef(null);

  return (
    <Form
      dataSet={headerDs}
      showLines={6}
      columns={3}
      ref={formRef}
      labelLayout="float"
      useColon={false}
      useWidthPercent
      style={{ height: '100%' }}
    >
      <TextField name="templateCode" disabled={changeFlag} />
      <IntlField name="templateName" />
      <Select name="templateStatusShow" disabled />
      <TextField name="createdByName" disabled />
      <DatePicker name="creationDate" disabled />
    </Form>
  );
};

export default BaseInfo;
