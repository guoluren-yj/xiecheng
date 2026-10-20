// 自动生单配置
import React from 'react';
import { Form, Select, DatePicker, Output } from 'choerodon-ui/pro';

const AutoOrderConfig = (props) => {
  const SelCmps = props?.editFlag ? Select : Output;
  const DateCmps = props?.editFlag ? DatePicker : Output;

  return (
    <Form labelLayout="float" columns={3} dataSet={props.AutoDs}>
      <SelCmps name="cycleRange" />
      <DateCmps name="cycleDate" />
      {/* <Select name="cycleConsumeQuantity" /> */}
    </Form>
  );
};

export default AutoOrderConfig;
