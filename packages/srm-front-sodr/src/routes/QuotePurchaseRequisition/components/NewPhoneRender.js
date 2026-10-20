import React from 'react';
import { Select, TextField } from 'choerodon-ui/pro';

const style = {
  border: 'none',
  padding: 0,
  maxWidth: 60,
  width: '35%',
};

const selectStyle = {
  height: 28,
};

const renderPhone = function PhoneRender(props) {
  const { record, internationalTelName, ...reset } = props;
  const region = (
    <Select style={selectStyle} clearButton={false} record={record} name={internationalTelName} />
  );
  return <TextField record={record} addonBefore={region} addonBeforeStyle={style} {...reset} />;
};

export default renderPhone;
