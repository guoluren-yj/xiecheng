/*
 * @Date: 2023-07-31 17:20:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, TextField } from 'choerodon-ui/pro';

const Index = ({ dataSet }) => {
  return (
    <Form dataSet={dataSet} labelLayout="float" columns={1}>
      <TextField name="evalTplCode" />
      <TextField name="evalTplName" />
    </Form>
  );
};

export default Index;
