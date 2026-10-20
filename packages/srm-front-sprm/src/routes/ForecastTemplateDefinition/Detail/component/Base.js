/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext, useRef } from 'react';
import { TextField, DatePicker, IntlField, Select, Form } from 'choerodon-ui/pro';

import { Store } from '../stores';

const BaseInfo = function BaseInfo() {
  const { headerDs } = useContext(Store);

  const formRef = useRef(null);

  return (
    <Form
      dataSet={headerDs}
      showLines={6}
      columns={3}
      ref={formRef}
      labelLayout="float"
      useColon={false}
      style={{ height: '100%' }}
    >
      <TextField name="templateCode" />
      <IntlField name="templateName" />
      <Select name="enabledFlag" />
      <Select name="templateStatus" disabled />
      <TextField name="createdByName" disabled />
      <DatePicker name="creationDate" disabled />
    </Form>
  );
};

export default BaseInfo;
