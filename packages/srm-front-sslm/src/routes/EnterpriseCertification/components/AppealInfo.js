/**
 * Appeal - 申诉
 * @date: 2022-8-3
 * @author: ZLH
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';

const AppealInfo = ({ dataSet }) => {
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <TextArea name="appealReason" />
    </Form>
  );
};

export default AppealInfo;
