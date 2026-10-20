import React from 'react';
import { Divider } from 'choerodon-ui';
import { Output } from 'choerodon-ui/pro';

// 渲染底部表单字段
export const renderFormField = ({ name, dataSet, renderer }) => {
  const field = dataSet?.getField(name);
  const label = field?.get('label');
  return (
    <div className="form-field-wrap">
      <span>{label || '-'}：</span>
      <Output dataSet={dataSet} name={name} renderer={renderer} />
      <Divider type="vertical" />
    </div>
  );
};

// 企业状态color
export const enterpriseStatusColor = {
  EMPLOYMENT: 'green',
  EXISTENCE: 'green',
  IMMIGRATION: 'green',
  EMIGRATION: 'red',
  STOP_DOING_BUSINESS: 'red',
  LIQUIDATION: 'gray',
  WRITE_OFF: 'gray',
  DEACTIVE: 'gray',
  '1': 'green',
  '2': 'yellow',
  '3': 'red',
};
